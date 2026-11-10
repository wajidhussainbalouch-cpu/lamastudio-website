"""LAMA Coding Academy Python runner.
Run by a Pyodide module worker; _lama_payload contains JSON with student code and authored tests.
Not a security sandbox. Intended for learner-authored, non-sensitive examples only.
"""
import contextlib
import io
import json
import traceback


def _lama_run(payload):
    code = payload["code"]
    tests = payload["tests"]
    output = io.StringIO()
    error_text = io.StringIO()
    namespace = {"__name__": "__main__"}
    compile_error = ""
    results = []

    try:
        # No input prompts, imported packages, files, or app credentials are supplied.
        # This still executes normal Python, so code must be treated as learner-trusted.
        with contextlib.redirect_stdout(output), contextlib.redirect_stderr(error_text):
            exec(compile(code, "<learner>", "exec"), namespace)
    except BaseException:
        compile_error = traceback.format_exc(limit=4)[-1800:]

    if not compile_error:
        for test in tests:
            try:
                with contextlib.redirect_stdout(output), contextlib.redirect_stderr(error_text):
                    passed = bool(eval(test["expression"], namespace))
                results.append({"label": test["label"], "pass": passed,
                                "details": "" if passed else "Expected condition was False."})
            except BaseException:
                results.append({"label": test["label"], "pass": False,
                                "details": traceback.format_exc(limit=2)[-450:]})

    return {
        "stdout": output.getvalue()[:4000],
        "stderr": error_text.getvalue()[:1000],
        "error": compile_error,
        "results": results,
        "passed": not compile_error and len(results) == len(tests) and all(
            t["pass"] for t in results
        ),
    }


json.dumps(_lama_run(json.loads(_lama_payload)), ensure_ascii=False)
