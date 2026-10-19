/* ==========================================================
   НАСТРОЙКИ НА САЙТА — редактирайте само този файл
   ========================================================== */
window.SITE_CONFIG = {
  companyName: "Мега Чисто",           // марка (показва се на сайта)
  tagline: "Чистота | Качество | Доверие",
  companyLegal: "Д.В.Х. 93 ЕООД",      // юридическо лице (документи, футър)
  phone: "0894 097 232",
  email: "office@megachisto.com",
  address: "гр. Пловдив, ул. „Примерна“ 12",
  workHours: "Пон–Съб: 8:00 – 20:00",
  serviceArea: "Пловдив и околностите",

  // Адрес за изпращане на заявките.
  // Регистрирайте безплатна форма в https://formspree.io и поставете адреса ѝ тук,
  // напр. "https://formspree.io/f/abcdwxyz".
  // Ако е празно, заявката се отваря като имейл в пощенския клиент на посетителя.
  formEndpoint: "",

  // Адрес на Google Apps Script (виж apps-script/НАСТРОЙКА.md).
  // Когато е попълнен, всяка заявка идва на имейла на собственика
  // с прикачена оферта (Word), в която се попълва цената.
  // Има предимство пред formEndpoint.
  appsScriptUrl: "https://script.google.com/macros/s/AKfycbwHcor9vabYvj9ZxBb38_DSwq7Y3p3nV4tW7Oc0D9uaFch0UnYYAPpp1ecHYlU_XuqScw/exec",

  // Видове почистване (recurring: true = може и по абонамент)
  services: {
    standard:   { label: "Стандартно почистване", hint: "Редовна поддръжка",       recurring: true },
    deep:       { label: "Основно почистване",    hint: "Детайлно, всяко ъгълче",  recurring: false },
    renovation: { label: "След ремонт",           hint: "Строителен прах и петна", recurring: false },
    moving:     { label: "При нанасяне/изнасяне", hint: "Празен имот",             recurring: false },
    office:     { label: "Офис почистване",       hint: "Офиси и търговски обекти", recurring: true },
    rainbow:    { label: "Мебели и килими (Rainbow)", hint: "Пране с водна филтрация", recurring: false, anyProperty: true }
  },

  // Допълнителни услуги (perUnit = пита се за брой)
  extras: {
    oven:     { label: "Фурна (вътрешно)" },
    fridge:   { label: "Хладилник (вътрешно)" },
    cabinets: { label: "Кухненски шкафове" },
    balcony:  { label: "Балкон / тераса" },
    windows:  { label: "Прозорци", perUnit: "крила" }
  },

  // Предмети за почистване с Rainbow (unit = мерна единица, qty = начална стойност)
  rainbowItems: {
    sofa:      { label: "Диван",               unit: "места", qty: 3 },
    armchair:  { label: "Фотьойл",             unit: "бр.",   qty: 1 },
    mattress:  { label: "Матрак",              unit: "бр.",   qty: 1 },
    carpet:    { label: "Килим / мокет",       unit: "м²",    qty: 10 },
    chairs:    { label: "Столове с тапицерия", unit: "бр.",   qty: 4 },
    carseat:   { label: "Детско столче / количка", unit: "бр.", qty: 1 }
  },

  // Абонаментни честоти и отстъпки
  plans: {
    weekly:   { label: "Всяка седмица",      discount: 0.20 },
    biweekly: { label: "На всеки 2 седмици", discount: 0.15 },
    monthly:  { label: "Веднъж месечно",     discount: 0.10 }
  }
};
