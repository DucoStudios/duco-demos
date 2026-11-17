(function () {
  // Sektioner tonar in när de kommer in i bild.
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("syns");
        io.unobserve(e.target);
        // Domänexemplet blir grönt och företagets staplar fylls när de syns.
        if (e.target.classList.contains("domain-demo")) setTimeout(function () { e.target.classList.add("done"); }, 1400);
        if (e.target.classList.contains("co-mock")) e.target.querySelectorAll(".pbar i").forEach(function (i) { i.style.width = i.dataset.w; });
      });
    }, { threshold: 0.18 });
    document.querySelectorAll(".co-mock .pbar i").forEach(function (i) { i.dataset.w = i.style.width; i.style.width = "0"; });
    items.forEach(function (s) { io.observe(s); });
  } else {
    items.forEach(function (s) { s.classList.add("syns"); });
  }

  var nav = document.querySelector(".nav");
  window.addEventListener("scroll", function () { nav.classList.toggle("scrolled", window.scrollY > 10); }, { passive: true });

  // Kön går till CRM:et (underkonto kursplattform).
  var API = "https://portal.ducomaison.fr/api/list/subscribe";
  var form = document.getElementById("anmalan");
  var status = document.getElementById("status");
  function visa(text, typ) { status.textContent = text; status.className = "status " + (typ || ""); }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = form.email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { visa("Skriv en giltig e-postadress.", "fel"); return; }
    if (!form.samtycke.checked) { visa("Kryssa i rutan så att vi får mejla dig när vi öppnar.", "fel"); return; }
    var knapp = form.querySelector("button");
    knapp.disabled = true;
    visa("Skickar...");
    var data = { konto: "kursplattform", magnet: "kursplattform-vantelista", email: email, samtycke: true, kalla: "kursplattformen-sida" };
    var namn = form.namn.value.trim();
    if (namn) data.namn = namn;
    var saljer = form.saljer.value.trim();
    if (saljer) data.meddelande = saljer;
    if (form.webbplats.value) data.webbplats = form.webbplats.value;
    fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
      .then(function (r) {
        if (r.status === 429) throw new Error("För många försök. Vänta en stund och försök igen.");
        if (!r.ok) throw new Error("Något gick fel. Försök igen om en stund.");
        form.reset();
        visa("Klart! Du står i kön. Vi hör av oss när det är din tur.", "ok");
      })
      .catch(function (err) { visa(err.message || "Något gick fel. Försök igen om en stund.", "fel"); })
      .finally(function () { knapp.disabled = false; });
  });
})();
