from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
import json

from apps.frontend.models import Participant

def manifest(request):
    manifest_data = {
        "name": "Padosi Agent",
        "short_name": "PadosiAgent",
        "description": "Find Trusted & Verified Insurance Experts in your Neighbourhood",
        "start_url": "/?source=pwa",
        "display": "standalone",
        "background_color": "#ffffff",
        "theme_color": "#0d6efd",
        "icons": [
            {
                "src": "/static/images/logo/logo-192.png",
                "sizes": "192x192",
                "type": "image/png"
            },
            {
                "src": "/static/images/logo/logo-512.png",
                "sizes": "512x512",
                "type": "image/png"
            }
        ]
    }
    return JsonResponse(manifest_data)

def sw_js(request):
    js_content = """
    const CACHE_NAME = 'padosiagent-v1';
    const OFFLINE_URL = '/offline.html';

    self.addEventListener('install', (event) => {
        event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.add(OFFLINE_URL);
            })
        );
    });

    self.addEventListener('fetch', (event) => {
        if (event.request.mode === 'navigate') {
            event.respondWith(
                fetch(event.request).catch(() => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        return cache.match(OFFLINE_URL);
                    });
                })
            );
        }
    });
    """
    return HttpResponse(js_content, content_type="application/javascript")

def offline(request):
    return render(request, 'offline.html')


@csrf_exempt
def store_participant(request):
    if request.method == 'POST':
        full_name = request.POST.get('full_name')
        email = request.POST.get('email')
        phone_number = request.POST.get('phone_number')
        have_insurance = request.POST.get('have_insurance', 'no')
        insurance_planning = request.POST.get('insurance_planning')
        mutual_fund = request.POST.get('mutual_fund', 'no')
        
        if not full_name or not email or not phone_number:
            return JsonResponse({'success': False, 'message': 'Missing required fields'})
            
        if Participant.objects.filter(email=email).exists():
            return JsonResponse({'success': False, 'message': 'Email already registered'})

        p = Participant.objects.create(
            full_name=full_name,
            email=email,
            phone_number=phone_number,
            have_insurance=have_insurance,
            insurance_planning=insurance_planning,
            mutual_fund=mutual_fund
        )
        return JsonResponse({'success': True, 'message': 'Registration successful!'})

    return JsonResponse({'success': False, 'message': 'Invalid request'})
