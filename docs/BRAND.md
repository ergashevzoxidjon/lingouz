# LingoUz Kids — Brend kitobi (v1)

## Nom va shior
- **Nom:** LingoUz Kids (Lingo + Uz). Maskot: **Lingo** — do'ppi kiygan sher bolasi.
- **Asosiy shior (EN):** Learn English, Play, Explore and Dream!
- **O'zbekcha shior:** O'yna, o'rgan, kashf et va ingliz tilida so'zla!

## Ranglar (`styles.css` → `:root`)
| Rol | Kod | Qo'llanishi |
|---|---|---|
| Asosiy (primary) | `#FF8A4C` | Asosiy tugmalar, logotipdagi "Uz" |
| Aksent | `#7C5CFF` | Ikkinchi darajali tugmalar, havolalar |
| Fon | `#FFF8EE` | Sahifa foni |
| Pastel to'plam | `#FFD6E0 #CDE8FF #D4F5DC #FFF1B8 #E4D9FF #FFDDBF` | Kartalar (har bir bo'lim alohida rangda) |
| Matn | `#3a3358` | Asosiy matn (kontrast 4.5:1 dan yuqori) |

## Shrift
Nunito (agar o'rnatilgan bo'lsa), aks holda tizim shrifti (`Segoe UI`, `Roboto`…). Tashqi serverdan yuklanmaydi (oflayn va maxfiylik uchun).

## Ovoz ohangi (matnlar)
- Bolaga: iliq, qisqa, rag'batlantiruvchi ("Barakalla!", "Yana bir bor urinib ko'ramizmi?"). Hech qachon ayblamaydi.
- Ota-onaga: aniq, shaffof, raqamlar bilan.
- O'zbekcha imlo: `o‘ g‘` (U+2018) va tutuq `’` (U+2019). Kodda `uzFix()` avtomatik moslaydi.

## Maskot Lingo
- Kayfiyatlar: `happy`, `cheer`, `wow`, `sad`, `sleepy` (`mascot(mood)` funksiyasi).
- Aksessuarlar (do'kondan): ko'zoynak, bant, quloqchin, sharf, toj.
- Qoida: Lingo hech qachon bolani xafa qilmaydi; xatoda "sad" emas, rag'bat matni ko'rsatiladi.

## Emoji / rasm
Hozir **Twemoji (CC-BY 4.0)** lokal SVG. Footer'da muallif ko'rsatilgan. Professional illyustratsiyaga o'tishda `em()` funksiyasi (core.js) yagona almashtirish nuqtasi.
