let activities = JSON.parse(localStorage.getItem("dashboard_activities")) || [];

function loadActivities() {
  updateRecentActivities();
  populateAllActivitiesModal();
}

function addActivity(type, message) {
  const activity = {
    type,
    message,
    timestamp: new Date().toISOString(),
  };
  activities.unshift(activity);
  if (activities.length > 50) activities.pop();
  localStorage.setItem("dashboard_activities", JSON.stringify(activities));
  updateRecentActivities();
  populateAllActivitiesModal();
}

function updateRecentActivities() {
  const list = document.querySelector(".activity-list");
  if (!list) return;

  list.innerHTML = "";
  const recent = activities.slice(0, 5);
  recent.forEach((activity) => {
    const item = document.createElement("div");
    item.className = "activity-item";
    item.innerHTML = `<div class="activity-icon"><i class="fas fa-info-circle"></i></div><div class="activity-details"><p>${
      activity.message
    }</p><span>${new Date(activity.timestamp).toLocaleString()}</span></div>`;
    list.appendChild(item);
  });
}

function formatTime(date) {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function populateAllActivitiesModal() {
  const list = document.querySelector(".all-activities-list");
  if (!list) return;

  list.innerHTML = "";
  activities.forEach((activity) => {
    const item = document.createElement("div");
    item.className = "activity-item";
    item.innerHTML = `<div class="activity-icon"><i class="fas fa-info-circle"></i></div><div class="activity-details"><p>${
      activity.message
    }</p><span>${new Date(activity.timestamp).toLocaleString()}</span></div>`;
    list.appendChild(item);
  });
}

function loadBooks() {
  fetch("/api/books")
    .then((response) => response.json())
    .then((books) => {
      const tbody = document.querySelector("#books-section tbody");
      if (!tbody) return;
      tbody.innerHTML = "";
      books.forEach((book) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${book.title}</td>
          <td>${book.author}</td>
          <td>${book.genre || "N/A"}</td>
          <td>${book.status}</td>
          <td>
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch((error) => console.error("Error loading books:", error));
}

function loadUsers() {
  fetch("/api/users")
    .then((response) => response.json())
    .then((users) => {
      const tbody = document.querySelector("#users-section tbody");
      if (!tbody) return;
      tbody.innerHTML = "";
      users.forEach((user) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.role}</td>
          <td>${user.status}</td>
          <td>
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch((error) => console.error("Error loading users:", error));
}

function loadSettings() {
  fetch("/api/settings")
    .then((response) => response.json())
    .then((settings) => {
      document.getElementById("maintenance-mode").checked =
        settings.maintenanceMode || false;
      document.getElementById("email-notifications").checked =
        settings.emailNotifications || false;
      const inputs = document.querySelectorAll('input[type="number"]');
      if (inputs[0]) inputs[0].value = settings.maxBorrowDays || 14;
      if (inputs[1]) inputs[1].value = settings.maxBooksPerUser || 5;
    })
    .catch((error) => console.error("Error loading settings:", error));
}

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
        document.querySelector(".recent-activity").classList.remove("hidden");
        loadActivities();
      } else {
        const targetElement = document.getElementById(
          targetSection + "-section"
        );
        if (targetElement) targetElement.classList.remove("hidden");
        if (targetSection === "manage-books") {
          loadBooks();
        } else if (targetSection === "manage-users") {
          loadUsers();
        }
        document.querySelector(".recent-activity").classList.add("hidden");
      }
    });
  });

  loadActivities();
  loadBooks();
  loadUsers();
  loadSettings();

  function updateStats() {
    fetch("/api/books")
      .then((response) => response.json())
      .then((books) => {
        const totalBooks = books.length;
        const availableBooks = books.filter(
          (book) => book.status === "available"
        ).length;
        const borrowedBooks = totalBooks - availableBooks;

        fetch("/api/users")
          .then((response) => response.json())
          .then((users) => {
            const totalUsers = users.length;
            const activeUsers = users.filter(
              (user) => user.status === "active"
            ).length;

            document.querySelectorAll(".stat-info h3")[0].textContent =
              totalBooks.toLocaleString();
            document.querySelectorAll(".stat-info h3")[1].textContent =
              availableBooks.toLocaleString();
            document.querySelectorAll(".stat-info h3")[2].textContent =
              borrowedBooks.toLocaleString();
            document.querySelectorAll(".stat-info h3")[3].textContent =
              activeUsers.toLocaleString();
          })
          .catch((error) => console.error("Error loading user stats:", error));
      })
      .catch((error) => console.error("Error loading book stats:", error));
  }

  updateStats();
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

      if (this.closest("#add-book-modal")) {
        addActivity(`New book added: ${data.title} by ${data.author}`);
      } else if (this.closest("#add-user-modal")) {
        addActivity(
          `New user registered: ${data["Full Name"]} (${data.Email})`
        );
      }

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

  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = btn.closest(".content-section");
      if (section.id === "books-section") {
        openModal("filter-modal");
      } else if (section.id === "users-section") {
        openModal("filter-users-modal");
      }
    });
  });

  const filterForm = document.querySelector("#filter-modal .filter-form");
  if (filterForm) {
    filterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const filterValue = document.getElementById("filter-status").value;
      const sortValue = document.getElementById("sort-order").value;
      applyBookFilters(filterValue, sortValue);
      closeModal("filter-modal");
    });
  }

  const filterUsersForm = document.querySelector(
    "#filter-users-modal .filter-form"
  );
  if (filterUsersForm) {
    filterUsersForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const filterStatus = document.getElementById("filter-user-status").value;
      const filterRole = document.getElementById("filter-user-role").value;
      const sortValue = document.getElementById("sort-users-order").value;
      applyUserFilters(filterStatus, filterRole, sortValue);
      closeModal("filter-users-modal");
    });
  }

  function applyBookFilters(filterValue, sortValue) {
    const table = document.querySelector("#books-section table");
    if (!table) return;
    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody.querySelectorAll("tr"));

    rows.forEach((row) => {
      const statusCell = row.cells[3].textContent.toLowerCase();
      let show = true;
      if (filterValue === "available" && !statusCell.includes("available"))
        show = false;
      if (filterValue === "borrowed" && !statusCell.includes("borrowed"))
        show = false;
      row.style.display = show ? "" : "none";
    });

    const visibleRows = rows.filter((row) => row.style.display !== "none");
    visibleRows.sort((a, b) => {
      let aVal, bVal;
      if (sortValue.includes("title")) {
        aVal = a.cells[0].textContent.toLowerCase();
        bVal = b.cells[0].textContent.toLowerCase();
      } else if (sortValue.includes("author")) {
        aVal = a.cells[1].textContent.toLowerCase();
        bVal = b.cells[1].textContent.toLowerCase();
      }
      if (sortValue.includes("-desc")) {
        return bVal.localeCompare(aVal);
      } else {
        return aVal.localeCompare(bVal);
      }
    });

    visibleRows.forEach((row) => tbody.appendChild(row));
  }

  function applyUserFilters(filterStatus, filterRole, sortValue) {
    const table = document.querySelector("#users-section table");
    if (!table) return;
    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody.querySelectorAll("tr"));

    rows.forEach((row) => {
      const statusCell = row.cells[3].textContent.toLowerCase();
      const roleCell = row.cells[2].textContent.toLowerCase();
      let show = true;
      if (filterStatus === "active" && !statusCell.includes("active"))
        show = false;
      if (filterStatus === "inactive" && !statusCell.includes("inactive"))
        show = false;
      if (filterRole === "user" && !roleCell.includes("user")) show = false;
      if (filterRole === "admin" && !roleCell.includes("admin")) show = false;
      row.style.display = show ? "" : "none";
    });

    const visibleRows = rows.filter((row) => row.style.display !== "none");
    visibleRows.sort((a, b) => {
      let aVal, bVal;
      if (sortValue.includes("name")) {
        aVal = a.cells[0].textContent.toLowerCase();
        bVal = b.cells[0].textContent.toLowerCase();
      } else if (sortValue.includes("email")) {
        aVal = a.cells[1].textContent.toLowerCase();
        bVal = b.cells[1].textContent.toLowerCase();
      }
      if (sortValue.includes("-desc")) {
        return bVal.localeCompare(aVal);
      } else {
        return aVal.localeCompare(bVal);
      }
    });

    visibleRows.forEach((row) => tbody.appendChild(row));
  }

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

  const viewAllActivitiesBtn = document.querySelector(
    ".view-all-activities-btn"
  );
  if (viewAllActivitiesBtn) {
    viewAllActivitiesBtn.addEventListener("click", function () {
      openModal("all-activities-modal");
      populateAllActivitiesModal();
    });
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
