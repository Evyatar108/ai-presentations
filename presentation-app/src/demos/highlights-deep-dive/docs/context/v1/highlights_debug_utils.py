# type: ignore
# pylint: skip-file

import json
import os
import sys
from datetime import datetime
from pathlib import Path
from time import time

import numpy as np
import pandas as pd

parent_dir = str(Path(__file__).resolve().parents[2])  # Adjust the number of parents based on actual structure
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from SummarizeService.DisplayModelCompletion import parse_table_for_display


def write_offline_results_to_files(polymer_output_folder_path, offline_highlights_results):
    meeting_name = os.path.basename(os.path.normpath(polymer_output_folder_path))
    with open(os.path.join(polymer_output_folder_path, f"{meeting_name}_highlights.json"), "w", encoding="utf-8") as file:
        json.dump(offline_highlights_results, file, ensure_ascii=False, indent=0)
    with open(os.path.join(polymer_output_folder_path, f"{meeting_name}_highlights_manual_debug.json"), "w", encoding="utf-8") as file:
        if offline_highlights_results == []:
            # scenario is not supported by highlights (foreign language or unsupported transcript length)
            json.dump(offline_highlights_results, file, ensure_ascii=False, indent=0)
            return
        manual_res = []
        for res in offline_highlights_results:
            d = {}
            d["index"] = res["id"]
            d["startTime"] = res["start_time_rel"]
            d["duration"] = res["duration"]
            d["displayMode"] = res["displayMode"]
            if "sentence" in res:
                d["sentence"] = res["sentence"]
            if "narration" in res:
                d["narration"] = res["narration"]
                d["muted"] = True

            manual_res.append(d)
        json.dump(manual_res, file, ensure_ascii=False, indent=0)


def add_debug_row_to_df(
    df,
    model_name,
    prompt_id,
    end_reason,
    model_run_time,
    num_extractives,
    num_topics,
    last_has_extractive,
    is_all_is_agenda_false,
    index,
    topic,
    narration,
    intro_sentence,
    line_range,
    speakers_in_extractive,
    extractive_transcript,
    extractive_selection_reason,
    extractive_duration_claculation_gpt,
    actual_extractive_duration,
    duration_compliance,
    is_agenda,
):
    new_row = {}
    new_row["model_name"] = model_name
    new_row["prompt_id"] = prompt_id
    new_row["end reason"] = (end_reason,)
    new_row["model_run_time"] = model_run_time
    new_row["# of extractives"] = num_extractives
    new_row["# of topics"] = num_topics
    new_row["does last topic has an extractive"] = last_has_extractive
    new_row["is all is_agnda False"] = is_all_is_agenda_false
    new_row["topic_index"] = index
    new_row["topic title"] = topic
    new_row["narration"] = narration
    new_row["transition sentence"] = intro_sentence
    new_row["extractive line_range"] = line_range
    new_row["speakers in extractive"] = speakers_in_extractive
    new_row["extractive transcript"] = extractive_transcript
    new_row["extractive selection reason"] = extractive_selection_reason
    new_row["extractive duration calculation in secs"] = extractive_duration_claculation_gpt
    new_row["extractice actual duration calculation in secs"] = actual_extractive_duration
    new_row["duration compliance"] = duration_compliance
    new_row["is_agenda"] = is_agenda

    df = df.append(new_row, ignore_index=True)
    return df


def string_range_to_tuple_list(string_range):
    range_lst = string_range.split(",")
    res = []
    for r in range_lst:
        inx = r.find("-")
        start = int(r[0:inx])
        end = int(r[inx + 1 :])
        res.append((start, end))
    return res


def indices_range_to_transcript_sentences(transcript_df, range_strings):
    if range_strings == "" or range_strings == "NA":
        return ""

    range_lst = string_range_to_tuple_list(range_strings)
    res = ""
    for r in range_lst:
        start = r[0]
        end = r[1]
        res += f"utterances {range_strings}:\n"
        for i in range(start, end + 1):
            speaker = transcript_df.iloc[i].SpeakerName
            sentence = transcript_df.iloc[i].TranscriptSentence
            res += f"idx: {i}, {speaker}: {sentence}\n"
    return res


def get_speakers_in_extractive(transcript_df, range_strings):
    speakers = []
    if range_strings == "" or range_strings == "NA":
        return speakers

    range_lst = string_range_to_tuple_list(range_strings)
    for r in range_lst:
        start = r[0]
        end = r[1]
        for i in range(start, end + 1):
            speakers.append(transcript_df.iloc[i].SpeakerName)
    return ",".join(speakers)


def parse_datetime(datetime_str):
    # List of possible format strings
    format_strings = [
        "%Y-%m-%d %H:%M:%S.%f%z",
        "%Y-%m-%d %H:%M:%S%z",  # With timezone offset
        "%Y-%m-%d %H:%M:%S",  # Without timezone offset
    ]

    for format_str in format_strings:
        try:
            return datetime.strptime(datetime_str, format_str)
        except ValueError:
            continue

    # If none of the formats matched, raise an error
    raise ValueError(f"time data '{datetime_str}' does not match any of the given formats")


def indices_range_to_transcript_duration(transcript_df, range_strings):
    if range_strings == "" or range_strings == "NA":
        return 0

    range_lst = string_range_to_tuple_list(range_strings)
    res = 0
    for r in range_lst:
        start = r[0]
        end = r[1]
        start_time = transcript_df.iloc[start].StartTime
        end_time = transcript_df.iloc[end].EndTime
        if type(start_time) == str:
            # start_time = datetime.strptime(start_time, "%Y-%m-%d %H:%M:%S.%f%z")
            start_time = parse_datetime(start_time)
        if type(end_time) == str:
            # end_time = datetime.strptime(end_time, "%Y-%m-%d %H:%M:%S.%f%z")
            end_time = parse_datetime(end_time)

        duration = end_time - start_time
        res += duration.seconds
    return round(res)


def get_gpt_duration_result(duration_str):
    if duration_str == "NA":
        return duration_str
    return float(duration_str)


def is_model_response_for_highlights_not_supported(model_answer):
    return len(json.loads(model_answer["displayTextResults"]["displayText"])["meetingHighlights"]) == 0


def generate_debug_files(model_answer, transcript_df, debug_file_path):
    os.makedirs(debug_file_path, exist_ok=True)
    raw_model_response = model_answer["displayTextResults"]["modelCompletion"]
    if model_answer["displayTextResults"]["modelCompletion"] == "":
        write_offline_results_to_files(debug_file_path, [])
        return
    end_reason = model_answer["telemetry"]["modelCalls"][0]["endReason"]
    model_name = model_answer["telemetry"]["modelCalls"][0]["openaiModel"]
    model_run_time = model_answer["telemetry"]["modelCalls"][0]["modelLatency"] / 1000
    prompt_id = model_answer["userQuestion"]["id"]

    highlights_df, _ = parse_table_for_display(raw_model_response, end_reason, write_debug_info=False)
    highlights_df.set_axis(
        [
            "topic",
            "narration",
            "playback",
            "intro_sentence",
            "line_range",
            # "selection_reason",
        ],
        axis=1,
        inplace=True,
    )

    meeting_highlights_display_text = json.loads(model_answer["displayTextResults"]["displayText"])["meetingHighlights"]
    write_offline_results_to_files(debug_file_path, meeting_highlights_display_text)

    # temp - fix to collect statistics
    return
    columns = [
        "model_name",
        "prompt_id",
        "end reason",
        "model_run_time",
        "# of extractives",
        "# of topics",
        "does last topic has an extractive",
        "is all is_agnda False",
        "topic_index",
        "topic title",
        "narration",
        "transition sentence",
        "extractive line_range",
        "speakers in extractive",
        "extractive transcript",
        "extractive selection reason",
        "extractive duration calculation in secs",
        "extractice actual duration calculation in secs",
        "extractive compliance",
        "is_agenda",
    ]

    df = pd.DataFrame(data={}, columns=columns)
    num_extractives = (highlights_df["highlight_length"] != "NA").sum()
    num_topics = len(highlights_df)
    last_has_extractive = highlights_df.iloc[len(highlights_df) - 1].highlight_length != "NA"
    is_all_is_agenda_false = (highlights_df["is_agenda"] == "False").all()

    for index, row in highlights_df.iterrows():
        topic = highlights_df.iloc[index].topic
        line_range = highlights_df.iloc[index]["line_range"]
        narration = highlights_df.iloc[index]["narration"]
        extractive_transcript = indices_range_to_transcript_sentences(transcript_df, line_range)
        speakers_in_extractive = get_speakers_in_extractive(transcript_df, line_range)
        intro_sentence = highlights_df.iloc[index]["intro_sentence"]
        is_agenda = highlights_df.iloc[index]["is_agenda"]
        extractive_selection_reason = highlights_df.iloc[index]["selection_reason"]
        actual_extractive_duration = indices_range_to_transcript_duration(transcript_df, line_range)
        extractive_duration_claculation_gpt = get_gpt_duration_result(highlights_df.iloc[index].highlight_length)
        duration_compliance = highlights_df.iloc[index]["duration_compliance"]

        df = add_debug_row_to_df(
            df,
            model_name,
            prompt_id,
            end_reason,
            model_run_time,
            num_extractives,
            num_topics,
            last_has_extractive,
            is_all_is_agenda_false,
            index,
            topic,
            narration,
            intro_sentence,
            line_range,
            speakers_in_extractive,
            extractive_transcript,
            extractive_selection_reason,
            extractive_duration_claculation_gpt,
            actual_extractive_duration,
            duration_compliance,
            is_agenda,
        )
    write_debug_data_to_file(os.path.basename(debug_file_path), df, debug_file_path)


def write_debug_data_to_file(meeting_name, df, debug_file_path):

    debug_file_path = os.path.join(debug_file_path, f"{meeting_name}_debug_data.csv")
    # if os.path.exists(debug_file_path):
    #     df_old = pd.read_csv(debug_file_path, index_col=0)
    #     df = pd.concat([df_old, df], ignore_index=True)
    df.to_csv(debug_file_path)


def calc_statistics(parent_meeting_foler):
    start_time = time()
    csv_files = []
    stats = {
        "model_name": set(),
        "prompt_name": set(),
        "model_run_time": [],
        "number_of_topics": [],
        "number_of_extractives": [],
        "last_topic_has_extractive": [],
        "extractive_duration_secs": [],
        "extractive_actual_duration_secs": [],
    }

    # Traverse the directory and collect all relevant CSV files
    for root, dirs, files in os.walk(parent_meeting_foler):
        for file in files:
            if file.endswith("_debug_data.csv"):
                csv_files.append(os.path.join(root, file))

    # Process each CSV file
    for file in csv_files:
        df = pd.read_csv(file)

        # Collect data
        stats["model_name"].update(df["model_name"].unique())
        stats["prompt_name"].update(df["prompt_id"].unique())  # Assuming prompt_id is the prompt name
        stats["model_run_time"].append(df["model_run_time"].iloc[0])
        stats["number_of_topics"].append(df["# of topics"].iloc[0])
        stats["number_of_extractives"].append(df["# of extractives"].iloc[0])
        stats["last_topic_has_extractive"].append(df["does last topic has an extractive"].iloc[0])
        # Convert to numeric, setting errors='coerce' to turn non-numeric values into NaN, then drop NaN values
        stats["extractive_duration_secs"].extend(
            pd.to_numeric(df["extractive duration calculation in secs"], errors="coerce").dropna().tolist()
        )
        # stats['extractive_actual_duration_secs'].extend(pd.to_numeric(df['extractice actual duration calculation in secs'], errors='coerce').dropna().tolist())
        filtered_values = pd.to_numeric(df["extractice actual duration calculation in secs"], errors="coerce").dropna()
        filtered_values = filtered_values[filtered_values != 0]
        stats["extractive_actual_duration_secs"].extend(filtered_values.tolist())

    # Calculate required statistics
    model_runtime = np.array(stats["model_run_time"], dtype=float)
    number_of_topics = np.array(stats["number_of_topics"], dtype=int)
    number_of_extractives = np.array(stats["number_of_extractives"], dtype=int)
    extractive_duration = np.array(stats["extractive_duration_secs"], dtype=float)
    actual_duration = np.array(stats["extractive_actual_duration_secs"], dtype=float)
    duration_error = np.abs(extractive_duration - actual_duration)

    results = {
        "Statistics run time": time() - start_time,
        "Model name": list(stats["model_name"])[0] if stats["model_name"] else None,
        "Prompt name": list(stats["prompt_name"])[0] if stats["prompt_name"] else None,
        "Total number of meetings": len(csv_files),
        "Avg model runtime": np.mean(model_runtime),
        "Min model runtime": np.min(model_runtime),
        "Max model runtime": np.max(model_runtime),
        "Avg # of topics": np.mean(number_of_topics),
        "Min # of topics": np.min(number_of_topics),
        "Max # of topics": np.max(number_of_topics),
        "Avg # of extractives": np.mean(number_of_extractives),
        "Min # of extractives": np.min(number_of_extractives),
        "Max # of extractives": np.max(number_of_extractives),
        "Percentage ends with extractive": np.mean([x == "True" for x in stats["last_topic_has_extractive"]]) * 100,
        "Avg extractive duration": np.mean(extractive_duration),
        "Min extractive duration": np.min(extractive_duration),
        "Max extractive duration": np.max(extractive_duration),
        "Avg GPT calculation error": np.mean(duration_error),
        "Min GPT calculation error": np.min(duration_error),
        "Max GPT calculation error": np.max(duration_error),
    }

    # Write or append to the statistics.csv file
    stats_path = Path(r"C:\Users\t-liperry\OneDrive - Microsoft\meeting highlights\statistics\statistics.csv")
    if stats_path.exists():
        existing_stats = pd.read_csv(stats_path)
        result_df = pd.DataFrame(results, index=[0])
        updated_stats = pd.concat([existing_stats, result_df], axis=1)
    else:
        updated_stats = pd.DataFrame(results, index=[0])

    updated_stats.to_csv(stats_path, index=False)


if __name__ == "__main__":
    parent_meetings_folder = r"C:\Users\t-liperry\OneDrive - Microsoft\Meeting Resources Lilach\test"
    calc_statistics(parent_meetings_folder)
