import logging
import asyncio
import os
import sys
from pathlib import Path

from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiohttp import web
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))

load_dotenv()
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Voter_hak.settings")

try:
    import django

    django.setup()
    from apps.voter.models import BotSettings
except Exception as exc:
    BotSettings = None
    logging.warning("Не удалось подключить Django-модель настроек бота: %s", exc)

API_TOKEN = os.getenv('BOT_TOKEN')
ADMIN_CHAT_ID = os.getenv('ADMIN_CHAT_ID', "").strip()

# Инициализация бота с дефолтным парсингом HTML (новшество aiogram 3)
bot = Bot(
    token=API_TOKEN,
    default=DefaultBotProperties(parse_mode=ParseMode.HTML)
)
dp = Dispatcher()


def get_admin_chat_id():
    if BotSettings is not None:
        try:
            chat_id = str(BotSettings.load().admin_chat_id).strip()
            if chat_id:
                return int(chat_id) if chat_id.lstrip("-").isdigit() else chat_id
        except Exception as exc:
            logging.error("Не удалось получить ADMIN_CHAT_ID из админки Django: %s", exc)

    if ADMIN_CHAT_ID:
        return int(ADMIN_CHAT_ID) if ADMIN_CHAT_ID.lstrip("-").isdigit() else ADMIN_CHAT_ID

    return ""


# --- ОБРАБОТЧИК КОМАНДЫ START В AIOGRAM 3 ---
@dp.message(Command('start'))
async def send_welcome(message: types.Message):
    await message.answer(f"Привет! Я бот для приема заявок с сайта. Наш чат id: {message.chat.id}")



# --- ОБРАБОТЧИК ВЕБХУКА ОТ DJANGO ---
async def handle_django_webhook(request: web.Request):
    try:
        # 1. Получаем JSON payload, который отправил Django
        data = await request.json()

        # 2. Красиво форматируем данные для поля text
        zones_str = ", ".join(data.get('zones', [])) if data.get('zones') else "Не указано"

        text = (
            f"🔔 <b>Новая заявка (Квиз)!</b>\n\n"
            f"👤 <b>Имя:</b> {data.get('name', 'Не указано')}\n"
            f"📞 <b>Телефон:</b> {data.get('phone')}\n"
            f"📧 <b>Email:</b> {data.get('email', 'Не указано')}\n"
            f"🏠 <b>Тип помещения:</b> {data.get('room_type', 'Не указано')}\n"
            f"📐 <b>Площадь:</b> {data.get('area', 'Не указано')}\n"
            f"🧩 <b>Зоны:</b> {zones_str}\n"
            f"🎨 <b>Стиль:</b> {data.get('style', 'Не указано')}\n"
            f"💰 <b>Бюджет:</b> {data.get('budget', 'Не указано')}\n"
            f"📝 <b>Комментарий:</b> {data.get('comment', 'Не указано')}\n"
            f"🔗 <b>Источник (URL):</b> {data.get('page_url', 'Не указано')}"
        )

        chat_id = get_admin_chat_id()
        if not chat_id:
            raise ValueError("ADMIN_CHAT_ID не настроен ни в Django admin, ни в .env")

        # 3. Отправляем сообщение администратору через бота
        await bot.send_message(
            chat_id=chat_id,
            text=text
        )

        # Возвращаем Django статус 200 OK
        return web.Response(text="Webhook received", status=200)

    except Exception as e:
        logging.error(f"Ошибка при обработке вебхука: {e}")
        return web.Response(text="Bad Request", status=400)


# --- ЗАПУСК БОТА И ВЕБ-СЕРВЕРА ---
async def on_startup(app):
    # В aiogram 3 обязательно нужно передавать объект bot в start_polling
    asyncio.create_task(dp.start_polling(bot))


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)

    # Настраиваем aiohttp приложение
    app = web.Application()
    # Регистрируем маршрут, на который Django будет слать POST-запрос
    app.router.add_post('/new-quiz-webhook', handle_django_webhook)

    app.on_startup.append(on_startup)

    # Запускаем веб-сервер на порту 8080
    web.run_app(app, host='0.0.0.0', port=8080)
