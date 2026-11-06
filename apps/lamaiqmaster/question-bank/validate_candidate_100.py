#!/usr/bin/env python3
"""Validate supplemental rule-derived questions before any Android integration."""
import json
from pathlib import Path

paths = [Path(__file__).with_name(name) for name in ("number_logic_candidate_100.json", "advanced_candidate_100.json")]
for path in paths:
    pack = json.loads(path.read_text(encoding="utf-8"))
    items = pack["questions"]
    assert len(items) == pack["count"] == 100
    assert len({q["id"] for q in items}) == 100
    assert len({q["prompt"] for q in items}) == 100
    assert len({q["kind"] for q in items}) >= 10
    for q in items:
        assert q["field"] == pack["field"]
        assert 1 <= q["level"] <= 10
        assert len(q["options"]) == len(set(q["options"])) == 4
        assert 0 <= q["correctIndex"] < 4
        assert q["options"][q["correctIndex"]]
        assert q["explanation"]
        assert q["reviewStatus"] == "automated-verified"
    print(f"PASS: {path.name}, {len(items)} candidates, {len({q['kind'] for q in items})} mechanisms")
print("LIMIT: Structural checks are not independent answer verification or editorial approval.")
