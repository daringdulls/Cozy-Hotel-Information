/* Printable QR codes always point to the stable production guest guides. */
(function(){
  function render(){
    document.querySelectorAll('[data-qr]').forEach(function(el){
      var path = el.getAttribute('data-qr');
      var url = new URL(path, 'https://cozy-hotel-information.vercel.app/').href;
      var cellSize = parseInt(el.getAttribute('data-qr-size') || '6', 10);
      var qr = qrcode(0, 'M');
      qr.addData(url);
      qr.make();
      el.innerHTML = qr.createSvgTag({ cellSize: cellSize, margin: cellSize * 4, scalable: true });
      var svg = el.querySelector('svg');
      if (svg) { svg.style.width = '100%'; svg.style.height = '100%'; svg.style.display = 'block'; }
      var urlOut = el.parentElement && el.parentElement.querySelector('[data-qr-url]');
      if (urlOut) urlOut.textContent = url;
      var download = el.parentElement.querySelector('[data-qr-download]');
      if (download && svg) { download.href = URL.createObjectURL(new Blob([svg.outerHTML], {type:'image/svg+xml'})); download.download = path.replace('.html', '-guest-guide-qr.svg'); }
    });
  }
  document.addEventListener('DOMContentLoaded', render);
})();
