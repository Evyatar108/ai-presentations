using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace VibeVoice.Client
{
    public interface ITtsService
    {
        Task<byte[]> GenerateTtsAudioAsync(string text);
        Task<byte[]> GenerateTtsAudioAsync(string text, string speaker);
        Task<byte[][]> GenerateTtsAudioBatchAsync(string[] texts);
        Task<byte[][]> GenerateTtsAudioBatchAsync(string[] texts, string speaker);
    }

    public class VibeVoiceTtsService : ITtsService, IDisposable
    {
        private readonly HttpClient _httpClient;
        private readonly string _serverUrl;
        private bool _disposed = false;

        /// <summary>
        /// Initializes a new instance of the VibeVoiceTtsService.
        /// </summary>
        /// <param name="serverUrl">The base URL of the VibeVoice TTS server (e.g., "http://localhost:5000")</param>
        /// <param name="httpClient">Optional HttpClient instance. If not provided, a new one will be created.</param>
        public VibeVoiceTtsService(string serverUrl, HttpClient httpClient = null)
        {
            if (string.IsNullOrWhiteSpace(serverUrl))
            {
                throw new ArgumentException("Server URL cannot be null or empty.", nameof(serverUrl));
            }

            _serverUrl = serverUrl.TrimEnd('/');
            _httpClient = httpClient ?? new HttpClient();
            _httpClient.Timeout = TimeSpan.FromMinutes(5); // TTS can take a while
        }

        /// <summary>
        /// Generates TTS audio from the provided text using default speaker (Speaker 0).
        /// </summary>
        /// <param name="text">The text to convert to speech (plain text, speaker prefix will be added automatically)</param>
        /// <returns>WAV audio data as a byte array</returns>
        /// <exception cref="ArgumentException">Thrown when text is null or empty</exception>
        /// <exception cref="HttpRequestException">Thrown when the server request fails</exception>
        /// <exception cref="InvalidOperationException">Thrown when the server returns an error</exception>
        public async Task<byte[]> GenerateTtsAudioAsync(string text)
        {
            return await GenerateTtsAudioAsync(text, "Speaker 0");
        }

        /// <summary>
        /// Generates TTS audio from the provided text with a specified speaker.
        /// </summary>
        /// <param name="text">The text to convert to speech (plain text, speaker prefix will be added automatically)</param>
        /// <param name="speaker">The speaker identifier (e.g., "Speaker 0", "Speaker 1"). Defaults to "Speaker 0"</param>
        /// <returns>WAV audio data as a byte array</returns>
        /// <exception cref="ArgumentException">Thrown when text is null or empty</exception>
        /// <exception cref="HttpRequestException">Thrown when the server request fails</exception>
        /// <exception cref="InvalidOperationException">Thrown when the server returns an error</exception>
        public async Task<byte[]> GenerateTtsAudioAsync(string text, string speaker)
        {
            if (string.IsNullOrWhiteSpace(text))
            {
                throw new ArgumentException("Text cannot be null or empty.", nameof(text));
            }

            if (string.IsNullOrWhiteSpace(speaker))
            {
                speaker = "Speaker 0";
            }

            try
            {
                // Prepare the request payload
                var requestPayload = new
                {
                    text = text,
                    speaker = speaker
                };

                var jsonContent = JsonSerializer.Serialize(requestPayload);
                var httpContent = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                // Send request to the server
                var response = await _httpClient.PostAsync($"{_serverUrl}/generate", httpContent);

                // Read response content
                var responseContent = await response.Content.ReadAsStringAsync();

                // Check if request was successful
                if (!response.IsSuccessStatusCode)
                {
                    // Try to parse error message
                    try
                    {
                        using var errorDoc = JsonDocument.Parse(responseContent);
                        var errorMessage = errorDoc.RootElement.GetProperty("error").GetString();
                        throw new InvalidOperationException($"Server error: {errorMessage}");
                    }
                    catch (JsonException)
                    {
                        throw new HttpRequestException($"Server returned status code {response.StatusCode}: {responseContent}");
                    }
                }

                // Parse the JSON response
                using var jsonDoc = JsonDocument.Parse(responseContent);
                var root = jsonDoc.RootElement;

                // Check if generation was successful
                if (!root.GetProperty("success").GetBoolean())
                {
                    var errorMessage = root.TryGetProperty("error", out var errorProp) 
                        ? errorProp.GetString() 
                        : "Unknown error";
                    throw new InvalidOperationException($"TTS generation failed: {errorMessage}");
                }

                // Extract the base64-encoded audio
                var audioBase64 = root.GetProperty("audio").GetString();
                
                // Decode and return the audio data
                return Convert.FromBase64String(audioBase64);
            }
            catch (HttpRequestException ex)
            {
                throw new HttpRequestException($"Failed to connect to TTS server at {_serverUrl}: {ex.Message}", ex);
            }
            catch (JsonException ex)
            {
                throw new InvalidOperationException($"Failed to parse server response: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// Generates TTS audio for multiple texts in a single batch request using default speaker (Speaker 0).
        /// This is more efficient than making multiple individual requests.
        /// </summary>
        /// <param name="texts">Array of texts to convert to speech</param>
        /// <returns>Array of WAV audio data byte arrays, one for each input text</returns>
        /// <exception cref="ArgumentException">Thrown when texts is null or empty</exception>
        /// <exception cref="HttpRequestException">Thrown when the server request fails</exception>
        /// <exception cref="InvalidOperationException">Thrown when the server returns an error</exception>
        public async Task<byte[][]> GenerateTtsAudioBatchAsync(string[] texts)
        {
            return await GenerateTtsAudioBatchAsync(texts, "Speaker 0");
        }

        /// <summary>
        /// Generates TTS audio for multiple texts in a single batch request with a specified speaker.
        /// This is more efficient than making multiple individual requests.
        /// </summary>
        /// <param name="texts">Array of texts to convert to speech</param>
        /// <param name="speaker">The speaker identifier (e.g., "Speaker 0", "Speaker 1")</param>
        /// <returns>Array of WAV audio data byte arrays, one for each input text</returns>
        /// <exception cref="ArgumentException">Thrown when texts is null or empty</exception>
        /// <exception cref="HttpRequestException">Thrown when the server request fails</exception>
        /// <exception cref="InvalidOperationException">Thrown when the server returns an error</exception>
        public async Task<byte[][]> GenerateTtsAudioBatchAsync(string[] texts, string speaker)
        {
            if (texts == null || texts.Length == 0)
            {
                throw new ArgumentException("Texts array cannot be null or empty.", nameof(texts));
            }

            if (string.IsNullOrWhiteSpace(speaker))
            {
                speaker = "Speaker 0";
            }

            try
            {
                // Format all texts with speaker prefix if needed
                var formattedTexts = texts.Select(text =>
                {
                    if (string.IsNullOrWhiteSpace(text))
                    {
                        throw new ArgumentException("Text in array cannot be null or empty.");
                    }
                    return text.Trim().StartsWith("Speaker") ? text : $"{speaker}: {text}";
                }).ToArray();

                // Prepare the request payload
                var requestPayload = new
                {
                    texts = formattedTexts
                };

                var jsonContent = JsonSerializer.Serialize(requestPayload);
                var httpContent = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                // Send request to the server
                var response = await _httpClient.PostAsync($"{_serverUrl}/generate_batch", httpContent);

                // Read response content
                var responseContent = await response.Content.ReadAsStringAsync();

                // Check if request was successful
                if (!response.IsSuccessStatusCode)
                {
                    // Try to parse error message
                    try
                    {
                        using var errorDoc = JsonDocument.Parse(responseContent);
                        var errorMessage = errorDoc.RootElement.GetProperty("error").GetString();
                        throw new InvalidOperationException($"Server error: {errorMessage}");
                    }
                    catch (JsonException)
                    {
                        throw new HttpRequestException($"Server returned status code {response.StatusCode}: {responseContent}");
                    }
                }

                // Parse the JSON response
                using var jsonDoc = JsonDocument.Parse(responseContent);
                var root = jsonDoc.RootElement;

                // Check if generation was successful
                if (!root.GetProperty("success").GetBoolean())
                {
                    var errorMessage = root.TryGetProperty("error", out var errorProp)
                        ? errorProp.GetString()
                        : "Unknown error";
                    throw new InvalidOperationException($"TTS batch generation failed: {errorMessage}");
                }

                // Extract the array of base64-encoded audios
                var audiosArray = root.GetProperty("audios");
                var audioDataArray = new byte[audiosArray.GetArrayLength()][];

                int index = 0;
                foreach (var audioElement in audiosArray.EnumerateArray())
                {
                    var audioBase64 = audioElement.GetString();
                    audioDataArray[index++] = Convert.FromBase64String(audioBase64);
                }

                return audioDataArray;
            }
            catch (HttpRequestException ex)
            {
                throw new HttpRequestException($"Failed to connect to TTS server at {_serverUrl}: {ex.Message}", ex);
            }
            catch (JsonException ex)
            {
                throw new InvalidOperationException($"Failed to parse server response: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// Checks if the TTS server is available and ready.
        /// </summary>
        /// <returns>True if the server is healthy, false otherwise</returns>
        public async Task<bool> IsServerHealthyAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync($"{_serverUrl}/health");
                if (!response.IsSuccessStatusCode)
                {
                    return false;
                }

                var content = await response.Content.ReadAsStringAsync();
                using var jsonDoc = JsonDocument.Parse(content);
                var status = jsonDoc.RootElement.GetProperty("status").GetString();
                var modelLoaded = jsonDoc.RootElement.GetProperty("model_loaded").GetBoolean();

                return status == "ok" && modelLoaded;
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Gets server health information.
        /// </summary>
        /// <returns>A tuple containing status, model loaded state, device, and GPU name (if available)</returns>
        public async Task<(string Status, bool ModelLoaded, string Device, string GpuName)> GetServerHealthAsync()
        {
            var response = await _httpClient.GetAsync($"{_serverUrl}/health");
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            using var jsonDoc = JsonDocument.Parse(content);
            var root = jsonDoc.RootElement;

            var status = root.GetProperty("status").GetString();
            var modelLoaded = root.GetProperty("model_loaded").GetBoolean();
            var device = root.GetProperty("device").GetString();
            var gpuName = root.TryGetProperty("gpu_name", out var gpuProp) && gpuProp.ValueKind != JsonValueKind.Null
                ? gpuProp.GetString()
                : null;

            return (status, modelLoaded, device, gpuName);
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                {
                    _httpClient?.Dispose();
                }
                _disposed = true;
            }
        }
    }
}