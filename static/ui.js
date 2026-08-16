// ui.js - menu, theme toggle, ripple
document.addEventListener('DOMContentLoaded', ()=>{
  const menuBtn = document.querySelector('.menu-toggle');
  const nav = document.getElementById('main-nav');

  if(menuBtn && nav){
    menuBtn.addEventListener('click', ()=>{
      const open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // close on route click (mobile)
    nav.addEventListener('click', (e)=>{
      const link = e.target.closest('a');
      if(link && nav.classList.contains('open')){
        nav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const themeBtn = document.querySelector('.btn-theme');
  themeBtn && themeBtn.addEventListener('click', ()=>{
    const dark = document.body.classList.toggle('mode-sombre');
    themeBtn.setAttribute('aria-pressed', dark ? 'true' : 'false');
  });

  // pointer ripple for interactive elements
  document.addEventListener('pointerdown', (e)=>{
    const btn = e.target.closest('.btn, .tile.interactive, .nav-link');
    if(!btn) return;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = (e.clientX - rect.left) + 'px';
    ripple.style.top  = (e.clientY - rect.top) + 'px';
    const size = Math.max(rect.width, rect.height) * 0.2;
    ripple.style.width = ripple.style.height = size + 'px';
    btn.appendChild(ripple);
    setTimeout(()=> ripple.remove(), 700);
  }, {passive:true});

});
