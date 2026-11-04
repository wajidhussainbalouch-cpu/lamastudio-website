#!/usr/bin/env python3
"""Detect template inflation in question drafts; read-only, standard library only."""
import collections
import json
import pathlib
import re
import sys

CONTEXTS = [
    "pencils in a classroom", "mangoes in a basket", "books on a shelf",
    "buttons in a box", "flowers in a garden", "marbles in a jar",
    "cups on a table", "kites in a shop", "apples at a stall",
    "toy cars in a bag", "birds on a tree", "chairs in a hall",
    "erasers in a drawer", "stones by a path", "biscuits on a plate",
    "balloons at a party", "oranges in a crate", "crayons in a case",
    "leaves on a branch", "spoons in a kitchen", "pebbles in a bucket",
    "stickers in an album", "seeds in a packet", "shells on a beach",
    "coins in a purse", "ribbons in a basket", "blocks in a tower",
    "eggs in a tray", "candles in a box", "beads on a string",
    "paper clips in a cup", "tulips in a vase",
    "notebooks in a cupboard", "tomatoes in a basket",
    "flags on a wall", "fish in a pond", "keys on a ring",
    "stars on a chart", "cards in a pack", "socks in a drawer",
    "plates on a rack", "teddies on a bed", "lollipops in a jar",
    "pears in a bowl", "ducks by a lake", "pins on a board",
    "bottles on a shelf", "brushes in a cup", "tiles on a floor",
    "drums in a store"
]

def fingerprint(text):
    text = str(text).casefold()
    for phrase in sorted(CONTEXTS, key=len, reverse=True):
        text = text.replace(phrase, "[object]")
    text = re.sub(r"\d+", "#", text)
    return re.sub(r"\s+", " ", text).strip()

def main(paths):
    questions = []
    for path in paths:
        data = json.loads(path.read_text(encoding="utf-8"))
        questions.extend((path.name, q) for q in data.get("questions", []))
    patterns = collections.defaultdict(list)
    ids = collections.defaultdict(list)
    for file, q in questions:
        identifier = q.get("questionId", "")
        ids[identifier].append(file)
        patterns[fingerprint(q.get("questionText", ""))].append(identifier)
    repeated = {k:v for k,v in patterns.items() if len(v) >= 5}
    result = {
        "records":len(questions),
        "unique_ids":len(ids),
        "duplicate_ids":{k:v for k,v in ids.items() if len(v)>1},
        "repeated_context_normalized_templates":len(repeated),
        "records_in_repeated_templates":sum(map(len,repeated.values())),
        "largest_repeated_templates":[{"pattern":k,"count":len(v)} for k,v in sorted(repeated.items(),key=lambda x:-len(x[1]))[:20]],
        "warning":"A repeated template is a pedagogical review flag, not proof the answer is wrong. Do not count flagged items as independently varied approved questions."
    }
    print(json.dumps(result,ensure_ascii=False,indent=2))
    return 1 if result["duplicate_ids"] else 0

if __name__=="__main__":
    if len(sys.argv)<2:
        raise SystemExit("Usage: python audit_semantic_templates.py question-file.json [...]")
    sys.exit(main([pathlib.Path(p) for p in sys.argv[1:]]))
