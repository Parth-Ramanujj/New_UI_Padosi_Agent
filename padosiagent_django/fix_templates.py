import os
import re

TEMPLATES_DIR = r"c:\Users\DEV\OneDrive\Pictures\Desktop\Padosi Agent\2_5\padosiagent_django\templates"

def fix_dict_lookups(content):
    # This regex looks for dictionary lookups like my_dict['key'] or my_dict["key"] inside Django template variables {{ ... }} or tags {% ... %}
    # It replaces ['key'] with .key
    
    # We will just replace all ['key'] or ["key"] to .key within {{ }} or {% %} tags
    def replace_brackets(match):
        inner = match.group(1)
        # replace ['key'] or ["key"] with .key
        inner = re.sub(r"\[(['\"])(.*?)\1\]", r".\2", inner)
        
        # replace |default:true with |default:True and false with False
        inner = re.sub(r"\|default:true\b", r"|default:True", inner)
        inner = re.sub(r"\|default:false\b", r"|default:False", inner)
        
        # return the reconstructed match
        if match.group(0).startswith('{{'):
            return "{{" + inner + "}}"
        else:
            return "{%" + inner + "%}"

    content = re.sub(r"\{\{(.*?)\}\}", replace_brackets, content)
    content = re.sub(r"\{%(.*?)%\}", replace_brackets, content)
    return content

count = 0
for root, _, files in os.walk(TEMPLATES_DIR):
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = fix_dict_lookups(content)
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                count += 1
                
print(f"Fixed {count} template files.")
