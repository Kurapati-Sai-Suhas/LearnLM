import json
from django.core.management.base import BaseCommand
from groups.models import Question

class Command(BaseCommand):
    help = 'Seeds problems with perfect wrapper code and test cases to bypass Gemini execution bugs.'

    def handle(self, *args, **kwargs):
        # 1. Remove Element
        q1 = Question.objects.filter(title__icontains='Remove Element').first()
        if q1:
            q1.hidden_test_cases = [
                {"stdin": "3,2,2,3\n3", "expected_output": "2,2"},
                {"stdin": "0,1,2,2,3,0,4,2\n2", "expected_output": "0,1,4,0,3"}
            ]
            q1.hidden_wrapper_code = {
                'python': '''import sys\n{user_code}\n\nif __name__ == "__main__":\n    lines = sys.stdin.read().strip().split("\\n")\n    if len(lines) >= 2:\n        nums = [int(x) for x in lines[0].split(",")] if lines[0] else []\n        val = int(lines[1])\n        sol = Solution()\n        k = sol.removeElement(nums, val)\n        print(",".join(map(str, nums[:k])))\n''',
                'java': '''import java.util.*;\nimport java.io.*;\n\n{user_code}\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(sc.hasNextLine()) {\n            String arrStr = sc.nextLine();\n            String valStr = sc.hasNextLine() ? sc.nextLine() : "0";\n            int[] nums = new int[0];\n            if(!arrStr.isEmpty()) {\n                String[] parts = arrStr.split(",");\n                nums = new int[parts.length];\n                for(int i=0; i<parts.length; i++) nums[i] = Integer.parseInt(parts[i]);\n            }\n            int val = Integer.parseInt(valStr);\n            Solution sol = new Solution();\n            int k = sol.removeElement(nums, val);\n            for(int i=0; i<k; i++) {\n                System.out.print(nums[i] + (i == k-1 ? "" : ","));\n            }\n            System.out.println();\n        }\n    }\n}\n'''
            }
            q1.save()
            self.stdout.write(self.style.SUCCESS('Seeded Remove Element'))

        self.stdout.write(self.style.SUCCESS('Successfully seeded perfect wrappers!'))
