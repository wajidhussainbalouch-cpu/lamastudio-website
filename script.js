(function () {
  "use strict";

  // Theme Toggle Functionality
  var root = document.documentElement;
  var themeToggle = document.getElementById('themeToggle');
  var savedTheme = localStorage.getItem('lama-theme');
  if (savedTheme) root.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      localStorage.setItem('lama-theme', next);
    });
  }

  // Sidebar Toggle Functionality
  var menuToggle = document.getElementById('menuToggle');
  var sidebarOverlay = document.getElementById('sidebarOverlay');
  var sidebarClose = document.getElementById('sidebarClose');

  function openSidebar() {
    sidebarOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeSidebar() {
    sidebarOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (menuToggle) menuToggle.addEventListener('click', openSidebar);
  if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', function (e) {
      if (e.target === sidebarOverlay) closeSidebar();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sidebarOverlay && sidebarOverlay.classList.contains('is-open')) closeSidebar();
  });

  // Quick-View Modal References & Logic
  var overlay = document.getElementById('modalOverlay');
  var modalBox = document.getElementById('modalBox');
  var modalIcon = document.getElementById('modalIcon');
  var modalTag = document.getElementById('modalTag');
  var modalTitle = document.getElementById('modalTitle');
  var modalDesc = document.getElementById('modalDesc');
  var modalPrice = document.getElementById('modalPrice');
  var modalMobileBtn = document.getElementById('modalMobileBtn');
  var modalPcBtn = document.getElementById('modalPcBtn');
  var lastFocused = null;

  function openModal(app) {
    lastFocused = document.activeElement;
    if (modalBox) modalBox.style.setProperty('--pc', 'var(--c-' + app.cat + ')');
    if (modalIcon) {
      modalIcon.textContent = app.icon;
      modalIcon.style.background = 'color-mix(in srgb, var(--c-' + app.cat + ') 14%, transparent)';
      modalIcon.style.borderColor = 'color-mix(in srgb, var(--c-' + app.cat + ') 40%, transparent)';
    }
    if (modalTag) {
      modalTag.textContent = app.tag;
      modalTag.style.color = 'var(--c-' + app.cat + ')';
    }
    if (modalTitle) modalTitle.textContent = app.name;
    if (modalDesc) modalDesc.textContent = app.desc;
    if (modalPrice) {
      modalPrice.textContent = app.price;
      modalPrice.style.color = 'var(--c-' + app.cat + ')';
    }
    
    if (modalMobileBtn) {
      modalMobileBtn.href = app.mobileHref;
      modalMobileBtn.style.background = 'var(--c-' + app.cat + ')';
      modalMobileBtn.style.borderColor = 'var(--c-' + app.cat + ')';
      modalMobileBtn.style.color = '#07090e';
    }

    if (modalPcBtn) modalPcBtn.href = app.pcHref;

    if (overlay) overlay.classList.add('is-open');
    var closeBtn = document.getElementById('modalClose');
    if (closeBtn) closeBtn.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (overlay) overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  var modalCloseBtn = document.getElementById('modalClose');
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (overlay) {
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && overlay && overlay.classList.contains('is-open')) closeModal(); });

  // App Ecosystem Data
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
      mobileHref: 'apps/lamavpnpro/index.html',
      pcHref: 'apps/lamavpnpro/index.html'
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
      mobileHref: 'apps/lamasky/index.html',
      pcHref: 'apps/lamasky/index.html'
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
      mobileHref: 'apps/lamaiqmaster/index.html',
      pcHref: 'apps/lamaiqmaster/index.html'
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
      mobileHref: 'apps/lamamulticalendar/index.html',
      pcHref: 'apps/lamamulticalendar/index.html'
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
      mobileHref: 'apps/lamaphotoresizer/index.html',
      pcHref: 'apps/lamaphotoresizer/index.html'
    }
  ];

  // Blog Articles Data
  var posts = [
    { cat: 'tech', icon: '💻', title: 'Building Robust Mobile Software in 2026', excerpt: 'Deep dive into modern developer tools, framework patterns, and efficient coding workflows for independent studios.', time: '6 min read' },
    { cat: 'business', icon: '💳', title: 'Local Payment Rails Are the New Table Stakes for Pakistani Apps', excerpt: 'EasyPaisa, JazzCash, and Raast aren’t optional add-ons anymore — they’re how most of your users expect to pay.', time: '5 min read' },
    { cat: 'education', icon: '🎓', title: 'What EdTech Gets Wrong About Pakistani Classrooms', excerpt: 'Most education apps are built for a device, connection, and curriculum that doesn’t match the average government-school classroom.', time: '7 min read' },
    { cat: 'health', icon: '💚', title: 'Building Habit Apps That Don’t Guilt-Trip Users', excerpt: 'Streaks and shame notifications drive short-term engagement and long-term uninstalls. There’s a better way to design for consistency.', time: '4 min read' },
    { cat: 'fashion', icon: '👗', title: 'Designing for Small Screens: Lessons from Fashion E-Commerce', excerpt: 'What clothing marketplaces get right about product photography, sizing charts, and thumb-friendly checkout.', time: '5 min read' },
    { cat: 'weather', icon: '🌦️', title: 'Why Weather Apps Feel Unreliable in South Asia', excerpt: 'Sparse ground stations and coarse forecast models mean most weather apps are guessing more than users realize.', time: '6 min read' },
    { cat: 'sports', icon: '⚽', title: 'Local Sports Fan Engagement on Budget Handsets', excerpt: 'How lightweight tracking engines keep users connected during live matches.', time: '5 min read' },
    { cat: 'news', icon: '📰', title: 'Delivering Low-Bandwidth News Feeds Effectively', excerpt: 'Optimizing payload sizes for intermittent regional internet coverage.', time: '4 min read' },
    { cat: 'travel', icon: '✈️', title: 'Building Tourism Guides for Northern Pakistan', excerpt: 'Offline map caches and localized trail references.', time: '6 min read' }
  ];

  var tickerHeadlines = [
    { tag: 'BIZ', text: 'Raast adoption keeps climbing among small merchant apps' },
    { tag: 'EDU', text: 'Offline-first tools remain the biggest unlock for rural classrooms' },
    { tag: 'HEALTH', text: 'Habit-tracking apps are quietly dropping streak-shame mechanics' }
  ];

  // Render Apps
  var appGrid = document.getElementById('appGrid');
  if (appGrid) {
    apps.forEach(function (app) {
      var card = document.createElement('article');
      card.className = 'app-card';
      card.style.setProperty('--pc', 'var(--c-' + app.cat + ')');
      card.dataset.cat = app.cat;
      card.dataset.type = app.type;
      card.innerHTML =
        '<div class="app-icon">' + app.icon + '</div>' +
        '<div><span class="tag-pill">' + app.tag + '</span><h3>' + app.name + '</h3></div>' +
        '<p class="desc">' + app.desc + '</p>' +
        '<div class="card-actions"><button type="button" class="btn-action"><span>View Details</span></button></div>';
      card.addEventListener('click', function () { openModal(app); });
      appGrid.appendChild(card);
    });
  }

  // Render Blog Posts
  var blogGrid = document.getElementById('blogGrid');
  if (blogGrid) {
    posts.forEach(function (post) {
      var card = document.createElement('article');
      card.className = 'blog-card';
      card.style.setProperty('--pc', 'var(--c-' + post.cat + ')');
      card.dataset.cat = post.cat;
      card.innerHTML =
        '<div class="blog-thumb">' + post.icon + '</div>' +
        '<div class="blog-body">' +
          '<div class="blog-meta"><span class="tag-pill">' + post.cat + '</span><span class="read-time">' + post.time + '</span></div>' +
          '<h3>' + post.title + '</h3>' +
          '<p>' + post.excerpt + '</p>' +
          '<span class="read-link">Read article →</span>' +
        '</div>';
      blogGrid.appendChild(card);
    });
  }

  // Render Ticker
  var tickerTrack = document.getElementById('tickerTrack');
  if (tickerTrack) {
    function tickerHTML() {
      return tickerHeadlines.map(function (h) {
        return '<span class="ticker-item"><span class="tag">' + h.tag + '</span>' + h.text + '</span>';
      }).join('');
    }
    tickerTrack.innerHTML = tickerHTML() + tickerHTML();
  }

  // Top Category Filter Functionality
  var pills = Array.prototype.slice.call(document.querySelectorAll('.cat-pill'));
  var appFilterNote = document.getElementById('appFilterNote');
  var appFilterLabel = document.getElementById('appFilterLabel');
  var blogFilterNote = document.getElementById('blogFilterNote');
  var blogFilterLabel = document.getElementById('blogFilterLabel');

  function applyFilter(cat) {
    if (!appGrid || !blogGrid) return;
    var appCards = appGrid.querySelectorAll('.app-card');
    var blogCards = blogGrid.querySelectorAll('.blog-card');

    appCards.forEach(function (c) { c.classList.toggle('is-hidden', c.dataset.cat !== cat); });
    blogCards.forEach(function (c) { c.classList.toggle('is-hidden', c.dataset.cat !== cat); });

    if (appFilterNote) appFilterNote.hidden = false;
    if (blogFilterNote) blogFilterNote.hidden = false;
    
    var label = cat.charAt(0).toUpperCase() + cat.slice(1);
    if (appFilterLabel) appFilterLabel.textContent = label;
    if (blogFilterLabel) blogFilterLabel.textContent = label;

    pills.forEach(function (p) {
      p.classList.toggle('is-active', p.dataset.cat === cat);
    });
  }

  pills.forEach(function (p) {
    p.addEventListener('click', function () { applyFilter(p.dataset.cat); });
  });

  // Sidebar Filter Links for Apps vs Software
  var sidebarFilterLinks = document.querySelectorAll('.sidebar-filter-link');
  sidebarFilterLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var targetType = link.dataset.type;
      
      var appCards = appGrid.querySelectorAll('.app-card');
      appCards.forEach(function (c) {
        c.classList.toggle('is-hidden', c.dataset.type !== targetType);
      });

      if (appFilterNote) appFilterNote.hidden = false;
      if (appFilterLabel) appFilterLabel.textContent = targetType === 'apps' ? 'Mobile Apps' : 'Desktop Software';
      
      closeSidebar();
    });
  });

  var appClear = document.getElementById('appFilterClear');
  var blogClear = document.getElementById('blogFilterClear');
  if (appClear) {
    appClear.addEventListener('click', function () {
      var appCards = appGrid.querySelectorAll('.app-card');
      appCards.forEach(function (c) { c.classList.remove('is-hidden'); });
      if (appFilterNote) appFilterNote.hidden = true;
    });
  }
  if (blogClear) {
    blogClear.addEventListener('click', function () {
      var blogCards = blogGrid.querySelectorAll('.blog-card');
      blogCards.forEach(function (c) { c.classList.remove('is-hidden'); });
      if (blogFilterNote) blogFilterNote.hidden = true;
      pills.forEach(function (p) { p.classList.remove('is-active'); });
    });
  }

  // Animate Stat Counters
  var counted = false;
  var counters = document.querySelectorAll('[data-count]');
  function animateCounters() {
    if (counted) return;
    counted = true;
    counters.forEach(function (el) {
      var target = parseInt(el.dataset.count, 10);
      var start = 0;
      var duration = 900;
      var startTime = null;
      function step(ts) {
        if (!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        el.textContent = Math.floor(progress * (target - start) + start);
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  var statsSection = document.querySelector('.stats-grid');
  if ('IntersectionObserver' in window && statsSection) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) animateCounters(); });
    }, { threshold: 0.4 });
    io.observe(statsSection);
  } else {
    animateCounters();
  }
})();
