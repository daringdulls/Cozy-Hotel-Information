/* Renders QR codes into elements with [data-qr] using the vendored
   qrcode-generator library (assets/js/qrcode.lib.js, MIT licensed).
   Encodes the current origin + given path, so codes are always correct
   locally, in preview, and once deployed — no hardcoded domain. */
(function(){
  function render(){
    document.querySelectorAll('[data-qr]').forEach(function(el){
      var path = el.getAttribute('data-qr');
      var url = new URL(path, window.location.href).href;
      var cellSize = parseInt(el.getAttribute('data-qr-size') || '6', 10);
      var qr = qrcode(0, 'M');
      qr.addData(url);
      qr.make();
      el.innerHTML = qr.createSvgTag({ cellSize: cellSize, margin: 2, scalable: true });
      var svg = el.querySelector('svg');
      if (svg) { svg.style.width = '100%'; svg.style.height = '100%'; svg.style.display = 'block'; }
      var urlOut = el.parentElement && el.parentElement.querySelector('[data-qr-url]');
      if (urlOut) urlOut.textContent = url;
    });
  }
  document.addEventListener('DOMContentLoaded', render);
})();
