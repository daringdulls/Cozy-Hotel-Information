(function () {
  var dialog = document.querySelector('.gallery-dialog');
  var items = Array.from(document.querySelectorAll('.gallery-photo'));
  if (!dialog || !items.length) return;
  var index = 0, opener;
  function showPhoto(next) {
    index = (next + items.length) % items.length;
    var source = items[index].querySelector('img');
    var caption = items[index].querySelector('[data-field]').textContent;
    var image = dialog.querySelector('.gallery-full-image');
    image.src = source.currentSrc || source.src;
    image.alt = caption;
    dialog.querySelector('#gallery-dialog-caption').textContent = caption;
    dialog.querySelector('.gallery-count').textContent = (index + 1) + ' / ' + items.length;
  }
  items.forEach(function (item, n) {
    item.addEventListener('click', function () { opener = item; showPhoto(n); dialog.showModal(); });
  });
  dialog.querySelector('.gallery-close').addEventListener('click', function () { dialog.close(); });
  dialog.querySelector('.gallery-prev').addEventListener('click', function () { showPhoto(index - 1); });
  dialog.querySelector('.gallery-next').addEventListener('click', function () { showPhoto(index + 1); });
  dialog.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); showPhoto(index + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); showPhoto(index - 1); }
  });
  dialog.addEventListener('click', function (e) {
    var box = dialog.getBoundingClientRect();
    if (e.target === dialog && (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom)) dialog.close();
  });
  dialog.addEventListener('close', function () { if (opener) opener.focus(); });
})();
