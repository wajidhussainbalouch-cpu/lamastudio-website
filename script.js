(function () {
  "use strict";

  // Theme Toggle
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

  // Sidebar Controls
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

  // App Data with Specified Color Themes and Categories
  var apps = [
    { 
      id: 'vpn', name: 'LamaVPN Pro', cat: 'tech', type: 'apps', icon: '🛡️', 
      tag: 'Tech & Security', desc: 'WireGuard VPN client with advanced encrypted storage.', 
      price: 'Free / Pro PKR 500/mo', mobileHref: '#', pcHref: '#'
    },
    { 
      id: 'sky', name: 'LamaSky Forecast', cat: 'weather', type: 'apps', icon: '🌤️', 
      tag: 'Weather Forecast', desc: 'Accurate local weather and atmospheric metrics.', 
      price: 'Free Ad-Supported', mobileHref: '#', pcHref: '#'
    },
    { 
      id: 'iq', name: 'LamaIQ Master', cat: 'education', type: 'software', icon: '🧠', 
      tag: 'Education', desc: 'Bilingual cognitive training and quiz platform.', 
      price: 'Freemium (PKR 300)', mobileHref: '#', pcHref: '#'
    },
    { 
      id: 'cal', name: 'Lama MultiCalendar', cat: 'business', type: 'apps', icon: '📅', 
      tag: 'Business', desc: 'Gregorian, Hijri, and Nanakshahi productivity calendar.', 
      price: '100% Free', mobileHref: '#', pcHref: '#'
    },
    { 
      id: 'photo', name: 'Lama Photo Resizer', cat: 'fashion', type: 'software', icon: '🖼️', 
      tag: 'Fashion & Style', desc: 'Optimized photo asset editing for style showcases.', 
      price: 'Free / Pro Tier PKR 400', mobileHref: '#', pcHref: '#'
    }
  ];

  var posts = [
    { cat: 'tech', icon: '⚙️', title: 'On-Device AI on Budget Phones', excerpt: 'The case for local-first processing.', time: '6 min read' },
    { cat: 'business', icon: '💳', title: 'Local Payment Rails in Pakistan', excerpt: 'EasyPaisa and Raast integration guides.', time: '5 min read' },
    { cat: 'education', icon: '🎓', title: 'Modern EdTech Frameworks', excerpt: 'Tools designed for modern classrooms.', time: '7 min read' },
    { cat: 'health', icon: '💚', title: 'Sustainable Habit Tracking', excerpt: 'Designing consistency without burnout.', time: '4 min read' },
    { cat: 'travel', icon: '✈️', title: 'Navigating Local Tourism Apps', excerpt: 'Building location utilities for road trips.', time: '5 min read' },
    { cat: 'sports', icon: '⚽', title: 'Sports Analytics on Mobile', excerpt: 'Real-time match updates made lightweight.', time: '6 min read' },
    { cat: 'news', icon: '📰', title: 'Fast RSS Aggregation', excerpt: 'Delivering breaking news cleanly.', time: '4 min read' },
    { cat: 'fashion', icon: '👗', title: 'E-Commerce UX Optimization', excerpt: 'Mobile-first layout strategies.', time: '5 min read' }
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

  // Render Blogs
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

  // Top Category Filter Logic
  var pills = Array.prototype.slice.call(document.querySelectorAll('.cat-pill'));
  var appFilterNote = document.getElementById('appFilterNote');
  var appFilterLabel = document.getElementById('appFilterLabel');

  function applyFilter(cat) {
    if (!appGrid || !blogGrid) return;
    var appCards = appGrid.querySelectorAll('.app-card');
    var blogCards = blogGrid.querySelectorAll('.blog-card');

    appCards.forEach(function (c) { c.classList.toggle('is-hidden', cat !== 'all' && c.dataset.cat !== cat); });
    blogCards.forEach(function (c) { c.classList.toggle('is-hidden', cat !== 'all' && c.dataset.cat !== cat); });

    var showNote = cat !== 'all';
    if (appFilterNote) appFilterNote.hidden = !showNote;
    if (showNote && appFilterLabel) {
      appFilterLabel.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    }

    pills.forEach(function (p) {
      p.classList.toggle('is-active', p.dataset.cat === cat);
    });
  }

  pills.forEach(function (p) {
    p.addEventListener('click', function () { applyFilter(p.dataset.cat); });
  });

  var appClear = document.getElementById('appFilterClear');
  if (appClear) appClear.addEventListener('click', function () { applyFilter('all'); });

  // Modal Functionality
  var overlay = document.getElementById('modalOverlay');
  var modalBox = document.getElementById('modalBox');
  var modalIcon = document.getElementById('modalIcon');
  var modalTag = document.getElementById('modalTag');
  var modalTitle = document.getElementById('modalTitle');
  var modalDesc = document.getElementById('modalDesc');
  var modalPrice = document.getElementById('modalPrice');
  var modalMobileBtn = document.getElementById('modalMobileBtn');
  var modalPcBtn = document.getElementById('modalPcBtn');

  function openModal(app) {
    modalBox.style.setProperty('--pc', 'var(--c-' + app.cat + ')');
    modalIcon.textContent = app.icon;
    modalTag.textContent = app.tag;
    modalTitle.textContent = app.name;
    modalDesc.textContent = app.desc;
    modalPrice.textContent = app.price;
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  var modalCloseBtn = document.getElementById('modalClose');
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (overlay) {
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
  }
})();
