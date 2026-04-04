import json
import re

from django.db.utils import OperationalError, ProgrammingError
from django.http import JsonResponse
from django.shortcuts import render
from django.utils import timezone
from django.views.decorators.http import require_http_methods

from .models import Room, Style, Zone, Voter

QUIZ_TITLE_FALLBACK = "Подберите дизайн-проект интерьера"
QUIZ_DESCRIPTION_FALLBACK = (
    "Ответьте на 6 коротких вопросов, и мы подготовим ориентир по вашему проекту."
)

ROOM_FALLBACKS = [
    {"value": "Квартира", "label": "Квартира"},
    {"value": "Частный дом", "label": "Частный дом"},
    {"value": "Офис", "label": "Офис"},
    {"value": "Коммерческое помещение", "label": "Коммерческое помещение"},
    {"value": "Студия / апартаменты", "label": "Студия / апартаменты"},
    {"value": "Другое", "label": "Другое"},
]

ZONE_FALLBACKS = [
    {"value": "Кухня", "label": "Кухня"},
    {"value": "Гостиная", "label": "Гостиная"},
    {"value": "Спальня", "label": "Спальня"},
    {"value": "Детская", "label": "Детская"},
    {"value": "Санузел", "label": "Санузел"},
    {"value": "Прихожая", "label": "Прихожая"},
    {"value": "Кабинет", "label": "Кабинет"},
    {"value": "Гардеробная", "label": "Гардеробная"},
    {"value": "Балкон / лоджия", "label": "Балкон / лоджия"},
    {"value": "Полностью всё помещение", "label": "Полностью всё помещение"},
]

STYLE_FALLBACKS = [
    {"value": "Современный", "label": "Современный"},
    {"value": "Минимализм", "label": "Минимализм"},
    {"value": "Скандинавский", "label": "Скандинавский"},
    {"value": "Лофт", "label": "Лофт"},
    {"value": "Неоклассика", "label": "Неоклассика"},
    {"value": "Классика", "label": "Классика"},
    {"value": "Пока не определился", "label": "Пока не определился"},
]

BUDGET_CHOICES = [
    {"value": "До 500 000 ₽", "label": "До 500 000 ₽"},
    {"value": "500 000 – 1 000 000 ₽", "label": "500 000 – 1 000 000 ₽"},
    {"value": "1 000 000 – 2 000 000 ₽", "label": "1 000 000 – 2 000 000 ₽"},
    {"value": "От 2 000 000 ₽", "label": "От 2 000 000 ₽"},
    {"value": "Пока не знаю", "label": "Пока не знаю"},
]

TRACKED_UTM_FIELDS = (
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
)
def _get_choice_payload(model, fallback):
    try:
        values = list(model.objects.order_by("id").values_list("name", flat=True))
    except (OperationalError, ProgrammingError):
        values = []
    if not values:
        return fallback
    return [{"value": name, "label": name} for name in values]


def quiz_page(request):
    quiz_config = {
        "title": QUIZ_TITLE_FALLBACK,
        "description": QUIZ_DESCRIPTION_FALLBACK,
        "rooms": _get_choice_payload(Room, ROOM_FALLBACKS),
        "zones": _get_choice_payload(Zone, ZONE_FALLBACKS),
        "styles": _get_choice_payload(Style, STYLE_FALLBACKS),
        "budgets": BUDGET_CHOICES,
        "area": {"min": 20, "max": 300, "step": 5, "default": 60},
        "success_message": "Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.",
        "error_message": "Не удалось отправить заявку. Пожалуйста, попробуйте ещё раз.",
    }
    return render(
        request,
        "quiz.html",
        {
            "quiz_name": QUIZ_TITLE_FALLBACK,
            "quiz_description": QUIZ_DESCRIPTION_FALLBACK,
            "quiz_config": quiz_config,
        },
    )


@require_http_methods(["GET"])
def api_get_blocks(request):
    return JsonResponse({"blocks": []})


@require_http_methods(["POST"])
def api_submit_quiz(request):
    try:
        data = json.loads(request.body or "{}")
        phone = str(data.get("phone", "")).strip()
        consent = bool(data.get("privacy_agreed"))
        digits = re.sub(r"\D", "", phone)

        errors = {}
        if not phone:
            errors["phone"] = "Укажите телефон."
        elif len(digits) < 11:
            errors["phone"] = "Введите корректный номер телефона."
        if not consent:
            errors["privacy_agreed"] = "Нужно согласиться на обработку персональных данных."

        if errors:
            return JsonResponse(
                {
                    "status": "error",
                    "message": "Не удалось отправить заявку. Пожалуйста, попробуйте ещё раз.",
                    "errors": errors,
                },
                status=400,
            )

        payload = {
            "room_type": str(data.get("room_type", "")).strip(),
            "zones": [str(zone).strip() for zone in data.get("zones", []) if str(zone).strip()],
            "area": data.get("area"),
            "style": str(data.get("style", "")).strip(),
            "budget": str(data.get("budget", "")).strip(),
            "name": str(data.get("name", "")).strip(),
            "phone": phone,
            "email": str(data.get("email", "")).strip(),
            "comment": str(data.get("comment", "")).strip(),
            "privacy_agreed": consent,
            "page_url": str(data.get("page_url", "")).strip(),
            "submitted_at": timezone.now().isoformat(),
        }

        for utm_field in TRACKED_UTM_FIELDS:
            value = str(data.get(utm_field, "")).strip()
            if value:
                payload[utm_field] = value

        voter = Voter.objects.create(
            name=payload["name"] or payload["phone"],
            description=payload["comment"] or payload["budget"],
            answer=payload,
        )

        return JsonResponse(
            {
                "status": "success",
                "message": "Заявка успешно отправлена!",
                "voter_id": voter.id,
            }
        )
    except Exception as error:
        return JsonResponse({"status": "error", "message": str(error)}, status=400)
