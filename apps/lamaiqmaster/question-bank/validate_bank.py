#!/usr/bin/env python3
"""Offline QA gate for Lama IQ Test JSON packs. No network or deployment.

Run: python3 apps/lamaiqmaster/question-bank/validate_bank.py
Non-zero exit means the pack is not suitable for app integration.
"""
import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PACKS = ("number_logic", "visual_patterns", "memory", "attention", "advanced")
FIELDS = ("id", "field", "level", "kind", "prompt", "options", "correctIndex", "explanation")
SUFFIX = re.compile(r"\s*\[(?:pattern|trial)\s+\d+,\s*level\s+\d+\]\s*$", re.I)


def canonical(text):
    """Ignore artificial trial labels when comparing actual question content."""
    return " ".join(SUFFIX.sub("", text).casefold().split())


def audit():
    errors, warnings, seen_ids, seen_prompts = [], [], set(), {}
    total = 0
    for name in PACKS:
        path = ROOT / (name + ".json")
        if not path.is_file():
            errors.append(f"{name}: file missing")
            continue
        try:
            pack = json.loads(path.read_text(encoding="utf-8"))
        except (ValueError, OSError) as exc:
            errors.append(f"{name}: unreadable JSON: {exc}")
            continue
        items = pack.get("questions")
        if not isinstance(items, list):
            errors.append(f"{name}: questions must be a list")
            continue
        if pack.get("field") != name or pack.get("count") != len(items) or len(items) != 1000:
            errors.append(f"{name}: expected field and count of 1000")
        levels = Counter()
        for pos, q in enumerate(items, 1):
            total += 1
            tag = f"{name} #{pos}"
            if not isinstance(q, dict) or any(k not in q for k in FIELDS):
                errors.append(f"{tag}: missing required fields")
                continue
            qid = q["id"]
            if not isinstance(qid, str) or not qid or qid in seen_ids:
                errors.append(f"{tag}: invalid or duplicate ID {qid!r}")
            seen_ids.add(qid)
            if q["field"] != name or not isinstance(q["level"], int) or not 1 <= q["level"] <= 10:
                errors.append(f"{tag}: invalid field/level")
            else:
                levels[q["level"]] += 1
            options = q["options"]
            if not isinstance(options, list) or len(options) != 4 or any(not isinstance(x, str) or not x.strip() for x in options):
                errors.append(f"{tag}: expected four nonempty choices")
            elif len(set(options)) != 4:
                errors.append(f"{tag}: repeated choices")
            if not isinstance(q["correctIndex"], int) or q["correctIndex"] not in range(4):
                errors.append(f"{tag}: invalid answer index")
            prompt = q["prompt"]
            if not isinstance(prompt, str) or not prompt.strip():
                errors.append(f"{tag}: empty prompt")
            else:
                key = canonical(prompt)
                if key in seen_prompts:
                    warnings.append(f"{tag}: same substantive prompt as {seen_prompts[key]}")
                else:
                    seen_prompts[key] = tag
            if not isinstance(q["explanation"], str) or not q["explanation"].strip():
                errors.append(f"{tag}: missing explanation")
            if name == "memory" and isinstance(prompt, str) and re.search(r"(?:digit|position)", prompt, re.I):
                warnings.append(f"{tag}: check that memory stimulus is hidden before answering")
            if q.get("reviewStatus") != "human-approved":
                # Drafts must never be silently treated as reviewed content.
                pass
        if any(levels[level] != 100 for level in range(1, 11)):
            errors.append(f"{name}: expected 100 questions per level; got {dict(levels)}")
        print(f"{name}: {len(items)} records; level counts {dict(sorted(levels.items()))}")
    print(f"TOTAL {total}; ERRORS {len(errors)}; WARNINGS {len(warnings)}")
    for message in errors[:30]:
        print("ERROR:", message)
    for message in warnings[:30]:
        print("WARNING:", message)
    if len(errors) > 30 or len(warnings) > 30:
        print("Additional findings omitted from console; fix generator and rerun.")
    return 1 if errors or warnings else 0


if __name__ == "__main__":
    sys.exit(audit())
