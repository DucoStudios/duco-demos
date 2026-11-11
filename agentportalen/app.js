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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { visa("Please enter a valid email address.", "fel"); return; }
    if (!form.samtycke.checked) { visa("Tick the box so we are allowed to email you when we open.", "fel"); return; }
    var knapp = form.querySelector("button");
    knapp.disabled = true; visa("Sending...");
    var data = { konto: "agentportal", magnet: "agentportal-vantelista", email: email, samtycke: true, kalla: "agentportalen-sida-en" };
    var namn = form.namn.value.trim();
    if (namn) data.namn = namn;
    if (form.webbplats.value) data.webbplats = form.webbplats.value;
    fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
      .then(function (r) {
        if (r.status === 429) throw new Error("Too many attempts. Wait a moment and try again.");
        if (!r.ok) throw new Error("Something went wrong. Please try again in a moment.");
        form.reset();
        visa("Done! You are in line. We will be in touch when it is your turn.", "ok");
      })
      .catch(function (err) { visa(err.message || "Something went wrong. Please try again in a moment.", "fel"); })
      .finally(function () { knapp.disabled = false; });
  });
})();
