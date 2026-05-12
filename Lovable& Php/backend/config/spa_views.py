"""
SPA (Single Page Application) views for serving the React frontend.
This view serves the React build's index.html for all non-API routes,
enabling client-side routing.
"""
import os
from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.http import require_GET


REACT_BUILD_DIR = os.path.join(
    settings.BASE_DIR.parent, 'frontend', 'dist'
)


def serve_react_app(request):
    """
    Catch-all view that serves the React SPA's index.html.
    All client-side routes (/, /login, /agents, etc.) are handled by React Router.
    """
    index_path = os.path.join(REACT_BUILD_DIR, 'index.html')

    if not os.path.isfile(index_path):
        return HttpResponse(
            '<h1>React app not built yet</h1>'
            '<p>Run <code>npm run build</code> in the <code>frontend/</code> directory first.</p>',
            status=501,
        )

    with open(index_path, 'r', encoding='utf-8') as f:
        html = f.read()

    return HttpResponse(html, content_type='text/html')


@require_GET
def csrf_token_view(request):
    """
    GET /api/csrf/
    Returns a CSRF token so the React SPA can include it in POST/PUT/DELETE requests.
    The token is also set as a cookie.
    """
    token = get_token(request)
    return JsonResponse({'csrfToken': token})
