from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import StudySession

class ScheduleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = StudySession.objects.filter(user=request.user)
        return Response([{
            "id": s.id,
            "title": s.title,
            "start_time": s.start_time,
            "duration_minutes": s.duration_minutes
        } for s in sessions])

    def post(self, request):
        title = request.data.get("title", "Study Session")
        start_time = request.data.get("start_time")
        duration = request.data.get("duration_minutes", 60)
        
        if not start_time:
            return Response({"error": "start_time is required"}, status=400)
            
        session = StudySession.objects.create(
            user=request.user,
            title=title,
            start_time=start_time,
            duration_minutes=duration
        )
        return Response({"status": "success", "id": session.id})
