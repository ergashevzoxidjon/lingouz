# Ovoz kutubxonasi

Ilova har bir inglizcha so'z/gap/ertak qatorini shu papkadagi `<slug>.mp3` faylidan o'qiydi. Fayl topilmasa (yoki "Tabiiy ovoz" sozlamasi o'chirilsa) brauzerning robot ovozi zaxira sifatida ishlaydi.

**Slug** = matn kichik harfda, harf va apostrofdan boshqa belgilar bo'shliq, bo'shliq → `-`. Masalan `ice cream` → `ice-cream.mp3`.

## Hozirgi audiolar qanday yaratilgan
Bepul va oflayn **Kokoro** neyron ovoz modeli (Apache-2.0 litsenziya) bilan, `af_heart` ovozida, tezligi 0.9 (bolalar uchun sekinroq va aniq). Barcha fayllar bir xil balandlikda, boshidagi/oxiridagi sukunat kesilgan, MP3 80 kbps.

```powershell
node tools/collect-speech.js > speech-list.json        # ilovadagi barcha matnlar (891 ta)
python tools/gen-audio.py --list speech-list.json --models <model-papkasi> --voice af_heart
python tools/gen-audio.py --samples --models <model-papkasi>     # ovozlarni solishtirish namunalari
```
Tayyorgarlik va model fayllari haqida — `tools/gen-audio.py` boshidagi izohda. Yangi matn qo'shsangiz, shu buyruqlarni qayta ishga tushiring (mavjud fayllar o'tkazib yuboriladi); `npm test` yetishmayotgan audiolarni aytib beradi.

## Ovozni almashtirish
`audio/samples/` ichida 7 ta ovozning namunasi bor (`af_heart`, `af_bella`, `af_sarah`, `af_sky`, `bf_emma` (britancha), `am_michael` (erkak), `af_nicole`). Yoqqanini tanlab `--voice <nom> --force` bilan hammasini qayta yarating.

## Professional diktor
Ona tili egasi yozgan audio ustun turadi: shu papkaga bir xil nomli mp3 qo'ying (mavjud faylni almashtiring) va `manifest.json` ga nomini qo'shing — ilova avtomatik ishlatadi.
