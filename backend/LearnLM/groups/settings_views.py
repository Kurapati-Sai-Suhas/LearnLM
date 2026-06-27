from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Profile
from django.core.mail import send_mail
from django.conf import settings

class ProfileSettingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        return Response({
            "first_name": request.user.first_name,
            "last_name": request.user.last_name,
            "email": request.user.email,
            "bio": profile.bio,
            "email_alerts": profile.email_alerts
        })

    def put(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        user = request.user
        
        user.first_name = request.data.get("first_name", user.first_name)
        user.last_name = request.data.get("last_name", user.last_name)
        if "email" in request.data:
            user.email = request.data["email"]
        user.save()

        profile.bio = request.data.get("bio", profile.bio)
        profile.email_alerts = request.data.get("email_alerts", profile.email_alerts)
        profile.save()

        return Response({"status": "success"})

class TestEmailView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            send_mail(
                subject='LearnLM Alert - Email Connected!',
                message='Your LearnLM account is now successfully connected to Gmail SMTP for notifications.',
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[request.user.email],
                fail_silently=False,
            )
            return Response({"status": "Email sent successfully!"})
        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=500)
