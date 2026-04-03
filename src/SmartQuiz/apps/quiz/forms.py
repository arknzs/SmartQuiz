from django import forms

from .models import Quiz

class QuizForm(forms.ModelForm):
    class Meta:
        model = Quiz
        fields = ('quiz_name', 'quiz_questions')


class AnswerForm(forms.ModelForm):
    class Meta:
        model = Quiz
        fields = ('quiz_id', 'true_answer')
