from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [("applications", "0003_interview")]
    operations = [migrations.CreateModel(
        name="ApplicationEvent",
        fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("status", models.CharField(choices=[("applied", "Applied"), ("under_review", "Under Review"), ("shortlisted", "Shortlisted"), ("interview", "Interview"), ("selected", "Selected"), ("rejected", "Rejected"), ("withdrawn", "Withdrawn")], max_length=20)),
            ("note", models.TextField(blank=True)),
            ("created_at", models.DateTimeField(auto_now_add=True)),
            ("application", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="events", to="applications.application")),
        ],
        options={"ordering": ["created_at", "pk"]},
    )]
