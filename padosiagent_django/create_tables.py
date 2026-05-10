"""Create all app-model tables in SQLite (bypassing managed=False)."""
import os, sys, django

os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

django.setup()

from django.db import connection
from django.apps import apps

# Models that use managed=False — we force-create their tables
app_labels = ['accounts', 'agents', 'frontend', 'clients']

with connection.schema_editor() as schema_editor:
    for app_label in app_labels:
        app_config = apps.get_app_config(app_label)
        for model in app_config.get_models():
            table_name = model._meta.db_table
            # Check if table already exists
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
                    [table_name]
                )
                if cursor.fetchone():
                    print(f"  Table {table_name} already exists, skipping.")
                    continue
            try:
                schema_editor.create_model(model)
                print(f"  Created table {table_name}")
            except Exception as e:
                print(f"  ERROR creating {table_name}: {e}")

print("Done.")
