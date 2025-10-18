document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.querySelector(".sidebar");
  const menuToggle = document.createElement("button");
  menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
  menuToggle.className = "menu-toggle";
  menuToggle.style.cssText = `
    position: fixed;
    top: 1rem;
    left: 1rem;
    z-index: 101;
    background: var(--sidebar-bg);
    border: 1px solid var(--border-color);
    color: var(--text-main);
    padding: 0.5rem;
    border-radius: 8px;
    cursor: pointer;
    display: none;
  `;

  if (window.innerWidth <= 768) {
    document.body.appendChild(menuToggle);
    menuToggle.style.display = "block";
  }

  menuToggle.addEventListener("click", function () {
    sidebar.classList.toggle("show");
  });

  document.addEventListener("click", function (e) {
    if (
      window.innerWidth <= 768 &&
      !sidebar.contains(e.target) &&
      e.target !== menuToggle
    ) {
      sidebar.classList.remove("show");
    }
  });

  const navLinks = document.querySelectorAll(".sidebar-nav a");
  const sections = document.querySelectorAll(".content-section");
  const dashboardSection = document.querySelector(".dashboard-overview");

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetSection = this.getAttribute("href").substring(1);

      navLinks.forEach((l) => l.parentElement.classList.remove("active"));
      this.parentElement.classList.add("active");

      sections.forEach((section) => section.classList.add("hidden"));
      if (dashboardSection) dashboardSection.classList.add("hidden");

      if (targetSection === "dashboard") {
        if (dashboardSection) dashboardSection.classList.remove("hidden");
        document.querySelector(".quick-actions").classList.remove("hidden");
        document.querySelector(".recent-activity").classList.remove("hidden");
      } else {
        const targetElement = document.getElementById(
          targetSection + "-section"
        );
        if (targetElement) targetElement.classList.remove("hidden");
      }
    });
  });

  function updateStats() {
    const stats = document.querySelectorAll(".stat-info h3");
    stats.forEach((stat) => {
      const currentValue = parseInt(stat.textContent.replace(",", ""));
      const newValue = currentValue + Math.floor(Math.random() * 10) - 5;
      stat.textContent = Math.max(0, newValue).toLocaleString();
    });
  }

  setInterval(updateStats, 30000);

  const actionButtons = document.querySelectorAll(".action-btn");
  actionButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const action = this.textContent.trim();
      if (action.includes("Add New Book")) {
        openModal("add-book-modal");
      } else if (action.includes("Add New User")) {
        openModal("add-user-modal");
      } else if (action.includes("Export Data")) {
        exportData();
      } else if (action.includes("System Settings")) {
        navLinks.forEach((l) => l.parentElement.classList.remove("active"));
        document
          .querySelector('a[href="#settings"]')
          .parentElement.classList.add("active");
        sections.forEach((section) => section.classList.add("hidden"));
        document.getElementById("settings-section").classList.remove("hidden");
      }
    });
  });

  document.querySelectorAll(".add-book-btn").forEach((btn) => {
    btn.addEventListener("click", () => openModal("add-book-modal"));
  });

  document.querySelectorAll(".add-user-btn").forEach((btn) => {
    btn.addEventListener("click", () => openModal("add-user-modal"));
  });

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = "block";
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = "none";
    }
  }

  document.querySelectorAll(".close").forEach((closeBtn) => {
    closeBtn.addEventListener("click", function () {
      const modal = this.closest(".modal");
      if (modal) modal.style.display = "none";
    });
  });

  window.addEventListener("click", function (e) {
    if (e.target.classList.contains("modal")) {
      e.target.style.display = "none";
    }
  });

  document.querySelectorAll(".modal-form").forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const formData = new FormData(this);
      const data = Object.fromEntries(formData);

      alert("Form submitted successfully!\n" + JSON.stringify(data, null, 2));

      const modal = this.closest(".modal");
      if (modal) modal.style.display = "none";

      this.reset();
    });
  });

  const notificationBtn = document.querySelector(".notification-btn");
  notificationBtn.addEventListener("click", function () {
    openModal("notifications-modal");
  });

  const adminProfile = document.querySelector(".admin-profile");
  const dropdown = document.getElementById("profile-dropdown");

  adminProfile.addEventListener("click", function (e) {
    e.stopPropagation();
    dropdown.style.display =
      dropdown.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", function (e) {
    if (!adminProfile.contains(e.target)) {
      dropdown.style.display = "none";
    }
  });

  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const row = this.closest("tr");
      const title = row.cells[0].textContent;
      alert(`Edit functionality for "${title}" would open an edit modal.`);
    });
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const row = this.closest("tr");
      const title = row.cells[0].textContent;
      if (confirm(`Are you sure you want to delete "${title}"?`)) {
        row.remove();
        alert("Item deleted successfully!");
      }
    });
  });

  document.querySelectorAll(".search-input").forEach((input) => {
    input.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase();
      const table = this.closest(".content-section").querySelector("table");
      if (table) {
        const rows = table.querySelectorAll("tbody tr");
        rows.forEach((row) => {
          const text = row.textContent.toLowerCase();
          row.style.display = text.includes(searchTerm) ? "" : "none";
        });
      }
    });
  });

  document.querySelectorAll(".generate-report-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const reportType =
        this.closest(".report-card").querySelector("h3").textContent;
      alert(
        `Generating ${reportType} report...\n\nThis would create and download a report file.`
      );
    });
  });

  const saveSettingsBtn = document.querySelector(".save-settings-btn");
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener("click", function () {
      const settings = {
        maintenanceMode: document.getElementById("maintenance-mode").checked,
        emailNotifications: document.getElementById("email-notifications")
          .checked,
        maxBorrowDays: document.querySelector('input[type="number"][value]')
          .value,
        maxBooksPerUser: document.querySelectorAll('input[type="number"]')[1]
          .value,
      };

      alert(
        "Settings saved successfully!\n" + JSON.stringify(settings, null, 2)
      );
    });
  }

  function exportData() {
    const data = {
      books: [
        {
          title: "The Great Gatsby",
          author: "F. Scott Fitzgerald",
          status: "Available",
        },
        { title: "1984", author: "George Orwell", status: "Borrowed" },
      ],
      users: [
        { name: "John Doe", email: "john.doe@example.com", role: "User" },
        { name: "Jane Smith", email: "jane.smith@example.com", role: "Admin" },
      ],
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "library-data-export.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert("Data exported successfully!");
  }

  const activityItems = document.querySelectorAll(".activity-item");
  activityItems.forEach((item) => {
    item.addEventListener("click", function () {
      const details = this.querySelector(".activity-details p").textContent;
      alert(`Activity Details: ${details}`);
    });
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth <= 768) {
      menuToggle.style.display = "block";
    } else {
      menuToggle.style.display = "none";
      sidebar.classList.remove("show");
    }
  });
});
