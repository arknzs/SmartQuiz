from django.db import models

class Question(models.Model):
    question_id = models.AutoField(primary_key=True)
    question_text = models.CharField(max_length=100)
    true_answer = models.CharField(max_length=100)

class Quiz(models.Model):
    quiz_id = models.AutoField(primary_key=True)
    quiz_name = models.CharField(max_length=100)
    quiz_questions = models.ManyToManyField('Question')

