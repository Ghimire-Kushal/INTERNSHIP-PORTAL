from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("jobs", "0002_default_categories")]

    operations = [
        migrations.AddConstraint(
            model_name="job",
            constraint=models.CheckConstraint(
                condition=(
                    models.Q(salary_min__isnull=True)
                    | models.Q(salary_max__isnull=True)
                    | models.Q(salary_min__lte=models.F("salary_max"))
                ),
                name="job_salary_min_lte_max",
            ),
        ),
    ]
