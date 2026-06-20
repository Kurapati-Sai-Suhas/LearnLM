import os
import base64
import requests
from django.db.models import F, Func
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

# Import Models
from .models import CodeSubmission, UserCodingProfile, Question, Topic
from .models import CodingPortal
from .serializers import CodingPortalSerializer

# Import AI Engines & Services
from .engines.elo_engine import EloEngine
from .engines.gnn_engine import GNNKnowledgeGraph
from .ai_services import generate_test_cases

LANGUAGE_IDS = {
    "python": 71,
    "java":   62,
    "cpp":    54,
    "c":      50,
    "js":     63,
}

JUDGE0_BASE = os.environ.get('JUDGE0_URL', 'https://judge0-ce.p.rapidapi.com')
JUDGE0_KEY  = os.environ.get('JUDGE0_API_KEY')

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
    REQ-3.2: Run code in isolation (Used for the "Run Code" button).
    POST /api/code/run/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        raw_code = request.data.get('code', '').strip()
        language = request.data.get('language', 'python')
        stdin    = request.data.get('stdin', '')
        problem_id = request.data.get('problem_id', None)
        
        if not raw_code:
            return Response({"error": "code is required"}, status=400)
            
        executable_code = raw_code
        lang_key = language.lower()

        # Dynamic Wrapper Injection for Code Run
        if problem_id:
            try:
                question = Question.objects.get(id=problem_id)
                if question.hidden_wrapper_code and lang_key in question.hidden_wrapper_code:
                    wrapper_template = question.hidden_wrapper_code[lang_key]
                    executable_code = wrapper_template.replace("{user_code}", raw_code)
            except Question.DoesNotExist:
                pass

        result = _run_on_judge0(executable_code, language, stdin)
        
        if "error" in result:
            return Response(result, status=400)
        return Response(result)


class CodeSubmitView(APIView):
    """
    REQ-3.2 + REQ-3.3: Submit code against hidden test cases, log result, update Elo.
    POST /api/code/submit/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        raw_code   = request.data.get('code', '').strip()
        language   = request.data.get('language', 'python')
        problem_id = request.data.get('problem_id', 'unknown')
        test_cases = request.data.get('test_cases', [])

        if not raw_code:
            return Response({"error": "code is required"}, status=400)

        # 🚀 Fetch the Question from DB
        try:
            question = Question.objects.get(id=problem_id)
            difficulty = question.base_difficulty
        except (Question.DoesNotExist, ValueError):
            return Response({"error": "Question not found"}, status=404)

        # ---------------------------------------------------------
        # 🚀 THE STRICT DATABASE WRAPPER ENGINE
        # ---------------------------------------------------------
        executable_code = raw_code
        lang_key = language.lower()

        # We ONLY use the wrapper from the database now. No hardcoding.
        if question.hidden_wrapper_code and lang_key in question.hidden_wrapper_code:
            wrapper_template = question.hidden_wrapper_code[lang_key]
            executable_code = wrapper_template.replace("{user_code}", raw_code)
        else:
            # If the database is missing the wrapper, fail instantly so we can see the error!
            return Response(
                {"error": f"No '{lang_key}' wrapper configured in the database for problem ID {problem_id}."}, 
                status=400
            )
        # ---------------------------------------------------------

        passed  = 0
        results = []

        # 1. Run all test cases USING THE WRAPPED CODE
        for i, tc in enumerate(test_cases):
            verdict  = _run_on_judge0(executable_code, language, tc.get('stdin', ''))
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

        # 2. Log submission to the database
        submission = CodeSubmission.objects.create(
            user=request.user,
            problem_id=problem_id,
            language=language,
            code=raw_code,
            status=final_status,
            execution_time_ms=int(float(results[0]['time'] or 0) * 1000) if results and results[0].get('time') else None,
            memory_used_kb=results[0]['memory'] if results else None,
        )

        # 3. Update User's Profile Stats & Elo Rating
        profile, _ = UserCodingProfile.objects.get_or_create(user=request.user)
        profile.total_submissions += 1
        
        if all_passed:
            profile.successful_submissions += 1

        exec_time = int(float(results[0]['time'] or 0) * 1000) if results and results[0].get('time') else None
        mem_used = results[0]['memory'] if results else None

        elo_result = EloEngine.calculate_new_rating(
            user_rating=profile.elo_rating, 
            question_difficulty=difficulty, 
            is_correct=all_passed,
            execution_time_ms=exec_time,
            memory_used_kb=mem_used
        )
        
        profile.elo_rating = elo_result["new_rating"]
        profile.save()

        # 4. Return data to React frontend
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
    """
    GET /api/code/profile/ — Returns Elo, stats, and last 10 submissions.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
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


class NextProblemView(APIView):
    """
    REQ-4.2 & REQ-4.3 & REQ-4.4: The Traffic Cop (Hybrid Routing).
    Routes to GNN for structured topics (DSA), or Elo for unstructured topics (Trivia).
    GET /api/code/next/?topic=Array
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = UserCodingProfile.objects.get_or_create(user=request.user)
        target_elo = profile.elo_rating
        
        # Default to 'Array' if no topic is provided by the frontend
        topic_name = request.query_params.get('topic', 'Array')
        
        try:
            topic = Topic.objects.get(name__iexact=topic_name)
        except Topic.DoesNotExist:
            topic = Topic.objects.first() # Fallback

        # --- Safely cast problem IDs to Integers ---
        raw_solved_ids = CodeSubmission.objects.filter(
            user=request.user, status='accepted'
        ).values_list('problem_id', flat=True)

        solved_ids = []
        for pid in raw_solved_ids:
            try:
                solved_ids.append(int(pid))
            except (ValueError, TypeError):
                pass 
        # -------------------------------------------

        question = None
        xai_explanation = ""
        advanced_data = None 

        # 🚥 ROUTE 1: HIERARCHICAL (PYTORCH GNN ENGINE)
        if topic and topic.structure_type == 'hierarchical':
            print(f"🚥 Traffic Cop: Routing to PyTorch GNN Engine for {topic.name}")
            gnn = GNNKnowledgeGraph()
            
            optimal_node = gnn.get_next_optimal_topic(request.user)
            
            target_topic_name = optimal_node.get("recommended_topic", topic.name)
            xai_explanation = optimal_node.get("reason", f"🧠 XAI Insight: Mathematically selected as the optimal node for {topic.name}.")
            advanced_data = optimal_node 

            question = Question.objects.filter(topic__name=target_topic_name).exclude(id__in=solved_ids).annotate(
                elo_diff=Func(F('base_difficulty') - target_elo, function='ABS')
            ).order_by('elo_diff').first()

        # 🚥 ROUTE 2: FLAT (ELO ENGINE)
        elif topic:
            print(f"🚥 Traffic Cop: Routing to Flat Elo Engine for {topic.name}")
            xai_explanation = f"📈 XAI Insight: Dynamically matched to your current skill level (Elo: {target_elo})."
            
            question = Question.objects.filter(topic__name=topic.name).exclude(id__in=solved_ids).annotate(
                elo_diff=Func(F('base_difficulty') - target_elo, function='ABS')
            ).order_by('elo_diff').first()

        if not question:
            question = Question.objects.exclude(id__in=solved_ids).first()
            if not question:
                return Response({"error": "You have solved every problem in the database!"}, status=404)

        # 🤖 AI TEST CASE GENERATION FALLBACK
        if not question.hidden_test_cases:
            print(f"🤖 Booting Gemini to generate test cases for: {question.title}...")
            generated_cases = generate_test_cases(question.title, question.content)
            question.hidden_test_cases = generated_cases
            question.save()

        if question.base_difficulty < 1100: diff_text = "Easy"
        elif question.base_difficulty < 1400: diff_text = "Medium"
        else: diff_text = "Hard"

        return Response({
            "id": str(question.pk),
            "title": f"[{question.topic.name}] {question.title}",
            "difficulty": diff_text,
            "description": question.content, 
            "explanation": xai_explanation,
            "boilerplate_code": question.boilerplate_code, 
            "hiddenTestCases": question.hidden_test_cases,
            "advanced_xai": advanced_data
        })
    
class CodingOnboardingView(APIView):
    """
    POST /api/code/onboard/
    Saves the topics a user already knows so the GNN skips them.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        known_topics = request.data.get('known_topics', []) 
        
        for topic_name in known_topics:
            try:
                question = Question.objects.filter(topic__name__iexact=topic_name).first()
                if question:
                    CodeSubmission.objects.get_or_create(
                        user=request.user,
                        problem_id=str(question.pk),
                        defaults={
                            'language': 'python',
                            'code': '# Skipped via Onboarding',
                            'status': 'accepted',
                            'execution_time_ms': 10,
                            'memory_used_kb': 1024
                        }
                    )
            except Exception as e:
                print(f"Error onboarding topic {topic_name}: {e}")

        return Response({"message": "Onboarding complete! GNN updated."})
    

class CodingPortalListView(APIView):
    """
    GET /api/coding-portals/
    Returns a list of all active global coding courses (e.g., DSA, OS).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        portals = CodingPortal.objects.filter(is_active=True)
        serializer = CodingPortalSerializer(portals, many=True)
        return Response(serializer.data)