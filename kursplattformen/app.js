(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Linje under menyn när man lämnat toppen.
  var top = document.querySelector(".top");
  function onScroll() { top.classList.toggle("scrolled", window.scrollY > 4); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobilmeny i en dialog.
  var sheet = document.getElementById("meny");
  var openBtn = document.querySelector(".menu-btn");
  if (sheet && openBtn && sheet.showModal) {
    openBtn.addEventListener("click", function () { sheet.showModal(); });
    sheet.querySelector(".menu-close").addEventListener("click", function () { sheet.close(); });
    sheet.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { sheet.close(); }); });
  }

  // Entréer: samma rörelse överallt, 60 ms förskjutning inom en grupp.
  var items = Array.prototype.slice.call(document.querySelectorAll(".in"));
  var groups = new Map();
  items.forEach(function (el) {
    var parent = el.parentElement;
    var i = groups.get(parent) || 0;
    el.style.setProperty("--d", i * 60 + "ms");
    groups.set(parent, i + 1);
  });
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("on");
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("on"); });
  }

  // Metoden: aktivt steg och förloppslinje följer kapitlet i bild.
  var chapters = document.querySelectorAll(".chapter");
  var steps = document.querySelectorAll(".steps li");
  var bar = document.querySelector(".progress i");
  function mark() {
    var line = window.innerHeight * 0.45;
    var active = 0;
    chapters.forEach(function (c, i) { if (c.getBoundingClientRect().top < line) active = i; });
    steps.forEach(function (s, i) { s.classList.toggle("on", i === active); });
    if (bar) bar.style.width = ((active + 1) / steps.length) * 100 + "%";
  }
  if (chapters.length) {
    window.addEventListener("scroll", mark, { passive: true });
    mark();
  }

  // Väntelistan går till CRM:et (underkonto kursplattform).
  var API = "https://portal.ducomaison.fr/api/list/subscribe";
  var form = document.getElementById("anmalan");
  var status = document.getElementById("status");
  var btn = form.querySelector("button");
  var label = btn.querySelector(".btn-label");
  function show(text, kind) { status.textContent = text; status.className = "status " + (kind || ""); }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = form.email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { show("Skriv en giltig e-postadress.", "fel"); form.email.focus(); return; }
    if (!form.samtycke.checked) { show("Kryssa i rutan så att vi får mejla dig när vi öppnar.", "fel"); return; }
    btn.disabled = true;
    label.textContent = "Skickar";
    show("");
    var data = { konto: "kursplattform", magnet: "kursplattform-vantelista", email: email, samtycke: true, kalla: "kursplattformen-sida" };
    if (form.namn.value.trim()) data.namn = form.namn.value.trim();
    if (form.saljer.value.trim()) data.meddelande = form.saljer.value.trim();
    if (form.webbplats.value) data.webbplats = form.webbplats.value;
    fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
      .then(function (r) {
        if (r.status === 429) throw new Error("För många försök. Vänta en stund och försök igen.");
        if (!r.ok) throw new Error("Något gick fel. Försök igen om en stund.");
        form.reset();
        label.textContent = "Du står på listan";
        show("Tack. Vi hör av oss när det är din tur.", "ok");
      })
      .catch(function (err) {
        label.textContent = "Skriv upp mig";
        show(err.message || "Något gick fel. Försök igen om en stund.", "fel");
      })
      .finally(function () { btn.disabled = false; });
  });
})();
