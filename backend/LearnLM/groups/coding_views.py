# groups/coding_views.py
import os
import base64
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

LANGUAGE_IDS = {
    "python": 71,
    "java":   62,
    "cpp":    54,
    "c":      50,
    "js":     63,
}

JUDGE0_BASE = os.environ.get('JUDGE0_URL', 'https://judge0-ce.p.rapidapi.com')
JUDGE0_KEY  = os.environ.get('JUDGE0_RAPIDAPI_KEY', '')


def _run_on_judge0(source_code: str, language: str, stdin: str = "") -> dict:
    language_id = LANGUAGE_IDS.get(language.lower())
    if not language_id:
        return {"error": f"Unsupported language '{language}'. Use: {list(LANGUAGE_IDS.keys())}"}

    payload = {
        "source_code":    base64.b64encode(source_code.encode()).decode(),
        "language_id":    language_id,
        "stdin":          base64.b64encode(stdin.encode()).decode() if stdin else "",
        "base64_encoded": True,
        "wait":           True,
    }
    headers = {
        "Content-Type":    "application/json",
        "X-RapidAPI-Key":  JUDGE0_KEY,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    }

    def decode(val):
        if not val:
            return ""
        try:
            return base64.b64decode(val).decode('utf-8', errors='replace')
        except Exception:
            return val

    try:
        res = requests.post(
            f"{JUDGE0_BASE}/submissions?base64_encoded=true&wait=true",
            json=payload, headers=headers, timeout=15
        )
        res.raise_for_status()
        data = res.json()
        return {
            "status":         data.get("status", {}).get("description", "Unknown"),
            "status_id":      data.get("status", {}).get("id"),
            "stdout":         decode(data.get("stdout")),
            "stderr":         decode(data.get("stderr")),
            "compile_output": decode(data.get("compile_output")),
            "time":           data.get("time"),
            "memory":         data.get("memory"),
        }
    except requests.Timeout:
        return {"error": "Judge0 timed out. Try again."}
    except requests.RequestException as e:
        return {"error": f"Judge0 request failed: {str(e)}"}


class CodeRunView(APIView):
    """
    REQ-3.2: Run code in isolation.
    POST /api/code/run/
    { "code": "print('hi')", "language": "python", "stdin": "" }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code     = request.data.get('code', '').strip()
        language = request.data.get('language', 'python')
        stdin    = request.data.get('stdin', '')
        if not code:
            return Response({"error": "code is required"}, status=400)
        result = _run_on_judge0(code, language, stdin)
        if "error" in result:
            return Response(result, status=400)
        return Response(result)


class CodeSubmitView(APIView):
    """
    REQ-3.2 + REQ-3.3: Submit code against test cases, log result, update Elo.
    POST /api/code/submit/
    {
        "code": "...", "language": "python", "problem_id": "two-sum",
        "test_cases": [{ "stdin": "2 7\n9", "expected_output": "0 1" }]
    }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code       = request.data.get('code', '').strip()
        language   = request.data.get('language', 'python')
        problem_id = request.data.get('problem_id', 'unknown')
        test_cases = request.data.get('test_cases', [])

        if not code:
            return Response({"error": "code is required"}, status=400)

        passed  = 0
        results = []

        for i, tc in enumerate(test_cases):
            verdict  = _run_on_judge0(code, language, tc.get('stdin', ''))
            expected = tc.get('expected_output', '').strip()
            actual   = verdict.get('stdout', '').strip()
            ok       = (actual == expected) and verdict.get('status_id') == 3

            if ok:
                passed += 1
            results.append({
                "test_case":       i + 1,
                "passed":          ok,
                "status":          verdict.get('status'),
                "your_output":     actual,
                "expected_output": expected,
                "time":            verdict.get('time'),
                "memory":          verdict.get('memory'),
            })

        total      = len(test_cases)
        all_passed = passed == total
        final_status = "accepted" if all_passed else "wrong_answer"

        # REQ-3.3: Log to DB
        from .models import CodeSubmission, UserCodingProfile
        submission = CodeSubmission.objects.create(
            user=request.user,
            problem_id=problem_id,
            language=language,
            code=code,
            status=final_status,
            execution_time_ms=int(float(results[0]['time'] or 0) * 1000) if results else None,
            memory_used_kb=results[0]['memory'] if results else None,
        )

        # Update Elo
        profile, _ = UserCodingProfile.objects.get_or_create(user=request.user)
        profile.total_submissions += 1
        if all_passed:
            profile.successful_submissions += 1

        from .hybrid_router import EloEngine
        elo_result = EloEngine.update_rating(profile.elo_rating, 1200.0, all_passed)
        profile.elo_rating = elo_result["new_rating"]
        profile.save()

        return Response({
            "submission_id": submission.id,
            "status":        final_status,
            "passed":        passed,
            "total":         total,
            "all_passed":    all_passed,
            "test_results":  results,
            "elo_update":    elo_result,
            "success_rate":  profile.success_rate,
        })


class CodingProfileView(APIView):
    """GET /api/code/profile/ — Elo, stats, last 10 submissions."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from .models import CodeSubmission, UserCodingProfile
        profile, _ = UserCodingProfile.objects.get_or_create(user=request.user)
        recent = CodeSubmission.objects.filter(user=request.user).order_by('-submitted_at')[:10]

        return Response({
            "elo_rating":             profile.elo_rating,
            "total_submissions":      profile.total_submissions,
            "successful_submissions": profile.successful_submissions,
            "success_rate":           profile.success_rate,
            "recent_submissions": [
                {
                    "problem_id":        s.problem_id,
                    "language":          s.language,
                    "status":            s.status,
                    "execution_time_ms": s.execution_time_ms,
                    "memory_used_kb":    s.memory_used_kb,
                    "submitted_at":      s.submitted_at.strftime("%d %b %Y %H:%M"),
                }
                for s in recent
            ],
        })