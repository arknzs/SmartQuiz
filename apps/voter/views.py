import json

from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_http_methods

from .models import BlockModel, Product, Voter
from .services import computed_sum


def quiz_page(request):
    quiz_info = Voter.objects.exclude(name="").order_by("-id").values("name", "description").first()
    return render(request, "quiz.html", {
        "quiz_name": (quiz_info or {}).get("name", "Квиз по подбору интерьера"),
        "quiz_description": (quiz_info or {}).get(
            "description",
            "Ответьте на несколько вопросов, и мы подготовим подборку интерьерных решений под ваш запрос.",
        ),
    })


@require_http_methods(["GET"])
def api_get_blocks(request):
    blocks = BlockModel.objects.prefetch_related("products", "products__productimage_set").all()
    data = []

    for block in blocks:
        products_data = []
        for product in block.products.all():
            image = product.productimage_set.first()
            image_url = image.image.url if image and image.image else None
            products_data.append({
                "id": product.id,
                "name": product.name,
                "price": product.price,
                "image": image_url,
            })
        data.append({
            "id": block.id,
            "products": products_data,
        })

    return JsonResponse({"blocks": data})


@require_http_methods(["POST"])
def api_submit_quiz(request):
    try:
        data = json.loads(request.body)
        selected_products_header = request.headers.get("X-Selected-Products", "[]")

        try:
            selected_product_ids = json.loads(selected_products_header)
        except json.JSONDecodeError:
            selected_product_ids = data.get("selected_products", [])

        products = list(Product.objects.filter(id__in=selected_product_ids))
        room_type = next((product.room_type for product in products if product.room_type), "")
        zones = list(dict.fromkeys(product.zone for product in products if product.zone))

        data["room_type"] = room_type
        data["zones"] = zones

        voter = Voter.objects.create(answer=data)
        total_sum = computed_sum(products)

        return JsonResponse({
            "status": "success",
            "message": "Заявка успешно отправлена!",
            "voter_id": voter.id,
            "total_sum": total_sum,
        })
    except Exception as error:
        return JsonResponse({"status": "error", "message": str(error)}, status=400)
