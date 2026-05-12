"""Append lead management views to views.py."""
APPEND = '''

# =============================================================================
# LEAD MANAGEMENT  (from AgentLeadController / AgentDashboardController)
# =============================================================================

@login_required
def lead_list(request):
    """List all leads for the authenticated agent with optional status filter."""
    agent = request.user.agent_record.first()
    if not agent:
        return redirect('accounts:agent_login')

    status_filter = request.GET.get('status', '')
    qs = AgentLead.objects.filter(agent=agent).order_by('-created_at')
    if status_filter:
        qs = qs.filter(lead_status=status_filter)

    from django.core.paginator import Paginator
    paginator = Paginator(qs, 25)
    page_obj  = paginator.get_page(request.GET.get('page', 1))

    base_qs       = AgentLead.objects.filter(agent=agent)
    status_counts = {
        'all':       base_qs.count(),
        'new':       base_qs.filter(lead_status='new').count(),
        'contacted': base_qs.filter(lead_status='contacted').count(),
        'follow_up': base_qs.filter(lead_status='follow_up').count(),
        'closed':    base_qs.filter(lead_status='closed').count(),
    }

    context = {
        'agent':         agent,
        'page_obj':      page_obj,
        'leads':         page_obj,
        'status_filter': status_filter,
        'status_counts': status_counts,
    }
    return render(request, 'agents/leads.html', context)


@login_required
@require_POST
def lead_update_status(request, lead_id):
    """Update the status (and optional notes) of a lead — AJAX-friendly."""
    agent = request.user.agent_record.first()
    if not agent:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=403)

    lead = AgentLead.objects.filter(pk=lead_id, agent=agent).first()
    if not lead:
        return JsonResponse({'status': 'error', 'message': 'Lead not found'}, status=404)

    VALID_STATUSES = ['new', 'contacted', 'follow_up', 'closed']
    new_status = request.POST.get('lead_status', '').strip()
    if new_status not in VALID_STATUSES:
        return JsonResponse(
            {'status': 'error', 'message': f'Invalid status. Choose from: {VALID_STATUSES}'},
            status=422,
        )

    lead.lead_status = new_status
    lead.notes       = request.POST.get('notes', lead.notes)
    lead.save(update_fields=['lead_status', 'notes', 'updated_at'])

    return JsonResponse({
        'status':      'success',
        'message':     'Lead updated successfully.',
        'lead_id':     lead.pk,
        'lead_status': lead.lead_status,
    })


@login_required
def lead_detail(request, lead_id):
    """View / update notes for a single lead."""
    agent = request.user.agent_record.first()
    if not agent:
        return redirect('accounts:agent_login')

    lead = AgentLead.objects.filter(pk=lead_id, agent=agent).first()
    if not lead:
        from django.http import Http404
        raise Http404('Lead not found')

    if request.method == 'POST':
        lead.notes       = request.POST.get('notes', lead.notes)
        lead.lead_status = request.POST.get('lead_status', lead.lead_status)
        lead.save(update_fields=['notes', 'lead_status', 'updated_at'])
        return JsonResponse({'status': 'success', 'message': 'Lead notes saved.'})

    context = {'agent': agent, 'lead': lead}
    return render(request, 'agents/lead_detail.html', context)
'''

with open('apps/agents/views.py', 'r', encoding='utf-8') as f:
    txt = f.read()

if 'def lead_list' not in txt:
    with open('apps/agents/views.py', 'a', encoding='utf-8') as f:
        f.write(APPEND)
    print('Lead management views appended.')
else:
    print('Lead management views already present.')
