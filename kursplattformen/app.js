(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  var header = document.querySelector(".site-header");

  function updateHeader() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 10);
  }
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  var menu = document.getElementById("mobile-menu");
  var menuButton = document.querySelector(".menu-button");
  var menuClose = document.querySelector(".menu-close");
  if (menu && menuButton && typeof menu.showModal === "function") {
    menuButton.addEventListener("click", function () {
      menu.showModal();
      document.body.classList.add("menu-open");
    });
    function closeMenu() {
      menu.close();
      document.body.classList.remove("menu-open");
    }
    if (menuClose) menuClose.addEventListener("click", closeMenu);
    menu.querySelectorAll("a").forEach(function (link) { link.addEventListener("click", closeMenu); });
  }

  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var revealGroups = new Map();
  reveals.forEach(function (element) {
    var parent = element.parentElement;
    var index = revealGroups.get(parent) || 0;
    element.style.setProperty("--delay", Math.min(index * 70, 210) + "ms");
    revealGroups.set(parent, index + 1);
  });

  if (!reduceMotion && "IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.11, rootMargin: "0px 0px -7% 0px" });
    reveals.forEach(function (element) { revealObserver.observe(element); });
  } else {
    reveals.forEach(function (element) { element.classList.add("visible"); });
  }

  var animatedElements = document.querySelectorAll(".progress-card, .journey-track, .company-dashboard");
  if (!reduceMotion && "IntersectionObserver" in window) {
    var animationObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("animated");
        animationObserver.unobserve(entry.target);
      });
    }, { threshold: 0.3 });
    animatedElements.forEach(function (element) { animationObserver.observe(element); });
  } else {
    animatedElements.forEach(function (element) { element.classList.add("animated"); });
  }

  var stage = document.querySelector("[data-parallax-stage]");
  if (stage && !reduceMotion && !coarsePointer) {
    var layers = stage.querySelectorAll("[data-parallax]");
    var frame = null;
    stage.addEventListener("pointermove", function (event) {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(function () {
        var bounds = stage.getBoundingClientRect();
        var x = (event.clientX - bounds.left) / bounds.width - 0.5;
        var y = (event.clientY - bounds.top) / bounds.height - 0.5;
        layers.forEach(function (layer) {
          var depth = Number(layer.getAttribute("data-parallax")) || 0.5;
          layer.style.translate = (x * depth * 12).toFixed(2) + "px " + (y * depth * 9).toFixed(2) + "px";
        });
      });
    });
    stage.addEventListener("pointerleave", function () {
      layers.forEach(function (layer) {
        layer.style.transition = "translate 600ms cubic-bezier(.2,.75,.25,1)";
        layer.style.translate = "0 0";
        window.setTimeout(function () { layer.style.transition = ""; }, 620);
      });
    });
  }

  var tabs = Array.prototype.slice.call(document.querySelectorAll(".showcase-tab"));
  var panels = Array.prototype.slice.call(document.querySelectorAll(".showcase-panel"));
  function activatePanel(name, focus) {
    tabs.forEach(function (tab) {
      var active = tab.getAttribute("data-panel") === name;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });
    panels.forEach(function (panel) {
      var active = panel.getAttribute("data-panel") === name;
      panel.hidden = !active;
      panel.classList.toggle("active", active);
      if (active) {
        panel.classList.remove("entering");
        void panel.offsetWidth;
        panel.classList.add("entering");
      }
    });
  }
  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () { activatePanel(tab.getAttribute("data-panel"), false); });
    tab.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      var next = event.key === "ArrowRight" ? (index + 1) % tabs.length : (index - 1 + tabs.length) % tabs.length;
      activatePanel(tabs[next].getAttribute("data-panel"), true);
    });
  });

  var billingButtons = Array.prototype.slice.call(document.querySelectorAll("[data-billing]"));
  var priceValues = Array.prototype.slice.call(document.querySelectorAll(".price-number strong[data-monthly]"));
  function setBilling(period) {
    var yearly = period === "yearly";
    billingButtons.forEach(function (button) {
      var active = button.getAttribute("data-billing") === period;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    priceValues.forEach(function (value) {
      var price = value.getAttribute(yearly ? "data-yearly" : "data-monthly");
      var card = value.closest(".price-card");
      var periodLabel = card.querySelector("[data-period]");
      var equivalent = card.querySelector("[data-equivalent]");
      value.animate([{ opacity: .25, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }], { duration: reduceMotion ? 1 : 280, easing: "ease-out" });
      value.textContent = price;
      periodLabel.textContent = yearly ? "/ år" : "/ månad";
      equivalent.hidden = !yearly;
    });
  }
  billingButtons.forEach(function (button) {
    button.addEventListener("click", function () { setBilling(button.getAttribute("data-billing")); });
  });

  var API = "https://portal.ducomaison.fr/api/list/subscribe";
  var form = document.getElementById("anmalan");
  var status = document.getElementById("status");
  if (form && status) {
    var submit = form.querySelector("button[type=submit]");
    var submitLabel = submit.querySelector(".btn-label");
    function showStatus(message, type) {
      status.textContent = message;
      status.className = "form-status " + (type || "");
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var email = form.email.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showStatus("Skriv en giltig e-postadress.", "error");
        form.email.focus();
        return;
      }
      if (!form.samtycke.checked) {
        showStatus("Kryssa i rutan så att vi får mejla dig när vi öppnar.", "error");
        return;
      }
      submit.disabled = true;
      submitLabel.textContent = "Skickar…";
      showStatus("");
      var payload = {
        konto: "kursplattform",
        magnet: "kursplattform-vantelista",
        email: email,
        samtycke: true,
        kalla: "kursplattformen-sida"
      };
      if (form.namn.value.trim()) payload.namn = form.namn.value.trim();
      if (form.saljer.value.trim()) payload.meddelande = form.saljer.value.trim();
      if (form.webbplats.value) payload.webbplats = form.webbplats.value;

      fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(function (response) {
        if (response.status === 429) throw new Error("För många försök. Vänta en stund och försök igen.");
        if (!response.ok) throw new Error("Något gick fel. Försök igen om en stund.");
        form.reset();
        submitLabel.textContent = "Du står på listan";
        showStatus("Tack. Vi hör av oss när det är din tur.", "ok");
      }).catch(function (error) {
        submitLabel.textContent = "Skriv upp mig";
        showStatus(error.message || "Något gick fel. Försök igen om en stund.", "error");
      }).finally(function () {
        submit.disabled = false;
      });
    });
  }
})();
