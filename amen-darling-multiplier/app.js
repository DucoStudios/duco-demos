(function () {
  var body = document.body;
  var portar = document.getElementById('portar');
  var sigill = document.getElementById('sigill');
  var stang = document.getElementById('stang');
  var spar = document.querySelector('.rad-spar');
  var stegtext = document.getElementById('stegtext');

  // Sigillets ojämna vaxkant, ritad som en cirkel med små vågor
  function vaxkant() {
    var pts = [], n = 120, lober = 26;
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2;
      var r = 46 + Math.sin(a * lober) * 1.1 + Math.sin(a * 7 + 1.3) * 1.4 + Math.sin(a * 3) * 0.8;
      pts.push((50 + Math.cos(a) * r).toFixed(2) + ',' + (50 + Math.sin(a) * r).toFixed(2));
    }
    return 'M' + pts.join('L') + 'Z';
  }
  var d = vaxkant();
  document.getElementById('kant').setAttribute('d', d);
  document.getElementById('kant2').setAttribute('d', d);

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function oppna() {
    if (portar.classList.contains('oppnar')) return;
    portar.classList.add('oppnar');
    portar.setAttribute('aria-hidden', 'true');
    window.scrollTo(0, 0);
    setTimeout(function () {
      portar.classList.add('borta');
      body.classList.remove('last');
      start();
    }, reduced ? 1100 : 2500);
  }

  function stangDorrar() {
    portar.classList.remove('borta');
    // tvinga omflöde så att övergången körs baklänges
    void portar.offsetWidth;
    portar.classList.remove('oppnar');
    portar.setAttribute('aria-hidden', 'false');
    body.classList.add('last');
    window.scrollTo(0, 0);
  }

  sigill.addEventListener('click', oppna);
  stang.addEventListener('click', stangDorrar);

  // Framträdande vid scroll + följarlist
  var rvEls = document.querySelectorAll('.prolog .num,.prolog h2,.prolog .lede,.kort .top,.kort h3,.kort p,.kort li,.kort .stortal,.rakna,.finale h2,.tre div,.mitt > *');
  rvEls.forEach(function (el) { el.classList.add('rv'); });

  var observerStarted = false;
  function start() {
    if (observerStarted) return;
    observerStarted = true;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    rvEls.forEach(function (el) { io.observe(el); });

    var etiketter = [
      { el: document.querySelector('.hero'), t: 'Prolog', p: 0 },
      { el: document.querySelector('.prolog'), t: 'Idén', p: 0.1 }
    ];
    document.querySelectorAll('.kort').forEach(function (k, i) {
      etiketter.push({ el: k, t: k.getAttribute('data-steg'), p: 0.2 + i * 0.13 });
    });
    etiketter.push({ el: document.getElementById('finale'), t: 'Slutsats', p: 0.9 });
    etiketter.push({ el: document.querySelector('.avslut'), t: 'Din tur', p: 1 });

    function uppdatera() {
      var mitt = window.innerHeight * 0.55, valt = etiketter[0];
      etiketter.forEach(function (x) {
        if (x.el.getBoundingClientRect().top < mitt) valt = x;
      });
      stegtext.textContent = valt.t;
      spar.style.setProperty('--p', valt.p);
    }
    window.addEventListener('scroll', uppdatera, { passive: true });
    uppdatera();
  }
})();
