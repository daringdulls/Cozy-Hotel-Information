(function () {
  var drawer = document.getElementById('guest-menu');
  var toggle = document.querySelector('.guide-menu-button');
  function close() { drawer.hidden = true; toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); }
  toggle.addEventListener('click', function () { drawer.hidden = !drawer.hidden; toggle.setAttribute('aria-expanded', String(!drawer.hidden)); if (!drawer.hidden) drawer.querySelector('button').focus(); });
  drawer.querySelector('.drawer-close').addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (drawer.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      var items = drawer.querySelectorAll('button,a'); var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  document.addEventListener('click', function (e) {
    if (!drawer.hidden && !drawer.contains(e.target) && !toggle.contains(e.target)) close();
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute('href').slice(1);
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;
    var detail = target.closest('details');
    if (detail) detail.open = true;
    if (drawer.contains(link)) close();
    requestAnimationFrame(function () { target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); });
  });
  function openHash() { var target = document.getElementById(location.hash.slice(1)); if (target) { var detail = target.closest('details'); if (detail) detail.open = true; } }
  openHash(); window.addEventListener('hashchange', openHash);
})();
