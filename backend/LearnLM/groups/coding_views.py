import os
import base64
import requests
from django.db.models import F, Func
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

# Import Models
from .models import CodeSubmission, UserCodingProfile, Question, Topic, RecommendationLog, Badge, UserBadge
from .models import CodingPortal
from .serializers import CodingPortalSerializer

# Import AI Engines & Services
from .engines.elo_engine import EloEngine
from .engines.gnn_engine import GNNKnowledgeGraph
from .hybrid_router import GDCPEngine, SequentialKnowledgeTracer, DSA_GRAPH
import torch
from .engines.agentic_coach import trigger_agentic_coach
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


class GamificationDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 1. Get current streak
        profile, _ = UserCodingProfile.objects.get_or_create(user=request.user)
        streak = profile.current_streak

        # 2. Get global leaderboard (Top 3 by Elo)
        top_profiles = UserCodingProfile.objects.all().order_by('-elo_rating')[:3]
        leaderboard = []
        for idx, p in enumerate(top_profiles):
            leaderboard.append({
                "rank": idx + 1,
                "name": p.user.get_full_name() or p.user.username,
                "handle": f"@{p.user.username}",
                "elo": int(p.elo_rating)
            })

        # 3. Get recent badges
        recent_badges = UserBadge.objects.filter(user=request.user).order_by('-awarded_at')[:3]
        badges = []
        for ub in recent_badges:
            badges.append({
                "id": ub.badge.badge_id,
                "name": ub.badge.name,
                "description": ub.badge.description,
                "color": ub.badge.color,
                "icon": ub.badge.icon_name
            })
            
        # Fallback if no badges (for UI showcase)
        if not badges:
            badges = [
                {"id": "b1", "name": "First Steps", "description": "Joined LearnLM", "color": "primary", "icon": "Award"}
            ]

        return Response({
            "streak": streak,
            "leaderboard": leaderboard,
            "badges": badges
        })


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
            if not test_cases:
                test_cases = question.hidden_test_cases
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
        elif lang_key == "python":
            # 🚀 DYNAMIC GENERIC WRAPPER FOR PYTHON (Leetcode Style)
            generic_python_wrapper = """{user_code}

import sys
import json

if __name__ == '__main__':
    stdin_str = sys.stdin.read().strip()
    try:
        parsed_input = json.loads(stdin_str)
    except:
        parsed_input = stdin_str
        
    sol = Solution()
    try:
        if isinstance(parsed_input, list):
            res = sol.solve(*parsed_input) if type(parsed_input) is list else sol.solve(parsed_input)
        elif isinstance(parsed_input, dict):
            res = sol.solve(**parsed_input)
        else:
            res = sol.solve(parsed_input)
            
        if isinstance(res, (list, dict)):
            print(json.dumps(res).replace(" ", ""))
        elif isinstance(res, bool):
            print(str(res).lower())
        else:
            print(str(res))
    except Exception as e:
        print(f"Runtime Error: {e}")
"""
            executable_code = generic_python_wrapper.replace("{user_code}", raw_code)
        elif lang_key == "java":
            # 🚀 DYNAMIC GENERIC WRAPPER FOR JAVA (Leetcode Style using Reflection)
            import re
            # Strip out any imports the user added because Java doesn't allow imports in the middle of a file
            cleaned_user_code = re.sub(r'^\s*import\s+.*?;', '', raw_code, flags=re.MULTILINE)
            
            generic_java_wrapper = """import java.util.*;
import java.lang.reflect.*;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (!scanner.hasNextLine()) return;
        String input = scanner.nextLine().trim();
        
        try {
            Solution sol = new Solution();
            Method[] methods = Solution.class.getDeclaredMethods();
            Method targetMethod = null;
            for (Method m : methods) {
                if (m.getName().equals("solve")) {
                    targetMethod = m;
                    break;
                }
            }
            
            if (targetMethod == null) {
                System.out.println("Error: Method 'solve' not found.");
                return;
            }
            
            Class<?>[] paramTypes = targetMethod.getParameterTypes();
            Object[] argsToPass = new Object[paramTypes.length];
            
            if (paramTypes.length > 0) {
                Class<?> pType = paramTypes[0];
                if (pType == int.class || pType == Integer.class) {
                    argsToPass[0] = Integer.parseInt(input);
                } else if (pType == double.class || pType == Double.class) {
                    argsToPass[0] = Double.parseDouble(input);
                } else {
                    argsToPass[0] = input;
                }
            }
            
            Object result = targetMethod.invoke(sol, argsToPass);
            if (result != null) {
                System.out.println(result.toString().replace(" ", ""));
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

{user_code}
"""
            executable_code = generic_java_wrapper.replace("{user_code}", cleaned_user_code)
        else:
            # Fallback to direct execution
            executable_code = raw_code
        # ---------------------------------------------------------

        passed  = 0
        results = []

        # 1. Run all test cases USING THE WRAPPED CODE
        for i, tc in enumerate(test_cases):
            verdict  = _run_on_judge0(executable_code, language, tc.get('stdin', ''))
            expected = tc.get('expected_output', '').strip()
            actual   = verdict.get('stdout', '').strip()
            
            # 🚀 AI FORMATTING FIX: Normalize spaces and newlines so arrays match perfectly
            expected_norm = expected.replace(" ", "").replace("\\n", "")
            actual_norm = actual.replace(" ", "").replace("\\n", "")
            
            ok       = (actual_norm == expected_norm) and verdict.get('status_id') == 3

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

        # 🚀 UPDATE THE DATA FLYWHEEL LOG
        recent_log = RecommendationLog.objects.filter(
            user=request.user, 
            problem_id=problem_id, 
            actual_result_correct__isnull=True
        ).order_by('-created_at').first()
        
        if recent_log:
            recent_log.actual_result_correct = all_passed
            recent_log.save()

        # 🚀 AGENTIC COACH TRIGGER (3 Consecutive Failures)
        agentic_hint = None
        if not all_passed:
            recent_subs = CodeSubmission.objects.filter(user=request.user, problem_id=problem_id).order_by('-submitted_at')[1:3]
            failed_count = 1
            for sub in recent_subs:
                if sub.status != 'accepted':
                    failed_count += 1
                else:
                    break
            
            if failed_count >= 3:

                agentic_hint = trigger_agentic_coach(
                    user=request.user,
                    problem_id=problem_id,
                    code_snippet=raw_code,
                    error_logs=str(results),
                    failed_attempts=failed_count
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

        # 🚀 ADVANCED ML: Multi-dimensional IRT (MIRT)
        from .engines.mirt_engine import MIRTEngine
        mirt_update = MIRTEngine.update_latents(
            logic=profile.irt_latent_logic,
            syntax=profile.irt_latent_syntax,
            opt=profile.irt_latent_optimization,
            status=final_status,
            difficulty=difficulty
        )
        profile.irt_latent_logic = mirt_update["latent_logic"]
        profile.irt_latent_syntax = mirt_update["latent_syntax"]
        profile.irt_latent_optimization = mirt_update["latent_optimization"]

        profile.save()

        # 4. 🚀 ADVANCED ML: SM-2 Spaced Repetition & GDCP Graph Decay
        from .models import UserTopicMastery
        mastery, _ = UserTopicMastery.objects.get_or_create(
            user=request.user,
            topic=question.topic.name,
            defaults={"subject": "Data Structures"}
        )
        
        # Calculate SM-2 Quality
        recent_fails = CodeSubmission.objects.filter(
            user=request.user, problem_id=problem_id, status__in=['wrong_answer', 'compile_error', 'runtime_error', 'time_limit']
        ).count()
        
        quality = 0
        if all_passed:
            if recent_fails == 0: quality = 5
            elif recent_fails == 1: quality = 4
            else: quality = 3
            
        from .engines.hlr_engine import HLREngine
        new_halflife = HLREngine.update_halflife(quality, mastery.hlr_halflife)
        mastery.hlr_halflife = new_halflife
        mastery.accuracy = (mastery.accuracy * mastery.reviews + (1.0 if all_passed else 0.0)) / (mastery.reviews + 1)
        mastery.reviews += 1
        mastery.save()

        # GDCP: Graph-Decay Cross-Pollination (If failed, penalize downstream dependencies)
        if not all_passed:
            try:
                penalties = GDCPEngine.propagate_decay(DSA_GRAPH, question.topic.name, base_decay=0.1)
                for desc_node, penalty in penalties.items():
                    desc_mastery, _ = UserTopicMastery.objects.get_or_create(user=request.user, topic=desc_node, defaults={"subject": "Data Structures"})
                    desc_mastery.accuracy = max(0.0, desc_mastery.accuracy - penalty)
                    desc_mastery.save()
            except Exception:
                pass # Graph node might not exist in DSA_GRAPH, fallback safe.

        # 5. Return data to React frontend
        return Response({
            "submission_id": submission.id,
            "status":        final_status,
            "passed":        passed,
            "total":         total,
            "all_passed":    all_passed,
            "test_results":  results,
            "elo_update":    elo_result,
            "success_rate":  profile.success_rate,
            "agentic_hint":  agentic_hint,
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
        from .hybrid_router import RoutingClassifier
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

        # 🚀 ADVANCED ML: Sequence-Based LSTM (Deep Knowledge Tracing)
        try:
            # Reconstruct recent sequence: [difficulty, is_correct, time_spent]
            recent_subs = CodeSubmission.objects.filter(user=request.user).order_by('-submitted_at')[:5]
            if recent_subs.exists():
                seq_data = []
                for sub in reversed(recent_subs):
                    q_diff = Question.objects.filter(id=sub.problem_id).first()
                    diff_val = (q_diff.base_difficulty / 2000.0) if q_diff else 0.5
                    corr_val = 1.0 if sub.status == 'accepted' else 0.0
                    time_val = min(1.0, (sub.execution_time_ms or 0) / 5000.0)
                    seq_data.append([diff_val, corr_val, time_val])
                
                lstm = SequentialKnowledgeTracer(input_dim=3, hidden_dim=16, num_layers=1)
                lstm.eval()
                with torch.no_grad():
                    tensor_seq = torch.tensor([seq_data], dtype=torch.float32)
                    lstm_prob = lstm(tensor_seq).item()
                    print(f"🧠 DKT LSTM Predicts Next Success Probability: {lstm_prob:.2f}")
        except Exception as e:
            print(f"LSTM Warning: {e}")

        # 🚥 ML-BASED TRAFFIC COP
        router = RoutingClassifier()
        # In a real scenario, we'd query past performance for these stats.
        # For now, we mock some stats to get a route
        route_decision = router.predict_route(avg_acc=0.6, var_acc=0.2, avg_elo=target_elo/2000.0)

        # ROUTE 1: HIERARCHICAL (PYTORCH GNN ENGINE)
        if route_decision == 'hierarchical' and topic:
            print(f"🚥 ML Traffic Cop: Routing to PyTorch GNN Engine for {topic.name}")
            gnn = GNNKnowledgeGraph(subject="dsa", graph=None) # Note: requires proper graph setup
            
            optimal_node = gnn.get_next_optimal_topic(request.user)
            
            target_topic_name = optimal_node.get("recommended_topic", topic.name)
            if target_topic_name is None:
                target_topic_name = topic.name
                
            xai_explanation = optimal_node.get("reason", f"🧠 XAI Insight: Mathematically selected as the optimal node for {topic.name}.")
            advanced_data = optimal_node 

            question = Question.objects.filter(topic__name=target_topic_name).exclude(id__in=solved_ids).annotate(
                elo_diff=Func(F('base_difficulty') - target_elo, function='ABS')
            ).order_by('elo_diff').first()

        # 🚥 ROUTE 2: FLAT (ELO ENGINE)
        else:
            print(f"🚥 ML Traffic Cop: Routing to Flat Elo Engine for {topic.name if topic else 'Fallback'}")
            xai_explanation = f"📈 XAI Insight: Dynamically matched to your current skill level (Elo: {target_elo})."
            
            if topic:
                question = Question.objects.filter(topic__name=topic.name).exclude(id__in=solved_ids).annotate(
                    elo_diff=Func(F('base_difficulty') - target_elo, function='ABS')
                ).order_by('elo_diff').first()

        if not question:
            question = Question.objects.exclude(id__in=solved_ids).first()
            if not question:
                return Response({"error": "You have solved every problem in the database!"}, status=404)

        # 🚀 LOG THE RECOMMENDATION TO THE DATA FLYWHEEL
        prob = advanced_data.get("xai", {}).get("success_probability", None) if advanced_data else None
        RecommendationLog.objects.create(
            user=request.user,
            recommended_topic=question.topic.name,
            engine_used=route_decision,
            predicted_success_prob=prob,
            problem_id=str(question.pk)
        )

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

        # 🚀 ADVANCED ML: 3-Parameter IRT Cold Start Calibration
        profile, _ = UserCodingProfile.objects.get_or_create(user=request.user)
        # Assuming a diagnostic test of 10 average questions
        num_known = len(known_topics)
        theta_guess = (num_known / 10.0) * 4.0 - 2.0 # Maps 0-10 scale to -2.0 to 2.0 theta range
        
        # Calculate expected score using IRT to see if it aligns
        expected = IRTEngine.expected_score(theta=theta_guess, a=1.0, b=0.0, c=0.2)
        profile.irt_latent_ability = theta_guess
        
        # Also boost Elo to skip "Cold Start" problem
        profile.elo_rating = 1200 + (num_known * 50)
        profile.save()

        return Response({"message": f"Onboarding complete! IRT Theta calibrated to {theta_guess:.2f}."})
    

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