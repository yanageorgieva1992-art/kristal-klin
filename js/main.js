/* ==========================================================
   Общ хедър, футър, меню и анимации
   ========================================================== */
(function () {
  var C = window.SITE_CONFIG;
  var telHref = "tel:" + C.phone.replace(/\s+/g, "");
  // „Мега Чисто“ → „Мега“ в синьо, „Чисто“ в оранжево
  var brandParts = C.companyName.split(" ");
  var brandHtml = brandParts[0] +
    (brandParts.length > 1 ? ' <span class="logo-accent">' + brandParts.slice(1).join(" ") + "</span>" : "");

  var logo =
    '<a href="index.html" class="logo" aria-label="' + C.companyName + ' — начало">' +
    '<img src="img/logo-mark.png" alt="" width="43" height="48">' +
    '<span class="logo-text"><span class="logo-name">' + brandHtml + '</span>' +
    '<span class="logo-tag">' + C.tagline + "</span></span></a>";

  var header =
    '<div class="topbar"><div class="container">' +
    '<div><span>📞 <a href="' + telHref + '">' + C.phone + "</a></span>" +
    '<span class="hide-sm">✉️ <a href="mailto:' + C.email + '">' + C.email + "</a></span></div>" +
    '<div class="hide-sm">🕗 ' + C.workHours + " · " + C.serviceArea + "</div>" +
    "</div></div>" +
    '<header class="site-header"><div class="container nav">' + logo +
    '<button class="nav-toggle" aria-label="Меню" aria-expanded="false"><span></span><span></span><span></span></button>' +
    '<nav class="nav-links">' +
    '<a href="index.html">Начало</a>' +
    '<a href="uslugi.html">Услуги</a>' +
    '<a href="abonamenti.html">Абонаменти</a>' +
    '<a href="index.html#faq">Въпроси</a>' +
    '<a href="index.html#kontakti">Контакти</a>' +
    '<a href="zayavka.html" class="btn btn-primary btn-sm">Заяви почистване</a>' +
    "</nav></div></header>";

  var year = new Date().getFullYear();
  var footer =
    '<footer class="site-footer"><div class="container">' +
    '<div class="footer-grid">' +
    "<div>" + logo +
    "<p>Професионално почистване на домове и офиси с грижа за детайла. Еднократно или по абонамент — Вие избирате.</p></div>" +
    "<div><h4>Услуги</h4><ul>" +
    '<li><a href="uslugi.html#dom">Почистване на дом</a></li>' +
    '<li><a href="uslugi.html#ofis">Почистване на офис</a></li>' +
    '<li><a href="uslugi.html#osnovno">Основно почистване</a></li>' +
    '<li><a href="uslugi.html#remont">След ремонт</a></li>' +
    '<li><a href="uslugi.html#rainbow">Мебели и килими (Rainbow)</a></li>' +
    "</ul></div>" +
    "<div><h4>Информация</h4><ul>" +
    '<li><a href="abonamenti.html">Абонаменти</a></li>' +
    '<li><a href="uslugi.html#dopalnitelni">Допълнителни услуги</a></li>' +
    '<li><a href="index.html#faq">Често задавани въпроси</a></li>' +
    '<li><a href="poveritelnost.html">Поверителност</a></li>' +
    "</ul></div>" +
    "<div><h4>Контакти</h4><ul>" +
    '<li><a href="' + telHref + '">' + C.phone + "</a></li>" +
    '<li><a href="mailto:' + C.email + '">' + C.email + "</a></li>" +
    "<li>" + C.address + "</li>" +
    "<li>" + C.workHours + "</li>" +
    "</ul></div></div>" +
    '<div class="footer-bottom"><span>© ' + year + " " + C.companyName + " — " + C.companyLegal + ". Всички права запазени.</span>" +
    "<span>Без онлайн плащания — плащате на място след услугата.</span></div>" +
    "</div></footer>";

  var h = document.getElementById("site-header");
  var f = document.getElementById("site-footer");
  if (h) h.outerHTML = header;
  if (f) f.outerHTML = footer;

  // Попълване на контактни данни в страниците
  document.querySelectorAll("[data-cfg]").forEach(function (el) {
    var key = el.getAttribute("data-cfg");
    if (C[key] == null) return;
    el.textContent = C[key];
    if (key === "phone" && el.tagName === "A") el.href = telHref;
    if (key === "email" && el.tagName === "A") el.href = "mailto:" + C.email;
  });

  // Активна връзка в менюто
  var page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a:not(.btn)").forEach(function (a) {
    if (a.getAttribute("href") === page) a.classList.add("active");
  });

  // Мобилно меню
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Появяване при скрол
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("visible");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("visible"); });
  }
})();
