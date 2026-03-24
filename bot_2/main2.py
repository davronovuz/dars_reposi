import asyncio
import os
from aiogram import Bot, Dispatcher, F, types
from aiogram.types import Message, FSInputFile, InputMediaPhoto, InputMediaVideo
from aiogram.filters import Command

# Bot tokeningizni kiriting
TOKEN = "8698335797:AAHWfiIbNDhYOdFduEq8Tdy4DjK36xpF_eY"

bot = Bot(token=TOKEN)
dp = Dispatcher()

# Yuklab olingan fayllar uchun papka yaratish
if not os.path.exists("downloads"):
    os.makedirs("downloads/photos")
    os.makedirs("downloads/docs")
    os.makedirs("downloads/audio")
    os.makedirs("downloads/videos")


# 1. START komandasi va matnli filtrlar (startswith, endswith)
@dp.message(Command("start"))
async def start_handler(message: Message):
    await message.answer(
        f"Assalomu alaykum, {message.from_user.full_name}!\n"
        "Media botga xush kelibsiz. Quyidagilarni sinab ko'ring:\n"
        "1. Rasm, video yoki audio yuboring (saqlab beraman)\n"
        "2. /album buyrug'ini yuboring\n"
        "3. 'Bot' so'zi bilan boshlanadigan xabar yuboring"
    )


# 2. Magic Filters: startswith, endswith, contains
@dp.message(F.text.startswith("ahmoq"))
async def starts_with_handler(message: Message):
    await message.reply("O'zing ahmoq")


@dp.message(F.text.endswith(".uz"))
async def ends_with_handler(message: Message):
    await message.answer("Siz O'zbekiston domenidagi sayt haqida yozdingiz shekilli?")


@dp.message(F.text.contains("python"))
async def contains_handler(message: Message):
    await message.answer("🐍 Python haqida gap ketyaptimi? Zo'r!")


# 3. Rasmlarni qabul qilish va yuklab olish
@dp.message(F.photo)
async def handle_photo(message: Message):
    photo = message.photo[-1]  # Eng sifatlisi
    file_info = await bot.get_file(photo.file_id)
    destination = f"downloads/photos/{photo.file_id}.jpg"

    await bot.download_file(file_info.file_path, destination)
    await message.reply(f"Rasm saqlandi! \nFile ID: `{photo.file_id}`", parse_mode="Markdown")


# 4. Hujjatlarni (Document) yuklab olish
@dp.message(F.document)
async def handle_document(message: Message):
    doc = message.document
    destination = f"downloads/docs/{doc.file_name}"

    file_info = await bot.get_file(doc.file_id)
    await bot.download_file(file_info.file_path, destination)
    await message.answer(f"Hujjat '{doc.file_name}' nomi bilan saqlandi! ✅")


# 5. Audio va Voice bilan ishlash
@dp.message(F.audio | F.voice)
async def handle_audio(message: Message):
    if message.audio:
        file_id = message.audio.file_id
        ext = "mp3"
        msg = "Musiqa"
    else:
        file_id = message.voice.file_id
        ext = "ogg"
        msg = "Ovozli xabar"

    file_info = await bot.get_file(file_id)
    await bot.download_file(file_info.file_path, f"downloads/audio/{file_id}.{ext}")
    await message.answer(f"{msg} qabul qilindi!")


# 6. Sticker va GIF (Animation)
@dp.message(F.sticker)
async def handle_sticker(message: Message):
    await message.answer(f"Siz yuborgan stiker ID: `{message.sticker.file_id}`")
    # Stikerni o'ziga qaytarib yuborish
    await message.answer_sticker(sticker=message.sticker.file_id)


@dp.message(F.animation)
async def handle_gif(message: Message):
    await message.answer("Bu juda qiziqarli GIF ekan! 😂")


# 7. Media Group (Album) yuborish
@dp.message(Command("album"))
async def send_album(message: Message):
    media = [
        InputMediaPhoto(media="https://picsum.photos/400/300", caption="Bizning media to'plam"),
        InputMediaPhoto(media="https://picsum.photos/400/301"),
        InputMediaVideo(media="http://techslides.com/demos/sample-videos/small.mp4")
    ]
    await message.answer_media_group(media=media)


async def main():
    print("Bot muvaffaqiyatli ishga tushdi...")
    await dp.start_polling(bot)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Bot to'xtatildi.")