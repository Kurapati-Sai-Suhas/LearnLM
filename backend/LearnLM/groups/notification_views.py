from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Notification

class NotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifs = Notification.objects.filter(user=request.user)
        return Response([{
            "id": n.id,
            "title": n.title,
            "description": n.description,
            "type": n.type,
            "is_read": n.is_read,
            "time": n.created_at.strftime("%I:%M %p, %b %d")
        } for n in notifs])

    def put(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"status": "success"})
