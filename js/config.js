/* ==========================================================
   НАСТРОЙКИ НА САЙТА — редактирайте само този файл
   ========================================================== */
window.SITE_CONFIG = {
  companyFirst: "Кристал",
  companySecond: "Клийн",
  companyLegal: "Кристал Клийн ЕООД",
  phone: "+359 888 123 456",
  email: "office@crystalclean.bg",
  address: "гр. Пловдив, ул. „Примерна“ 12",
  workHours: "Пон–Съб: 8:00 – 20:00",
  serviceArea: "Пловдив и околностите",

  // Адрес за изпращане на заявките.
  // Регистрирайте безплатна форма в https://formspree.io и поставете адреса ѝ тук,
  // напр. "https://formspree.io/f/abcdwxyz".
  // Ако е празно, заявката се отваря като имейл в пощенския клиент на посетителя.
  formEndpoint: "",

  // Видове почистване (recurring: true = може и по абонамент)
  services: {
    standard:   { label: "Стандартно почистване", hint: "Редовна поддръжка",       recurring: true },
    deep:       { label: "Основно почистване",    hint: "Детайлно, всяко ъгълче",  recurring: false },
    renovation: { label: "След ремонт",           hint: "Строителен прах и петна", recurring: false },
    moving:     { label: "При нанасяне/изнасяне", hint: "Празен имот",             recurring: false },
    office:     { label: "Офис почистване",       hint: "Офиси и търговски обекти", recurring: true }
  },

  // Допълнителни услуги (perUnit = пита се за брой)
  extras: {
    oven:     { label: "Фурна (вътрешно)" },
    fridge:   { label: "Хладилник (вътрешно)" },
    cabinets: { label: "Кухненски шкафове" },
    balcony:  { label: "Балкон / тераса" },
    ironing:  { label: "Гладене" },
    windows:  { label: "Прозорци", perUnit: "крила" }
  },

  // Абонаментни честоти и отстъпки
  plans: {
    weekly:   { label: "Всяка седмица",      discount: 0.20 },
    biweekly: { label: "На всеки 2 седмици", discount: 0.15 },
    monthly:  { label: "Веднъж месечно",     discount: 0.10 }
  }
};
