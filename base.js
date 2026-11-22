/* base.js — ilova istalgan yo'lda (masalan, mylogo.uz/lingouz/) ishlashi uchun <base> o'rnatadi.
   Sahifa manzili: /lingouz  →  /lingouz/ ;  /lingouz/admin  →  /lingouz/ ;  /  →  /  */
(function () {
  var p = location.pathname.replace(/(admin(\.html)?|index\.html)$/, '');
  if (p.charAt(p.length - 1) !== '/') p += '/';
  document.write('<base href="' + p.replace(/[<>"&]/g, '') + '">');
})();
