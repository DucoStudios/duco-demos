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

  var isFr = document.documentElement.lang === "fr";
  var T = isFr ? {
    invalid: "Veuillez saisir une adresse e-mail valide.", sending: "Envoi…", sent: "Envoyé", send: "Envoyer",
    ok: "Merci. Nous vous recontactons d’ici quelques jours pour fixer un rendez-vous.",
    rate: "Trop de tentatives. Patientez un instant et réessayez.",
    fail: "L’envoi n’a pas fonctionné. ", mail: "Écrivez-nous plutôt par e-mail",
    lines: ["Nom: ", "E-mail: ", "Lieu: ", "Logements: ", "Annonce/site: "], source: "ducobook-sida-fr"
  } : {
    invalid: "Please enter a valid email address.", sending: "Sending…", sent: "Sent", send: "Send",
    ok: "Thank you. We’ll be in touch within a couple of days to book a time.",
    rate: "Too many attempts. Please wait a moment and try again.",
    fail: "We couldn’t send that just now. ", mail: "Email us instead",
    lines: ["Name: ", "Email: ", "Location: ", "Properties: ", "Listing/site: "], source: "ducobook-sida-en"
  };
  var fmt = isFr
    ? function (n) { return Math.round(n).toLocaleString("fr-FR") + " €"; }
    : function (n) { return "€" + Math.round(n).toLocaleString("en-GB"); };
  var num = function (id) { var el = document.getElementById(id); var v = el ? parseFloat(el.value) : 0; return isFinite(v) && v > 0 ? v : 0; };
  function calc() {
    var tot = num("c-int") * Math.min(num("c-pct"), 100) / 100;
    document.getElementById("c-tot").textContent = fmt(tot);
    document.getElementById("c-save").textContent = fmt(tot * Math.min(num("c-dir"), 100) / 100);
  }
  if (document.getElementById("calc")) {
    ["c-int", "c-pct", "c-dir"].forEach(function (id) { document.getElementById(id).addEventListener("input", calc); });
    calc();
  }

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
    function mailto(data) {
      var body = [T.lines[0] + (data.namn || ""), T.lines[1] + data.email, T.lines[2] + (data.ort || ""), T.lines[3] + (data.antal || ""), T.lines[4] + (data.meddelande || "")].join("\n");
      return "mailto:david@ducostudios.com?subject=" + encodeURIComponent("DucoBook demo") + "&body=" + encodeURIComponent(body);
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var email = form.email.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showStatus(T.invalid, "error");
        form.email.focus();
        return;
      }
      submit.disabled = true;
      submitLabel.textContent = T.sending;
      showStatus("");
      var payload = { konto: "webb", magnet: "ducobook-demo", email: email, kalla: T.source };
      ["namn", "ort", "antal", "meddelande", "webbplats"].forEach(function (k) { var v = form[k] && form[k].value.trim(); if (v) payload[k] = v; });
      fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        .then(function (response) {
          if (response.status === 429) throw new Error("rate");
          if (!response.ok) throw new Error("fail");
          form.reset();
          submitLabel.textContent = T.sent;
          showStatus(T.ok, "ok");
        })
        .catch(function (error) {
          submitLabel.textContent = T.send;
          if (error.message === "rate") { showStatus(T.rate, "error"); return; }
          status.className = "form-status error";
          status.innerHTML = "";
          status.appendChild(document.createTextNode(T.fail));
          var a = document.createElement("a"); a.href = mailto(payload); a.textContent = T.mail; a.style.textDecoration = "underline";
          status.appendChild(a);
        })
        .finally(function () { submit.disabled = false; });
    });
  }
})();
