from django.conf import settings
from django.core.validators import FileExtensionValidator, MaxValueValidator, MinValueValidator
from django.db import models


class StudentProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="student_profile")
    headline = models.CharField(max_length=160, blank=True)
    bio = models.TextField(blank=True)
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True, db_index=True)
    country = models.CharField(max_length=100, blank=True)
    date_of_birth = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=30, blank=True)
    university = models.CharField(max_length=160, blank=True)
    degree = models.CharField(max_length=160, blank=True)
    graduation_year = models.PositiveSmallIntegerField(blank=True, null=True, validators=[MinValueValidator(1950), MaxValueValidator(2100)])
    current_semester = models.CharField(max_length=40, blank=True)
    portfolio_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    cv = models.FileField(upload_to="cvs/%Y/%m/", blank=True, null=True, validators=[FileExtensionValidator(["pdf", "doc", "docx"])])
    profile_completion = models.PositiveSmallIntegerField(default=0)

    def calculate_completion(self):
        sections = [
            bool(self.headline and self.city and self.university), bool(self.cv),
            self.education.exists(), self.student_skills.exists(), self.experiences.exists() or self.projects.exists(),
        ]
        return sum(sections) * 20

    def save(self, *args, **kwargs):
        if self.pk:
            self.profile_completion = self.calculate_completion()
        super().save(*args, **kwargs)


class Education(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="education")
    institution_name = models.CharField(max_length=180)
    degree = models.CharField(max_length=160)
    field_of_study = models.CharField(max_length=160, blank=True)
    start_year = models.PositiveSmallIntegerField(validators=[MinValueValidator(1950), MaxValueValidator(2100)])
    end_year = models.PositiveSmallIntegerField(blank=True, null=True, validators=[MinValueValidator(1950), MaxValueValidator(2100)])
    grade = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    class Meta: ordering = ["-end_year", "-start_year"]


class Skill(models.Model):
    name = models.CharField(max_length=80, unique=True)
    class Meta: ordering = ["name"]
    def __str__(self): return self.name


class StudentSkill(models.Model):
    class Proficiency(models.TextChoices): BEGINNER = "beginner", "Beginner"; INTERMEDIATE = "intermediate", "Intermediate"; ADVANCED = "advanced", "Advanced"; EXPERT = "expert", "Expert"
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="student_skills")
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name="student_skills")
    proficiency = models.CharField(max_length=16, choices=Proficiency.choices, default=Proficiency.INTERMEDIATE)
    class Meta: constraints = [models.UniqueConstraint(fields=["student", "skill"], name="unique_student_skill")]


class Experience(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="experiences")
    company_name = models.CharField(max_length=160); position = models.CharField(max_length=160); employment_type = models.CharField(max_length=60, blank=True)
    start_date = models.DateField(); end_date = models.DateField(blank=True, null=True); currently_working = models.BooleanField(default=False); description = models.TextField(blank=True)
    class Meta: ordering = ["-start_date"]


class Project(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="projects")
    title = models.CharField(max_length=180); description = models.TextField(); technology_used = models.CharField(max_length=255, blank=True)
    project_url = models.URLField(blank=True); github_url = models.URLField(blank=True); start_date = models.DateField(blank=True, null=True); end_date = models.DateField(blank=True, null=True)
    class Meta: ordering = ["-start_date"]


class Certificate(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="certificates")
    certificate_name = models.CharField(max_length=180); organization = models.CharField(max_length=160); issue_date = models.DateField(); expiry_date = models.DateField(blank=True, null=True)
    credential_id = models.CharField(max_length=120, blank=True); credential_url = models.URLField(blank=True)
    class Meta: ordering = ["-issue_date"]
