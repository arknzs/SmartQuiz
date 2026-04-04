from django.http import JsonResponse
import json

# from SmartQuiz.apps.quiz.models import AnswerModel


def send_json_response(data):
    return JsonResponse(data)

#
# def get_answers(quiz):
#     answers = AnswerModel.objects.filter(quiz=quiz)
#     return answers
#
