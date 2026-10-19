/* ==========================================================
   Форма за заявка: избор на услуга и изпращане
   ========================================================== */
(function () {
  var C = window.SITE_CONFIG;
  var form = document.getElementById("booking-form");
  if (!form) return;

  var $ = function (id) { return document.getElementById(id); };

  function val(name) {
    var el = form.querySelector('[name="' + name + '"]:checked');
    return el ? el.value : null;
  }

  // ---------- Генериране на опции ----------
  var serviceBox = $("service-options");
  Object.keys(C.services).forEach(function (key) {
    var s = C.services[key];
    serviceBox.insertAdjacentHTML("beforeend",
      '<label data-service="' + key + '"><input type="radio" name="service" value="' + key + '">' +
      '<span class="tg"><strong>' + s.label + "</strong><small>" + s.hint + "</small></span></label>");
  });

  var planBox = $("plan-options");
  Object.keys(C.plans).forEach(function (key) {
    var p = C.plans[key];
    planBox.insertAdjacentHTML("beforeend",
      '<label><input type="radio" name="plan" value="' + key + '"' + (key === "biweekly" ? " checked" : "") + ">" +
      '<span class="tg"><strong>' + p.label + "</strong><small>-" + Math.round(p.discount * 100) + "% на посещение</small></span></label>");
  });

  var extrasBox = $("extras-options");
  Object.keys(C.extras).forEach(function (key) {
    var x = C.extras[key];
    var qty = x.perUnit
      ? '<input type="number" name="qty_' + key + '" min="1" max="99" value="6" aria-label="Брой"><em>' + x.perUnit + "</em>"
      : "";
    extrasBox.insertAdjacentHTML("beforeend",
      '<label class="extra"><input type="checkbox" name="extra" value="' + key + '">' +
      "<span>" + x.label + "</span>" + qty + "</label>");
  });

  // ---------- Начални стойности от URL ----------
  var params = new URLSearchParams(location.search);
  function preset(name, value) {
    if (!value) return;
    var el = form.querySelector('[name="' + name + '"][value="' + value + '"]');
    if (el) el.checked = true;
  }
  preset("mode", params.get("mode"));
  preset("property", params.get("property"));
  preset("plan", params.get("plan"));
  preset("service", params.get("service"));
  if (params.get("plan") && !params.get("mode")) preset("mode", "subscription");

  // Минимална дата — утре
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var minDate = tomorrow.toISOString().slice(0, 10);
  $("date").min = minDate;

  // ---------- Наличност на услугите ----------
  function allowedServices() {
    var mode = val("mode"), prop = val("property");
    return Object.keys(C.services).filter(function (k) {
      if (prop === "office") return k === "office";
      if (k === "office") return false;
      if (mode === "subscription") return C.services[k].recurring;
      return true;
    });
  }

  function syncVisibility() {
    var mode = val("mode");
    var allowed = allowedServices();

    serviceBox.querySelectorAll("label").forEach(function (lbl) {
      var ok = allowed.indexOf(lbl.getAttribute("data-service")) !== -1;
      lbl.classList.toggle("hidden", !ok);
      lbl.querySelector("input").disabled = !ok;
    });
    var selected = val("service");
    if (!selected || allowed.indexOf(selected) === -1) {
      serviceBox.querySelector('input[value="' + allowed[0] + '"]').checked = true;
    }

    var isSub = mode === "subscription";
    $("plan-block").classList.toggle("hidden", !isSub);
    $("weekday-block").classList.toggle("hidden", !isSub);
    $("date-label").innerHTML = (isSub ? "Дата на първото посещение" : "Предпочитана дата") + ' <span class="req">*</span>';
    $("rooms-label").textContent = val("property") === "office" ? "Брой помещения" : "Брой стаи";
    $("invoice-block").classList.toggle("hidden", val("payment") !== "Банков път (фактура)");
  }

  // ---------- Текущ избор ----------
  function selection() {
    var isSub = val("mode") === "subscription";
    var extras = [];
    form.querySelectorAll('input[name="extra"]:checked').forEach(function (cb) {
      var x = C.extras[cb.value];
      var label = x.label;
      if (x.perUnit) {
        var q = form.querySelector('[name="qty_' + cb.value + '"]');
        label += " (" + Math.max(1, parseInt(q.value, 10) || 1) + " " + x.perUnit + ")";
      }
      extras.push(label);
    });
    return {
      isSub: isSub,
      area: parseFloat($("area").value) || 0,
      service: C.services[val("service")],
      plan: isSub ? C.plans[val("plan")] : null,
      extras: extras
    };
  }

  function render() {
    syncVisibility();
    var s = selection();
    var rows = [
      ["Тип", s.isSub ? "Абонамент" : "Еднократно"],
      ["Обект", val("property") === "office" ? "Офис" : "Дом"],
      ["Услуга", s.service.label],
      ["Площ", s.area ? s.area + " м²" : "—"]
    ];
    if (s.plan) {
      rows.push(["Честота", s.plan.label]);
      rows.push(["Отстъпка", "-" + Math.round(s.plan.discount * 100) + "%"]);
    }
    rows.push(["Допълнително", s.extras.length ? s.extras.join(", ") : "—"]);

    $("summary-list").innerHTML = rows.map(function (row) {
      return '<div class="row"><dt>' + row[0] + "</dt><dd>" + row[1] + "</dd></div>";
    }).join("");
  }

  form.addEventListener("input", render);
  form.addEventListener("change", render);
  render();

  // ---------- Валидация ----------
  function setInvalid(id, bad) {
    var field = $(id).closest(".field");
    field.classList.toggle("invalid", bad);
    return !bad;
  }

  function validate() {
    var ok = true;
    var area = parseFloat($("area").value);
    ok = setInvalid("area", !(area >= 10 && area <= 5000)) && ok;
    ok = setInvalid("date", !$("date").value || $("date").value < minDate) && ok;
    ok = setInvalid("address", $("address").value.trim().length < 5) && ok;
    ok = setInvalid("name", $("name").value.trim().length < 2) && ok;
    var phone = $("phone").value.replace(/[\s\-()]/g, "");
    ok = setInvalid("phone", !/^(\+?359|0)\d{8,9}$/.test(phone)) && ok;
    var email = $("email").value.trim();
    ok = setInvalid("email", email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) && ok;
    var consent = $("consent").checked;
    $("consent-wrap").classList.toggle("invalid", !consent);
    ok = consent && ok;
    return ok;
  }

  // ---------- Изпращане ----------
  function buildPayload() {
    var r = selection();
    var data = {
      "Тип": r.isSub ? "Абонамент" : "Еднократно",
      "Обект": val("property") === "office" ? "Офис" : "Дом",
      "Услуга": r.service.label,
      "Площ (м²)": r.area,
      "Стаи/помещения": $("rooms").value
    };
    if (r.plan) {
      data["Честота"] = r.plan.label;
      data["Предпочитан ден"] = $("weekday").value;
    }
    data["Допълнителни услуги"] = r.extras.length ? r.extras.join(", ") : "няма";
    data[r.isSub ? "Първо посещение" : "Дата"] = $("date").value;
    data["Час"] = $("time").value;
    data["Адрес"] = $("address").value.trim();
    data["Име"] = $("name").value.trim();
    data["Телефон"] = $("phone").value.trim();
    data["Имейл"] = $("email").value.trim() || "—";
    data["Плащане"] = val("payment");
    if (val("payment") === "Банков път (фактура)") {
      data["Фирма"] = $("company").value.trim() || "—";
      data["ЕИК"] = $("eik").value.trim() || "—";
    }
    data["Бележки"] = $("notes").value.trim() || "—";
    return data;
  }

  function showSuccess(viaMail) {
    form.classList.add("hidden");
    if (viaMail) {
      $("success-text").textContent =
        "Отворихме имейл с данните от заявката — моля, изпратете го. Ако нищо не се е отворило, обадете ни се на " + C.phone + ".";
    }
    $("success").classList.remove("hidden");
    $("success").scrollIntoView({ behavior: "smooth", block: "center" });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    $("form-error").classList.add("hidden");

    if (!validate()) {
      var firstBad = form.querySelector(".invalid");
      if (firstBad) firstBad.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (form.querySelector('[name="_gotcha"]').value) return; // спам бот

    var data = buildPayload();
    var subject = "Нова заявка: " + data["Тип"] + " — " + data["Услуга"] + " (" + data["Име"] + ")";

    if (!C.formEndpoint) {
      var body = Object.keys(data).map(function (k) { return k + ": " + data[k]; }).join("\n");
      location.href = "mailto:" + C.email +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
      showSuccess(true);
      return;
    }

    var btn = $("submit-btn");
    btn.disabled = true;
    btn.textContent = "Изпращане…";
    data._subject = subject;
    if ($("email").value.trim()) data._replyto = $("email").value.trim();

    fetch(C.formEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data)
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        showSuccess(false);
      })
      .catch(function () {
        var err = $("form-error");
        err.textContent = "Възникна грешка при изпращането. Моля, опитайте отново или ни се обадете на " + C.phone + ".";
        err.classList.remove("hidden");
        btn.disabled = false;
        btn.textContent = "Изпрати заявката";
      });
  });
})();
