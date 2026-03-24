import asyncio
from aiogram import F
from aiogram import Bot, Dispatcher
from aiogram.filters import Command
from aiogram.types import Message
from keyboards import start_menu
import requests
from aiogram.fsm.state import State,StatesGroup
from aiogram.fsm.context import FSMContext

TOKEN = "8698335797:AAHWfiIbNDhYOdFduEq8Tdy4DjK36xpF_eY"

dp = Dispatcher()

# Sherik kerak state
class SherikState(StatesGroup):
    full_name=State()
    techno=State()
    contact=State()
    region=State()
    price=State()
    job=State()
    murojat=State()
    maqsad=State()






# start tugmasi uchun handler
@dp.message(Command("start"))
async def start_message(message:Message):
    txt=f"""
        Assalom alaykum {message.from_user.full_name}
        UstozShogird kanalining rasmiy botiga xush kelibsiz!
        
        /help yordam buyrugi orqali nimalarga qodir ekanligimni bilib oling!
    """
    await message.answer(txt,reply_markup=start_menu)

    admin_text=f"Yangi foydalanuvchi keldi\n\n"
    admin_text+=f"username: @{message.from_user.username}"
    await message.bot.send_message(1879114908,admin_text)



# sherik kerak tugmasi uchun handler
@dp.message(F.text=="Sherik kerak")
async def sherik_kerak(message:Message,state:FSMContext):
    text="""
Sherik topish uchun ariza berish
Hozir sizga birnecha savollar beriladi. 
Har biriga javob bering. 
Oxirida agar hammasi to`g`ri bo`lsa, HA tugmasini bosing va arizangiz Adminga yuboriladi.
    
    """
    await message.answer(text)
    await message.answer("Ism, familiyangizni kiriting?")
    await state.set_state(SherikState.full_name)

# foydalanuvchi ism familya kiritish holatida
@dp.message(SherikState.full_name)
async def fullname_state(message:Message,state:FSMContext):
    await state.update_data(full_name=message.text)
    await message.answer("""
📚 Texnologiya:
Talab qilinadigan texnologiyalarni kiriting?
Texnologiya nomlarini vergul bilan ajrating. Masalan, 
Java, C++, C#
    """)

    await state.set_state(SherikState.techno)


# foydalanuvchi texno kiritish holatida
@dp.message(SherikState.techno)
async def texno_state_func(message: Message, state: FSMContext):
    await state.update_data(texno=message.text)
    await message.answer("""
📞 Aloqa: 
Bog`lanish uchun raqamingizni kiriting?
Masalan, +998 90 123 45 67
    """)

    await state.set_state(SherikState.contact)


# foydalanuvchi aloq kiritish holatida
@dp.message(SherikState.contact)
async def aloqa_state_func(message: Message, state: FSMContext):
    await state.update_data(aloqa=message.text)
    await message.answer("""
🌐 Hudud: 
Qaysi hududdansiz?
Viloyat nomi, Toshkent shahar yoki Respublikani kiriting.
    """)

    await state.set_state(SherikState.region)


# foydalanuvchi hudud kiritish holatida
@dp.message(SherikState.region)
async def hudud_state_func(message: Message, state: FSMContext):
    await state.update_data(hudud=message.text)
    await message.answer("""
🌐 Hudud: 
Qaysi hududdansiz?
Viloyat nomi, Toshkent shahar yoki Respublikani kiriting.
    """)

    await state.set_state(SherikState.price)


    # ma'lumotlarni yig'amiz
    data=await state.get_data()
    full_name=data["full_name"]
    texno=data["texno"]
    contact=data["contact"]
    region=data["region"]

    await message.answer(texno)
    await message.bot.send_message(1879114908,texno)




# Run the bot
async def main() -> None:
    bot = Bot(token=TOKEN)
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
