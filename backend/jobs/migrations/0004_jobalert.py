from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [("jobs", "0003_job_salary_min_lte_max"), ("users", "0001_initial")]
    operations = [migrations.CreateModel(
        name="JobAlert",
        fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("name", models.CharField(max_length=120)),
            ("keywords", models.CharField(blank=True, max_length=255)),
            ("location", models.CharField(blank=True, max_length=160)),
            ("job_type", models.CharField(blank=True, choices=[("full_time", "Full Time"), ("part_time", "Part Time"), ("contract", "Contract"), ("temporary", "Temporary"), ("freelance", "Freelance"), ("internship", "Internship")], max_length=20)),
            ("work_mode", models.CharField(blank=True, choices=[("onsite", "On-site"), ("remote", "Remote"), ("hybrid", "Hybrid")], max_length=20)),
            ("is_active", models.BooleanField(default=True)),
            ("created_at", models.DateTimeField(auto_now_add=True)),
            ("category", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="job_alerts", to="jobs.category")),
            ("student", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="job_alerts", to="users.user")),
        ],
        options={"ordering": ["-created_at"]},
    )]
