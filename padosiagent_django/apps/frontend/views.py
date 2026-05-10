import json
import logging
import requests
from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
from apps.frontend.models import SiteSetting, ContactSubmission

logger = logging.getLogger('apps')

def index(request):
    default_hero = {
        'headline': 'Find Trusted & Verified Insurance Experts in your Neighbourhood',
        'subheadline': 'Connect with your local PadosiAgent',
        'visible': True
    }
    default_content = {
        'hero': default_hero,
        'benefits': {
            'title': 'Buy/Port/Renew Insurance with PadosiAgent',
            'subtitle': 'Click on the Icon to search for PadosiAgent',
            'visible': True
        },
        'claims': {
            'title': 'Stuck with your Claim?',
            'subtitle': 'Get assisted with PadosiAgent Claim Experts',
            'description': 'Select your insurance type below to find your claim assistance PadosiAgent'
        },
        'review': {
            'title': 'Do you have multiple Insurance Policies?',
            'subtitle': 'Get your Portfolio Audited by Expert PadosiAgents',
            'description': 'PadosiAgent will analyse and identify gaps in your coverage'
        },
        'trust': {
            'title': 'Why Users Trust their PadosiAgent',
            'subtitle': 'The safest way to find your insurance PadosiAgent: No Spam, No Fees, just trusted service for you'
        },
        'works': {
            'title': 'Find My PadosiAgent in 4 Simple Steps',
            'subtitle': 'From search to service - it takes just minutes for you'
        },
        'sections': {
            'claim_assistance': True,
            'policy_review': True,
            'why_choose': True,
            'stats': True
        }
    }
    homepageContent = SiteSetting.get_value('homepage_content', default_content)
    return render(request, 'index.html', {'homepageContent': homepageContent})

def about(request):
    about_data = SiteSetting.get_value('about_page_content', {
        'banner_title': 'About Us',
        'banner_subtitle': 'Connecting you with trusted insurance agents in your neighborhood',
        'who_we_are': 'PadosiAgent is a digital-first platform built to simplify how people connect with trusted insurance professionals in their locality.',
        'why_we_exist': 'The insurance ecosystem often faces three common challenges.',
        'what_we_do': 'We provide a platform where customers can discover agents based on location and service segments.',
        'vision': "To build India's most trusted hyperlocal insurance discovery and service platform.",
        'mission': 'Digitally empower insurance agents. Promote transparency and accountability.',
        'commitment': 'PadosiAgent does not replace insurers, brokers, or regulatory authorities.',
    })
    return render(request, 'about.html', {'about': about_data})

def faq(request):
    return render(request, 'faq.html')

def contact(request):
    contact_data = SiteSetting.get_value('contact_page_content', {
        'banner_title': 'Contact Us',
        'section_title': 'Secure Your Family Future With us.',
        'section_subtitle': 'Have questions or need assistance? Reach out to us today for expert guidance on securing your family\'s future.',
    })
    return render(request, 'contact.html', {'contact': contact_data})

def submit_contact(request):
    if request.method == 'POST':
        try:
            # Manual validation since forms.py might not exist for contact yet, 
            # but ideally we should use Django forms. For now we parse POST.
            name = request.POST.get('name')
            mobile = request.POST.get('mobile')
            email = request.POST.get('email')
            company = request.POST.get('company')
            subject = request.POST.get('subject')
            message = request.POST.get('message')

            # Basic Validation
            errors = {}
            if not name or len(name) < 2:
                errors['name'] = ['Name is required and must be at least 2 characters.']
            if not mobile or len(mobile) != 10 or not mobile.isdigit():
                errors['mobile'] = ['Please enter a valid 10-digit mobile number.']
            if not email or '@' not in email:
                errors['email'] = ['Please enter a valid email address.']
            if not subject or len(subject) < 5:
                errors['subject'] = ['Subject is required and must be at least 5 characters.']
            if not message or len(message) < 10:
                errors['message'] = ['Message is required and must be at least 10 characters.']

            if errors:
                return JsonResponse({
                    'success': False,
                    'message': 'Please fix the validation errors below.',
                    'errors': errors
                }, status=422)

            reference_id = ContactSubmission.generate_reference_id()
            
            contact_submission = ContactSubmission.objects.create(
                reference_id=reference_id,
                name=name,
                mobile=mobile,
                email=email,
                company=company,
                subject=subject,
                message=message,
                status='pending'
            )

            # Send email using Brevo Web API
            to_email = 'support@padosiagents.com'
            email_subject = f'New Contact Message: {subject}'
            
            body = (f"You received a new contact message.<br><br>"
                f"<b>Reference ID:</b> {reference_id}<br>"
                f"<b>Name:</b> {name}<br>"
                f"<b>Email:</b> {email}<br>"
                f"<b>Mobile:</b> {mobile}<br>"
                f"<b>Company:</b> {company or 'N/A'}<br>"
                f"<b>Subject:</b> {subject}<br><br>"
                f"<b>Message:</b><br>{message}<br>")

            headers = {
                'api-key': getattr(settings, 'BREVO_API_KEY', ''),
                'Content-Type': 'application/json',
                'accept': 'application/json'
            }

            payload = {
                'sender': {
                    'name': 'Padosi Agents Website',
                    'email': 'noreply@padosiagents.com'
                },
                'to': [
                    {
                        'name': 'Support',
                        'email': to_email
                    }
                ],
                'replyTo': {
                    'email': email,
                    'name': name
                },
                'subject': email_subject,
                'htmlContent': body
            }

            try:
                response = requests.post(
                    'https://api.brevo.com/v3/smtp/email',
                    json=payload,
                    headers=headers,
                    verify=not settings.DEBUG
                )
                logger.info(f'CONTACT FORM SUBMISSION - Brevo API Response: {response.text}')
                
                if not response.ok:
                    logger.error(f'CONTACT FORM SUBMISSION - Brevo API Error: {response.text}')
                    return JsonResponse({
                        'success': False,
                        'message': 'Message saved, but mail service API failed. Verify BREVO_API_KEY in .env.'
                    }, status=400)
            except Exception as e:
                logger.error(f'CONTACT FORM SUBMISSION - Brevo HTTP Error: {str(e)}')
                return JsonResponse({
                    'success': False,
                    'message': 'Message saved, but mail service API failed.'
                }, status=400)

            return JsonResponse({
                'success': True,
                'message': 'Thank you! Your message has been sent successfully. We will get back to you soon.'
            })

        except Exception as e:
            logger.error(f'CONTACT FORM SUBMISSION - Error: {str(e)}')
            return JsonResponse({
                'success': False,
                'message': 'Failed to submit your message. Please try again.'
            }, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)
