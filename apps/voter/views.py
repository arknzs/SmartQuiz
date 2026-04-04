import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from .models import BlockModel, Voter, Product
from .services import computed_sum  # Ваш сервис


def quiz_page(request):
    """Рендерит базовый шаблон с Vue.js"""
    return render(request, 'quiz.html')


@require_http_methods(["GET"])
def api_get_blocks(request):
    """Отдает N блоков и продуктов в формате JSON"""
    blocks = BlockModel.objects.prefetch_related('products', 'products__productimage_set').all()
    data = []

    for block in blocks:
        products_data = []
        for p in block.products.all():
            img = p.productimage_set.first()
            img_url = img.image.url if img and img.image else None
            products_data.append({
                'id': p.id,
                'name': p.name,
                'price': p.price,
                'image': img_url
            })
        data.append({
            'id': block.id,
            'products': products_data
        })

    return JsonResponse({'blocks': data})


@require_http_methods(["POST"])
def api_submit_quiz(request):
    """Принимает результаты, сохраняет их и считает сумму"""
    try:
        data = json.loads(request.body)

        # Сохраняем ответ пользователя
        voter = Voter.objects.create(answer=data)

        # Получаем ID всех выбранных продуктов для калькулятора
        selected_product_ids = data.get('selected_products', [])
        products = Product.objects.filter(id__in=selected_product_ids)

        # Считаем сумму с помощью вашего сервиса
        total_sum = computed_sum(products)

        return JsonResponse({
            'status': 'success',
            'message': 'Заявка успешно отправлена!',
            'voter_id': voter.id,
            'total_sum': total_sum
        })
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)