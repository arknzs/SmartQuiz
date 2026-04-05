import asyncio
import html
import logging
import os
import sys
from pathlib import Path

from aiogram import Bot, Dispatcher, types
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.filters import Command
from aiohttp import web
from asgiref.sync import sync_to_async
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))

load_dotenv()
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Voter_hak.settings")

try:
    import django

    django.setup()
    from apps.voter.models import BotSettings, TelegramRecipient
except Exception as exc:
    BotSettings = None
    TelegramRecipient = None
    logging.warning("Could not load Django bot settings: %s", exc)

API_TOKEN = os.getenv("BOT_TOKEN", "").strip()
ADMIN_CHAT_ID = os.getenv("ADMIN_CHAT_ID", "").strip()

if not API_TOKEN:
    raise RuntimeError("BOT_TOKEN is not configured")

bot = Bot(
    token=API_TOKEN,
    default=DefaultBotProperties(parse_mode=ParseMode.HTML),
)
dp = Dispatcher()


def get_admin_chat_id_sync():
    if BotSettings is not None:
        try:
            settings_obj = BotSettings.load()
            chat_id = settings_obj.get_chat_id()
            if chat_id:
                return int(chat_id) if str(chat_id).lstrip("-").isdigit() else str(chat_id)
        except Exception as exc:
            logging.error("Could not load ADMIN_CHAT_ID from Django admin: %s", exc)

    if ADMIN_CHAT_ID:
        return int(ADMIN_CHAT_ID) if ADMIN_CHAT_ID.lstrip("-").isdigit() else ADMIN_CHAT_ID

    return ""


async def get_admin_chat_id():
    return await sync_to_async(get_admin_chat_id_sync, thread_sensitive=True)()


def save_recipient_sync(chat_id, username="", first_name="", last_name=""):
    if TelegramRecipient is None:
        return

    TelegramRecipient.objects.update_or_create(
        chat_id=chat_id,
        defaults={
            "username": username or "",
            "first_name": first_name or "",
            "last_name": last_name or "",
            "is_active": True,
        },
    )


async def save_recipient(message: types.Message):
    user = message.from_user
    await sync_to_async(save_recipient_sync, thread_sensitive=True)(
        message.chat.id,
        user.username if user else "",
        user.first_name if user else "",
        user.last_name if user else "",
    )


def escape_value(value, fallback="Не указано"):
    text = str(value).strip() if value is not None else ""
    return html.escape(text) if text else fallback


def build_message(data):
    zones = data.get("zones") or []
    zones_str = ", ".join(escape_value(zone, "") for zone in zones if str(zone).strip()) or "Не указано"
    estimated_price = data.get("estimated_price")
    estimated_label = "Не рассчитано"
    if estimated_price not in (None, ""):
        estimated_label = f"{estimated_price} руб."

    lines = [
        "🔔 <b>Новая заявка из квиза</b>",
        "",
        f"👤 <b>Имя:</b> {escape_value(data.get('name'))}",
        f"📞 <b>Телефон:</b> {escape_value(data.get('phone'))}",
        f"📧 <b>Email:</b> {escape_value(data.get('email'))}",
        f"🏠 <b>Тип помещения:</b> {escape_value(data.get('room_type'))}",
        f"📐 <b>Площадь:</b> {escape_value(data.get('area'))}",
        f"🧩 <b>Зоны:</b> {zones_str}",
        f"🎨 <b>Стиль:</b> {escape_value(data.get('style'))}",
        f"💰 <b>Бюджет:</b> {escape_value(data.get('budget'))}",
        f"🧮 <b>Примерная сумма:</b> {html.escape(estimated_label)}",
        f"📝 <b>Комментарий:</b> {escape_value(data.get('comment'))}",
        f"🔗 <b>Источник:</b> {escape_value(data.get('page_url'))}",
    ]
    return "\n".join(lines)


async def forward_quiz_to_admin(data):
    chat_id = await get_admin_chat_id()
    if not chat_id:
        logging.error("Recipient is not configured in Django admin or .env")
        return

    try:
        await bot.send_message(
            chat_id=chat_id,
            text=build_message(data),
            request_timeout=20,
        )
    except Exception as exc:
        logging.error("Could not send message to Telegram recipient %s: %s", chat_id, exc)


@dp.message(Command("start"))
async def send_welcome(message: types.Message):
    await save_recipient(message)
    await message.answer(
        "Привет! Я бот для заявок с сайта.\n"
        f"Ваш chat id: <code>{message.chat.id}</code>\n"
        "Теперь этого пользователя можно выбрать в админке Django."
    )


async def handle_django_webhook(request: web.Request):
    try:
        data = await request.json()
        task = asyncio.create_task(forward_quiz_to_admin(data))
        request.app["delivery_tasks"].add(task)
        task.add_done_callback(request.app["delivery_tasks"].discard)
        return web.Response(text="Webhook accepted", status=200)
    except Exception as exc:
        logging.error("Webhook processing error: %s", exc)
        return web.Response(text="Bad Request", status=400)


async def run_polling():
    try:
        await dp.start_polling(bot, handle_signals=False)
    except asyncio.CancelledError:
        raise
    except Exception as exc:
        logging.error("Telegram polling stopped: %s", exc)


async def on_startup(app):
    app["delivery_tasks"] = set()
    app["polling_task"] = asyncio.create_task(run_polling())


async def on_cleanup(app):
    polling_task = app.get("polling_task")
    if polling_task:
        polling_task.cancel()
        try:
            await polling_task
        except asyncio.CancelledError:
            pass

    delivery_tasks = list(app.get("delivery_tasks", set()))
    if delivery_tasks:
        await asyncio.gather(*delivery_tasks, return_exceptions=True)

    await bot.session.close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    app = web.Application()
    app.router.add_post("/new-quiz-webhook", handle_django_webhook)
    app.on_startup.append(on_startup)
    app.on_cleanup.append(on_cleanup)

    web.run_app(app, host="0.0.0.0", port=8080)
