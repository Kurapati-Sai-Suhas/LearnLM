import pytest
import json
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from groups.models import Question, CodeSubmission, UserCodingProfile, Topic

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def setup_user():
    user = User.objects.create_user(username="testuser", password="password", email="test@example.com")
    UserCodingProfile.objects.create(user=user, elo_rating=1200)
    return user

@pytest.fixture
def setup_question():
    # Setup a mock question that expects "1" to return "1"
    topic, _ = Topic.objects.get_or_create(name="Array", structure_type="flat")
    q = Question.objects.create(
        id=999,
        title="Test Problem",
        topic=topic,
        base_difficulty=1200.0,
        hidden_test_cases=[{"stdin": "1", "expected_output": "1"}],
        hidden_wrapper_code={}
    )
    return q

@pytest.mark.django_db
def test_python_leetcode_wrapper_success(api_client, setup_user, setup_question):
    api_client.force_authenticate(user=setup_user)
    
    # Valid Python code using Leetcode style
    code = """class Solution:
    def solve(self, input_val):
        return input_val
"""
    
    url = reverse('code-submit')  # Assuming this URL name exists, will fallback to path if needed
    try:
        response = api_client.post(url, {
            'problem_id': setup_question.id,
            'code': code,
            'language': 'python'
        }, format='json')
    except Exception:
        # Fallback to direct path if reverse fails
        response = api_client.post('/api/code/submit/', {
            'problem_id': setup_question.id,
            'code': code,
            'language': 'python'
        }, format='json')
        
    assert response.status_code == 200
    assert response.data['status'] == 'accepted'
    assert response.data['passed'] == 1

@pytest.mark.django_db
def test_java_leetcode_wrapper_syntax_error(api_client, setup_user, setup_question):
    api_client.force_authenticate(user=setup_user)
    
    # Java code with illegal import in middle
    code = """import java.util.*;
class Solution {
    public int solve(int input) { return input; }
}"""
    
    try:
        response = api_client.post(reverse('code-submit'), {
            'problem_id': setup_question.id,
            'code': code,
            'language': 'java'
        }, format='json')
    except Exception:
        response = api_client.post('/api/code/submit/', {
            'problem_id': setup_question.id,
            'code': code,
            'language': 'java'
        }, format='json')
        
    assert response.status_code == 200
    # Our regex strip fixes the illegal import so it should pass
    assert response.data['status'] == 'accepted'

@pytest.mark.django_db
def test_agentic_coach_threshold_trigger(api_client, setup_user, setup_question):
    api_client.force_authenticate(user=setup_user)
    
    # Intentionally fail 3 times
    code = """class Solution:
    def solve(self, input_val):
        return "wrong"
"""
    for i in range(3):
        try:
            response = api_client.post(reverse('code-submit'), {
                'problem_id': setup_question.id,
                'code': code,
                'language': 'python'
            }, format='json')
        except Exception:
            response = api_client.post('/api/code/submit/', {
                'problem_id': setup_question.id,
                'code': code,
                'language': 'python'
            }, format='json')
        
        assert response.status_code == 200
        assert response.data['status'] == 'wrong_answer'
        
        # On the 3rd fail, agentic_coach should not be None
        if i == 2:
            assert response.data.get('agentic_coach') is not None
        else:
            assert response.data.get('agentic_coach') is None

@pytest.mark.django_db
def test_edge_case_compilation_error(api_client, setup_user, setup_question):
    api_client.force_authenticate(user=setup_user)
    
    # Python code with syntax error
    code = """class Solution:
    def solve(self, input_val)
        return input_val
"""
    try:
        response = api_client.post(reverse('code-submit'), {
            'problem_id': setup_question.id,
            'code': code,
            'language': 'python'
        }, format='json')
    except Exception:
        response = api_client.post('/api/code/submit/', {
            'problem_id': setup_question.id,
            'code': code,
            'language': 'python'
        }, format='json')
        
    assert response.status_code == 200
    assert response.data['status'] in ['compile_error', 'runtime_error', 'wrong_answer']

@pytest.mark.django_db
def test_agentic_coach_resilience(api_client, setup_user, setup_question, monkeypatch):
    api_client.force_authenticate(user=setup_user)
    
    # Mock requests.post to raise a Timeout to simulate n8n being offline
    import requests
    def mock_post(*args, **kwargs):
        raise requests.exceptions.Timeout("Webhook offline")
    monkeypatch.setattr(requests, "post", mock_post)
    
    code = """class Solution:
    def solve(self, input_val):
        return "wrong"
"""
    for i in range(3):
        try:
            response = api_client.post(reverse('code-submit'), {
                'problem_id': setup_question.id,
                'code': code,
                'language': 'python'
            }, format='json')
        except Exception:
            response = api_client.post('/api/code/submit/', {
                'problem_id': setup_question.id,
                'code': code,
                'language': 'python'
            }, format='json')
        
        assert response.status_code == 200
        # Should gracefully handle the webhook timeout without crashing the submission
        assert response.data['status'] == 'wrong_answer'

