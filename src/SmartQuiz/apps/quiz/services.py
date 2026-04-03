import json

from django.http import JsonResponse





def send_json_response(data, user_id):
    a = json.load(data)
    a.update({'user_id': user_id})
    return JsonResponse(a)