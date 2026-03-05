import { useState, useRef } from 'react';
import { Text, View, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library'; 

// Xatolik chiqmasligi uchun 'export default' bo'lishi shart!
export default function SmartScannerApp() {
  // ==========================================
  // 1. HOLATLAR (States)
  // ==========================================
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions(); 
  
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  
  // Kamera boshqaruvi
  const [facing, setFacing] = useState<'back' | 'front'>('back'); 
  const [flash, setFlash] = useState<'off' | 'on'>('off'); 
  const [isSending, setIsSending] = useState(false); 
  
  const cameraRef = useRef<CameraView>(null);

  // ==========================================
  // 2. RUXSATLARNI TEKSHIRISH
  // ==========================================
  if (!cameraPermission) return <View className="flex-1 bg-white" />;
  if (!cameraPermission.granted) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100 px-4">
        <Text className="text-gray-800 text-center text-lg mb-4">Kameraga ruxsat bering</Text>
        <TouchableOpacity className="bg-blue-600 px-6 py-3 rounded-xl" onPress={requestCameraPermission}>
          <Text className="text-white font-bold text-lg">Ruxsat berish</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ==========================================
  // 3. FUNKSIYALAR
  // ==========================================
  
  // A. Rasmga olish
  const takePic = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (photo) setPhotoUri(photo.uri);
    }
  };

  // B. Galereyaga saqlash
  const saveToGallery = async () => {
    if (mediaPermission?.status !== 'granted') {
      const permission = await requestMediaPermission();
      if (!permission.granted) {
        Alert.alert("Xatolik", "Galereyaga saqlash uchun ruxsat kerak!");
        return;
      }
    }
    try {
      if (photoUri) {
        await MediaLibrary.saveToLibraryAsync(photoUri);
        Alert.alert("Saqlandi!", "Rasm galereyangizga tushdi 📸");
      }
    } catch (error) {
      Alert.alert("Xatolik", "Rasmni saqlashda muammo yuz berdi.");
    }
  };

  // C. Telegramga yuborish
  const sendToTelegram = async () => {
    if (!photoUri) return;
    
    // O'zingizning bot ma'lumotlaringizni kiriting
    const BOT_TOKEN = "BOT_TOKEN_SHU_YERGA_YOZILADI"; 
    const CHAT_ID = "CHAT_ID_SHU_YERGA_YOZILADI"; 
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;

    setIsSending(true);

    const formData = new FormData();
    formData.append("chat_id", CHAT_ID);
    formData.append("photo", {
      uri: photoUri,
      name: "skaner_qilingan_rasm.jpg",
      type: "image/jpeg",
    } as any);

    try {
      const response = await fetch(telegramUrl, { method: 'POST', body: formData });
      const result = await response.json();
      
      if (result.ok) {
        Alert.alert("Qoyil! 🚀", "Rasm Telegramga muvaffaqiyatli yuborildi!");
        setPhotoUri(null); // Oynani tozalash
      } else {
        Alert.alert("Telegram xatosi", result.description);
      }
    } catch (error) {
      Alert.alert("Internet xatosi", "Tarmoqqa ulanishda muammo yuz berdi.");
    } finally {
      setIsSending(false);
    }
  };

  // ==========================================
  // 4. EKRANLAR (UI)
  // ==========================================

  // --- 1-EKRAN: Olingan rasmni ko'rsatish ---
  if (photoUri) {
    return (
      <View className="flex-1 bg-black">
        <Image source={{ uri: photoUri }} className="flex-1" resizeMode="contain" />
        
        {/* Yuklanish jarayoni */}
        {isSending && (
          <View className="absolute inset-0 items-center justify-center bg-black/60 z-20">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-white mt-4 font-bold text-lg">Telegramga yuborilmoqda...</Text>
          </View>
        )}

        <View className="absolute bottom-10 w-full px-4 gap-y-4 z-10">
          <TouchableOpacity 
            className="w-full bg-blue-500 py-4 rounded-xl items-center"
            onPress={sendToTelegram} 
            disabled={isSending}
          >
            <Text className="text-white font-bold text-lg">✈️ Telegramga yuborish</Text>
          </TouchableOpacity>

          <View className="flex-row justify-between gap-x-4">
            <TouchableOpacity 
              className="bg-gray-700 px-6 py-3 rounded-xl flex-1 items-center"
              onPress={() => setPhotoUri(null)} 
              disabled={isSending}
            >
              <Text className="text-white font-bold">X Qayta olish</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-green-600 px-6 py-3 rounded-xl flex-1 items-center"
              onPress={saveToGallery} 
              disabled={isSending}
            >
              <Text className="text-white font-bold">⬇️ Saqlash</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // --- 2-EKRAN: Kamera oynasi ---
  if (showCamera) {
    return (
      <View className="flex-1 bg-black">
        <CameraView 
          style={StyleSheet.absoluteFillObject} 
          facing={facing} 
          flash={flash}
          ref={cameraRef} 
        />
        
        {/* Tepadagi pultlar */}
        <View className="absolute top-14 w-full flex-row justify-between px-6 z-10">
          <TouchableOpacity className="bg-black/60 px-4 py-2 rounded-full" onPress={() => setShowCamera(false)}>
            <Text className="text-white font-bold">← Yopish</Text>
          </TouchableOpacity>
          
          <View className="flex-row gap-x-3">
            <TouchableOpacity 
              className={`px-4 py-2 rounded-full ${flash === 'on' ? 'bg-yellow-500' : 'bg-black/60'}`} 
              onPress={() => setFlash(f => f === 'off' ? 'on' : 'off')}
            >
              <Text className="text-white font-bold">💡 Chiroq</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="bg-black/60 px-4 py-2 rounded-full" onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}>
              <Text className="text-white font-bold">🔄</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Fokus Ramkasi */}
        <View className="absolute inset-0 items-center justify-center pointer-events-none">
          <View className="w-72 h-96 border-2 border-green-500 rounded-xl items-center justify-center bg-black/10">
             <Text className="text-green-400 font-bold bg-black/70 px-4 py-2 rounded-lg">
               Hujjatni ramkaga joylang
             </Text>
          </View>
        </View>

        {/* Rasmga olish tugmasi */}
        <View className="absolute bottom-12 w-full items-center z-10">
          <TouchableOpacity 
            className="w-20 h-20 bg-white rounded-full border-4 border-gray-400 shadow-2xl"
            onPress={takePic}
          />
        </View>
      </View>
    );
  }

  // --- 3-EKRAN: Asosiy kirish oynasi ---
  return (
    <View className="flex-1 justify-center items-center bg-gray-100 p-6">
      <View className="w-full bg-white p-8 rounded-3xl shadow-lg items-center border-t-4 border-blue-500">
        <Text className="text-3xl font-extrabold text-gray-800 mb-2">Smart Skaner</Text>
        <Text className="text-gray-500 text-center mb-8">
          Hujjatni rasmga oling va to'g'ridan-to'g'ri Telegramga yuboring.
        </Text>
        
        <TouchableOpacity 
          className="w-full bg-blue-600 py-4 rounded-xl items-center shadow-md active:bg-blue-800"
          onPress={() => setShowCamera(true)}
        >
          <Text className="text-white font-bold text-xl">Skanerni yoqish</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}