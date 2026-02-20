{
  "title": "MeetingHighlightsOutput",
  "type": "object",
  "required": [
    "abstractive_topics",
    "topic_order",
    "extractive_ranges",
    "ranking",
    "final_narrative",
    "self_checks"
  ],
  "additionalProperties": false,
  "properties": {
    "abstractive_topics": {
      "type": "array",
      "description": "Ordered list of strictly sequential, non-overlapping semantic topics. Each topic's start position must be after the previous topic's end (no shared utterances).",
      "items": {
        "type": "object",
        "required": [
          "topic_id",
          "topic_title",
          "start",
          "end",
          "narration",
          "playback_start",
          "is_intro",
          "category",
          "interest_level"
        ],
        "additionalProperties": false,
        "properties": {
          "topic_id": {
            "type": "string",
            "pattern": "^[A-Z]{3}$",
            "description": "3 random uppercase letters; unique per topic."
          },
          "topic_title": {
            "type": "string",
            "maxLength": 30,
            "description": "Concise (1-3 words ideally) human-readable label."
          },
          "start": {
            "type": "object",
            "required": [
              "turn_id",
              "utterance_id"
            ],
            "additionalProperties": false,
            "properties": {
              "turn_id": {
                "type": "integer",
                "minimum": 0,
                "description": "Span number (strip 't' prefix, e.g., 't3' → 3)."
              },
              "utterance_id": {
                "type": "integer",
                "minimum": 0,
                "description": "Local utterance ID (strip 'u' prefix, e.g., 'u2' → 2)."
              }
            },
            "description": "Topic start position."
          },
          "end": {
            "type": "object",
            "required": [
              "turn_id",
              "utterance_id"
            ],
            "additionalProperties": false,
            "properties": {
              "turn_id": {
                "type": "integer",
                "minimum": 0,
                "description": "Span number."
              },
              "utterance_id": {
                "type": "integer",
                "minimum": 0,
                "description": "Local utterance ID (inclusive)."
              }
            },
            "description": "Topic end position."
          },
          "narration": {
            "type": "string",
            "maxLength": 350,
            "description": "Abstractive summary (<=350 chars / <=40 words)."
          },
          "playback_start": {
            "type": "object",
            "required": [
              "turn_id",
              "utterance_id"
            ],
            "additionalProperties": false,
            "properties": {
              "turn_id": {
                "type": "integer",
                "minimum": 0,
                "description": "Span number."
              },
              "utterance_id": {
                "type": "integer",
                "minimum": 0,
                "description": "Local utterance ID."
              }
            },
            "description": "Playback anchor within topic."
          },
          "is_intro": {
            "type": "boolean",
            "const": false,
            "description": "Always false; intro content excluded."
          },
          "category": {
            "type": "string",
            "enum": [
              "important feedback",
              "exciting news or declaration",
              "part of a demo",
              "decision rationale",
              "problem analysis",
              "action planning",
              "design explanation",
              "status update",
              "technical discussion",
              "risk assessment",
              "priority discussion",
              "knowledge sharing",
              "other"
            ],
            "description": "High-level topic classification; 'other' for substantive content not fitting main categories."
          },
          "interest_level": {
            "type": "integer",
            "minimum": 0,
            "maximum": 100,
            "description": "Salience score 0-100 (higher = more compelling)."
          }
        }
      }
    },
    "topic_order": {
      "type": "array",
      "description": "Ordered list of topic_ids reflecting the chronological order in which topics appear in the transcript (based on turn utterances positions). final_narrative MUST follow this order.",
      "items": {
        "type": "string",
        "pattern": "^[A-Z]{3}$",
        "description": "Topic ID from abstractive_topics."
      }
    },
    "extractive_ranges": {
      "type": "array",
      "description": "Selected verbatim single-speaker highlight ranges (<=10 total, <=2 per topic). Each extractive MUST be fully contained within its associated topic's start/end boundaries. If no quality extractive exists within a topic's bounds, omit it entirely (quality over quantity).",
      "items": {
        "type": "object",
        "required": [
          "topic_id",
          "selected_turn_opening_tag_raw_copy_from_input",
          "speaker_name",
          "turn_id",
          "selected_start_position",
          "candidate_end_utterance_ids_within_max_boundary",
          "final_chosen_end_utterance_id_from_candidates",
          "selection_reason",
          "self_containment_score",
          "is_engaging"
        ],
        "additionalProperties": false,
        "properties": {
          "topic_id": {
            "type": "string",
            "pattern": "^[A-Z]{3}$",
            "description": "Owning topic identifier."
          },
          "selected_turn_opening_tag_raw_copy_from_input": {
            "type": "string",
            "description": "The complete turn opening tag for the selected turn containing this extractive range, copied EXACTLY as it appears in the input transcript without any modification (e.g., '<t0 SpeakerA>'). This identifies which turn the extractive is selected from."
          },
          "speaker_name": {
            "type": "string",
            "description": "Speaker name extracted from the selected_turn_opening_tag_raw_copy_from_input (e.g., 'SpeakerA' from '<t0 SpeakerA>')."
          },
          "turn_id": {
            "type": "integer",
            "minimum": 0,
            "description": "Turn number parsed from the selected_turn_opening_tag_raw_copy_from_input by stripping 't' prefix and converting to integer (e.g., '<t3 Speaker>' → 3)."
          },
          "selected_start_position": {
            "type": "object",
            "description": "Selected start position from the turn with its associated maximum end boundary information. The max_allowed_end comes from the max_end_utterance_id column for this specific start utterance.",
            "required": [
              "raw_pipe_delimited_table_row_copied_from_input",
              "start_utterance_id_parsed_from_first_column",
              "max_end_utterance_id_parsed_from_third_column"
            ],
            "additionalProperties": false,
            "properties": {
              "raw_pipe_delimited_table_row_copied_from_input": {
                "type": "string",
                "description": "The complete pipe-delimited table row copied EXACTLY as it appears in the input transcript without any modification (e.g., 'u5|this is a very important development|u22'). Format: utterance_id|utterance_text|max_end_utterance_id."
              },
              "start_utterance_id_parsed_from_first_column": {
                "type": "integer",
                "minimum": 0,
                "description": "Starting utterance ID extracted from the first column of the table row by stripping 'u' prefix and converting to integer (e.g., 'u2' → 2). This is the first utterance of your extractive range."
              },
              "max_end_utterance_id_parsed_from_third_column": {
                "type": "integer",
                "minimum": 0,
                "description": "Maximum allowed ending utterance ID for this start position, extracted from the third column of the table row by stripping 'u' prefix and converting to integer (e.g., 'u22' → 22). This is a boundary constraint, not a target."
              }
            }
          },
          "candidate_end_utterance_ids_within_max_boundary": {
            "type": "array",
            "description": "Up to 3 candidate end IDs (prefer sentence endings; fallback to best break points if none available). Each MUST be >= start_utterance_id and <= max_end_utterance_id.",
            "items": {
              "type": "object",
              "required": [
                "is_within_max_allowed_boundary",
                "utterance_id"
              ],
              "additionalProperties": false,
              "properties": {
                "is_within_max_allowed_boundary": {
                  "type": "boolean",
                  "const": true,
                  "description": "Always true; validates that this candidate end ID is <= max_end_utterance_id (respects the boundary constraint)."
                },
                "utterance_id": {
                  "type": "integer",
                  "minimum": 0,
                  "description": "Candidate end ID (ideally at sentence boundary)."
                }
              }
            }
          },
          "final_chosen_end_utterance_id_from_candidates": {
            "type": "integer",
            "minimum": 0,
            "description": "Final end ID from candidates. MUST be >= start_utterance_id and <= max_end_utterance_id. Prefer sentence boundaries."
          },
          "selection_reason": {
            "type": "string",
            "enum": [
              "important feedback",
              "exciting news or declaration",
              "part of a demo",
              "decision rationale",
              "problem analysis",
              "action planning",
              "design explanation",
              "status update",
              "technical discussion",
              "risk assessment",
              "priority discussion",
              "knowledge sharing",
              "other"
            ],
            "description": "Reason for selection; 'other' for substantive content not fitting main categories."
          },
          "self_containment_score": {
            "type": "integer",
            "minimum": 0,
            "maximum": 100,
            "description": "0-100 self-containment score (100 = fully interpretable without context, coherent sentence boundaries without dangling clauses)."
          },
          "is_engaging": {
            "type": "boolean",
            "description": "Subjective engagement value assessment."
          }
        }
      }
    },
    "ranking": {
      "type": "array",
      "description": "Quality ranking of each extractive turn (one entry per extractive).",
      "items": {
        "type": "object",
        "required": [
          "topic_id",
          "turn_id",
          "start_utterance_id",
          "end_utterance_id",
          "clarity_score",
          "self_containment_score",
          "interest_level",
          "overall_rank"
        ],
        "additionalProperties": false,
        "properties": {
          "topic_id": {
            "type": "string",
            "pattern": "^[A-Z]{3}$",
            "description": "Topic identifier for the ranked extractive."
          },
          "turn_id": {
            "type": "integer",
            "minimum": 0,
            "description": "Span number (matches extractive_ranges)."
          },
          "start_utterance_id": {
            "type": "integer",
            "minimum": 0,
            "description": "Start utterance ID."
          },
          "end_utterance_id": {
            "type": "integer",
            "minimum": 0,
            "description": "End utterance ID (inclusive)."
          },
          "clarity_score": {
            "type": "integer",
            "minimum": 0,
            "maximum": 100,
            "description": "0-100 clarity measure (100 = completely clear)."
          },
          "self_containment_score": {
            "type": "integer",
            "minimum": 0,
            "maximum": 100,
            "description": "Self-containment 0-100 (100 = fully interpretable standalone)."
          },
          "interest_level": {
            "type": "integer",
            "minimum": 0,
            "maximum": 100,
            "description": "Salience score for ranking."
          },
          "overall_rank": {
            "type": "integer",
            "minimum": 1,
            "description": "Unique integer 1..N (1 = highest quality)."
          }
        }
      }
    },
    "final_narrative": {
      "type": "array",
      "description": "Ordered narrative rows (one per topic) with rephrased narration and optional extractive linkage.",
      "items": {
        "type": "object",
        "required": [
          "topic_id",
          "topic_title",
          "narration_for_final_output",
          "playback_start",
          "extractive"
        ],
        "additionalProperties": false,
        "properties": {
          "topic_id": {
            "type": "string",
            "pattern": "^[A-Z]{3}$",
            "description": "Topic identifier (must match abstractive topic)."
          },
          "topic_title": {
            "type": "string",
            "description": "Copied topic title for direct consumption."
          },
          "narration_for_final_output": {
            "type": "string",
            "description": "Narrative sequence for final output WITHOUT the transition sentence; final topic must begin with closing cue token ('Lastly', 'Finally', 'In conclusion', etc.)."
          },
          "playback_start": {
            "type": "object",
            "required": [
              "turn_id",
              "utterance_id"
            ],
            "additionalProperties": false,
            "properties": {
              "turn_id": {
                "type": "integer",
                "minimum": 0,
                "description": "Span number."
              },
              "utterance_id": {
                "type": "integer",
                "minimum": 0,
                "description": "Local utterance ID."
              }
            },
            "description": "Playback anchor."
          },
          "extractive": {
            "type": [
              "object",
              "null"
            ],
            "required": [
              "turn_id",
              "start_utterance_id",
              "end_utterance_id",
              "transition_sentence"
            ],
            "additionalProperties": false,
            "properties": {
              "turn_id": {
                "type": "integer",
                "minimum": 0,
                "description": "Span number."
              },
              "start_utterance_id": {
                "type": "integer",
                "minimum": 0,
                "description": "Start utterance ID."
              },
              "end_utterance_id": {
                "type": "integer",
                "minimum": 0,
                "description": "End utterance ID."
              },
              "transition_sentence": {
                "type": "string",
                "description": "Bridge to extractive audio (e.g., 'let's hear how...', 'here's what was said...'). Ensure speaker consistency. Do NOT include in narration_for_final_output."
              }
            },
            "description": "Extractive range with transition, or null if none."
          }
        }
      }
    },
    "self_checks": {
      "type": "object",
      "description": "Automatic validation flags for downstream acceptance/rejection.",
      "required": [
        "topic_non_overlap",
        "extractive_non_overlap",
        "extractive_within_topic_bounds",
        "max_two_extractives_per_topic",
        "all_extractives_ranked",
        "final_narrative_alignment",
        "rai_policy_pass",
        "turn_boundary_compliance",
        "topic_order_compliance",
        "narration_excludes_transition"
      ],
      "additionalProperties": false,
      "properties": {
        "topic_non_overlap": {
          "type": "boolean",
          "description": "True if topics are strictly sequential with no shared utterances. Adjacent topics A and B: A.end position < B.start position."
        },
        "extractive_non_overlap": {
          "type": "boolean",
          "description": "True if no extractive turns overlap in turn/index space."
        },
        "extractive_within_topic_bounds": {
          "type": "boolean",
          "description": "True if all extractives fully contained within their topic's [start, end] boundaries. Extractive turn_id within [topic.start.turn_id, topic.end.turn_id]; if same turn, utterance IDs within topic bounds."
        },
        "max_two_extractives_per_topic": {
          "type": "boolean",
          "description": "True if each topic has <=2 extractive turns."
        },
        "all_extractives_ranked": {
          "type": "boolean",
          "description": "True if each extractive appears once in the ranking array."
        },
        "final_narrative_alignment": {
          "type": "boolean",
          "description": "True if final_narrative aligns with topics and extractive links."
        },
        "turn_boundary_compliance": {
          "type": "boolean",
          "description": "True if extractives: (1) within single turn, (2) final_chosen_end_utterance_id <= max_end_utterance_id, (3) final_chosen_end is one of the candidate_end_utterance_ids."
        },
        "topic_order_compliance": {
          "type": "boolean",
          "description": "True if topic_order reflects chronological transcript order (matching abstractive_topics order) AND final_narrative follows topic_order."
        },
        "narration_excludes_transition": {
          "type": "boolean",
          "description": "True if narration_for_final_output does not contain the transition_sentence text from the extractive."
        },
        "rai_policy_pass": {
          "type": "boolean",
          "description": "True if content complies with RAI constraints."
        }
      }
    }
  }
}