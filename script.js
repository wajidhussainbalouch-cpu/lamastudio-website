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

  // NOTE: Dynamic app and blog injection loops have been completely removed. 
  // All elements are now cleanly and statically managed directly inside index.html.
})();
