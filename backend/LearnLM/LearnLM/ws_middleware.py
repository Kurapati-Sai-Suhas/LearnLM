import urllib.parse
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken

User = get_user_model()

@database_sync_to_async
def get_user_from_token(token_string):
    """
    Validates a JWT access token and returns the corresponding User.
    """
    # 1. Strip literal quotes in case React's localStorage added them!
    clean_token = token_string.strip('"').strip("'")
    
    print(f"🔍 [WebSocket] Attempting to authenticate token: {clean_token[:15]}...")
    
    try:
        token = AccessToken(clean_token)
        user_id = token["user_id"]
        user = User.objects.get(id=user_id)
        print(f"✅ [WebSocket] Success! Authenticated User: {user.username}")
        return user
    except Exception as e:
        # Now Daphne will actually print the exact reason it failed
        print(f"❌ [WebSocket] Token Auth Failed: {e}")
        return AnonymousUser()

class JWTAuthMiddleware(BaseMiddleware):
    """
    Reads JWT from the WebSocket URL query string:
    ws://host/ws/chat/1/?token=<access_token>
    """
    async def __call__(self, scope, receive, send):
        # Parse the query string for the token
        query_string = scope.get("query_string", b"").decode()
        print(f"🔗 [WebSocket] Incoming connection with query: {query_string}")
        
        params = urllib.parse.parse_qs(query_string)
        token_list = params.get("token", [None])
        token = token_list[0] if token_list else None

        if token:
            scope["user"] = await get_user_from_token(token)
        else:
            print("⚠️ [WebSocket] No token found in URL.")
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)