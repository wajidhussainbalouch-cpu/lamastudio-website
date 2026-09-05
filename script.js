document.addEventListener("DOMContentLoaded", () => {
  // ---------------------------------------------------------
  // 1. Mobile Sidebar Navigation Drawer Toggle
  // ---------------------------------------------------------
  const menuToggle = document.getElementById("menuToggle");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const sidebarClose = document.getElementById("sidebarClose");

  function openSidebar() {
    if (sidebarOverlay) sidebarOverlay.classList.add("is-open");
  }

  function closeSidebar() {
    if (sidebarOverlay) sidebarOverlay.classList.remove("is-open");
  }

  if (menuToggle) menuToggle.addEventListener("click", openSidebar);
  if (sidebarClose) sidebarClose.addEventListener("click", closeSidebar);
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", (e) => {
      if (e.target === sidebarOverlay) closeSidebar();
    });
  }

  // ---------------------------------------------------------
  // 2. Dark / Light Theme Switcher
  // ---------------------------------------------------------
  const themeToggle = document.getElementById("themeToggle");
  const htmlRoot = document.documentElement;

  // Check for saved user preference
  const savedTheme = localStorage.getItem("lamastudio_theme") || "dark";
  htmlRoot.setAttribute("data-theme", savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentTheme = htmlRoot.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      htmlRoot.setAttribute("data-theme", newTheme);
      localStorage.setItem("lamastudio_theme", newTheme);
    });
  }

  // ---------------------------------------------------------
  // 3. Category Filter Strip Logic (Fixes Stuck Filtering)
  // ---------------------------------------------------------
  const filterPills = document.querySelectorAll(".cat-pill");
  const appCards = document.querySelectorAll(".app-card");

  filterPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      // Remove active state from all pills
      filterPills.forEach((p) => p.classList.remove("is-active"));
      pill.classList.add("is-active");

      const filterValue = pill.getAttribute("data-filter");

      appCards.forEach((card) => {
        const cardCategory = card.getAttribute("data-category");
        if (filterValue === "all" || cardCategory === filterValue) {
          card.classList.remove("is-hidden");
        } else {
          card.classList.add("is-hidden");
        }
      });
    });
  });

  // ---------------------------------------------------------
  // 4. Quick-View Modal Popup Handler
  // ---------------------------------------------------------
  const modalOverlay = document.getElementById("modalOverlay");
  const modalClose = document.getElementById("modalClose");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const quickViewBtns = document.querySelectorAll(".quick-view-btn");

  const modalTitle = document.getElementById("modalTitle");
  const modalDesc = document.getElementById("modalDesc");
  const modalPrice = document.getElementById("modalPrice");
  const modalCategory = document.getElementById("modalCategory");
  const modalIcon = document.getElementById("modalIcon");
  const modalActionLink = document.getElementById("modalActionLink");

  function openModal(data) {
    if (!modalOverlay) return;
    if (modalTitle) modalTitle.textContent = data.title;
    if (modalDesc) modalDesc.textContent = data.desc;
    if (modalPrice) modalPrice.textContent = data.price;
    if (modalCategory) modalCategory.textContent = data.category;
    
    modalOverlay.classList.add("is-open");
  }

  function closeModal() {
    if (modalOverlay) modalOverlay.classList.remove("is-open");
  }

  quickViewBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".app-card");
      const iconText = card ? card.querySelector(".app-icon").textContent : "📦";
      
      openModal({
        title: btn.getAttribute("data-title"),
        desc: btn.getAttribute("data-desc"),
        price: btn.getAttribute("data-price"),
        category: btn.getAttribute("data-category"),
        icon: iconText
      });
    });
  });

  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }
});
