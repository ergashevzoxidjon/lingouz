# Mobil ilova: iPhone va Android

Bitta kod (veb) uch usulda ishlaydi — hammasida bir xil ko'rinish va bir xil hisob (login/parol, admin kuzatuvi):

| Usul | Qayerda ishlaydi | Nima kerak | Holat |
|---|---|---|---|
| **1. Veb + PWA** (bosh ekranga o'rnatish) | iPhone (Safari), Android (Chrome), planshet | Hech narsa — havola yetarli | ✅ tayyor va sinalgan |
| **2. Android ilova (APK/AAB)** | Android telefon/planshet, Google Play | Android Studio (Windows/Mac/Linux) | 🟡 loyiha tayyor; yig'ish sizning kompyuteringizda |
| **3. iOS ilova (IPA)** | iPhone/iPad, App Store | **Mac + Xcode + Apple Developer hisobi** | 🟡 loyiha tayyor; yig'ish faqat Mac'da |

## 1. Hoziroq: bosh ekranga o'rnatish (do'konsiz)
Havola: `https://mylogo.uz/lingouz/`
- **iPhone/iPad (Safari):** pastdagi **Ulashish ⎙** → **Bosh ekranga qo'shish** → Qo'shish. (Chrome/Yandex emas, aynan Safari.)
- **Android (Chrome):** bosh sahifadagi **«O'rnatish»** tugmasi yoki ⋮ menyu → **Ilovani o'rnatish**.
Ilova to'liq ekranda, o'z ikonkasi bilan ochiladi, ovoz va rasmlar internetsiz ham ishlaydi (birinchi ochilishdan keyin).

## 2. Android ilova (Capacitor)
Bu kompyuterda Android Studio yo'q edi, shuning uchun APK yig'ilmadi. Loyiha (`android/`) tayyor.
```powershell
npm install                 # bir marta
npm run android             # veb fayllarni yig'adi (www/), Android Studio'ni ochadi
```
Android Studio'da: ▶ Run (telefon yoki emulyator) — sinash uchun. Do'konga: **Build → Generate Signed Bundle (AAB)** → imzo kaliti (keystore) yarating va **zaxirada saqlang** (yo'qolsa ilovani yangilab bo'lmaydi). Google Play: bir martalik $25, "Designed for Families" siyosati.
Tez sinov uchun komanda qatorida: `npm run android:apk` (Android SDK va JDK 17+ o'rnatilgan bo'lsa) → `android/app/build/outputs/apk/debug/app-debug.apk`.

## 3. iOS ilova (Capacitor)
Faqat **Mac**'da (Xcode kerak). Loyiha (`ios/`) tayyor.
```bash
npm install
npm run ios                 # www/ ni yig'adi, Xcode'ni ochadi
```
Xcode'da Signing & Capabilities → Team (Apple Developer hisobi, yiliga $99) → iPhone yoki simulyator → ▶. Do'konga: Product → Archive → App Store Connect.
**Eslatma:** `@capacitor-community/speech-recognition` plagini hozircha Swift Package Manager bilan mos emas (sync paytida ogohlantirish chiqadi). Mikrofon bilan talaffuz tekshiruvi kerak bo'lsa, iOS loyihasini CocoaPods bilan qayta qo'shing: `npx cap add ios --packagemanager CocoaPods` (Mac'da, CocoaPods o'rnatilgan). Aks holda iOS ilovada «mikrofonsiz rejim» (o'zini baholash) ishlaydi.

## Native ilova qanday ishlaydi
- Veb fayllar (`www/`) ilovaning ichiga joylanadi: audio (11 MB), emoji va dasturlar internetsiz ochiladi.
- Login, progress va javoblar **serverga** (`https://mylogo.uz/lingouz/api/…`) yuboriladi — xuddi veb versiyadagidek, admin hammasini ko'radi. Server faqat ilovaning o'z manbalariga (`capacitor://localhost`, `https://localhost`) CORS ruxsatini beradi.
- Internet yo'q bo'lsa: o'yinlar ishlaydi, natijalar navbatga tushib, internet kelganda yuboriladi.
- **Yangilash:** kontent yoki kodni o'zgartirsangiz — `npm run cap:sync` va do'konga yangi versiya (build raqami oshiriladi: Android `versionCode`, iOS `CURRENT_PROJECT_VERSION`). Veb versiya esa serverga deploy qilinishi bilanoq yangilanadi.

## Ikonka, nom, identifikator
- Manba rasmlar: `resources/` (1024 ikonka, 2732 splash). O'zgartirsangiz: `npm run assets` (Android/iOS ikonkalarini qayta yaratadi).
- Ilova nomi va identifikator: `capacitor.config.json` (`appId: uz.mylogo.lingouz`). **Do'konga chiqarishdan oldin o'zingizning haqiqiy identifikatoringizni qo'ying** (keyin o'zgartirib bo'lmaydi).

## Do'kon talablari (bolalar ilovasi)
- **Maxfiylik siyosati havolasi** (hozir ilova ichida `#/privacy`; do'kon uchun ochiq veb-manzil kerak) va yuridik ekspertiza.
- **Bolalar toifasi:** Apple «Kids Category», Google «Designed for Families» — reklamasiz va kuzatuvchisiz bo'lishi kerak (loyihada reklama va tracker yo'q), mikrofon va ma'lumot haqida aniq tushuntirish, ota-ona roziligi (ilovada bor).
- **Akkaunt:** o'quvchi hisobini admin yaratadi (o'zi ro'yxatdan o'tmaydi) — Apple «hisobni o'chirish» talabi uchun admin panelidagi «o'chirish» ishlatiladi; do'kon ko'rsatmasiga mos qilib maxfiylik sahifasida yozib qo'ying.
- Skrinshotlar: iPhone 6,7" va 6,5", iPad (Apple); telefon va planshet (Google).

## Sinalgan va sinalmagan
- ✅ 320–414 px telefon, 768/1024 planshet, gorizontal holat, admin panel: gorizontal siljish yo'q (avtomatik tekshiruv), bosiladigan joylar ≥44 px.
- ✅ `base.js`, CORS, manifest, ikonkalar, `www/` yig'ish — avtomatik testlar (`npm test`).
- ⏳ **Real iPhone/Android qurilmada sinalmagan:** notch/Dynamic Island, klaviatura, ovoz chiqarish (iOS birinchi bosishdan keyin ochadi), PWA o'rnatish, native ilova va native nutq aniqlash. Birinchi sinovdan keyin muammolar chiqishi mumkin — natijani yozing, tuzataman.
