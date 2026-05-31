# groups/routing.py
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Group chat: ws://host/ws/chat/42/
    re_path(r"^ws/chat/(?P<group_id>\d+)/$", consumers.GroupChatConsumer.as_asgi()),

    # Personal notifications: ws://host/ws/notifications/
    re_path(r"^ws/notifications/$", consumers.NotificationConsumer.as_asgi()),
]