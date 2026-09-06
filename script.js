// LamaStudio — shared front-end behaviour
(function () {
  "use strict";

  var root = document.documentElement;

  /* ---------------- theme toggle ---------------- */
  var THEME_KEY = "lama-theme";
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
  }
  (function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    if (saved === "light" || saved === "dark") {
      applyTheme(saved);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      applyTheme("light");
    }
  })();
  var themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme") || "dark";
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }

  /* ---------------- sidebar drawer ---------------- */
  var menuToggle = document.getElementById("menuToggle");
  var sidebarOverlay = document.getElementById("sidebarOverlay");
  var sidebarClose = document.getElementById("sidebarClose");

  function openSidebar() {
    if (!sidebarOverlay) return;
    sidebarOverlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function closeSidebar() {
    if (!sidebarOverlay) return;
    sidebarOverlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  if (menuToggle) menuToggle.addEventListener("click", openSidebar);
  if (sidebarClose) sidebarClose.addEventListener("click", closeSidebar);
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", function (e) {
      if (e.target === sidebarOverlay) closeSidebar();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeSidebar(); closeSearch(); closeModal(); }
  });

  /* ---------------- search panel ---------------- */
  var searchToggle = document.getElementById("searchToggle");
  var searchPanel = document.getElementById("searchPanel");
  var searchInput = document.getElementById("searchInput");

  function openSearch() {
    if (!searchPanel) return;
    searchPanel.classList.add("is-open");
    if (searchInput) setTimeout(function () { searchInput.focus(); }, 50);
  }
  function closeSearch() {
    if (!searchPanel) return;
    searchPanel.classList.remove("is-open");
  }
  if (searchToggle) {
    searchToggle.addEventListener("click", function () {
      if (searchPanel.classList.contains("is-open")) closeSearch();
      else openSearch();
    });
  }

  var searchForm = document.getElementById("searchForm");
  if (searchForm) {
    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = (searchInput.value || "").trim().toLowerCase();
      if (!q) return;
      var cards = document.querySelectorAll("[data-search-name]");
      var match = null;
      cards.forEach(function (card) {
        var name = card.getAttribute("data-search-name").toLowerCase();
        if (!match && name.indexOf(q) !== -1) match = card;
      });
      if (match) {
        match.scrollIntoView({ behavior: "smooth", block: "center" });
        match.style.outline = "2px solid var(--brand-2)";
        setTimeout(function () { match.style.outline = ""; }, 1600);
        closeSearch();
      }
    });
  }

  /* ---------------- quick view modal ---------------- */
  var modalOverlay = document.getElementById("modalOverlay");
  var modalClose = document.getElementById("modalClose");
  var modalCloseBtn = document.getElementById("modalCloseBtn");
  var modalIcon = document.getElementById("modalIcon");
  var modalCategory = document.getElementById("modalCategory");
  var modalTitle = document.getElementById("modalTitle");
  var modalDesc = document.getElementById("modalDesc");
  var modalPrice = document.getElementById("modalPrice");
  var modalActionLink = document.getElementById("modalActionLink");

  function openModal(btn) {
    if (!modalOverlay) return;
    var card = btn.closest(".app-card");
    var icon = card ? card.querySelector(".app-icon") : null;
    var link = card ? card.querySelector(".card-actions a.btn-action") : null;
    if (modalIcon) modalIcon.textContent = icon ? icon.textContent : "🔷";
    if (modalCategory) modalCategory.textContent = btn.dataset.category || "";
    if (modalTitle) modalTitle.textContent = btn.dataset.title || "";
    if (modalDesc) modalDesc.textContent = btn.dataset.desc || "";
    if (modalPrice) modalPrice.textContent = btn.dataset.price || "";
    if (modalActionLink) modalActionLink.href = link ? link.getAttribute("href") : "#";
    modalOverlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  document.querySelectorAll(".quick-view-btn").forEach(function (btn) {
    btn.addEventListener("click", function () { openModal(btn); });
  });
  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener("click", function (e) {
      if (e.target === modalOverlay) closeModal();
    });
  }

  /* ---------------- category pill scroll-highlight (visual only, links navigate) ---------------- */
  var pills = document.querySelectorAll(".cat-pill[data-active-check]");
  var path = window.location.pathname.split("/").pop();
  pills.forEach(function (pill) {
    if (pill.getAttribute("data-active-check") === path) {
      pill.classList.add("is-active");
    }
  });
})();
