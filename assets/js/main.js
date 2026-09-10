(function(){
  // Mobile quick-nav drawer
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.quick-nav');
  var closeBtn = document.querySelector('.quick-nav-close');
  function open(){ nav && nav.classList.add('open'); }
  function close(){ nav && nav.classList.remove('open'); }
  toggle && toggle.addEventListener('click', open);
  closeBtn && closeBtn.addEventListener('click', close);
  nav && nav.addEventListener('click', function(e){ if (e.target === nav) close(); });
  nav && nav.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', close); });

  // Back to top
  var toTop = document.querySelector('.to-top');
  if (toTop){
    window.addEventListener('scroll', function(){
      toTop.classList.toggle('show', window.scrollY > 500);
    }, { passive: true });
    toTop.addEventListener('click', function(){
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
