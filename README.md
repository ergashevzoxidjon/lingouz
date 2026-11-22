# LingoUz Kids (v3)

1–4-sinf uchun ingliz tili platformasi. **Node serveri** (tashqi kutubxonasiz) + o'quvchi ilovasi (PWA) + **admin paneli**.

```powershell
node server.js            # http://localhost:5173  (o'quvchilar)   ·   http://localhost:5173/admin  (administrator)
node --test tests/        # 36 ta avtomatik test (mantiq, kontent, server API)
```

**Birinchi ishga tushirishda** konsolda admin paroli bir marta chiqadi (`Admin login: admin`). O'zingiz belgilash uchun: `$env:ADMIN_PASSWORD="kuchli-parol"; node server.js`. Parolni admin sahifasida o'zgartirish mumkin. Ma'lumotlar `server/db.json` da (git'ga qo'shmang; zaxira nusxa oling).

## Qanday ishlaydi
1. **Admin** `/admin` ga kiradi → «➕ Qo'shish» bilan o'quvchi yaratadi: ism, **sinf (1–4) va harf**, **login, parol** (🎲 tugmasi tasodifiy parol beradi), kunlik vaqt chegarasi. Kirish ma'lumotlari ekranda bir marta ko'rsatiladi (nusxalash/chop etish).
2. **O'quvchi** asosiy sahifada login-parol bilan kiradi. Sinfini admin belgilaydi (o'quvchi o'zgartira olmaydi); faqat o'z sinfi mavzulari ochiladi.
3. O'quvchi o'ynaganda **har bir savol natijasi** (savol, bergan javobi, to'g'ri javob, to'g'ri/xato), o'yin ballari, yakuniy test, talaffuz va ertak/topishmoq javoblari serverga yoziladi; yulduz, daraja, tugallangan mavzular har 2–3 soniyada sinxronlanadi (oflayn bo'lsa navbatda turadi).
4. **Admin** ro'yxatdan o'quvchini tanlaydi va ko'radi: hozirgi **bosqich** (6 mavzulik yo'l, qaysi biri tugagan/joriy), mavzu va o'yin bo'yicha aniqlik, eng ko'p xato qilingan so'zlar, **javoblar jadvali** (filtr: to'g'ri/xato, o'yin, mavzu), o'yinlar tarixi, talaffuz natijalari, CSV yuklab olish. Parolni tiklash, sinfni o'zgartirish, vaqt chegarasi, bloklash va o'chirish mumkin. Sinflar bo'yicha filtr va qidiruv bor.

## Kontent
Ranglar (50, rang namunasi bilan), Sonlar (50, raqam belgisi bilan), Hayvonlar (50), Meva va sabzavotlar (50), O'yinchoqlar (50) va Oila a'zolari (51: ota-ona, aka-uka-opa-singil, buvi-bobo, amaki/tog'a, xola/amma, qaynona-qaynota, kelin-kuyov, o'gay ona/ota, egizaklar va h.k.). Qolgan mavzularda 12 tadan so'z. 20 ertak, 6 qo'shiq, 6 she'r, 12 topishmoq, 12 o'yin.

## Tuzilma
`server.js` — API + statik · `admin.html/js/css` — admin · `auth.js` — kirish, sinxron, hodisalar · `core.js` — holat, ovoz, maskot, router · `pages.js` · `games.js` · `coach.js` · `progress.js` · `logic.js` (sof mantiq) · `data*.js` — kontent · `ui.css` — dizayn (gradient "Candy Neon") · `sw.js` — oflayn · `docs/` — brend, pilot, biznes, yo'l xaritasi.

## Hostingda (cPanel / Hostmaster) — `https://mylogo.uz/lingouz/`
- Kod GitHub (`ergashevzoxidjon/lingouz`) → cPanel **Git™ Version Control** (`~/repositories/lingouz`) → `.cpanel.yml` fayllarni `~/lingouz` ga nusxalaydi.
- cPanel → **Setup Node.js App**: Node 20, Production, Application root `lingouz`, Application URL `mylogo.uz` + `lingouz`, startup `server.js`. O'quvchilar: `https://mylogo.uz/lingouz/`, admin: `https://mylogo.uz/lingouz/admin`.
- Ilova prefiksdan mustaqil: manzillar nisbiy (`base.js` + `<base>`), server `/lingouz` prefiksini o'zi tanib oladi (`BASE_PATH` bilan o'zgartiriladi).
- **Yangilash:** push → cPanel → Git → **Update from Remote** → **Deploy HEAD Commit** (`tmp/restart.txt` ilovani qayta ishga tushiradi).
- Baza `~/lingouz/server/db.json` da qoladi (repoda yo'q, deploy uni o'chirmaydi). Vaqti-vaqti bilan nusxa oling.
- Birinchi admin paroli `~/lingouz/tmp/passenger.log` ga bir marta yozilgan; kirgach o'zgartiring.

## Mobil: iPhone va Android
Veb + PWA (bosh ekranga o'rnatish) hozir ishlaydi; native Android/iOS ilova loyihalari Capacitor bilan tayyor (`android/`, `ios/`). Batafsil, yig'ish va do'konga chiqarish: [docs/MOBILE.md](docs/MOBILE.md). Qisqacha: `npm install` → `npm run android` (Android Studio) / `npm run ios` (Mac + Xcode).

## Xavfsizlik va cheklovlar (halol hisobot)
- Parollar `scrypt` bilan xeshlanadi; token HMAC bilan imzolanadi (o'quvchi 30 kun, admin 12 soat); login urinishlari cheklangan (5 ta xato → 1 daqiqa); maxfiy fayllar (`server/`, `server.js`, `tests/`, `docs/`) HTTP orqali berilmaydi (testlangan); CSP sarlavhalari va CSV-injeksiyadan himoya bor.
- **Internetda ishlatishdan oldin HTTPS (reverse proxy: nginx/Caddy) shart** — aks holda parollar ochiq uzatiladi. Server o'zi HTTPS bermaydi.
- Ma'lumotlar bazasi — bitta JSON fayl (yuzlab o'quvchi uchun yetarli; minglab o'quvchi va bir nechta server uchun haqiqiy bazaga o'ting).
- **Yulduz va natijalar mijoz tomonidan yuboriladi** — texnik bilimli o'quvchi o'z yulduzini soxtalashtira olishi mumkin. Javoblar jurnali ham shu tarzda. Maktab ichidagi kuzatuv uchun yetarli; rasmiy baholash uchun serverda tekshiruv kerak.
- Admin paroli unutilsa: `$env:ADMIN_PASSWORD="yangi-parol"; node server.js` — server shu parolni o'rnatadi (o'quvchilar ma'lumoti saqlanadi). Muhit o'zgaruvchisi qo'yilgan holda har ishga tushirishda parol qayta o'rnatiladi.
- Real qurilmalarda sinov, haqiqiy audio, metodist ko'rigi, pilot — `docs/ROADMAP.md` (avvalgi hisobot o'zgarishsiz).
