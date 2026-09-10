/* Minimal line-icon set, injected into <span data-icon="name"> elements.
   Keeps markup clean without an external icon font / CDN dependency. */
(function(){
  var s = 'stroke="currentColor" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  var ICONS = {
    logo: '<svg viewBox="0 0 68 28" fill="none" stroke="currentColor" stroke-width="3.3" stroke-linecap="round"><path d="M3 10C16-7 27 24 49 14c7-3 10-6 15-10M3 20C17 5 28 34 53 21c5-3 8-5 11-8"/></svg>',
    menu: '<svg viewBox="0 0 24 24" '+s+'><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" '+s+'><path d="M6 6l12 12M18 6L6 18"/></svg>',
    bed: '<svg viewBox="0 0 24 24" '+s+'><path d="M4 10V4h16v6M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8M2 16h20M5 20v-4M19 20v-4"/><rect x="6" y="6" width="5" height="4" rx="1"/><rect x="13" y="6" width="5" height="4" rx="1"/></svg>',
    restaurant: '<svg viewBox="0 0 24 24" '+s+'><path d="M7 3v7a2 2 0 0 0 2 2v9"/><path d="M7 3v5M10 3v5"/><path d="M17 3c-1.5 0-2 2-2 4s.7 3 2 3v11"/></svg>',
    mask: '<svg viewBox="0 0 24 24" '+s+'><path d="M4 9c0-3 3-5 8-5s8 2 8 5-2 6-4 6c-1.5 0-2-1.5-4-1.5S9.5 15 8 15c-2 0-4-3-4-6Z"/><path d="M4 9H2M20 9h2"/></svg>',
    scuba: '<svg viewBox="0 0 24 24" '+s+'><rect x="3" y="6" width="7" height="15" rx="2"/><rect x="14" y="6" width="7" height="15" rx="2"/><path d="M6.5 6V2M17.5 6V2M4 2h5M15 2h5M3 17h7M14 17h7"/></svg>',
    bike: '<svg viewBox="0 0 24 24" '+s+'><circle cx="6" cy="17" r="3.2"/><circle cx="18" cy="17" r="3.2"/><path d="M6 17l4-9h4l3 6"/><path d="M10 8h3M9 17h6l-3-6"/></svg>',
    transfer: '<svg viewBox="0 0 24 24" '+s+'><path d="M4 16V9a2 2 0 0 1 2-2h9l4 4v5"/><circle cx="8" cy="17" r="1.6"/><circle cx="17" cy="17" r="1.6"/><path d="M4 16h2M15 16h1M4 12h11"/></svg>',
    pin: '<svg viewBox="0 0 24 24" '+s+'><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.3"/></svg>',
    tray: '<svg viewBox="0 0 24 24" '+s+'><path d="M3 17a9 9 0 0 1 18 0H3ZM2 21h20M12 8V4M10 4h4"/></svg>',
    doc: '<svg viewBox="0 0 24 24" '+s+'><path d="M7 3h7l4 4v14H7Z"/><path d="M14 3v4h4"/><path d="M9.5 13h5M9.5 16.5h5"/></svg>',
    phone: '<svg viewBox="0 0 24 24" '+s+'><path d="M6 3h3l2 5-2.5 1.5a11 11 0 0 0 5 5L15 12l5 2v3a2 2 0 0 1-2 2C10 19 5 14 4 6a2 2 0 0 1 2-2Z"/></svg>',
    'phone-alert': '<svg viewBox="0 0 24 24" '+s+'><path d="M6 3h3l2 5-2.5 1.5a11 11 0 0 0 5 5L15 12l5 2v3a2 2 0 0 1-2 2C10 19 5 14 4 6a2 2 0 0 1 2-2Z"/><path d="M19 3v4M19 9.2v.1"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18.2a8.1 8.1 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.6.1s-.7.8-.8.9-.3.2-.5.1a6.6 6.6 0 0 1-2-1.2 7.4 7.4 0 0 1-1.4-1.7c-.1-.2 0-.4.1-.5l.4-.4.3-.4a.5.5 0 0 0 0-.5c-.1-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.6 1.1 2.8s1.8 2.7 4.3 3.8a10 10 0 0 0 1.5.5 3.6 3.6 0 0 0 1.6.1 2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .1-1.2c-.1-.1-.2-.2-.4-.3Z"/></svg>',
    'chevron-right': '<svg viewBox="0 0 24 24" '+s+'><path d="M9 6l6 6-6 6"/></svg>',
    'arrow-right': '<svg viewBox="0 0 24 24" '+s+'><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    clock: '<svg viewBox="0 0 24 24" '+s+'><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
    wifi: '<svg viewBox="0 0 24 24" '+s+'><path d="M2 8.5a16 16 0 0 1 20 0"/><path d="M5.3 12.3a11 11 0 0 1 13.4 0"/><path d="M8.6 16a6 6 0 0 1 6.8 0"/><circle cx="12" cy="19" r="1"/></svg>',
    broom: '<svg viewBox="0 0 24 24" '+s+'><path d="M20 4 10 14"/><path d="M9 13l2 2-5 6-3-3Z"/><path d="M9 13c-1-2-1-4 1-6l4 4c-2 2-4 2-5 2Z"/></svg>',
    towel: '<svg viewBox="0 0 24 24" '+s+'><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 9h16M9 3v6"/></svg>',
    laundry: '<svg viewBox="0 0 24 24" '+s+'><rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="13" r="4.5"/><circle cx="8" cy="6" r=".6" fill="currentColor" stroke="none"/><circle cx="11" cy="6" r=".6" fill="currentColor" stroke="none"/></svg>',
    luggage: '<svg viewBox="0 0 24 24" '+s+'><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M9 8V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3"/><path d="M9 12v4M15 12v4"/></svg>',
    sun: '<svg viewBox="0 0 24 24" '+s+'><circle cx="12" cy="12" r="4.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/></svg>',
    fish: '<svg viewBox="0 0 24 24" '+s+'><path d="M4 12c4-5 12-6 17 0-5 6-13 5-17 0Z"/><circle cx="15.5" cy="10.5" r=".6" fill="currentColor" stroke="none"/><path d="M4 12 1 9m3 3-3 3"/></svg>',
    shop: '<svg viewBox="0 0 24 24" '+s+'><path d="M4 8l1-4h14l1 4"/><path d="M4 8h16v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8Z"/><path d="M9 12a3 3 0 0 0 6 0"/></svg>',
    atm: '<svg viewBox="0 0 24 24" '+s+'><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><circle cx="8" cy="14.5" r="1"/><path d="M13 14h5"/></svg>',
    hospital: '<svg viewBox="0 0 24 24" '+s+'><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M12 8v8M8 12h8"/></svg>',
    pharmacy: '<svg viewBox="0 0 24 24" '+s+'><path d="M7 21 17 11a3.5 3.5 0 0 0-5-5L2 16v5h5Z"/><path d="M10.5 8.5l5 5"/></svg>',
    airport: '<svg viewBox="0 0 24 24" '+s+'><path d="M2 16l20-6-2-2-8 2-5-4-2 1 3 5-5 1.4Z"/><path d="M4 21h16"/></svg>',
    boat: '<svg viewBox="0 0 24 24" '+s+'><path d="M3 15h18l-2 4a2 2 0 0 1-1.8 1.1H6.8A2 2 0 0 1 5 19Z"/><path d="M6 15V6h5l4 4"/><path d="M2 20c2 1 4 1 6 0s4-1 6 0 4 1 6 0"/></svg>',
    warning: '<svg viewBox="0 0 24 24" '+s+'><path d="M12 3 2 20h20Z"/><path d="M12 10v4M12 17v.1"/></svg>',
    check: '<svg viewBox="0 0 24 24" '+s+'><path d="M5 13l4 4 10-10"/></svg>',
    star: '<svg viewBox="0 0 24 24" '+s+'><path d="M12 3l2.6 5.9 6.4.6-4.8 4.3 1.4 6.2L12 17l-5.6 3 1.4-6.2L3 9.5l6.4-.6Z"/></svg>',
    'arrow-up': '<svg viewBox="0 0 24 24" '+s+'><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
    globe: '<svg viewBox="0 0 24 24" '+s+'><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" '+s+'><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" '+s+'><path d="M14 9h3V6h-3a3 3 0 0 0-3 3v2H9v3h2v7h3v-7h3l1-3h-4V9Z"/></svg>',
    building: '<svg viewBox="0 0 24 24" '+s+'><rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M10 21v-4h4v4"/></svg>',
    binoculars: '<svg viewBox="0 0 24 24" '+s+'><path d="M9 10V6a2 2 0 1 0-4 0v2M9 10h2m2 0h2M9 10a2.5 2.5 0 1 0 0 6 2.5 2.5 0 0 0 0-6Zm6 0a2.5 2.5 0 1 0 0 6 2.5 2.5 0 0 0 0-6ZM15 10V6a2 2 0 1 1 4 0v2"/></svg>',
    users: '<svg viewBox="0 0 24 24" '+s+'><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 6.5a3 3 0 0 1 0 5.9M21 20c0-2.6-1.9-4.8-4.5-5.5"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" '+s+'><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>'
  };
  window.COZY_ICONS = ICONS;
  function inject(root){
    (root || document).querySelectorAll('[data-icon]').forEach(function(el){
      var name = el.getAttribute('data-icon');
      if (ICONS[name]) el.innerHTML = ICONS[name];
    });
  }
  window.COZY_ICONS_INJECT = inject;
  document.addEventListener('DOMContentLoaded', function(){ inject(document); });
})();
