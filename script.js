document.addEventListener("DOMContentLoaded", () => {
  // 1. Theme Toggle Logic
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const htmlRoot = document.documentElement;

  // Check saved preference or default to dark
  const savedTheme = localStorage.getItem("lamastudio_theme") || "dark";
  htmlRoot.setAttribute("data-theme", savedTheme);

  themeToggleBtn.addEventListener("click", () => {
    const currentTheme = htmlRoot.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    htmlRoot.setAttribute("data-theme", newTheme);
    localStorage.setItem("lamastudio_theme", newTheme);
  });

  // 2. Sidebar Navigation Drawer Logic
  const menuToggleBtn = document.getElementById("menuToggleBtn");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");

  menuToggleBtn.addEventListener("click", () => {
    sidebarOverlay.classList.add("is-open");
  });

  sidebarCloseBtn.addEventListener("click", () => {
    sidebarOverlay.classList.remove("is-open");
  });

  sidebarOverlay.addEventListener("click", (e) => {
    if (e.target === sidebarOverlay) {
      sidebarOverlay.classList.remove("is-open");
    }
  });

  // Close sidebar when clicking links inside it
  sidebarOverlay.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      sidebarOverlay.classList.remove("is-open");
    });
  });

  // 3. Category Filter Strip Logic
  const categoryTrack = document.getElementById("categoryTrack");
  const catPills = categoryTrack.querySelectorAll(".cat-pill");
  const appCards = document.querySelectorAll(".app-card");
  const blogCards = document.querySelectorAll(".blog-card");

  catPills.forEach(pill => {
    pill.addEventListener("click", () => {
      // Update active pill state
      catPills.forEach(p => p.classList.remove("is-active"));
      pill.classList.add("is-active");

      const filterValue = pill.getAttribute("data-filter");

      // Filter Applications
      appCards.forEach(card => {
        const cardCat = card.getAttribute("data-category");
        if (filterValue === "all" || cardCat === filterValue) {
          card.classList.remove("is-hidden");
        } else {
          card.classList.add("is-hidden");
        }
      });

      // Filter Blog Cards
      blogCards.forEach(card => {
        const cardCat = card.getAttribute("data-category");
        if (filterValue === "all" || cardCat === filterValue) {
          card.classList.remove("is-hidden");
        } else {
          card.classList.add("is-hidden");
        }
      });
    });
  });

  // 4. Quick-View Modal Logic
  const modalOverlay = document.getElementById("modalOverlay");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const modalCloseAction = document.getElementById("modalCloseAction");
  const modalPrimaryBtn = document.getElementById("modalPrimaryBtn");
  
  const modalIcon = document.getElementById("modalIcon");
  const modalTitle = document.getElementById("modalTitle");
  const modalDesc = document.getElementById("modalDesc");
  const modalPrice = document.getElementById("modalPrice");

  // Attach event listeners to all card open buttons
  document.querySelectorAll(".open-modal-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const card = e.target.closest(".app-card, .blog-card");
      if (!card) return;

      const title = card.getAttribute("data-title");
      const desc = card.getAttribute("data-desc");
      const price = card.getAttribute("data-price");
      const icon = card.querySelector(".app-icon, .blog-thumb")?.textContent || "✨";

      // Populate modal content
      modalTitle.textContent = title;
      modalDesc.textContent = desc;
      modalPrice.textContent = price;
      modalIcon.textContent = icon;

      modalOverlay.classList.add("is-open");
    });
  });

  function closeModal() {
    modalOverlay.classList.remove("is-open");
  }

  modalCloseBtn.addEventListener("click", closeModal);
  modalCloseAction.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  modalPrimaryBtn.addEventListener("click", () => {
    alert("Redirecting to secure access destination...");
    closeModal();
  });
});
