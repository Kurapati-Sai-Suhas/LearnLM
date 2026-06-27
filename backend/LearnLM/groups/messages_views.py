from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import DirectMessage, User, Connection
from django.db.models import Q

class DirectMessageFriendsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        connections = Connection.objects.filter(
            (Q(sender=request.user) | Q(receiver=request.user)) & Q(status='accepted')
        )
        friends_data = []
        for conn in connections:
            friend = conn.receiver if conn.sender == request.user else conn.sender
            
            last_msg = DirectMessage.objects.filter(
                (Q(sender=request.user, receiver=friend) | Q(sender=friend, receiver=request.user))
            ).order_by('-timestamp').first()

            friends_data.append({
                "id": str(friend.id),
                "name": f"{friend.first_name} {friend.last_name}".strip() or friend.username,
                "lastMessage": last_msg.content if last_msg else "Say hi!",
                "time": last_msg.timestamp.strftime("%I:%M %p") if last_msg else "",
                "unread": DirectMessage.objects.filter(sender=friend, receiver=request.user, is_read=False).count(),
                "online": True
            })
            
        if not friends_data:
            friends_data.append({
                "id": "999999",
                "name": "LearnLM Assistant",
                "lastMessage": "Welcome! I'm your AI study buddy.",
                "time": "Just now",
                "unread": 1,
                "online": True
            })
            
        return Response(friends_data)

class DirectMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, friend_id):
        if str(friend_id) == "999999":
            return Response([{
                "id": "m_system_1",
                "text": "Welcome to LearnLM Direct Messaging! This is a preview of the chat interface since you don't have any connections yet.",
                "time": "Just now",
                "fromMe": False,
                "read": False
            }])

        try:
            friend = User.objects.get(id=friend_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        DirectMessage.objects.filter(sender=friend, receiver=request.user, is_read=False).update(is_read=True)

        messages = DirectMessage.objects.filter(
            (Q(sender=request.user, receiver=friend) | Q(sender=friend, receiver=request.user))
        ).order_by('timestamp')

        return Response([{
            "id": f"m{msg.id}",
            "text": msg.content,
            "time": msg.timestamp.strftime("%I:%M %p"),
            "fromMe": msg.sender == request.user,
            "read": msg.is_read
        } for msg in messages])

    def post(self, request, friend_id):
        content = request.data.get("text")
        if not content:
            return Response({"error": "Text is required"}, status=400)
            
        if str(friend_id) == "999999":
            return Response({
                "id": "m_dummy_new",
                "text": content,
                "time": "Just now",
                "fromMe": True,
                "read": True
            })

        try:
            friend = User.objects.get(id=friend_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        msg = DirectMessage.objects.create(
            sender=request.user,
            receiver=friend,
            content=content
        )
        return Response({
            "id": f"m{msg.id}",
            "text": msg.content,
            "time": msg.timestamp.strftime("%I:%M %p"),
            "fromMe": True,
            "read": False
        })
