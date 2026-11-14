"""LAMA Coding Academy Python runner.
Run by a Pyodide module worker; _lama_payload contains JSON with student code and authored tests.
Not a security sandbox. Intended for learner-authored, non-sensitive examples only.
"""
import contextlib
import io
import json
import traceback


class _LimitedTextSink(io.TextIOBase):
    """Keep only the first N output characters; avoid unbounded StringIO growth."""

    def __init__(self, limit):
        super().__init__()
        self.limit = limit
        self.parts = []
        self.size = 0
        self.truncated = False

    def write(self, value):
        if not isinstance(value, str):
            raise TypeError("text output must be a string")
        available = max(0, self.limit - self.size)
        if len(value) > available:
            self.truncated = True
        if available:
            chunk = value[:available]
            self.parts.append(chunk)
            self.size += len(chunk)
        return len(value)

    def getvalue(self):
        return "".join(self.parts)

    def writable(self):
        return True

    def flush(self):
        return None


def _lama_run(payload):
    code = payload["code"]
    tests = payload["tests"]
    output = _LimitedTextSink(4000)
    error_text = _LimitedTextSink(1000)
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
        "stdout": output.getvalue(),
        "stdout_truncated": output.truncated,
        "stderr": error_text.getvalue(),
        "stderr_truncated": error_text.truncated,
        "error": compile_error,
        "results": results,
        "passed": not compile_error and len(results) == len(tests) and all(
            t["pass"] for t in results
        ),
    }


json.dumps(_lama_run(json.loads(_lama_payload)), ensure_ascii=False)
