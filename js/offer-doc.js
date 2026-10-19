/* ==========================================================
   Генериране на оферта (Word .docx) от заявката
   Библиотеката docx се зарежда само при изпращане на заявка.
   ========================================================== */
window.OfferDoc = (function () {
  var LIB_URL = "https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.js";
  var loading = null;

  function load() {
    if (window.docx) return Promise.resolve(window.docx);
    if (!loading) {
      loading = new Promise(function (resolve, reject) {
        var s = document.createElement("script");
        s.src = LIB_URL;
        s.onload = function () { resolve(window.docx); };
        s.onerror = function () { loading = null; reject(new Error("docx library failed to load")); };
        document.head.appendChild(s);
      });
    }
    return loading;
  }

  var BLUE = "1966B4", NAVY = "12263A", MUTED = "6B7F92", LINE = "E1EAF0", SOFT = "F4F9FB", FILL = "FFF4CC";

  /*
    info = {
      id, date,                         // номер и дата на офертата
      company: SITE_CONFIG,
      client: { name, phone, email, address },
      details: [[етикет, стойност], ...],
      lines: [{ name, qty }],           // редове в ценовата таблица
      discount: "-15%" | null,
      payment: "В брой" | "Банков път (фактура)"
    }
  */
  function create(d, info) {
    var C = info.company;

    function run(text, o) {
      o = o || {};
      return new d.TextRun({ text: String(text), bold: o.bold, italics: o.italics, size: o.size, color: o.color });
    }
    function para(children, o) {
      o = o || {};
      return new d.Paragraph({
        children: Array.isArray(children) ? children : [children],
        spacing: { before: o.before || 0, after: o.after == null ? 120 : o.after },
        alignment: o.align
      });
    }
    function multiline(text, o) {
      return String(text).split(/\r?\n/).map(function (line, i) {
        o = o || {};
        return new d.TextRun({ text: line, break: i ? 1 : 0, bold: o.bold, color: o.color });
      });
    }
    function heading(text) {
      return para(run(text, { bold: true, size: 26, color: NAVY }), { before: 220, after: 100 });
    }

    var border = { style: d.BorderStyle.SINGLE, size: 4, color: LINE };
    var borders = { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border };
    var pad = { top: 40, bottom: 40, left: 120, right: 120 };

    function cell(children, o) {
      o = o || {};
      return new d.TableCell({
        children: [new d.Paragraph({ children: children, alignment: o.align })],
        width: { size: o.width, type: d.WidthType.PERCENTAGE },
        shading: o.fill ? { fill: o.fill, type: d.ShadingType.CLEAR, color: "auto" } : undefined,
        margins: pad
      });
    }
    function table(rows) {
      return new d.Table({ width: { size: 100, type: d.WidthType.PERCENTAGE }, borders: borders, rows: rows });
    }
    function kvTable(pairs) {
      return table(pairs.map(function (p) {
        return new d.TableRow({ children: [
          cell([run(p[0], { color: MUTED })], { width: 32, fill: SOFT }),
          cell(multiline(p[1] || "—", { color: NAVY }), { width: 68 })
        ] });
      }));
    }

    // Ценова таблица — колоната „Цена“ е маркирана за попълване
    var priceRows = [new d.TableRow({ tableHeader: true, children: [
      cell([run("Услуга", { bold: true, color: "FFFFFF" })], { width: 55, fill: BLUE }),
      cell([run("Количество", { bold: true, color: "FFFFFF" })], { width: 20, fill: BLUE, align: d.AlignmentType.CENTER }),
      cell([run("Цена (€)", { bold: true, color: "FFFFFF" })], { width: 25, fill: BLUE, align: d.AlignmentType.RIGHT })
    ] })];
    info.lines.forEach(function (l) {
      priceRows.push(new d.TableRow({ children: [
        cell([run(l.name, { color: NAVY })], { width: 55 }),
        cell([run(l.qty || "", { color: NAVY })], { width: 20, align: d.AlignmentType.CENTER }),
        cell([run("")], { width: 25, fill: FILL, align: d.AlignmentType.RIGHT })
      ] }));
    });
    if (info.discount) {
      priceRows.push(new d.TableRow({ children: [
        cell([run("Отстъпка за абонамент", { color: NAVY })], { width: 55 }),
        cell([run(info.discount, { color: NAVY })], { width: 20, align: d.AlignmentType.CENTER }),
        cell([run("")], { width: 25, fill: FILL, align: d.AlignmentType.RIGHT })
      ] }));
    }
    priceRows.push(new d.TableRow({ children: [
      cell([run(info.discount ? "ОБЩО (на посещение)" : "ОБЩО", { bold: true, color: NAVY })], { width: 55, fill: SOFT }),
      cell([run("")], { width: 20, fill: SOFT }),
      cell([run("", { bold: true })], { width: 25, fill: FILL, align: d.AlignmentType.RIGHT })
    ] }));

    function bullet(text) {
      return new d.Paragraph({ children: [run(text)], bullet: { level: 0 }, spacing: { after: 30 } });
    }

    // Горна част: емблема + марка вляво, заглавие и номер вдясно (таблица без рамки)
    var none = { style: d.BorderStyle.NONE, size: 0, color: "FFFFFF" };
    var noBorders = { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none };
    var ORANGE = "F8A62C";
    var words = C.companyName.split(" ");
    var brandCells = [];
    if (info.logo) {
      brandCells.push(new d.TableCell({
        width: { size: 11, type: d.WidthType.PERCENTAGE },
        verticalAlign: d.VerticalAlign.CENTER,
        children: [new d.Paragraph({ children: [new d.ImageRun({ data: info.logo, transformation: { width: 54, height: 60 } })] })]
      }));
    }
    brandCells.push(new d.TableCell({
      width: { size: info.logo ? 39 : 50, type: d.WidthType.PERCENTAGE },
      verticalAlign: d.VerticalAlign.CENTER,
      children: info.wordmark
        // надписът „Мега Чисто“ от логото (543×144)
        ? [new d.Paragraph({ children: [new d.ImageRun({ data: info.wordmark, transformation: { width: 166, height: 44 } })] })]
        : [
          new d.Paragraph({ children: [
            run(words[0], { bold: true, size: 36, color: BLUE }),
            run(words.length > 1 ? " " + words.slice(1).join(" ") : "", { bold: true, size: 36, color: ORANGE })
          ] }),
          new d.Paragraph({ children: [run(C.tagline.toUpperCase(), { bold: true, size: 14, color: ORANGE })] })
        ]
    }));
    var header = new d.Table({
      width: { size: 100, type: d.WidthType.PERCENTAGE },
      borders: noBorders,
      rows: [new d.TableRow({ children: brandCells.concat([
        new d.TableCell({
          width: { size: 50, type: d.WidthType.PERCENTAGE },
          verticalAlign: d.VerticalAlign.CENTER,
          children: [
            new d.Paragraph({ alignment: d.AlignmentType.RIGHT, children: [run("ОФЕРТА ЗА ПОЧИСТВАНЕ", { bold: true, size: 34, color: NAVY })] }),
            new d.Paragraph({ alignment: d.AlignmentType.RIGHT, spacing: { before: 60 }, children: [run("№ " + info.id + "   ·   " + info.date, { color: MUTED })] })
          ]
        })
      ]) })]
    });

    var children = [
      header,
      para(run(C.companyLegal + "  ·  тел. " + C.phone + "  ·  " + C.email, { size: 18, color: MUTED }), { before: 120, after: 160 }),

      heading("Клиент"),
      kvTable([
        ["Име", info.client.name],
        ["Телефон", info.client.phone],
        ["Имейл", info.client.email],
        ["Адрес", info.client.address]
      ]),

      heading("Детайли на заявката"),
      kvTable(info.details),

      heading("Цена"),
      table(priceRows),

      heading("Условия"),
      bullet("Плащане на място след приключване на почистването — " + (info.payment === "Банков път (фактура)" ? "по банков път, с фактура." : "в брой.")),
      bullet("Не изискваме предплащане и не приемаме онлайн плащания."),
      bullet("Цената включва всички препарати и оборудване."),
      bullet("Безплатно пренасрочване до 24 часа преди посещението."),
      bullet("Офертата е валидна 7 дни."),

      heading("Потвърждение"),
      para(run("За да потвърдите посещението, отговорете на този имейл или се обадете на " + C.phone + ".")),
      para(run("С уважение,"), { before: 240, after: 0 }),
      para(run(C.companyName, { bold: true, color: NAVY }), { after: 0 }),
      para(run(C.companyLegal, { color: MUTED }))
    ];

    return new d.Document({
      creator: C.companyLegal,
      title: "Оферта " + info.id,
      styles: { default: { document: { run: { font: "Calibri", size: 22 }, paragraph: { spacing: { after: 0, line: 252 } } } } },
      sections: [{
        properties: { page: { margin: { top: 850, bottom: 850, left: 1100, right: 1100 } } },
        children: children
      }]
    });
  }

  // Връща Promise<Blob> (в браузъра)
  function loadImage(url) {
    return fetch(url)
      .then(function (r) { if (!r.ok) throw new Error(); return r.arrayBuffer(); })
      .then(function (buf) { return new Uint8Array(buf); })
      .catch(function () { return null; }); // без картинка — само текст
  }

  function build(info) {
    return Promise.all([load(), loadImage("img/logo-mark.png"), loadImage("img/logo-wordmark.png")]).then(function (res) {
      info.logo = res[1];
      info.wordmark = res[2];
      return res[0].Packer.toBlob(create(res[0], info));
    });
  }

  return { build: build, create: create, load: load };
})();
