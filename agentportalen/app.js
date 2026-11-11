(function () {
  // Slagorden tonar in när en sektion kommer in i bild.
  var scener = document.querySelectorAll(".scen");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (poster) {
      poster.forEach(function (p) { if (p.isIntersecting) { p.target.classList.add("syns"); io.unobserve(p.target); } });
    }, { threshold: 0.25 });
    scener.forEach(function (s) { io.observe(s); });
  } else {
    scener.forEach(function (s) { s.classList.add("syns"); });
  }

  // Väntelistan går till CRM:et (underkonto agentportal).
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
    knapp.disabled = true; visa("Skickar...");
    var data = { konto: "agentportal", magnet: "agentportal-vantelista", email: email, samtycke: true, kalla: "agentportalen-sida" };
    var namn = form.namn.value.trim();
    if (namn) data.namn = namn;
    if (form.webbplats.value) data.webbplats = form.webbplats.value;
    fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
      .then(function (r) {
        if (r.status === 429) throw new Error("För många försök. Vänta en stund och prova igen.");
        if (!r.ok) throw new Error("Något gick fel. Prova igen om en stund.");
        form.reset();
        visa("Klart! Du står i kön. Vi hör av oss när det är din tur.", "ok");
      })
      .catch(function (err) { visa(err.message || "Något gick fel. Prova igen om en stund.", "fel"); })
      .finally(function () { knapp.disabled = false; });
  });
})();
