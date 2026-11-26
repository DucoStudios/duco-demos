(() => {
  const PRIS = 680, ANDEL = 0.3;
  const input = document.getElementById("per-ar");
  const ut = document.getElementById("per-ar-ut");
  const rader = document.getElementById("calc-rows");
  const kr = (n) => Math.round(n).toLocaleString("sv-SE") + " kr";
  const rita = () => {
    const n = Number(input.value);
    ut.textContent = n;
    rader.innerHTML = [1, 2, 3].map((ar) => {
      const kunder = n * ar;
      return `<div class="calc-row"><span>År ${ar}</span><b>${kr(kunder * PRIS * ANDEL * 12)}</b><small>${kunder} betalande kunder, ${kr(kunder * PRIS * ANDEL)} i månaden</small></div>`;
    }).join("");
  };
  input.addEventListener("input", rita);
  rita();
})();
