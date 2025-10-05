from django.http import JsonResponse
from django.core.cache import cache
from django.contrib.auth.models import AnonymousUser
import time

class RateLimitMiddleware:
    """Rate limiting middleware - 60 requests per minute per user"""
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip rate limiting for admin and static files
        if request.path.startswith('/admin/') or request.path.startswith('/static/'):
            return self.get_response(request)

        # Get user identifier
        if isinstance(request.user, AnonymousUser):
            user_id = request.META.get('REMOTE_ADDR', 'unknown')
        else:
            user_id = f"user_{request.user.id}"

        # Create cache key
        cache_key = f"rate_limit_{user_id}"
        current_time = int(time.time())
        window_start = current_time - 60  # 1 minute window

        # Get current requests in the window
        requests = cache.get(cache_key, [])
        
        # Filter out requests older than 1 minute
        requests = [req_time for req_time in requests if req_time > window_start]

        # Check if limit exceeded
        if len(requests) >= 60:
            return JsonResponse({
                'error': {
                    'code': 'RATE_LIMIT',
                    'message': 'Rate limit exceeded. Maximum 60 requests per minute.'
                }
            }, status=429)

        # Add current request
        requests.append(current_time)
        cache.set(cache_key, requests, 60)  # Cache for 1 minute

        response = self.get_response(request)
        return response