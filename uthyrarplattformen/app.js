(function () {
  var fmt = function (n) { return Math.round(n).toLocaleString("sv-SE").replace(/ /g, " ") + " €"; };
  var get = function (id) { var v = parseFloat(document.getElementById(id).value); return isFinite(v) && v > 0 ? v : 0; };
  function calc() {
    var tot = get("c-int") * Math.min(get("c-pct"), 100) / 100;
    document.getElementById("c-tot").textContent = fmt(tot);
    document.getElementById("c-save").textContent = fmt(tot * Math.min(get("c-dir"), 100) / 100);
  }
  ["c-int", "c-pct", "c-dir"].forEach(function (id) { document.getElementById(id).addEventListener("input", calc); });
  calc();
})();
