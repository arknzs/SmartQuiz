import asyncio
import os
from aiogram import types

from aiogram import Bot, Dispatcher
from dotenv import load_dotenv

load_dotenv()

bot = Bot(token=os.getenv('BOT_TOKEN'))
dp = Dispatcher()

@dp.message(commands=['start'])
async def send_welcome(message: types.Message):
    await bot.send_message(
        chat_id=message.chat.id,
        text=...
    )


async def main():
    await dp.start_polling(bot)



if __name__ == "__main__":
    asyncio.run(main())
