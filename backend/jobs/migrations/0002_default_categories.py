from django.db import migrations


DEFAULT_CATEGORIES = [
    ("Software Development", "software-development"),
    ("Web Development", "web-development"),
    ("Data Science", "data-science"),
    ("Marketing", "marketing"),
]


def add_default_categories(apps, schema_editor):
    Category = apps.get_model("jobs", "Category")
    for name, slug in DEFAULT_CATEGORIES:
        Category.objects.get_or_create(slug=slug, defaults={"name": name})


class Migration(migrations.Migration):
    dependencies = [("jobs", "0001_initial")]
    operations = [migrations.RunPython(add_default_categories, migrations.RunPython.noop)]
