(function () {
  "use strict";

  // 1. Theme Toggle Functionality
  var root = document.documentElement;
  var themeToggle = document.getElementById('themeToggle');
  var savedTheme = localStorage.getItem('lama-theme');
  
  if (savedTheme) {
    root.setAttribute('data-theme', savedTheme);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      localStorage.setItem('lama-theme', next);
    });
  }

  // 2. Sidebar & Mobile Navigation Functionality
  document.addEventListener('DOMContentLoaded', function () {
    var menuToggle = document.getElementById('menuToggle') || document.querySelector('.nav-toggle');
    var sidebarOverlay = document.getElementById('sidebarOverlay');
    var sidebarClose = document.getElementById('sidebarClose');

    if (!menuToggle || !sidebarOverlay) return;

    function openSidebar() {
      sidebarOverlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      menuToggle.setAttribute('aria-expanded', 'true');
    }

    function closeSidebar() {
      sidebarOverlay.classList.remove('is-open');
      document.body.style.overflow = '';
      menuToggle.setAttribute('aria-expanded', 'false');
    }

    menuToggle.addEventListener('click', function () {
      var isOpen = sidebarOverlay.classList.contains('is-open');
      if (isOpen) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });

    sidebarOverlay.addEventListener('click', function (e) {
      if (e.target === sidebarOverlay) {
        closeSidebar();
      }
    });

    if (sidebarClose) {
      sidebarClose.addEventListener('click', closeSidebar);
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sidebarOverlay.classList.contains('is-open')) {
        closeSidebar();
      }
    });

    sidebarOverlay.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeSidebar);
    });
  });

  // 3. App Ecosystem Data with Subfolder Links
  var apps = [
    { 
      id: 'vpn', 
      name: 'LamaVPN Pro', 
      cat: 'business', 
      type: 'apps',
      icon: '🛡️', 
      tag: 'Privacy & Security', 
      desc: 'A full WireGuard VPN client with on-device key generation, Android Keystore-backed encrypted storage, and built-in DNS-leak protection.', 
      price: 'Free / Premium PKR 500/mo',
      url: 'apps/lamavpnpro/'
    },
    { 
      id: 'sky', 
      name: 'LamaSky', 
      cat: 'weather', 
      type: 'apps',
      icon: '🌤️', 
      tag: 'Weather & Planning', 
      desc: 'Local weather, prayer-aligned scheduling, and daily planning built around how Pakistani users structure their day.', 
      price: 'Free Ad-Supported',
      url: 'apps/lamasky/'
    },
    { 
      id: 'iq', 
      name: 'LamaIQMaster', 
      cat: 'education', 
      type: 'software',
      icon: '🧠', 
      tag: 'Cognitive Training', 
      desc: 'Adaptive cognitive training with a grade-based, bilingual question bank and server-hosted premium content.', 
      price: 'Freemium (PKR 300 unlock)',
      url: 'apps/lamaiqmaster/'
    },
    { 
      id: 'cal', 
      name: 'LamaMultiCalendar', 
      cat: 'business', 
      type: 'apps',
      icon: '📅', 
      tag: 'Productivity', 
      desc: 'Gregorian, Hijri (with Ruet-e-Hilal offset), and Nanakshahi dates side by side, with home-screen widgets.', 
      price: '100% Free',
      url: 'apps/lamamulticalendar/'
    },
    { 
      id: 'photo', 
      name: 'LamaPhotoResizer', 
      cat: 'fashion', 
      type: 'software',
      icon: '🖼️', 
      tag: 'Photo Tools', 
      desc: 'On-device AI subject segmentation for clean cutouts, with an optional cloud upgrade for harder backgrounds.', 
      price: 'Free / Pro Tier PKR 400',
      url: 'apps/lamaphotoresizer/'
    }
  ];

  // 5. Render Apps Grid
  var appGrid = document.getElementById('appGrid');
  if (appGrid) {
    apps.forEach(function (app) {
      var card = document.createElement('a');
      card.href = app.url;
      card.className = 'app-card';
      card.style.setProperty('--pc', 'var(--c-' + app.cat + ')');
      card.dataset.cat = app.cat;
      card.dataset.type = app.type;
      card.innerHTML =
        '<div class="app-icon">' + app.icon + '</div>' +
        '<div><span class="tag-pill">' + app.tag + '</span><h3>' + app.name + '</h3></div>' +
        '<p class="desc">' + app.desc + '</p>' +
        '<div class="card-actions"><span class="btn-action"><span>View App</span></span></div>';
      appGrid.appendChild(card);
    });
  }

  // NOTE: Section 6 (Blog Post dynamic injection) has been completely removed 
  // so that only the clean, hardcoded 12 connected blog cards from index.html show up.
})();
