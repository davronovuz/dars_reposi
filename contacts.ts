import React, { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import * as Contacts from 'expo-contacts';

// 1-QISM: QOLIP (TypeScript)
// Dastur "Odam" deganda nimani tushunishi kerakligini o'rgatamiz
interface Odam {
  name: string;
  phoneNumbers?: { number?: string }[];
}

export default function OsonKontaktlar() {
  // 2-QISM: QUTI (State)
  // Boshida quti bo'sh (null). Odam tanlangach, uning ma'lumotlari shu qutiga tushadi.
  const [tanlanganOdam, setTanlanganOdam] = useState<Odam | null>(null);

  // 3-QISM: ASOSIY MANTIQ (Funksiya)
  const kontaktTanlash = async () => {
    // a) Tizimdan ruxsat so'raymiz
    const { status } = await Contacts.requestPermissionsAsync();
    
    // b) Agar ruxsat berilsa...
    if (status === 'granted') {
      // 🚨 Telefonning o'z kontaktlar kitobini ochamiz (Kutib turamiz)
      const odam = await Contacts.presentContactPickerAsync();

      // v) Agar foydalanuvchi odam tanlasa (orqaga qaytib ketmasa)
      if (odam) {
        setTanlanganOdam(odam as Odam); // Tanlangan odamni qutiga solamiz
      }
    } else {
      Alert.alert("Xato", "Kontaktlarga ruxsat bermadingiz");
    }
  };

  // 4-QISM: EKRAN (Ko'rinish) - ENDI TAILWIND BILAN!
  return (
    <View className="flex-1 justify-center items-center bg-white p-5">
      
      {/* Tugma bosilganda tepadagi 'kontaktTanlash' funksiyasi ishga tushadi */}
      <Button title="📞 Odam tanlash" onPress={kontaktTanlash} />

      {/* MANTIQ: Agar 'tanlanganOdam' qutisi bo'sh bo'lmasa, ma'lumotlarni chizamiz */}
      {tanlanganOdam && (
        <View className="mt-10 p-5 bg-[#f0f8ff] rounded-xl border border-[#b0d4ff] w-full">
          
          <Text className="text-lg text-gray-500">
            Siz tanlagan odam:
          </Text>
          
          <Text className="text-2xl font-bold text-black mt-3">
            👤 {tanlanganOdam.name}
          </Text>
          
          {/* Raqamni massivning eng boshidan ([0]) qidiramiz */}
          <Text className="text-xl text-blue-600 mt-3 font-bold">
            📞 {tanlanganOdam.phoneNumbers?.[0]?.number || "Raqami yo'q"}
          </Text>
          
        </View>
      )}

    </View>
  );
}
