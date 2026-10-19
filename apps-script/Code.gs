/**
 * Д.В.Х. 93 — получаване на заявки от сайта
 *
 * Получава заявката от формата на сайта и я изпраща на имейла на собственика
 * с прикачена оферта (Word .docx), в която се попълва цената.
 * При „Отговор“ на имейла, отговорът отива директно до клиента (ако е оставил имейл).
 *
 * Инструкции за инсталиране: виж НАСТРОЙКА.md
 */

// Имейл, на който да идват заявките. Ако е празно — идват на акаунта, от който е пуснат скриптът.
var OWNER_EMAIL = "";

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

    var options = { name: "Заявки от сайта" };
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

function isEmail(s) {
  return typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
