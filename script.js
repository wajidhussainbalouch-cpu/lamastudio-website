// LamaStudio — Clean Front-End Behaviour
(function () {
  "use strict";

  var root = document.documentElement;

  /* ---------------- Theme Toggle ---------------- */
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

  var themeToggleBtn = document.getElementById("themeToggleBtn");
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", function () {
      var current = root.getAttribute("data-theme") || "dark";
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }

  /* ---------------- Sidebar Drawer Navigation ---------------- */
  var menuToggleBtn = document.getElementById("menuToggleBtn");
  var sidebarOverlay = document.getElementById("sidebarOverlay");
  var sidebarCloseBtn = document.getElementById("sidebarCloseBtn");

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

  if (menuToggleBtn) menuToggleBtn.addEventListener("click", openSidebar);
  if (sidebarCloseBtn) sidebarCloseBtn.addEventListener("click", closeSidebar);
  
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", function (e) {
      if (e.target === sidebarOverlay) closeSidebar();
    });
  }

  /* ---------------- Quick View Modal ---------------- */
  var modalOverlay = document.getElementById("modalOverlay");
  var modalCloseBtnElement = document.getElementById("modalCloseBtn");
  var modalCloseAction = document.getElementById("modalCloseAction");
  var modalIcon = document.getElementById("modalIcon");
  var modalTitle = document.getElementById("modalTitle");
  var modalDesc = document.getElementById("modalDesc");
  var modalPrice = document.getElementById("modalPrice");
  var modalPrimaryBtn = document.getElementById("modalPrimaryBtn");

  function openModal(card) {
    if (!modalOverlay || !card) return;

    var icon = card.querySelector(".app-icon");
    var title = card.getAttribute("data-title");
    var desc = card.getAttribute("data-desc");
    var price = card.getAttribute("data-price");
    var actionLink = card.querySelector(".card-actions a.btn-action");

    if (modalIcon) modalIcon.textContent = icon ? icon.textContent : "✨";
    if (modalTitle) modalTitle.textContent = title || "App Details";
    if (modalDesc) modalDesc.textContent = desc || "";
    if (modalPrice) modalPrice.textContent = price || "Free";
    
    if (modalPrimaryBtn && actionLink) {
      modalPrimaryBtn.onclick = function () {
        window.location.href = actionLink.getAttribute("href");
      };
    }

    modalOverlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".open-modal-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var card = btn.closest(".app-card");
      openModal(card);
    });
  });

  if (modalCloseBtnElement) modalCloseBtnElement.addEventListener("click", closeModal);
  if (modalCloseAction) modalCloseAction.addEventListener("click", closeModal);
  
  if (modalOverlay) {
    modalOverlay.addEventListener("click", function (e) {
      if (e.target === modalOverlay) closeModal();
    });
  }

  /* ---------------- Global Keyboard Shortcuts ---------------- */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeSidebar();
      closeModal();
    }
  });

})();
