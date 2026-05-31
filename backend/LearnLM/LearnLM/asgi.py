# LearnLM/asgi.py
import os
import django
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'LearnLM.settings')
django.setup()

# Import AFTER django.setup() so models are ready
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from groups.routing import websocket_urlpatterns
from .ws_middleware import JWTAuthMiddleware

application = ProtocolTypeRouter({
    # Regular HTTP → handled by Django as normal
    "http": get_asgi_application(),

    # WebSocket → JWT auth → URL router → consumers
    "websocket": AllowedHostsOriginValidator(
        JWTAuthMiddleware(
            URLRouter(websocket_urlpatterns)
        )
    ),
})