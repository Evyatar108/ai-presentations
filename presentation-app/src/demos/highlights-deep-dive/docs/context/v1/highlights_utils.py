# type: ignore
# pylint: skip-file

import langdetect
import pandas as pd

from ..DisplayModelCompletion import parse_table_for_display
from ..GptTokenizer import GptTokenizer
from ..Logger import LogType


class HighlightsError(Exception):
    """Base exception for errors in the highlights processing."""

    pass


class NoSelfContainedHighlightsError(HighlightsError):
    """Raised when no self-contained highlights are found."""

    pass


class EmptyHighlightsError(HighlightsError):
    """Raised when the model returns an empty set of highlights."""

    pass


class InvalidOverallRankError(HighlightsError):
    """Raised when the 'overall rank' column contains invalid values."""

    pass


# Model Output Parsing Exceptions
class AbstractivesTableParsingError(HighlightsError):
    """Raised when abstractives model output table cannot be parsed (df1 in final_input_combiner)."""

    pass


class ExtractivesTableParsingError(HighlightsError):
    """Raised when extractives model output table cannot be parsed (df2 in final_input_combiner)."""

    pass


class AbstractivesTableMissingColumnsError(HighlightsError):
    """Raised when abstractives table is missing required columns."""

    pass


class ExtractivesTableMissingColumnsError(HighlightsError):
    """Raised when extractives table is missing required columns."""

    pass


class TopicRangeExtractionFailedError(HighlightsError):
    """Raised when topic utterance ranges cannot be extracted from abstractives."""

    pass


class HighlightsCandidateFilteringFailedError(HighlightsError):
    """Raised when filtering of highlights candidates results in no valid highlights."""

    pass


class HighlightsRankingProcessingFailedError(HighlightsError):
    """Raised when ranking processing of extractives fails."""

    pass


# Meeting Eligibility Validation Exceptions
class MeetingContextsBlocksMissingError(HighlightsError):
    """Raised when contexts_blocks is None, empty, or missing required data structure."""

    pass


class MeetingTimestampDataMissingError(HighlightsError):
    """Raised when meeting timestamp data (start_times/end_times) is missing or empty."""

    pass


class MeetingDurationTooShortError(HighlightsError):
    """Raised when meeting duration is too short for highlights processing (≤10 minutes)."""

    pass


class MeetingDurationTooLongError(HighlightsError):
    """Raised when meeting duration is too long for highlights processing (≥90 minutes)."""

    pass


class MeetingLanguageDetectionFailedError(HighlightsError):
    """Raised when language detection fails on meeting content."""

    pass


class MeetingNonEnglishLanguageError(HighlightsError):
    """Raised when meeting is detected as non-English language."""

    pass


class MeetingLanguageConfidenceTooLowError(HighlightsError):
    """Raised when language detection confidence is below threshold (< 0.9)."""

    pass


# filter blocks starting with short utterances
def filter_short_utt(utterance_blocks):
    result = [element for element in utterance_blocks if len(element["uttrances_texts"][0]) > 2]
    return result


# filter blocks that end with a question mark
def filter_question_blocks(utterance_blocks):
    result = [element for element in utterance_blocks if not element["uttrances_texts"][-1].endswith("?")]
    return result


def count_words_in_sentences(sentences):
    # Split each sentence by spaces and count the number of words
    word_counts = [len(sentence.split()) for sentence in sentences]
    return word_counts


def count_speaker_appearances(speakers):
    # Create an empty dictionary to store the counts
    count_dict = {}

    # Iterate over the list of strings
    for string in speakers:
        if string in count_dict:
            count_dict[string] += 1
        else:
            count_dict[string] = 1

    return count_dict


def sum_words_for_speakers(speakers, word_num):
    # Create an empty dictionary to store the sums
    sum_dict = {}

    # Iterate over both arrays simultaneously
    for string, integer in zip(speakers, word_num):
        if string in sum_dict:
            sum_dict[string] += integer
        else:
            sum_dict[string] = integer

    return sum_dict


def is_insignificant_speaker_interruption(utterance_block):
    speakers = utterance_block["uttrances_speaker"]
    if len(set(speakers)) == 2 and speakers[0] == speakers[-1]:
        apps = count_speaker_appearances(speakers)
        utt = utterance_block["uttrances_texts"]
        word_count = count_words_in_sentences(utt)
        tot_words = sum_words_for_speakers(speakers, word_count)

        if min(apps.values()) == 1 and min(tot_words.values()) <= 3:
            return True

    return False


def filter_multiple_speaker_blocks(utterance_blocks):
    result = [
        element
        for element in utterance_blocks
        if len(set(element["uttrances_speaker"])) == 1 or is_insignificant_speaker_interruption(element)
    ]
    return result


def apply_filters_on_blocks(utterance_blocks):
    result = filter_short_utt(utterance_blocks)
    result = filter_question_blocks(result)
    result = filter_multiple_speaker_blocks(result)

    return result


def extract_highlights_candidates_from_transcript(contexts_blocks, topic_ranges, duration_thresh_low, duration_thresh_high):
    data = contexts_blocks[0]
    result = []

    ranges = [[int(x) for x in s.split("-")] for s in topic_ranges]
    speaker_list = [x["userDisplayName"] for x in data["uttrances_speakers_info"]]
    utterances = list(
        zip(data["uttrances_start_times"], data["uttrances_end_times"], data["uttrances_texts"], data["uttrances_ids"], speaker_list)
    )
    # utt_texts = data['uttrances_texts']

    for i in range(1, len(ranges) - 1):
        start_ind = ranges[i][0]
        end_ind = ranges[i][1]
        topic_blocks = []
        for j in range(start_ind, end_ind + 1):
            for k in range(j + 1, end_ind + 1):
                start_time = utterances[j][0]
                end_time = utterances[k][1]
                duration = end_time - start_time

                if duration_thresh_low <= duration <= duration_thresh_high:
                    utt = [ut[2] for ut in utterances[j : k + 1]]
                    # utt_str =
                    # sentence_tokens = len(tokenizer.get_tokens(prompt_sentence + speaker_split_str, is_gpt4=True))
                    subset = {
                        "utterance_range": [j, k],
                        "uttrances_texts": utt,
                        "uttrances_speaker": [ut[4] for ut in utterances[j : k + 1]],
                    }
                    topic_blocks.append(subset)

        topic_blocks_filt = apply_filters_on_blocks(topic_blocks)
        result.append(topic_blocks_filt)

    return result


def format_as_markdown_table(df):
    # Create the header row
    header = "|" + "|".join(df.columns) + "|"
    # Create the separator row
    separator = "|" + "|".join(["---"] * len(df.columns)) + "|"
    # Create the data rows
    data_rows = "\n".join(["|" + "|".join(map(str, row)) + "|" for index, row in df.iterrows()])
    # Combine all parts
    table = "\n".join([header, separator, data_rows])
    return table


def extractive_input_cleaner(
    model_completion,
    end_reason,
    logger,
    query_id=None,
    transcript_search_expressions=None,
    write_debug_info=False,
    contexts_blocks=None,
    model_name=None,
):
    # Parse abstractives table with specific error handling
    try:
        df, _ = parse_table_for_display(model_completion, end_reason, write_debug_info, query_id, logger)
    except Exception as e:
        raise AbstractivesTableParsingError(f"Failed to parse abstractives table in extractive_input_cleaner: {e}")

    df.columns = df.columns.str.strip()

    # Validate required columns
    required_columns = ["Topic Utterance Range", "Level of interest"]
    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        raise AbstractivesTableMissingColumnsError(f"Missing required columns in abstractives table: {missing_columns}")

    # Extract topic ranges with error handling
    try:
        topic_ranges = df["Topic Utterance Range"].tolist()
        candidates = extract_highlights_candidates_from_transcript(contexts_blocks, topic_ranges, 20, 40)
    except Exception as e:
        raise TopicRangeExtractionFailedError(f"Failed to extract topic ranges from abstractives: {e}")

    tokenizer = GptTokenizer()
    df["Level of interest"] = df["Level of interest"].astype(int)
    sorted_indices = df.sort_values(by="Level of interest", ascending=False).index.tolist()

    token_thresh = 128000
    total_tokens = 0
    all_candidates = []

    for ind in sorted_indices:
        if ind == 0 or ind == len(sorted_indices) - 1:
            continue
        cand = candidates[ind - 1]  # -1 because we excluded the first and last topics from the candidates computation
        if len(cand) == 0:
            continue
        df_output = pd.DataFrame(cand)
        df_output = df_output.drop("uttrances_speaker", axis=1)
        formatted = format_as_markdown_table(df_output)
        str_tokens = len(tokenizer.get_tokens(formatted, model_name=model_name)["input_ids"])
        if total_tokens + str_tokens <= token_thresh:
            total_tokens += str_tokens
            all_candidates += cand

    df_output = pd.DataFrame(all_candidates)
    df_output = df_output.drop("uttrances_speaker", axis=1)

    formatted = format_as_markdown_table(df_output)

    return formatted


def is_not_first_or_last(index):
    parts = index.split("/")
    return parts[0] != "1" and parts[0] != parts[1]


def filter_invalid_rows(df):
    # filter extractives that do not comply with the duration requirements
    res = df[df["Duration Compliance"] != "False"]
    if len(res) > 0:
        # filter extractives the correspond to the first or last abstractives
        condition2 = res["Topic index"].apply(is_not_first_or_last)
        res = res[condition2]
    return res


def ranking_input_cleaner(
    model_completion,
    end_reason,
    logger,
    query_id=None,
    transcript_search_expressions=None,
    write_debug_info=False,
    contexts_blocks=None,
    model_name="gpt-4",
):
    # Parse extractives table with specific error handling
    try:
        df, _ = parse_table_for_display(model_completion, end_reason, write_debug_info, query_id, logger)
    except Exception as e:
        raise ExtractivesTableParsingError(f"Failed to parse extractives table in ranking_input_cleaner: {e}")

    # Validate required columns before processing
    required_columns = ["selection_reason", "is_self_contained", "is_engaging"]
    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        raise ExtractivesTableMissingColumnsError(f"Missing required columns in extractives table: {missing_columns}")

    try:
        df1 = df.drop("selection_reason", axis=1)
        df1 = df1.drop("is_self_contained", axis=1)
        df1 = df1.drop("is_engaging", axis=1)
        formatted = format_as_markdown_table(df1)
    except Exception as e:
        raise HighlightsRankingProcessingFailedError(f"Failed to process extractives for ranking: {e}")

    return formatted


def string_to_range(str_range):
    # Handle both formats: "161-167" and "[161, 167]"
    str_range = str_range.strip()

    if str_range.startswith("[") and str_range.endswith("]"):
        # Handle format "[161, 167]"
        str_range = str_range[1:-1]
        spl = str_range.split(",")
    else:
        # Handle format "161-167"
        spl = str_range.split("-")

    return int(spl[0].strip()), int(spl[1].strip())


# Function to check if range r falls within a range in column 'A'
def is_within(row_range, r):
    row_start, row_end = string_to_range(row_range)
    r_start, r_end = string_to_range(r)
    return r_start >= row_start and r_end <= row_end


def final_input_combiner(dynamic_place_holder, logger, contexts_blocks):
    end_reason = "stop"

    # Parse abstractives table (df1) with specific error handling
    try:
        df1, _ = parse_table_for_display(dynamic_place_holder["$abstractives_output$"], end_reason, logger=logger)
    except Exception as e:
        raise AbstractivesTableParsingError(f"Failed to parse abstractives model output: {e}")

    # Parse extractives table (df2) with specific error handling
    try:
        df2, _ = parse_table_for_display(dynamic_place_holder["$ranked_extractives$"], end_reason, logger=logger)
    except Exception as e:
        raise ExtractivesTableParsingError(f"Failed to parse extractives model output: {e}")

    # Check if df2 is empty
    if df2.empty:
        raise EmptyHighlightsError("Model returned an empty set of highlights")

    # Validate required columns in abstractives table
    required_abstractives_columns = ["Topic Utterance Range"]
    missing_abstractives_cols = [col for col in required_abstractives_columns if col not in df1.columns]
    if missing_abstractives_cols:
        raise AbstractivesTableMissingColumnsError(f"Missing required columns in abstractives table: {missing_abstractives_cols}")

    # Validate required columns in extractives table
    required_extractives_columns = ["range", "overall rank", "self-containment"]
    missing_extractives_cols = [col for col in required_extractives_columns if col not in df2.columns]
    if missing_extractives_cols:
        raise ExtractivesTableMissingColumnsError(f"Missing required columns in extractives table: {missing_extractives_cols}")

    # Extract topic ranges with error handling
    try:
        topics = []
        range_col = df2["range"]
        for r in range_col:
            idx = df1[df1["Topic Utterance Range"].apply(lambda x: is_within(x, r))].index.tolist()
            if not idx:
                raise TopicRangeExtractionFailedError(f"No matching topic found for range: {r}")
            topics.append(idx[0])
        df2["topic"] = topics
    except Exception as e:
        if isinstance(e, TopicRangeExtractionFailedError):
            raise
        raise TopicRangeExtractionFailedError(f"Failed to extract topic ranges: {e}")

    # Check if overall rank column can be converted to int
    try:
        df2["overall rank"] = df2["overall rank"].astype(int)
    except (ValueError, TypeError) as e:
        raise InvalidOverallRankError(f"Invalid 'overall rank' values that cannot be converted to integers: {e}")

    # Process self-containment filtering with error handling
    try:
        df2["self-containment"] = df2["self-containment"].map({"true": True, "false": False})
        df2_filt = df2[df2["self-containment"]]

        # Check if no self-contained highlights exist
        if df2_filt.empty:
            raise NoSelfContainedHighlightsError("No self-contained highlights found in the model output")

        max_rank = df2_filt.groupby("topic")["overall rank"].transform(min)
        df2_filt2 = df2_filt[df2_filt["overall rank"] == max_rank]

        # Check if final filtering results in empty DataFrame
        if df2_filt2.empty:
            raise HighlightsCandidateFilteringFailedError("Final filtering resulted in no highlights - candidate filtering failed")
    except (NoSelfContainedHighlightsError, HighlightsCandidateFilteringFailedError):
        raise
    except Exception as e:
        raise HighlightsCandidateFilteringFailedError(f"Failed during highlights candidate filtering: {e}")

    # Process ranking with error handling
    try:
        min_index = df2_filt2["overall rank"].idxmin()
        rng = df2["range"].iloc[min_index]
        tpc = df2["topic"].iloc[min_index]
    except Exception as e:
        raise HighlightsRankingProcessingFailedError(f"Failed to process highlights ranking: {e}")

    # add extractive range column:
    ext = ["" for x in range(len(df1))]
    ext[tpc] = rng
    df1["extractive range"] = ext

    # add extractive texts column
    start, end = string_to_range(rng)
    ext[tpc] = contexts_blocks[0]["uttrances_texts"][start : end + 1]
    df1["extractive text"] = ext

    # add extractive texts column
    ext[tpc] = [speaker_dict["userDisplayName"] for speaker_dict in contexts_blocks[0]["uttrances_speakers_info"]][start]
    df1["speaker"] = ext

    formatted = format_as_markdown_table(df1)
    res = formatted

    dynamic_place_holder["$combined_input$"] = res
    return dynamic_place_holder


def get_sample_utternaces(contexts_blocks):
    if contexts_blocks == None or len(contexts_blocks) == 0 or "uttrances_texts" not in contexts_blocks[0]:
        return [""]
    n_utterances = len(contexts_blocks[0]["uttrances_texts"])

    if n_utterances <= 7:
        return contexts_blocks[0]["uttrances_texts"]

    mid_utt = round(n_utterances / 2)
    return contexts_blocks[0]["uttrances_texts"][mid_utt - 3 : mid_utt + 3]


def is_meeting_supported_for_highlights(contexts_blocks):

    if (
        contexts_blocks == None
        or len(contexts_blocks) == 0
        or "uttrances_start_times" not in contexts_blocks[0]
        or "uttrances_end_times" not in contexts_blocks[0]
        or len(contexts_blocks[0]["uttrances_start_times"]) == 0
        or len(contexts_blocks[0]["uttrances_end_times"]) == 0
    ):
        return False

    start = contexts_blocks[0]["uttrances_start_times"][0]
    end = contexts_blocks[0]["uttrances_end_times"][-1]
    duration_in_min = (end - start) / 60
    if duration_in_min <= 10 or duration_in_min >= 90:
        return False

    return True
