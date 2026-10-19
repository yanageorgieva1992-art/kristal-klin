/**
 * Мега Чисто — получаване на заявки от сайта
 *
 * Получава заявката от формата на сайта и я изпраща на имейла на собственика
 * с прикачена оферта (Word .docx), в която се попълва цената.
 * При „Отговор“ на имейла, отговорът отива директно до клиента (ако е оставил имейл).
 *
 * Инструкции за инсталиране: виж НАСТРОЙКА.md
 */

// Имейл, на който да идват заявките. Ако е празно — идват на акаунта, от който е пуснат скриптът.
var OWNER_EMAIL = "office@megachisto.com";

var MAX_FILE_BYTES = 5 * 1024 * 1024;
var DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function doPost(e) {
  try {
    var p = JSON.parse(e.postData.contents);
    var data = p.data || {};
    var to = OWNER_EMAIL || Session.getEffectiveUser().getEmail();
    var subject = String(p.subject || "Нова заявка от сайта").slice(0, 200);

    var lines = Object.keys(data).map(function (k) { return k + ": " + data[k]; });
    var replyTo = isEmail(p.replyTo) ? p.replyTo : "";

    var howTo = p.fileBase64
      ? "Офертата е прикачена като Word документ:\n" +
        "  1. Отворете я и попълнете жълтите полета в колоната „Цена“.\n" +
        "  2. Запазете документа.\n" +
        (replyTo
          ? "  3. Натиснете „Отговор“ на този имейл — той ще отиде директно до клиента — и прикачете попълнената оферта."
          : "  3. Клиентът не е оставил имейл — обадете му се на " + (data["Телефон"] || "посочения телефон") + ".")
      : "Офертата не можа да бъде генерирана — свържете се с клиента директно.";

    var body = "Нова заявка от сайта.\n\n" + lines.join("\n") + "\n\n" + howTo + "\n";

    var options = {
      name: "Мега Чисто — заявки",
      htmlBody: buildEmailHtml(data, {
        replyTo: replyTo,
        hasOffer: !!p.fileBase64,
        receivedAt: Utilities.formatDate(new Date(), "Europe/Sofia", "dd.MM.yyyy, HH:mm")
      })
    };
    if (replyTo) options.replyTo = replyTo;

    if (p.fileBase64) {
      var bytes = Utilities.base64Decode(p.fileBase64);
      if (bytes.length > MAX_FILE_BYTES) throw new Error("Файлът е твърде голям");
      var name = String(p.fileName || "Оферта.docx").replace(/[\\\/:*?"<>|]+/g, "-");
      options.attachments = [Utilities.newBlob(bytes, DOCX_MIME, name)];
    }

    MailApp.sendEmail(to, subject, body, options);
    return json({ ok: true });
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: String(err) });
  }
}

// Отваряне на адреса в браузър — проверка, че скриптът работи.
function doGet() {
  return json({ ok: true, status: "Скриптът работи." });
}

// Стартирайте ръчно от редактора веднъж, за да дадете разрешение за изпращане на имейли.
function testEmail() {
  var to = OWNER_EMAIL || Session.getEffectiveUser().getEmail();
  MailApp.sendEmail(to, "Тест: заявки от сайта", "Скриптът е настроен и може да изпраща имейли.");
}

/* ==========================================================
   HTML писмо до собственика (inline стилове — за Gmail/Outlook)
   ========================================================== */
var BRAND = { blue: "#1966B4", orange: "#F8A62C", navy: "#12263A", muted: "#6B7F92", line: "#E1EAF0", soft: "#F4F8FC" };
var LOGO_URL = "https://megachisto.com/img/logo-mark.png";
var SITE_URL = "https://megachisto.com";

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function filled(v) { return v != null && String(v).trim() !== "" && String(v).trim() !== "—"; }

function buildEmailHtml(data, o) {
  var B = BRAND;
  var font = "font-family:Arial,Helvetica,sans-serif;";
  var name = data["Име"] || "Клиент";
  var phone = data["Телефон"] || "";
  var email = filled(data["Имейл"]) ? data["Имейл"] : "";
  var address = data["Адрес"] || "";
  var date = data["Дата"] || data["Първо посещение"] || "";
  var isSub = data["Тип"] === "Абонамент";

  // Полета, показани в отделни блокове — не се повтарят в „Детайли“
  var shown = ["Име", "Телефон", "Имейл", "Адрес", "Тип", "Обект", "Услуга", "Дата", "Първо посещение", "Час", "Бележки"];
  var details = Object.keys(data).filter(function (k) { return shown.indexOf(k) === -1 && filled(data[k]); });

  function chip(text, bg, color) {
    return '<span style="display:inline-block;' + font + 'font-size:12px;font-weight:bold;padding:5px 11px;border-radius:999px;' +
      "background:" + bg + ";color:" + color + ';margin:0 6px 6px 0">' + esc(text) + "</span>";
  }
  function sectionTitle(t) {
    return '<div style="' + font + "font-size:12px;font-weight:bold;letter-spacing:1.2px;text-transform:uppercase;color:" + B.muted + ';margin:0 0 10px">' + esc(t) + "</div>";
  }
  function button(href, text, bg, color) {
    return '<a href="' + esc(href) + '" style="display:inline-block;' + font + "font-size:15px;font-weight:bold;text-decoration:none;" +
      "background:" + bg + ";color:" + color + ';padding:11px 18px;border-radius:10px;margin:0 8px 8px 0">' + text + "</a>";
  }

  var mapsUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(address + ", Пловдив");

  var detailRows = details.map(function (k, i) {
    return '<tr><td style="' + font + "font-size:14px;color:" + B.muted + ";padding:10px 12px;border-top:" + (i ? "1px solid " + B.line : "0") + ';width:42%;vertical-align:top">' + esc(k) + "</td>" +
      '<td style="' + font + "font-size:14px;color:" + B.navy + ";font-weight:bold;padding:10px 12px;border-top:" + (i ? "1px solid " + B.line : "0") + ';vertical-align:top">' + esc(data[k]) + "</td></tr>";
  }).join("");

  var steps = o.hasOffer
    ? [
        "Отворете прикачената оферта (Word).",
        "Попълнете цените в жълтите полета и запазете.",
        o.replyTo
          ? "Натиснете <b>„Отговор“</b> — писмото отива директно до клиента — и прикачете офертата."
          : "Клиентът не е оставил имейл — обадете се на <b>" + esc(phone) + "</b>."
      ]
    : ["Офертата не можа да бъде генерирана — свържете се с клиента директно на <b>" + esc(phone) + "</b>."];

  var html =
    '<div style="background:#EEF3F8;padding:24px 12px;margin:0">' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid ' + B.line + '">' +

    // Хедър
    '<tr><td style="background:' + B.blue + ';padding:18px 24px">' +
      '<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>' +
        '<td style="vertical-align:middle"><img src="' + LOGO_URL + '" width="38" height="42" alt="" style="vertical-align:middle;border:0;background:#fff;border-radius:8px;padding:3px">' +
        '<span style="' + font + 'font-size:20px;font-weight:bold;color:#ffffff;vertical-align:middle;margin-left:10px">Мега <span style="color:' + B.orange + '">Чисто</span></span></td>' +
        '<td align="right" style="vertical-align:middle">' + chip("НОВА ЗАЯВКА", B.orange, B.navy) + "</td>" +
      "</tr></table>" +
    "</td></tr>" +

    // Резюме
    '<tr><td style="padding:24px 24px 8px">' +
      '<div style="' + font + "font-size:13px;color:" + B.muted + ';margin-bottom:6px">Получена на ' + esc(o.receivedAt) + "</div>" +
      '<div style="' + font + "font-size:24px;font-weight:bold;color:" + B.navy + ';line-height:1.25;margin-bottom:12px">' + esc(data["Услуга"] || "Почистване") + "</div>" +
      chip(data["Тип"] || "", isSub ? "#FFF1DA" : "#E8F1FB", isSub ? "#9A5B00" : B.blue) +
      chip(data["Обект"] || "", "#E8F1FB", B.blue) +
      (date ? chip("📅 " + date + (data["Час"] ? " · " + data["Час"] : ""), "#E8F1FB", B.blue) : "") +
    "</td></tr>" +

    // Клиент
    '<tr><td style="padding:16px 24px">' +
      '<div style="background:' + B.soft + ";border:1px solid " + B.line + ';border-radius:12px;padding:18px">' +
        sectionTitle("Клиент") +
        '<div style="' + font + "font-size:20px;font-weight:bold;color:" + B.navy + ';margin-bottom:4px">' + esc(name) + "</div>" +
        (address ? '<div style="' + font + "font-size:14px;color:" + B.navy + ';margin-bottom:14px">📍 ' + esc(address) + "</div>" : "") +
        (phone ? button("tel:" + phone.replace(/[^\d+]/g, ""), "📞 " + esc(phone), B.blue, "#ffffff") : "") +
        (email ? button("mailto:" + email, "✉️ " + esc(email), "#ffffff", B.blue).replace("background:#ffffff;", "background:#ffffff;border:1px solid " + B.blue + ";") : "") +
        (address ? button(mapsUrl, "🗺️ Карта", "#ffffff", B.navy).replace("background:#ffffff;", "background:#ffffff;border:1px solid " + B.line + ";") : "") +
      "</div>" +
    "</td></tr>" +

    // Детайли
    (detailRows
      ? '<tr><td style="padding:8px 24px 16px">' + sectionTitle("Детайли") +
        '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid ' + B.line + ';border-radius:12px;border-collapse:separate">' + detailRows + "</table></td></tr>"
      : "") +

    // Бележки
    (filled(data["Бележки"])
      ? '<tr><td style="padding:0 24px 16px">' + sectionTitle("Бележки от клиента") +
        '<div style="' + font + "font-size:15px;line-height:1.5;color:" + B.navy + ";background:#FFF8E6;border-left:4px solid " + B.orange + ';border-radius:8px;padding:12px 14px">' +
        esc(data["Бележки"]).replace(/\n/g, "<br>") + "</div></td></tr>"
      : "") +

    // Какво следва
    '<tr><td style="padding:0 24px 24px">' +
      '<div style="background:#E8F1FB;border-radius:12px;padding:16px 18px">' +
        sectionTitle("Какво следва") +
        steps.map(function (s, i) {
          return '<table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom:8px"><tr>' +
            '<td style="vertical-align:top;padding-right:10px"><div style="' + font + "width:24px;height:24px;line-height:24px;border-radius:12px;background:" + B.blue + ';color:#fff;font-size:13px;font-weight:bold;text-align:center">' + (i + 1) + "</div></td>" +
            '<td style="' + font + "font-size:14px;line-height:1.5;color:" + B.navy + '">' + s + "</td></tr></table>";
        }).join("") +
      "</div>" +
    "</td></tr>" +

    // Футър
    '<tr><td style="border-top:1px solid ' + B.line + ";padding:14px 24px;" + font + "font-size:12px;color:" + B.muted + '">' +
      'Изпратено автоматично от формата за заявки на <a href="' + SITE_URL + '" style="color:' + B.blue + '">megachisto.com</a>' +
    "</td></tr>" +

    "</table></div>";
  return html;
}

function isEmail(s) {
  return typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
