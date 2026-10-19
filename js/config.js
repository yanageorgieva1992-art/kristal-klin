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

  currency: "€",

  // Цени (на кв.м.) по вид почистване
  rates: {
    standard:   { label: "Стандартно почистване", perSqm: 0.70, recurring: true },
    deep:       { label: "Основно почистване",    perSqm: 1.40, recurring: false },
    renovation: { label: "След ремонт",           perSqm: 1.90, recurring: false },
    moving:     { label: "При нанасяне/изнасяне", perSqm: 1.50, recurring: false },
    office:     { label: "Офис почистване",       perSqm: 0.60, recurring: true }
  },

  minOrder: 40,

  // Допълнителни услуги (фиксирана цена или цена на брой)
  extras: {
    oven:     { label: "Фурна (вътрешно)",     price: 15 },
    fridge:   { label: "Хладилник (вътрешно)", price: 12 },
    cabinets: { label: "Кухненски шкафове",    price: 15 },
    balcony:  { label: "Балкон / тераса",      price: 10 },
    ironing:  { label: "Гладене (1 час)",      price: 12 },
    windows:  { label: "Прозорци",             price: 3, perUnit: "крило" }
  },

  // Абонаментни отстъпки
  plans: {
    weekly:   { label: "Всяка седмица",       discount: 0.20, visitsPerMonth: 4.33 },
    biweekly: { label: "На всеки 2 седмици",  discount: 0.15, visitsPerMonth: 2.17 },
    monthly:  { label: "Веднъж месечно",      discount: 0.10, visitsPerMonth: 1 }
  }
};
