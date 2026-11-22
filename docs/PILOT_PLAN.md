# Pilot sinov rejasi (2–3 maktab)

> Bu — **reja**. Pilot hali o'tkazilmagan; maktablar, ruxsatnomalar va ota-ona roziligi sizning tomoningizdan tashkil etiladi.

## Maqsad va gipoteza
LingoUz Kids bilan 8 hafta davomida haftasiga 3×15 daqiqa mashq qilgan 1–4-sinf o'quvchilarining so'z boyligi va talaffuzi nazorat guruhiga nisbatan ko'proq o'sadi.

## Dizayn
- **Guruhlar:** tajriba (ilova + odatiy dars) va nazorat (odatiy dars). Har sinfdan kamida 20 o'quvchi.
- **Davomiylik:** 8 hafta. **Mashq:** 3×15 daq/hafta.
- **O'lchovlar:** (1) ilovadagi **Bilim darajasi testi** (`#/games/diag`) — kirish va chiqish; (2) o'qituvchi tuzgan 20 savollik qog'oz test (nazorat guruhida ham); (3) **talaffuz jurnali** (Ota-ona → Hisobot → CSV) — 10 ta bolada mikrofon aniqligini qo'lda tekshirish; (4) qiziqish so'rovnomasi (1–5 smaylik shkala, bola uchun); (5) o'qituvchi va ota-ona so'rovnomasi.

## Tayyorgarlik cheklist
- [ ] Maktab ma'muriyati va metodbirlashma bilan kelishuv
- [ ] Ota-ona roziligi shakli (rasm/ovoz yozish va ma'lumot saqlash haqida)
- [ ] Qurilmalar: planshet/telefon soni, internet (ilova oflayn ishlaydi, PWA)
- [ ] O'qituvchiga 1 soatlik tanishtiruv va qo'llanma
- [ ] Har o'quvchiga alohida profil (Ota-ona paneli → profil)

## Haftalik jadval
| Hafta | Ish |
|---|---|
| 0 | Kirish testi, so'rovnoma, profil yaratish |
| 1–7 | Mashq; o'qituvchi haftasiga bir marta o'quvchi hisobotlarini (JSON) yig'adi |
| 4 | Oraliq fikr-mulohaza uchrashuvi |
| 8 | Chiqish testi, so'rovnoma, intervyu (5 o'qituvchi, 10 ota-ona) |

## Tahlil
- Bilim testi: oldin/keyin farqi (juft t-test yoki Wilcoxon), tajriba va nazorat guruhlari orasida (ANCOVA / farqlar farqi).
- Talaffuz: ilova bali va mutaxassis bahosi o'rtasidagi korrelyatsiya (kamida 10 bola, 30 so'z).
- Foydalanish: seans soni, daqiqa, tugallangan mavzu (ota-ona hisobotidan).
- Natija **kichik namuna** ekanini hisobotda aniq yozing; sababiy xulosa qilmang.

## Axloq va maxfiylik
Ism o'rniga kod/taxallus ishlating; audio saqlanmaydi (ilova yubormaydi); faqat qurilmadagi hisobot fayli yig'iladi; ishtirokdan istalgan payt chiqish huquqi.
