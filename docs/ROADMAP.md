# Yo'l xaritasi va tashqi ishlar

Dasturda **bajarilgan** ishlar `README.md` dagi qamrov jadvalida. Quyida kod yozish bilan hal bo'lmaydigan yoki tashqi resurs talab qiladigan ishlar.

## A. Metodik ekspertiza (tavsiya 1, 10; kamchilik 6, 13)
- [ ] 2–3 boshlang'ich sinf ingliz tili o'qituvchisi + metodist har mavzuni ko'rib chiqadi: DTS maqsadlariga moslik, yosh darajasi, so'z tanlovi.
- [ ] O'zbek tili mutaxassisi imlo va tarjimani tekshiradi.
- [ ] Natija: har mavzuga `reviewed: true` va izoh (kelajakda `data.js` ga qo'shiladi).
Cheklist (har mavzu): so'zlar yoshga mosmi? tarjima aniqmi? madaniy misol to'g'rimi? gap sodda va grammatik to'g'rimi? rasm/emoji noaniq emasmi?

## B. Haqiqiy audio (tavsiya 18)
`audio/README.md` ga qarang: fayl nomi = so'zning `slug`i (kichik harf, bo'shliq → `-`), format mp3; keyin `audio/manifest.json` ga nomni qo'shing. Ilova avtomatik shu fayllarni ishlatadi, topilmasa brauzer ovozi.

## C. Fonema darajasidagi talaffuz (tavsiya 11–12, 14)
Hozir: brauzer ovoz aniqlashi + tovushga yaqin solishtirish. Keyingi bosqich: backend orqali Azure Pronunciation Assessment yoki shunga o'xshash xizmat. `coach.js` da `window.LINGO_PRON_ENDPOINT` uchun ulanish nuqtasi qoldirilgan (hozircha **ishlatilmaydi va sinalmagan**). Backend: audio qabul qilib baholash, audioni saqlamaslik, ota-ona roziligi. Bolalar ovozida sinov: talaffuz jurnali CSV (Ota-ona paneli) bilan.

## D. Illyustratsiya va animatsiya (tavsiya 19–21, 23)
Rassom bilan: maskot pozalari, sinf muhitlari, so'zlar uchun rasmlar. `em()` (core.js) va `mascot()` almashtirish nuqtalari.

## E. Bulutli hisob va mobil ilova (tavsiya 38–39)
- Hisob/sinxronlash: backend (Auth + baza), bolalar ma'lumoti qonunchiligiga mos; hozircha zaxira fayl bilan ko'chirish.
- Mobil: PWA tayyor; do'konlar uchun Capacitor/Flutter qobig'i. Android Chrome'da «Ilovani o'rnatish» ishlaydi.

## F. Real qurilmalarda sinov (tavsiya 26)
`docs/TESTING.md` cheklistiga qarang.

## G. Pilot, grant, biznes, taqdimot (tavsiya 47–50)
`PILOT_PLAN.md`, `RESEARCH_MAPPING.md`, `BUSINESS_MODEL.md`, `PITCH_OUTLINE.md`.

## H. Huquqiy
Maxfiylik siyosati prototip darajasida (`#/privacy`). Rasmiy ishga tushirishdan oldin yurist ko'rigi.
