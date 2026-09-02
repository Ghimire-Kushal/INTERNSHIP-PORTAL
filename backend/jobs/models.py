from django.db import models
from django.utils.text import slugify
from companies.models import Company

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)
    def save(self, *args, **kwargs):
        if not self.slug: self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    class Meta: verbose_name_plural = "categories"; ordering = ["name"]
    def __str__(self): return self.name

class Job(models.Model):
    class JobType(models.TextChoices): FULL_TIME="full_time","Full Time"; PART_TIME="part_time","Part Time"; CONTRACT="contract","Contract"; TEMPORARY="temporary","Temporary"; FREELANCE="freelance","Freelance"; INTERNSHIP="internship","Internship"
    class WorkMode(models.TextChoices): ONSITE="onsite","On-site"; REMOTE="remote","Remote"; HYBRID="hybrid","Hybrid"
    class Status(models.TextChoices): DRAFT="draft","Draft"; OPEN="open","Open"; CLOSED="closed","Closed"; EXPIRED="expired","Expired"
    company=models.ForeignKey(Company,on_delete=models.CASCADE,related_name="jobs")
    title=models.CharField(max_length=180,db_index=True); slug=models.SlugField(unique=True,blank=True); category=models.ForeignKey(Category,on_delete=models.SET_NULL,null=True,related_name="jobs")
    description=models.TextField(); responsibilities=models.TextField(blank=True); requirements=models.TextField(blank=True); skills_required=models.CharField(max_length=400,blank=True)
    job_type=models.CharField(max_length=20,choices=JobType.choices,default=JobType.FULL_TIME); experience_level=models.CharField(max_length=80,blank=True); education_required=models.CharField(max_length=160,blank=True)
    location=models.CharField(max_length=160,db_index=True); work_mode=models.CharField(max_length=20,choices=WorkMode.choices,default=WorkMode.ONSITE)
    salary_min=models.DecimalField(max_digits=12,decimal_places=2,null=True,blank=True); salary_max=models.DecimalField(max_digits=12,decimal_places=2,null=True,blank=True); salary_currency=models.CharField(max_length=8,default="NPR")
    number_of_openings=models.PositiveIntegerField(default=1); application_deadline=models.DateField(db_index=True); posted_date=models.DateTimeField(auto_now_add=True); status=models.CharField(max_length=12,choices=Status.choices,default=Status.DRAFT,db_index=True); views=models.PositiveIntegerField(default=0); is_featured=models.BooleanField(default=False)
    created_at=models.DateTimeField(auto_now_add=True); updated_at=models.DateTimeField(auto_now=True)
    class Meta:
        ordering=["-created_at"]
        indexes=[models.Index(fields=["status","application_deadline"])]
        constraints=[
            models.CheckConstraint(
                condition=(
                    models.Q(salary_min__isnull=True)
                    | models.Q(salary_max__isnull=True)
                    | models.Q(salary_min__lte=models.F("salary_max"))
                ),
                name="job_salary_min_lte_max",
            )
        ]
    def save(self,*args,**kwargs):
        if not self.slug: self.slug=slugify(self.title)
        base=self.slug; count=2
        while Job.objects.exclude(pk=self.pk).filter(slug=self.slug).exists(): self.slug=f"{base}-{count}"; count+=1
        super().save(*args,**kwargs)
    def __str__(self): return self.title
