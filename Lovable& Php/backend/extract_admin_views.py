import os
import re

PHP_DIR = r"C:\Users\DEV\OneDrive\Pictures\Desktop\Padosi Agent\2_5\app\Http\Controllers\Admin"
DJANGO_VIEWS_FILE = r"C:\Users\DEV\OneDrive\Pictures\Desktop\Padosi Agent\2_5\padosiagent_django\admin_panel\views.py"
DJANGO_URLS_FILE = r"C:\Users\DEV\OneDrive\Pictures\Desktop\Padosi Agent\2_5\padosiagent_django\admin_panel\urls.py"

views_content = "from django.shortcuts import render\nfrom django.http import HttpResponse\n\n# Auto-generated views from Laravel controllers\n\n"
urls_content = "from django.urls import path\nfrom . import views\n\nurlpatterns = [\n"

method_pattern = re.compile(r"public\s+function\s+([a-zA-Z0-9_]+)\s*\((.*?)\)")

for file in os.listdir(PHP_DIR):
    if not file.endswith(".php"): continue
    
    path = os.path.join(PHP_DIR, file)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    controller_name = file.replace('.php', '')
    views_content += f"# ==========================================\n# {controller_name}\n# ==========================================\n"
    
    methods = method_pattern.findall(content)
    for method_name, args in methods:
        if method_name == "__construct": continue
        
        # very naive arg parsing
        django_args = ["request"]
        url_params = ""
        if args.strip():
            # if there are parameters like $id
            params = args.split(',')
            for p in params:
                p = p.strip()
                if '$' in p:
                    param_name = p.split('$')[1].split(' ')[0].replace('=', '').strip()
                    if param_name not in ['request', 'req']:
                        django_args.append(param_name)
                        url_params += f"/<str:{param_name}>"
        
        view_func_name = f"{controller_name.lower().replace('controller', '')}_{method_name}"
        
        # Try to find what view it returns
        view_match = re.search(r"return\s+view\(\s*['\"](.*?)['\"]", content[content.find(f"function {method_name}"):])
        template_name = "admin_panel/dummy.html"
        if view_match:
            template_name = view_match.group(1).replace('.', '/') + ".html"
            if template_name.startswith('admin/'):
                template_name = template_name.replace('admin/', 'admin_panel/')
        
        views_content += f"def {view_func_name}({', '.join(django_args)}):\n"
        views_content += f"    # TODO: Implement {controller_name}.{method_name} logic\n"
        views_content += f"    return render(request, '{template_name}')\n\n"
        
        url_path = f"{controller_name.lower().replace('controller', '').replace('admin', '')}/{method_name.replace('_', '-')}{url_params}"
        if url_path.startswith('/'): url_path = url_path[1:]
        
        urls_content += f"    path('{url_path}', views.{view_func_name}, name='{view_func_name}'),\n"

urls_content += "]\n"

with open(DJANGO_VIEWS_FILE, 'w', encoding='utf-8') as f:
    f.write(views_content)

with open(DJANGO_URLS_FILE, 'w', encoding='utf-8') as f:
    f.write(urls_content)

print("Generated views.py and urls.py")
