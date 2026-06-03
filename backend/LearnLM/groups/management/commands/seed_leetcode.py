# groups/management/commands/seed_leetcode.py
from django.core.management.base import BaseCommand
from groups.models import Topic, Question

class Command(BaseCommand):
    help = 'Seeds the database with a high-quality LeetCode-style problem'

    def handle(self, *args, **kwargs):
        self.stdout.write("🌱 Seeding LeetCode problem...")

        # 1. Ensure the Topic exists
        topic, _ = Topic.objects.get_or_create(
            name="Two Pointers", 
            defaults={"structure_type": "hierarchical"}
        )
        
        # 2. The Full HTML/Latex Problem Description
        content = """
        <p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.</p>
        <p>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.</p>
        <p>You can return the answer in any order.</p>
        <br/>
        <strong>Example 1:</strong>
        <pre class="bg-slate-900 p-3 rounded-md mt-2 mb-4 border border-slate-700">
<strong>Input:</strong> nums = [2,7,11,15], target = 9
<strong>Output:</strong> [0,1]
<strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].
        </pre>
        <strong>Example 2:</strong>
        <pre class="bg-slate-900 p-3 rounded-md mt-2 mb-4 border border-slate-700">
<strong>Input:</strong> nums = [3,2,4], target = 6
<strong>Output:</strong> [1,2]
        </pre>
        """
        
        # 3. The Language Boilerplates
        boilerplate = {
            "python": "class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # Write your highly optimized code here!\n        pass",
            "java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your highly optimized code here!\n        return new int[]{};\n    }\n}",
            "cpp": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your highly optimized code here!\n        return {};\n    }\n};"
        }
        
        # 4. Hidden Test Cases for Judge0
        test_cases = [
            {"stdin": "4\n2 7 11 15\n9", "expected_output": "0 1"},
            {"stdin": "3\n3 2 4\n6", "expected_output": "1 2"}
        ]
        
        # 5. Inject into Database
        Question.objects.update_or_create(
            title="Two Sum (Optimal)",
            topic=topic,
            defaults={
                "content": content,
                "base_difficulty": 1250.0,
                "boilerplate_code": boilerplate,
                "hidden_test_cases": test_cases
            }
        )
        
        self.stdout.write(self.style.SUCCESS("✅ Successfully seeded 'Two Sum' problem!"))