---
name: source_check
track: bonus
kind: local_formatter
provider: local_rules
requires_env: []
inputs: [url, claim, source_type]
outputs: [domain, verdict, checks, recommendation]
side_effect: false
---
# source_check

Checks whether a source URL or source description is suitable for use in a
research digest or Telegram briefing. This tool does not verify facts by itself;
it applies local heuristics so the agent can flag weak sources, missing URLs,
social-only claims, or sources that need corroboration before publishing.
