from django.http import JsonResponse
import json

# from SmartQuiz.apps.quiz.models import AnswerModel


# def send_json_response(data):
#     return JsonResponse(data)


def send_data(data):
    ...
    return JsonResponse(data)


def computed_sum(products):
    total = 0
    for product in products:
        total += product.price
    return total


def computed_total(area, zone_kf, style_kf, base_price):
    total = base_price * area * zone_kf * style_kf
    return total

