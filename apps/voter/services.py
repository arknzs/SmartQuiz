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


def computed_total(area, zone, rooms, style):
    total = 0
    for room in rooms:
        room_price = room.base_price * zone.zone_kf
        room_price = room_price * area
        total += room_price * style.style_kf
    return total