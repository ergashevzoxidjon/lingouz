/* base.js — ilova istalgan yo'lda (masalan, mylogo.uz/lingouz/) ishlashi uchun <base> o'rnatadi.
   Sahifa manzili: /lingouz  ->  /lingouz/ ;  /lingouz/admin  ->  /lingouz/ ;  /  ->  /
   Native ilovada (Capacitor: iOS/Android) sahifa telefon ichidan ochiladi, shuning uchun API serverning to'liq manzili ishlatiladi. */
(function () {
  var p = location.pathname.replace(/(admin(\.html)?|index\.html)$/, '');
  if (p.charAt(p.length - 1) !== '/') p += '/';
  document.write('<base href="' + p.replace(/[<>"&]/g, '') + '">');
  var native = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  window.LINGO_NATIVE = native;
  window.LINGO_API = native ? 'https://mylogo.uz/lingouz/' : '';
})();
