document.addEventListener("DOMContentLoaded", () => {
  // 1. Theme Toggle Logic
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const htmlRoot = document.documentElement;

  const savedTheme = localStorage.getItem("lamastudio_theme") || "dark";
  htmlRoot.setAttribute("data-theme", savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const currentTheme = htmlRoot.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      htmlRoot.setAttribute("data-theme", newTheme);
      localStorage.setItem("lamastudio_theme", newTheme);
    });
  }

  // 2. Sidebar Navigation Drawer Logic
  const menuToggleBtn = document.getElementById("menuToggleBtn");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");

  if (menuToggleBtn && sidebarOverlay && sidebarCloseBtn) {
    menuToggleBtn.addEventListener("click", () => sidebarOverlay.classList.add("is-open"));
    sidebarCloseBtn.addEventListener("click", () => sidebarOverlay.classList.remove("is-open"));

    sidebarOverlay.addEventListener("click", (e) => {
      if (e.target === sidebarOverlay) sidebarOverlay.classList.remove("is-open");
    });

    sidebarOverlay.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => sidebarOverlay.classList.remove("is-open"));
    });
  }

  // 3. Category Filter Strip Logic
  const categoryTrack = document.getElementById("categoryTrack");
  if (categoryTrack) {
    const catPills = categoryTrack.querySelectorAll(".cat-pill");
    const appCards = document.querySelectorAll(".app-card");
    const blogCards = document.querySelectorAll(".blog-card");

    catPills.forEach(pill => {
      pill.addEventListener("click", () => {
        catPills.forEach(p => p.classList.remove("is-active"));
        pill.classList.add("is-active");

        const filterValue = pill.getAttribute("data-filter");

        appCards.forEach(card => {
          const cardCat = card.getAttribute("data-category");
          card.classList.toggle("is-hidden", filterValue !== "all" && cardCat !== filterValue);
        });

        blogCards.forEach(card => {
          const cardCat = card.getAttribute("data-category");
          card.classList.toggle("is-hidden", filterValue !== "all" && cardCat !== filterValue);
        });
      });
    });
  }

  // 4. Advanced Quick-View Modal Logic
  const modalOverlay = document.getElementById("modalOverlay");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const modalCloseAction = document.getElementById("modalCloseAction");
  const modalPrimaryBtn = document.getElementById("modalPrimaryBtn");
  
  const modalIcon = document.getElementById("modalIcon");
  const modalTitle = document.getElementById("modalTitle");
  const modalDesc = document.getElementById("modalDesc");
  const modalPrice = document.getElementById("modalPrice");

  document.querySelectorAll(".open-modal-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const card = e.target.closest(".app-card, .blog-card");
      if (!card) return;

      const title = card.getAttribute("data-title");
      const desc = card.getAttribute("data-desc");
      const price = card.getAttribute("data-price");
      const icon = card.querySelector(".app-icon, .blog-thumb")?.textContent || "✨";
      const cardStyleColor = card.style.getPropertyValue("--pc") || "var(--c-tech)";

      if (modalTitle) modalTitle.textContent = title;
      if (modalDesc) modalDesc.textContent = desc;
      if (modalPrice) modalPrice.textContent = price;
      if (modalIcon) modalIcon.textContent = icon;

      const modalBox = modalOverlay?.querySelector(".modal-box");
      if (modalBox) modalBox.style.setProperty("--pc", cardStyleColor);

      if (modalOverlay) modalOverlay.classList.add("is-open");
    });
  });

  const closeModal = () => modalOverlay?.classList.remove("is-open");

  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
  if (modalCloseAction) modalCloseAction.addEventListener("click", closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  if (modalPrimaryBtn) {
    modalPrimaryBtn.addEventListener("click", () => {
      alert("Redirecting to secure access destination...");
      closeModal();
    });
  }
});
