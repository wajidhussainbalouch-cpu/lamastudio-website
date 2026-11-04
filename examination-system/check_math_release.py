#!/usr/bin/env python3
"""Read-only Class 1 Mathematics release gate; run from repository root.
python examination-system/check_math_release.py
"""
import collections,json,pathlib,re,sys
root=pathlib.Path(__file__).resolve().parent
files=[
"data/class1-mathematics-unit1-draft.json",
"data/class1-mathematics-unit1-varied-draft.json",
"data/class1-mathematics-unit1-batch500-draft.json",
"data/class1-mathematics-batch2-500-draft.json",
"data/class1-mathematics-batch3-370-draft.json",
]
items=[];missing=[]
for path in files:
 p=root/path
 if not p.exists():missing.append(path);continue
 data=json.loads(p.read_text(encoding="utf-8"))
 for q in data.get("questions",[]):items.append((path,q))
def val(q,*names):
 for n in names:
  if n in q:return q[n]
 return None
ids=collections.Counter(str(val(q,"questionId","id")) for _,q in items)
texts=collections.Counter(re.sub(r"\s+"," ",str(val(q,"questionText","text") or "").casefold()).strip() for _,q in items)
approved=[q for _,q in items if q.get("approved") is True and q.get("onlineReady") is True and q.get("reviewStatus")=="approved"]
chaptered=[q for _,q in items if q.get("chapterId") not in (None,"")]
errors={
 "missing_files":missing,
 "duplicate_ids":[k for k,n in ids.items() if n>1],
 "exact_duplicate_texts":[k for k,n in texts.items() if n>1],
 "missing_answer":[str(val(q,"questionId","id")) for _,q in items if val(q,"correctAnswer","answer") is None],
 "unverified_chapter_count":len(items)-len(chaptered),
 "not_approved_count":len(items)-len(approved)
}
report={"subject":"Class 1 Mathematics","draft_records":len(items),"target":1500,"approved_online_ready":len(approved),"chapter_mapped":len(chaptered),"release_ready":len(items)>=1500 and len(approved)==len(items) and not missing and not errors["duplicate_ids"] and not errors["exact_duplicate_texts"] and len(chaptered)==len(items),"checks":errors,"note":"This structural gate does not replace textbook review, semantic deduplication, secure backend tests, print/PDF inspection, or teacher signoff."}
print(json.dumps(report,ensure_ascii=False,indent=2))
sys.exit(0 if report["release_ready"] else 1)
