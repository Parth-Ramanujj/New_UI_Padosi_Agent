import os
import re

BLADE_DIR = r"c:\Users\DEV\OneDrive\Pictures\Desktop\Padosi Agent\2_5\resources\views\admin"
DJANGO_TEMPLATES_DIR = r"c:\Users\DEV\OneDrive\Pictures\Desktop\Padosi Agent\2_5\padosiagent_django\templates\admin_panel"

os.makedirs(DJANGO_TEMPLATES_DIR, exist_ok=True)

def convert_blade_to_django(content):
    # This is a very naive converter, but saves 90% of manual work
    
    # Replace @extends
    content = re.sub(r"@extends\((['\"])(.*?)\1\)", r"{% extends '\2.html' %}", content)
    content = content.replace("admin.layout", "admin_panel/layout")
    
    # Replace @section('content') -> {% block content %}
    content = re.sub(r"@section\((['\"])(.*?)\1\)", r"{% block \2 %}", content)
    content = content.replace("@endsection", "{% endblock %}")
    content = content.replace("@stop", "{% endblock %}")
    content = content.replace("@show", "{% endblock %}")

    # Replace @include('admin.partials.xyz') -> {% include 'admin_panel/partials/xyz.html' %}
    def repl_include(m):
        path = m.group(2).replace('.', '/')
        if path.startswith('admin/'):
            path = path.replace('admin/', 'admin_panel/')
        return f"{{% include '{path}.html' %}}"
    content = re.sub(r"@include\((['\"])(.*?)\1(?:,\s*\[(.*?)\])?\)", repl_include, content)

    # Replace asset('...') -> {% static '...' %}
    content = re.sub(r"\{\{\s*asset\((['\"])(.*?)\1\)\s*\}\}", r"{% static '\2' %}", content)

    # Replace route('name', $var) -> {% url 'name' var %}
    def repl_route(m):
        route_name = m.group(2)
        args_str = m.group(3)
        if args_str:
            args = [a.strip().lstrip('$') for a in args_str.split(',')]
            return f"{{% url '{route_name}' {' '.join(args)} %}}"
        return f"{{% url '{route_name}' %}}"
    content = re.sub(r"\{\{\s*route\((['\"])(.*?)\1(?:,\s*(.*?))?\)\s*\}\}", repl_route, content)

    # Replace @if(...) -> {% if ... %}
    def repl_if(m):
        cond = m.group(1).replace('$', '').replace('==', '==').replace('!=', '!=')
        return f"{{% if {cond} %}}"
    content = re.sub(r"@if\((.*?)\)", repl_if, content)
    content = content.replace("@else", "{% else %}")
    content = re.sub(r"@elseif\((.*?)\)", r"{% elif \1 %}", content)
    content = content.replace("@endif", "{% endif %}")

    # Replace @foreach($list as $item) -> {% for item in list %}
    def repl_foreach(m):
        lst = m.group(1).replace('$', '')
        itm = m.group(2).replace('$', '')
        if '=>' in itm:
            key, val = itm.split('=>')
            return f"{{% for {key.strip()}, {val.strip()} in {lst}.items %}}"
        return f"{{% for {itm} in {lst} %}}"
    content = re.sub(r"@foreach\((.*?)\s+as\s+(.*?)\)", repl_foreach, content)
    content = content.replace("@endforeach", "{% endfor %}")

    # Variables {{ $agent->fullname }} -> {{ agent.fullname }}
    def repl_var(m):
        var = m.group(1)
        var = var.replace('$', '').replace('->', '.')
        var = var.replace('?? \'\'', '|default:""').replace("?? ''", '|default:""')
        return f"{{{{ {var} }}}}"
    content = re.sub(r"\{\{\s*(.*?)\s*\}\}", repl_var, content)

    # Basic PHP block removal/replacement
    content = re.sub(r"@php(.*?)@endphp", "{# PHP Logic omitted during conversion #}", content, flags=re.DOTALL)
    
    # CSRF
    content = content.replace("@csrf", "{% csrf_token %}")

    return "{% load static %}\n" + content

def process_directory(src_dir, dst_dir):
    if not os.path.exists(src_dir):
        return
    for item in os.listdir(src_dir):
        src_path = os.path.join(src_dir, item)
        if os.path.isdir(src_path):
            new_dst = os.path.join(dst_dir, item)
            os.makedirs(new_dst, exist_ok=True)
            process_directory(src_path, new_dst)
        elif item.endswith(".blade.php"):
            with open(src_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            converted = convert_blade_to_django(content)
            
            outname = item.replace('.blade.php', '.html')
            outpath = os.path.join(dst_dir, outname)
            with open(outpath, 'w', encoding='utf-8') as f:
                f.write(converted)
            print(f"Converted {src_path} to {outpath}")

process_directory(BLADE_DIR, DJANGO_TEMPLATES_DIR)
