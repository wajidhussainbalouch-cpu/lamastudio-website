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

  // 2. Sidebar & Mobile Navigation Functionality (Merged from nav.js)
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

    // Toggle drawer on button click
    menuToggle.addEventListener('click', function () {
      var isOpen = sidebarOverlay.classList.contains('is-open');
      if (isOpen) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });

    // Close on backdrop overlay click
    sidebarOverlay.addEventListener('click', function (e) {
      if (e.target === sidebarOverlay) {
        closeSidebar();
      }
    });

    // Close on 'X' button click
    if (sidebarClose) {
      sidebarClose.addEventListener('click', closeSidebar);
    }

    // Close on Escape key press
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sidebarOverlay.classList.contains('is-open')) {
        closeSidebar();
      }
    });

    // Close automatically when any link inside the sidebar menu is clicked
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

// 4. Blog Articles Data with unique URLs
  var posts = [
    { cat: 'tech', icon: '💻', title: 'Building Robust Mobile Software in 2026', excerpt: 'Deep dive into modern developer tools, framework patterns, and efficient coding workflows for independent studios.', time: '6 min read', url: 'blog/building-robust-mobile-software-in-2026/' },
    { cat: 'business', icon: '💳', title: 'Local Payment Rails Are the New Table Stakes for Pakistani Apps', excerpt: 'EasyPaisa, JazzCash, and Raast aren’t optional add-ons anymore — they’re how most of your users expect to pay.', time: '5 min read', url: 'blog/local-payment-rails/' },
    { cat: 'education', icon: '🎓', title: 'What EdTech Gets Wrong About Pakistani Classrooms', excerpt: 'Most education apps are built for a device, connection, and curriculum that doesn’t match the average government-school classroom.', time: '7 min read', url: 'blog/edtech-pakistani-classrooms/' },
    { cat: 'health', icon: '💚', title: 'Building Habit Apps That Don’t Guilt-Trip Users', excerpt: 'Streaks and shame notifications drive short-term engagement and long-term uninstalls. There’s a better way to design for consistency.', time: '4 min read', url: 'blog/building-habit-apps/' },
    { cat: 'fashion', icon: '👗', title: 'Designing for Small Screens: Lessons from Fashion E-Commerce', excerpt: 'What clothing marketplaces get right about product photography, sizing charts, and thumb-friendly checkout.', time: '5 min read', url: 'blog/fashion-ecommerce/' },
    { cat: 'weather', icon: '🌦️', title: 'Why Weather Apps Feel Unreliable in South Asia', excerpt: 'Sparse ground stations and coarse forecast models mean most weather apps are guessing more than users realize.', time: '6 min read', url: 'blog/weather-apps-south-asia/' },
    { cat: 'sports', icon: '⚽', title: 'Local Sports Fan Engagement on Budget Handsets', excerpt: 'How lightweight tracking engines keep users connected during live matches.', time: '5 min read', url: 'blog/local-sports-engagement/' },
    { cat: 'news', icon: '📰', title: 'Delivering Low-Bandwidth News Feeds Effectively', excerpt: 'Optimizing payload sizes for intermittent regional internet coverage.', time: '4 min read', url: 'blog/low-bandwidth-news/' },
    { cat: 'travel', icon: '✈️', title: 'Building Tourism Guides for Northern Pakistan', excerpt: 'Offline map caches and localized trail references for remote mountain areas.', time: '6 min read', url: 'blog/tourism-northern-pakistan/' }
  ];

  // 6. Render Blog Posts Grid as clickable anchors
  var blogGrid = document.getElementById('blogGrid');
  if (blogGrid) {
    posts.forEach(function (post) {
      var card = document.createElement('a');
      card.href = post.url;
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

  // 6. Render Blog Posts Grid as clickable anchors
  var blogGrid = document.getElementById('blogGrid');
  if (blogGrid) {
    posts.forEach(function (post) {
      var card = document.createElement('a');
      card.href = post.url;
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
  // 5. Render Apps Grid (Links directly to subfolder apps/)
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

  // 6. Render Blog Posts Grid
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
})();
