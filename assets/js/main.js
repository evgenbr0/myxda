/* ============================================================
   myxda.ru — интерактив
   Журнал о мобильной разработке. Чистый JS без зависимостей.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Год ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Шапка + кнопка «наверх» ---------- */
  var hdr = document.getElementById("hdr");
  var toTop = document.getElementById("toTop");
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (hdr) hdr.classList.toggle("is-scrolled", y > 8);
    if (toTop) {
      var show = y > 700;
      toTop.classList.toggle("is-visible", show);
      toTop.hidden = !show;
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  /* ---------- Мобильное меню с управлением фокусом ---------- */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  var mainEl = document.getElementById("main");
  var footerEl = document.querySelector(".foot");
  var logoEl = document.querySelector(".hdr .logo");
  var supportsInert = "inert" in HTMLElement.prototype;
  var MENU_BP = 1024;

  function setInert(on) {
    [mainEl, footerEl, toTop, logoEl].forEach(function (el) {
      if (!el) return;
      if (on) { el.setAttribute("aria-hidden", "true"); if (supportsInert) el.inert = true; }
      else { el.removeAttribute("aria-hidden"); if (supportsInert) el.inert = false; }
    });
  }
  function isOpen() { return nav && nav.classList.contains("is-open"); }
  function openMenu() {
    nav.classList.add("is-open");
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Закрыть меню");
    document.body.classList.add("nav-open");
    setInert(true);
    var first = nav.querySelector(".nav__link");
    if (first) first.focus();
  }
  function closeMenu(returnFocus) {
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Открыть меню");
    document.body.classList.remove("nav-open");
    setInert(false);
    if (returnFocus) burger.focus();
  }
  if (burger && nav) {
    burger.addEventListener("click", function () { isOpen() ? closeMenu(true) : openMenu(); });
    nav.addEventListener("click", function (e) {
      if (e.target.closest(".nav__link, .nav__cta")) {
        closeMenu(false);
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) { closeMenu(true); return; }
      if (e.key === "Tab" && isOpen()) {
        var f = [burger].concat(Array.prototype.slice.call(nav.querySelectorAll("a, button")));
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > MENU_BP && isOpen()) closeMenu(false);
    });
  }

  /* ---------- Reveal по скроллу ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var sib = el.parentElement
            ? Array.prototype.filter.call(el.parentElement.children, function (n) { return n.classList && n.classList.contains("reveal"); })
            : [];
          var idx = sib.indexOf(el);
          el.style.transitionDelay = Math.min(idx < 0 ? 0 : idx, 6) * 70 + "ms";
          el.classList.add("is-visible");
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Фильтр статей по тегам ---------- */
  var artTabs = Array.prototype.slice.call(document.querySelectorAll(".filter__tab"));
  var artItems = Array.prototype.slice.call(document.querySelectorAll(".art"));
  var artStatus = document.getElementById("artStatus");
  if (artTabs.length && artItems.length) {
    artTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var cat = tab.getAttribute("data-cat");
        artTabs.forEach(function (t) {
          var active = t === tab;
          t.classList.toggle("is-active", active);
          t.setAttribute("aria-pressed", active ? "true" : "false");
        });
        var shown = 0;
        artItems.forEach(function (item) {
          var show = cat === "all" || item.getAttribute("data-cat") === cat;
          item.classList.toggle("is-hidden", !show);
          if (show) shown++;
        });
        if (artStatus) artStatus.textContent = "Показано материалов: " + shown + " — тема «" + tab.textContent.trim() + "».";
      });
    });
  }

  /* ---------- FAQ — открыт только один ---------- */
  var faqItems = Array.prototype.slice.call(document.querySelectorAll(".faq__item"));
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) faqItems.forEach(function (o) { if (o !== item) o.open = false; });
    });
  });

  /* ---------- Тост ---------- */
  var toast = document.getElementById("toast");
  var toastTimer = null;
  function showToast(msg, assertive) {
    if (!toast) return;
    toast.setAttribute("aria-live", assertive ? "assertive" : "polite");
    toast.textContent = msg;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-visible"); }, 3500);
  }

  /* ---------- Валидация формы (имя + e-mail + сообщение) ---------- */
  function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((v || "").trim()); }
  function markInvalid(input, invalid) {
    var field = input.closest(".field");
    if (field) field.classList.toggle("is-invalid", invalid);
    input.setAttribute("aria-invalid", invalid ? "true" : "false");
    var errId = input.getAttribute("aria-describedby");
    if (errId) {
      var err = document.getElementById(errId);
      if (err && invalid) {
        var msg = err.getAttribute("data-msg") || err.textContent;
        err.setAttribute("data-msg", msg);
        err.textContent = ""; err.textContent = msg;
      }
    }
  }

  var contactForm = document.getElementById("contactForm");
  var formSuccess = document.getElementById("formSuccess");
  function setFormInert(on) {
    if (!contactForm) return;
    Array.prototype.forEach.call(contactForm.children, function (c) {
      if (c === formSuccess) return;
      if (supportsInert) { c.inert = on; return; }
      if (on) c.setAttribute("aria-hidden", "true"); else c.removeAttribute("aria-hidden");
      Array.prototype.forEach.call(c.querySelectorAll("input, select, textarea, button, a"), function (el) {
        if (on) { el.setAttribute("data-was-tabbable", ""); el.setAttribute("tabindex", "-1"); }
        else if (el.hasAttribute("data-was-tabbable")) { el.removeAttribute("tabindex"); el.removeAttribute("data-was-tabbable"); }
      });
    });
  }
  if (contactForm) {
    var consentEl = contactForm.elements["consent"];
    var consentLabel = consentEl ? consentEl.closest(".consent") : null;
    contactForm.addEventListener("input", function (e) {
      if (e.target.closest && e.target.closest(".field")) markInvalid(e.target, false);
    });
    if (consentEl) {
      consentEl.addEventListener("change", function () {
        if (consentEl.checked && consentLabel) {
          consentLabel.classList.remove("is-invalid");
          consentEl.removeAttribute("aria-invalid");
        }
      });
    }
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = contactForm.elements["name"];
      var email = contactForm.elements["email"];
      var message = contactForm.elements["message"];
      var firstInvalid = null;
      var nameOk = !!name.value.trim();
      var emailOk = isValidEmail(email.value);
      var msgOk = message.value.trim().length >= 5;
      markInvalid(name, !nameOk); if (!nameOk && !firstInvalid) firstInvalid = name;
      markInvalid(email, !emailOk); if (!emailOk && !firstInvalid) firstInvalid = email;
      markInvalid(message, !msgOk); if (!msgOk && !firstInvalid) firstInvalid = message;

      if (firstInvalid) { firstInvalid.focus(); showToast("Проверьте обязательные поля", true); return; }
      if (consentEl && !consentEl.checked) {
        if (consentLabel) consentLabel.classList.add("is-invalid");
        consentEl.setAttribute("aria-invalid", "true");
        consentEl.focus();
        showToast("Подтвердите согласие на обработку данных", true);
        return;
      }
      if (formSuccess) {
        formSuccess.hidden = false;
        formSuccess.setAttribute("tabindex", "-1");
        setFormInert(true);
        formSuccess.focus();
        contactForm.reset();
        setTimeout(function () {
          formSuccess.hidden = true;
          setFormInert(false);
          if (formSuccess.contains(document.activeElement) && name) name.focus();
        }, 6000);
      }
      showToast("Спасибо! Ваше сообщение отправлено в редакцию.");
    });
  }

})();
