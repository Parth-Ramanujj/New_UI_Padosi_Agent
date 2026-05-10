"""
fix_dashboard_template.py
Cleans up residual Blade / PHP syntax in templates/agents/dashboard.html
after the automatic Blade→Django conversion.
"""
import re

TEMPLATE = "templates/agents/dashboard.html"

with open(TEMPLATE, "r", encoding="utf-8") as f:
    txt = f.read()

# 1. Fix extends path separator
txt = txt.replace("{% extends 'layouts.app.html' %}", "{% extends 'layouts/app.html' %}")

# 2. Remove Blade @stack / @push / @endpush
txt = re.sub(r"@stack\('styles'\)", "", txt)
txt = re.sub(r"@push\('scripts'\)", "", txt)
txt = re.sub(r"@endpush", "", txt)

# 3. Fix Blade comment syntax  {{ -- text -- }}  →  {# text #}
txt = re.sub(r"\{\{\s*--\s*(.*?)\s*--\s*\}\}", r"{# \1 #}", txt, flags=re.DOTALL)

# 4. Fix PHP arrow-operator if conditions
txt = re.sub(
    r"\{%\s*if\s+agent->status\s*===\s*'inactive'\s*%}",
    "{% if agent.status == 'inactive' %}",
    txt,
)

# 5. Fix recentLeads->count() > 0  check
txt = re.sub(
    r"\{%\s*if\s+recentLeads->count\(\s*%}\s*>\s*0\)",
    "{% if recentLeads %}",
    txt,
)

# 6. Fix insuranceSegments->count() > 0
txt = re.sub(
    r"\{%\s*if\s+agent->insuranceSegments->count\(\s*%}\s*>\s*0\)",
    "{% if segment_labels %}",
    txt,
)

# 7. Fix serviceableCities->count() > 0
txt = re.sub(
    r"\{%\s*if\s+agent->serviceableCities->count\(\s*%}\s*>\s*0\)",
    "{% if agent.serviceable_city_set.exists %}",
    txt,
)

# 8. Fix isset(showReferral ... ) condition
txt = re.sub(
    r"\{%\s*if\s+isset\(showReferral\s*%}.*?\)",
    "{% if showReferral %}",
    txt,
)

# 9. Fix PHP null-coalescing  {{ var ?? 'default' }}  →  {{ var|default:'default' }}
def fix_null_coalesce(m):
    var = m.group(1).strip()
    default = m.group(2)
    return "{{{{ {var}|default:'{default}' }}}}".format(var=var, default=default)

txt = re.sub(
    r"\{\{\s*([\w\.\?]+)\s*\?\?\s*'([^']*)'\s*\}\}",
    lambda m: "{{{{ {var}|default:'{default}' }}}}".format(
        var=m.group(1).replace("?", ""), default=m.group(2)
    ),
    txt,
)

# 10. Fix URL tags with PHP-style params
txt = re.sub(
    r"\{%\s*url\s*'agent\.public-profile'\s*\[.*?\]\s*%}",
    "{% url 'agents:show_profile' profile.slug %}",
    txt,
    flags=re.DOTALL,
)
url_map = {
    "{% url 'agent.referral' %}":     "{% url 'agents:referral' %}",
    "{% url 'agent.edit-profile' %}": "{% url 'agents:edit_profile' %}",
    "{% url 'agent.dashboard' %}":    "{% url 'agents:dashboard' %}",
    "{% url 'agent.push-token' %}":   "{% url 'agents:store_push_token' %}",
}
for old, new in url_map.items():
    txt = txt.replace(old, new)

# 11. Fix CSRF token in JS
txt = txt.replace("{{ csrf_token() }}", "{{ csrf_token }}")

# 12. Fix Laravel config() calls in JS  →  Django settings vars
txt = re.sub(
    r"\{\{\s*config\('services\.fcm\.(\w+)'\)\s*\}\}",
    lambda m: '{{ FCM_' + m.group(1).upper() + '|default:"" }}',
    txt,
)

# 13. Fix profile->languages check
txt = re.sub(
    r"\{%\s*if\s+!empty\(profile\?->languages\s*%}\)",
    "{% if profile and profile.languages %}",
    txt,
)

# 14. Fix for loop over explode(',', profile->languages)
txt = re.sub(
    r"\{%\s*for\s+lang\s+in\s+explode\(',',\s*profile->languages\)\s*%}",
    "{% for lang in profile.languages.split(',') %}",
    txt,
)

# 15. Fix lead.created_at.diffForHumans()
txt = txt.replace(".diffForHumans()", "|timesince")

# 16. Fix stray PHP: if($daysLeft <= 5) leftover
txt = re.sub(r"if\(\$daysLeft\s*<=\s*5\)", "", txt)

# 17. Fix dashboardStats['key']  →  dashboardStats.key  in {{ }} expressions
txt = re.sub(
    r"\{\{\s*dashboardStats\['(\w+)'\]\s*\}\}",
    r"{{ dashboardStats.\1 }}",
    txt,
)
# Also in style attributes
txt = re.sub(
    r"(style=\"[^\"]*width:\s*)\{\{\s*dashboardStats\['(\w+)'\]\s*\}\}(%\")",
    r"\1{{ dashboardStats.\2 }}\3",
    txt,
)

# 18. Fix ucfirst() calls  →  |capfirst filter
txt = re.sub(r"ucfirst\((\w+)\)", r"\1|capfirst", txt)

# 19. Fix number_format() calls on dashboardStats values
txt = re.sub(
    r"\{\{\s*number_format\(dashboardStats\['(\w+)'\]\)\s*\}\}",
    r"{{ dashboardStats.\1 }}",
    txt,
)

# 20. Fix profile completion check  profile?->  to  profile.
txt = re.sub(r"profile\?->", "profile.", txt)

# 21. Fix agent->  to  agent.  in template expressions
txt = re.sub(r"agent->(\w+)", r"agent.\1", txt)

# 22. Fix  segmentLabel === 'sme' ? 'SME' : ucfirst(...)
#     → use a simple ifequal approach; wrap in comment noting manual fix needed
txt = re.sub(
    r"\{\{\s*segmentLabel\s*===\s*'sme'\s*\?[^}]+\}\}",
    "{% if segmentLabel == 'sme' %}SME{% else %}{{ segmentLabel|capfirst }}{% endif %}",
    txt,
)

# 23. Fix  agent.experience_range ? agent.experience_range . ' Years Exp.' : 'Experience not set'
txt = re.sub(
    r"\{\{\s*agent\.experience_range\s*\?.*?'Experience not set'\s*\}\}",
    "{% if agent.experience_range %}{{ agent.experience_range }} Years Exp.{% else %}Experience not set{% endif %}",
    txt,
    flags=re.DOTALL,
)

# 24. Fix {{ preg_replace(...)}} calls in JS — these are inside <script> blocks, leave as comments
txt = re.sub(
    r"\{\{\s*preg_replace\([^}]+\)\s*\}\}",
    "{{ '' }}{# preg_replace: format in view #}",
    txt,
)

# 25. Fix  agent.serviceableCities.take(5).pluck('name').implode(', ')
txt = re.sub(
    r"\{\{\s*agent\.serviceableCities\.take\(\d+\)\.pluck\('name'\)\.implode\(', '\)\s*\}\}",
    "{{ city_display }}",
    txt,
)
txt = re.sub(
    r"\{\{\s*agent\.serviceableCities\.count\(\)\s*>\s*5\s*\?.*?\}\}",
    "",
    txt,
    flags=re.DOTALL,
)

with open(TEMPLATE, "w", encoding="utf-8") as f:
    f.write(txt)

print("dashboard.html fixed successfully.")
