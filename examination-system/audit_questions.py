#!/usr/bin/env python3
"""Read-only quality audit for LAMA question-bank JSON. No answer keys are published."""
import argparse
import collections
import json
import pathlib
import re
import sys

def normalize(s):
    return re.sub(r"[^\w]+", " ", str(s).casefold()).strip()

def audit(path):
    data = json.loads(path.read_text(encoding="utf-8"))
    questions = data.get("questions", [])
    ids = collections.Counter(str(q.get("questionId", "")) for q in questions)
    texts = collections.Counter(normalize(q.get("questionText", "")) for q in questions)
    patterns = collections.Counter()
    errors = []
    for i, q in enumerate(questions, 1):
        for field in ("questionId", "questionType", "questionText", "correctAnswer"):
            if not str(q.get(field, "")).strip():
                errors.append(f"record {i}: missing {field}")
        if q.get("questionType") == "mcq":
            options = q.get("options")
            if not isinstance(options, list) or len(options) < 2:
                errors.append(f"record {i}: MCQ needs >=2 options")
            elif str(q.get("correctAnswer")) not in [str(x) for x in options]:
                errors.append(f"record {i}: MCQ answer not in options")
        if q.get("approved") and q.get("reviewStatus") != "approved":
            errors.append(f"record {i}: inconsistent approval status")
        if q.get("onlineReady") and not q.get("approved"):
            errors.append(f"record {i}: online-ready without approval")
        pattern = re.sub(r"\d+", "#", normalize(q.get("questionText", "")))
        patterns[pattern] += 1
    return {
        "file": str(path), "records": len(questions),
        "approved": sum(q.get("approved") is True for q in questions),
        "onlineReady": sum(q.get("onlineReady") is True for q in questions),
        "duplicateIds": {k:v for k,v in ids.items() if v > 1},
        "duplicateExactTexts": {k:v for k,v in texts.items() if v > 1},
        "repeatedNumericTemplates": {k:v for k,v in patterns.items() if v >= 5},
        "errors": errors,
        "note": "Template repetition is a review flag, not proof of semantic duplication. Source/answer correctness requires human review."
    }

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("paths", nargs="+", type=pathlib.Path)
    args = parser.parse_args()
    results = [audit(path) for path in args.paths]
    print(json.dumps(results, ensure_ascii=False, indent=2))
    return 1 if any(x["errors"] or x["duplicateIds"] for x in results) else 0

if __name__ == "__main__":
    sys.exit(main())
