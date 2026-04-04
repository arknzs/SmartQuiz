from django.contrib import admin

from apps.voter.models import Voter


@admin.register(Voter)
class VoterAdmin(admin.ModelAdmin):
    # fields = 'answer'
    list_display = ('answer',)

admin.site.register(Voter)