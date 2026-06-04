from __future__ import annotations

from typing import Any
from urllib.parse import urlparse


HIGH_TRUST_DOMAINS = {
    "openai.com",
    "anthropic.com",
    "deepmind.google",
    "ai.google",
    "microsoft.com",
    "nvidia.com",
    "arxiv.org",
    "nature.com",
    "science.org",
}

LOW_TRUST_HINTS = {"viral", "rumor", "rumour", "unconfirmed", "anonymous", "thread"}


def _domain(url: str) -> str:
    parsed = urlparse(url if "://" in url else f"https://{url}")
    return parsed.netloc.lower().removeprefix("www.")


def source_check(url: str = "", claim: str = "", source_type: str = "web") -> dict[str, Any]:
    domain = _domain(url) if url else ""
    checks: list[str] = []
    recommendation = "Use with citation and context."
    verdict = "usable"

    if not url:
      checks.append("missing_url")
      verdict = "needs_more_info"
      recommendation = "Ask for a concrete URL before relying on this source."
    elif domain in HIGH_TRUST_DOMAINS or domain.endswith(".gov") or domain.endswith(".edu"):
      checks.append("recognized_primary_or_high_trust_domain")
    else:
      checks.append("unrecognized_domain")
      verdict = "needs_corroboration"
      recommendation = "Corroborate with a primary or high-trust source before publishing."

    text = f"{claim} {source_type}".lower()
    if any(hint in text for hint in LOW_TRUST_HINTS):
      checks.append("low_trust_claim_language")
      verdict = "needs_corroboration"
      recommendation = "Do not present this as confirmed without another reliable source."

    if source_type.lower() in {"tweet", "twitter", "x", "social"}:
      checks.append("social_source")
      if verdict == "usable":
        verdict = "needs_corroboration"
      recommendation = "Treat social posts as signals; verify with a primary source before publishing."

    return {
        "tool": "source_check",
        "url": url,
        "domain": domain,
        "claim": claim,
        "source_type": source_type,
        "verdict": verdict,
        "checks": checks,
        "recommendation": recommendation,
    }
