from django.contrib import admin

# Register your models here.
from .models import (
    StudyGroup, StudyMaterial, Topic, Question, 
    CodingPortal, CodeSubmission, UserCodingProfile
)

# Register your models so they show up in the Admin Dashboard!
admin.site.register(StudyGroup)
admin.site.register(StudyMaterial)
admin.site.register(Topic)
admin.site.register(Question)
admin.site.register(CodingPortal)
admin.site.register(CodeSubmission)
admin.site.register(UserCodingProfile)