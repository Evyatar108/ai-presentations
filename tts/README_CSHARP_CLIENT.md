# VibeVoice C# Client

A C# client library for interfacing with the VibeVoice TTS server.

## Installation

Simply copy the `VibeVoiceTtsService.cs` file into your C# project.

## Usage

### Basic Usage

```csharp
using VibeVoice.Client;

// Create the TTS service instance
var ttsService = new VibeVoiceTtsService("http://localhost:5000");

// Generate audio from text (plain text, no need for "Speaker 0:" prefix)
string text = "Hello, this is a test of the VibeVoice TTS system.";
byte[] audioData = await ttsService.GenerateTtsAudioAsync(text);

// Or specify a different speaker
byte[] audioData2 = await ttsService.GenerateTtsAudioAsync("This is speaker 1 talking.", "Speaker 1");

// Save to file
await File.WriteAllBytesAsync("output.wav", audioData);

// Dispose when done
ttsService.Dispose();
```

### Using Dependency Injection

```csharp
// In Startup.cs or Program.cs
services.AddSingleton<ITtsService>(sp => 
    new VibeVoiceTtsService("http://localhost:5000"));

// In your class
public class MyService
{
    private readonly ITtsService _ttsService;
    
    public MyService(ITtsService ttsService)
    {
        _ttsService = ttsService;
    }
    
    public async Task GenerateSpeechAsync(string text)
    {
        byte[] audio = await _ttsService.GenerateTtsAudioAsync(text);
        // Process audio...
    }
}
```

### Health Check

```csharp
var ttsService = new VibeVoiceTtsService("http://localhost:5000");

// Simple health check
bool isHealthy = await ttsService.IsServerHealthyAsync();
if (!isHealthy)
{
    Console.WriteLine("Server is not ready!");
    return;
}

// Detailed health information
var (status, modelLoaded, device, gpuName) = await ttsService.GetServerHealthAsync();
Console.WriteLine($"Status: {status}");
Console.WriteLine($"Model Loaded: {modelLoaded}");
Console.WriteLine($"Device: {device}");
Console.WriteLine($"GPU: {gpuName ?? "N/A"}");
```

### Using Custom HttpClient

```csharp
// Create custom HttpClient with specific settings
var httpClient = new HttpClient
{
    Timeout = TimeSpan.FromMinutes(10)
};

var ttsService = new VibeVoiceTtsService("http://localhost:5000", httpClient);
```

### Error Handling

```csharp
try
{
    var audio = await ttsService.GenerateTtsAudioAsync("Speaker 0: Hello!");
}
catch (ArgumentException ex)
{
    // Invalid input (null or empty text)
    Console.WriteLine($"Invalid input: {ex.Message}");
}
catch (HttpRequestException ex)
{
    // Network/connection error
    Console.WriteLine($"Connection error: {ex.Message}");
}
catch (InvalidOperationException ex)
{
    // Server returned an error
    Console.WriteLine($"Server error: {ex.Message}");
}
```

## API Reference

### VibeVoiceTtsService Constructor

```csharp
public VibeVoiceTtsService(string serverUrl, HttpClient httpClient = null)
```

**Parameters:**
- `serverUrl`: The base URL of the VibeVoice TTS server (e.g., "http://localhost:5000")
- `httpClient`: Optional HttpClient instance. If not provided, a new one will be created.

### GenerateTtsAudioAsync (Basic)

```csharp
public async Task<byte[]> GenerateTtsAudioAsync(string text)
```

Generates TTS audio from the provided text using the default speaker (Speaker 0).

**Parameters:**
- `text`: The text to convert to speech (plain text, no need for "Speaker X:" prefix)

**Returns:** WAV audio data as a byte array (24kHz, mono, 16-bit PCM)

**Exceptions:**
- `ArgumentException`: Thrown when text is null or empty
- `HttpRequestException`: Thrown when the server request fails
- `InvalidOperationException`: Thrown when the server returns an error

### GenerateTtsAudioAsync (With Speaker)

```csharp
public async Task<byte[]> GenerateTtsAudioAsync(string text, string speaker)
```

Generates TTS audio from the provided text with a specified speaker.

**Parameters:**
- `text`: The text to convert to speech (plain text, no need for "Speaker X:" prefix)
- `speaker`: The speaker identifier (e.g., "Speaker 0", "Speaker 1"). Defaults to "Speaker 0" if null or empty.

**Returns:** WAV audio data as a byte array (24kHz, mono, 16-bit PCM)

**Exceptions:**
- `ArgumentException`: Thrown when text is null or empty
- `HttpRequestException`: Thrown when the server request fails
- `InvalidOperationException`: Thrown when the server returns an error

### IsServerHealthyAsync

```csharp
public async Task<bool> IsServerHealthyAsync()
```

Checks if the TTS server is available and ready.

**Returns:** True if the server is healthy, false otherwise

### GetServerHealthAsync

```csharp
public async Task<(string Status, bool ModelLoaded, string Device, string GpuName)> GetServerHealthAsync()
```

Gets detailed server health information.

**Returns:** A tuple containing:
- `Status`: Server status ("ok" or error message)
- `ModelLoaded`: Whether the model is loaded
- `Device`: Device type ("cuda" or "cpu")
- `GpuName`: GPU name if available, otherwise null

## Text Format

The C# client now handles speaker formatting automatically. You can simply pass plain text:

```csharp
// Simple usage - defaults to Speaker 0
await ttsService.GenerateTtsAudioAsync("Hello, world!");

// Specify a different speaker
await ttsService.GenerateTtsAudioAsync("Hello from speaker 1!", "Speaker 1");

// The client automatically formats it as "Speaker 0: Hello, world!" before sending to the server
```

You can also still send pre-formatted text if needed:
```csharp
await ttsService.GenerateTtsAudioAsync("Speaker 2: This is also valid.");
```

## Server Requirements

Make sure the VibeVoice TTS server is running before using this client. Start the server with:

```bash
python server.py --voice-sample path/to/voice.wav --host 0.0.0.0 --port 5000
```

## Notes

- The service automatically handles base64 encoding/decoding of audio data
- Default timeout is 5 minutes to accommodate longer text generation
- The returned audio is in WAV format (24kHz, mono, 16-bit PCM)
- The service implements `IDisposable` - remember to dispose or use with `using` statement