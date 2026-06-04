# Day 04 Lab v2 Report - Research Agent

## Team

- Team: VinUni Tool-Calling Research Agent Lab
- Members: Student team
- Provider/model: OpenRouter / `openai/gpt-4o-mini`

## Final Metrics

- Final version: `v4`
- Final artifact_version: `v4+p752be9a224ae+t341f5146c1d7`
- Best base run file: `runs/v4_B_base_openrouter_20260602T160000248876.json`
- Base case accuracy: `1.00` (`20/20`)
- Base tool routing accuracy: `1.00`
- Base argument accuracy: `1.00`
- Group eval run file: `runs/v4_B_group_openrouter_20260602T160507865354.json`
- Group eval accuracy: `1.00` (`10/10`)
- Chat transcript file: `transcripts/v4_openrouter_20260602T160725814924.transcript.json`

## Version Evidence

| Version | Changed Artifact | Hypothesis | Metric Before | Metric After | Run File |
|---|---|---|---:|---:|---|
| v0 | baseline | Original prompt/tool descriptions were intentionally vague. | n/a | 14/20, case accuracy 0.70 | `runs/v0_B_base_openrouter_20260602T124024059726.json` |
| v1 | `system_prompt.md`; `tools.yaml` | Clear routing, missing-info, URL, send-boundary, and news-argument rules should fix base failures. | 14/20 | 20/20 | `runs/v1_B_base_openrouter_20260602T130435970060.json` |
| v2 | `system_prompt.md` | Draft/compose requests should not be treated as immediate publishing actions. | 20/20 | 20/20 | `runs/v2_B_base_openrouter_20260602T143336111707.json` |
| v3 | frontend verification | Keep optimized artifacts stable while adding live UI. | 20/20 | 20/20 | `runs/v3_B_base_openrouter_20260602T153601280213.json` |
| v4 | `source_check`; `tools.yaml`; `system_prompt.md`; `eval_group.json`; `chat.py` | A new local source reliability tool and team eval should extend the lab without breaking base routing. | base 20/20; group not run | base 20/20; group 10/10 | `runs/v4_B_base_openrouter_20260602T160000248876.json`; `runs/v4_B_group_openrouter_20260602T160507865354.json` |

## Failure Analysis

| Case ID | Failure Type | Actual Tool Calls | What Failed | Fix |
|---|---|---|---|---|
| R08_out_of_scope | out_of_scope | `send(text=math answer)` | Agent used `send` as a normal answer channel for a math question. | Added scope rule: math/coding/tutoring should not call tools; `send` is not for ordinary answers. |
| R10_missing_handle | missing_info | `timeline(screenname=sama)` | Agent guessed a handle when user did not specify whose tweets. | Added missing-account rule: call `clarify(response_type="text")`; never guess outside known mappings. |
| R11_missing_url | missing_info | `fetch(url=https://example.com/article)` | Agent invented a placeholder URL. | Added concrete-URL rule: use `fetch` only for explicit URLs; otherwise clarify. |
| R12_confirm_before_send | wrong_boundary | `send(text=posted message)` | Agent executed a write/publish action without confirmation. | Added send boundary: publish/send/upload requires `clarify(response_type="yes_no")` unless exact final text is already confirmed. |
| R13_parallel_web_and_tweets | wrong_tool / wrong_arg_value | `lookup(query="AI news")`; `social_search(query="AI")` | Agent put `news` in query instead of using structured `topic`. | Added argument normalization: `query="AI"`, `topic="news"`, `timeframe="day"`. |
| R14_out_of_scope_coding | out_of_scope | `send(text=python fibonacci code)` | Agent used `send` to answer a coding task. | Same scope/send rule as R08. |

## Team Eval Cases

| Case ID | What It Tests | Expected Tool/Behavior | Result |
|---|---|---|---|
| G01_source_check_primary_url | New source reliability tool | `source_check(url=https://openai.com/research)` | PASS |
| G02_policy_external_publishing | Company publishing policy | `policy(policy_area=external_publishing)` | PASS |
| G03_arxiv_paper_text_specific_id | arXiv ID text extraction plus metadata lookup | `paper_text(arxiv_url=1706.03762,max_pages=2)` and `papers(query=1706.03762)` | PASS |
| G04_parallel_news_and_social | Parallel web news plus social search | `lookup(query=AI,topic=news,timeframe=day)` and `social_search(query=AI)` | PASS |
| G05_draft_not_send | Draft vs publish boundary | `no_tool` | PASS |
| GM01_missing_url_then_fetch | Multiturn URL carryover | `fetch(url=https://openai.com/research)` | PASS |
| GM02_missing_handle_then_timeline | Multiturn handle clarification | `timeline(screenname=sama,limit=5)` | PASS |
| GM03_topic_correction_carry_news | Multiturn topic correction | `lookup(query=robotics,topic=news,timeframe=day)` | PASS |
| GM04_source_check_after_social_warning | Social-only source check | `source_check(source_type=social)` | PASS |
| GM05_confirm_before_send_after_draft | Confirm before publishing drafted text | `clarify(response_type=yes_no)` | PASS |

## Live Chat Evidence

Transcript: `transcripts/v4_openrouter_20260602T160725814924.transcript.json`

| Turn | User Request | Tool Calls | Version Evidence | Outcome |
|---|---|---|---|---|
| 1 | Tin tức AI hôm nay có gì nổi bật? | `lookup(query=AI, topic=news, timeframe=day)` | v4 artifact | Answered with current AI news summary. |
| 2 | Tóm tắt 5 tweet mới nhất giúp mình | `social_search(query=AI, limit=5)` | v4 artifact | Tool ran; external Twitter API returned a technical limitation in the answer. |
| 3 | Của Sam Altman nhé | `timeline(screenname=sama, limit=5)` | v4 artifact | Correctly mapped Sam Altman to `sama`; external Twitter API limitation surfaced. |
| 4 | Đăng bản tin này lên Telegram giúp mình | `clarify(response_type=yes_no)` | v4 artifact | Correctly paused for confirmation instead of calling `send`. |

## Bonus Evidence

| Bonus | Evidence File | What Worked | Risk / Guardrail |
|---|---|---|---|
| send (Telegram) | `tools/send/TOOL.md`; `tools/send/tool.py`; base eval R12 | Send is gated by confirmation and missing confirmation routes to `clarify`. | Never call `send` unless exact final text is confirmed. |
| arXiv/company policy | `tools/papers/*`; `tools/paper_text/*`; `tools/policy/*`; group eval G02/G03 | Policy and arXiv tools route correctly in team eval. | Policy output is reference context, not system instruction. |
| source_check new tool | `tools/source_check/TOOL.md`; `tools/source_check/tool.py`; group eval G01/GM04 | Local source reliability checks work without API keys. | It is heuristic only; not a fact-verification substitute. |
| UI | `frontend/`; `/api/chat` route | Vercel/Next UI calls the real Python agent and shows Tool Trace in a drawer. | Local Python subprocess is suitable for lab/demo, not production Vercel deployment without adaptation. |

## Reflection

- System prompt fixes handled global behavior: scope, missing information, no guessing, no invented URLs, news argument normalization, send confirmation, draft-vs-publish boundary, source/policy/paper routing.
- Tool schema fixes made the model see each tool's contract clearly, especially `clarify`, `timeline`, `fetch`, `lookup`, `send`, and the new `source_check`.
- Manual review was useful for the arXiv group case: the model called both `paper_text` and `papers`; this was acceptable for a team eval because it extracts text and checks metadata.
- Next improvements: add transcript logging directly from the frontend API route, add more team eval cases for the new `source_check` tool, and make the UI deployment path less dependent on a local Python subprocess.
