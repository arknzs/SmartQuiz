import json

from django.test import TestCase
from django.urls import reverse

from .models import Room, Style, Voter, Zone


class QuizPageTests(TestCase):
    def test_quiz_page_renders_with_model_choices(self):
        Room.objects.create(name="Пентхаус")
        Zone.objects.create(name="Терраса")
        Style.objects.create(name="Japandi")

        response = self.client.get(reverse("quiz_page"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context["quiz_config"]["rooms"][0]["label"], "Пентхаус")
        self.assertEqual(response.context["quiz_config"]["zones"][0]["label"], "Терраса")
        self.assertEqual(response.context["quiz_config"]["styles"][0]["label"], "Japandi")


class QuizSubmitTests(TestCase):
    def test_submit_stores_payload_in_voter(self):
        payload = {
            "room_type": "Квартира",
            "zones": ["Кухня", "Гостиная"],
            "area": 85,
            "style": "Минимализм",
            "budget": "1 000 000 – 2 000 000 ₽",
            "name": "Иван",
            "phone": "+7 (900) 000-00-00",
            "email": "ivan@example.com",
            "comment": "Нужен дизайн-проект",
            "privacy_agreed": True,
            "page_url": "http://testserver/quiz/",
            "utm_source": "yandex",
        }

        response = self.client.post(
            reverse("api_submit_quiz"),
            data=json.dumps(payload),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(Voter.objects.count(), 1)
        voter = Voter.objects.get()
        self.assertEqual(voter.name, "Иван")
        self.assertEqual(voter.answer["room_type"], "Квартира")
        self.assertEqual(voter.answer["zones"], ["Кухня", "Гостиная"])
        self.assertEqual(voter.answer["utm_source"], "yandex")

    def test_submit_requires_phone_and_privacy(self):
        response = self.client.post(
            reverse("api_submit_quiz"),
            data=json.dumps({"phone": "", "privacy_agreed": False}),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(
            response.content,
            {
                "status": "error",
                "message": "Не удалось отправить заявку. Пожалуйста, попробуйте ещё раз.",
                "errors": {
                    "phone": "Укажите телефон.",
                    "privacy_agreed": "Нужно согласиться на обработку персональных данных.",
                },
            },
        )
