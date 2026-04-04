from django.db import models


class Voter(models.Model):
    answer = models.JSONField(default=dict)
