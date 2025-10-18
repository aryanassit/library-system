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

function showNotification(message, type = "success") {
  let notif = document.getElementById("custom-notification");
  if (!notif) {
    notif = document.createElement("div");
    notif.id = "custom-notification";
    notif.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === "error" ? "#e74c3c" : "#27ae60"};
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      z-index: 1000;
      display: none;
      font-family: Arial, sans-serif;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `;
    document.body.appendChild(notif);
  }
  notif.textContent = message;
  notif.style.display = "block";
  setTimeout(() => (notif.style.display = "none"), 3000);
}

function showConfirm(message, callback) {
  let modal = document.createElement("div");
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1001;
  `;
  modal.innerHTML = `
    <div style="background: white; padding: 20px; border-radius: 5px; max-width: 400px; text-align: center;">
      <p>${message}</p>
      <button id="confirm-yes" style="margin: 10px; padding: 5px 10px; background: #27ae60; color: white; border: none; border-radius: 3px; cursor: pointer;">Yes</button>
      <button id="confirm-no" style="margin: 10px; padding: 5px 10px; background: #e74c3c; color: white; border: none; border-radius: 3px; cursor: pointer;">No</button>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById("confirm-yes").addEventListener("click", () => {
    document.body.removeChild(modal);
    callback(true);
  });

  document.getElementById("confirm-no").addEventListener("click", () => {
    document.body.removeChild(modal);
    callback(false);
  });
}

function loadBooks() {
  const books = JSON.parse(localStorage.getItem("books")) || [
    {
      id: 1,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      genre: "Fiction",
      status: "available",
      isbn: "978-0-7432-7356-5",
      publication_year: 1925,
      description: "A classic novel about the American Dream.",
    },
    {
      id: 2,
      title: "1984",
      author: "George Orwell",
      genre: "Dystopian",
      status: "borrowed",
      isbn: "978-0-452-28423-4",
      publication_year: 1949,
      description: "A dystopian novel about totalitarianism.",
    },
  ];
  const tbody = document.querySelector("#books-section tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  books.forEach((book) => {
    const row = document.createElement("tr");
    row.dataset.id = book.id;
    row.innerHTML = `
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>${book.genre || "N/A"}</td>
        <td><span class="status ${book.status}">${book.status}</span></td>
        <td>
          <button class="action-btn-small edit-btn" data-id="${
            book.id
          }"><i class="fas fa-edit"></i></button>
          <button class="action-btn-small delete-btn" data-id="${
            book.id
          }"><i class="fas fa-trash"></i></button>
        </td>
      `;
    tbody.appendChild(row);
  });
}

function loadUsers() {
  const users = JSON.parse(localStorage.getItem("users")) || [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      role: "user",
      status: "active",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "admin",
      status: "active",
    },
  ];
  const tbody = document.querySelector("#users-section tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  users.forEach((user) => {
    const row = document.createElement("tr");
    row.dataset.id = user.id;
    row.innerHTML = `
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.role}</td>
      <td><span class="status ${user.status}">${user.status}</span></td>
      <td>
        <button class="action-btn-small edit-btn" data-id="${user.id}"><i class="fas fa-edit"></i></button>
        <button class="action-btn-small delete-btn" data-id="${user.id}"><i class="fas fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(row);
  });
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

  function updateStats() {
    const books = JSON.parse(localStorage.getItem("books")) || [];
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const totalBooks = books.length;
    const availableBooks = books.filter(
      (book) => book.status === "available"
    ).length;
    const borrowedBooks = books.filter(
      (book) => book.status === "borrowed"
    ).length;
    const activeUsers = users.filter((user) => user.status === "active").length;

    document.querySelectorAll(".stat-info h3")[0].textContent =
      totalBooks.toLocaleString();
    document.querySelectorAll(".stat-info h3")[1].textContent =
      availableBooks.toLocaleString();
    document.querySelectorAll(".stat-info h3")[2].textContent =
      borrowedBooks.toLocaleString();
    document.querySelectorAll(".stat-info h3")[3].textContent =
      activeUsers.toLocaleString();
  }

  updateStats();

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
      } else if (action.includes("Import Books")) {
        openModal("import-books-modal");
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
      const editId = data.id;

      if (this.closest("#add-book-modal")) {
        let books = JSON.parse(localStorage.getItem("books")) || [];
        if (editId) {
          const index = books.findIndex((book) => book.id == editId);
          if (index !== -1) {
            books[index] = {
              ...books[index],
              title: data.title,
              author: data.author,
              isbn: data.isbn,
              genre: data.genre,
              publication_year: data.publicationYear,
              description: data.description,
            };
          }
        } else {
          const newId = Math.max(...books.map((b) => b.id), 0) + 1;
          books.push({
            id: newId,
            title: data.title,
            author: data.author,
            isbn: data.isbn,
            genre: data.genre,
            publication_year: data.publicationYear,
            description: data.description,
            status: "available",
          });
        }
        localStorage.setItem("books", JSON.stringify(books));

        const action = editId ? "updated" : "added";
        addActivity(`Book ${action}: ${data.title} by ${data.author}`);
        showNotification(`Book ${action} successfully!`);
        loadBooks();
        updateStats();
      } else if (this.closest("#add-user-modal")) {
        let users = JSON.parse(localStorage.getItem("users")) || [];
        if (editId) {
          const index = users.findIndex((user) => user.id == editId);
          if (index !== -1) {
            users[index] = {
              ...users[index],
              name: data["Full Name"],
              email: data.Email,
              role: data.Role,
            };
          }
        } else {
          const newId = Math.max(...users.map((u) => u.id), 0) + 1;
          users.push({
            id: newId,
            name: data["Full Name"],
            email: data.Email,
            role: data.Role,
            status: "active",
          });
        }
        localStorage.setItem("users", JSON.stringify(users));

        const action = editId ? "updated" : "registered";
        addActivity(`User ${action}: ${data["Full Name"]} (${data.Email})`);
        showNotification(`User ${action} successfully!`);
        loadUsers();
        updateStats();
      } else if (this.closest("#import-books-modal")) {
        const fileInput = document.getElementById("books-file");
        const file = fileInput.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function (e) {
            try {
              let importedBooks = [];
              const fileContent = e.target.result;
              const fileExtension = file.name.split(".").pop().toLowerCase();

              if (fileExtension === "json") {
                importedBooks = JSON.parse(fileContent);
                if (Array.isArray(importedBooks)) {
                } else if (
                  importedBooks.books &&
                  Array.isArray(importedBooks.books)
                ) {
                  importedBooks = importedBooks.books;
                } else {
                  throw new Error(
                    "Invalid JSON format. Expected an array of books or an object with a 'books' array."
                  );
                }
              } else if (fileExtension === "csv") {
                const lines = fileContent.split("\n");
                const headers = lines[0]
                  .split(",")
                  .map((h) => h.trim().toLowerCase());
                importedBooks = lines.slice(1).map((line) => {
                  const values = line.split(",");
                  const book = {};
                  headers.forEach((header, index) => {
                    book[header] = values[index] ? values[index].trim() : "";
                  });
                  return book;
                });
              } else if (fileExtension === "txt") {
                importedBooks = fileContent
                  .split("\n")
                  .map((line) => {
                    const parts = line.split("|");
                    if (parts.length >= 2) {
                      return {
                        title: parts[0].trim(),
                        author: parts[1].trim(),
                        genre: parts[2] ? parts[2].trim() : "",
                        isbn: parts[3] ? parts[3].trim() : "",
                        publication_year: parts[4]
                          ? parseInt(parts[4].trim())
                          : null,
                        description: parts[5] ? parts[5].trim() : "",
                      };
                    }
                    return null;
                  })
                  .filter((book) => book !== null);
              } else {
                throw new Error(
                  "Unsupported file format. Please use JSON, CSV, or TXT files."
                );
              }

              let books = JSON.parse(localStorage.getItem("books")) || [];
              let addedCount = 0;
              importedBooks.forEach((bookData) => {
                if (bookData.title && bookData.author) {
                  const newId = Math.max(...books.map((b) => b.id), 0) + 1;
                  const book = {
                    id: newId,
                    title: bookData.title,
                    author: bookData.author,
                    genre: bookData.genre || "",
                    isbn: bookData.isbn || "",
                    publication_year: bookData.publication_year || null,
                    description: bookData.description || "",
                    status: "available",
                  };
                  books.push(book);
                  addedCount++;
                }
              });

              localStorage.setItem("books", JSON.stringify(books));
              addActivity(`Imported ${addedCount} books from file`);
              showNotification(`Successfully imported ${addedCount} books!`);
              loadBooks();
              updateStats();
            } catch (error) {
              showNotification(
                `Error importing books: ${error.message}`,
                "error"
              );
            }
          };
          reader.readAsText(file);
        }
      }

      const modal = this.closest(".modal");
      if (modal) modal.style.display = "none";

      this.reset();

      const editIdInput = this.querySelector("#edit-id");
      if (editIdInput) editIdInput.remove();
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

  document
    .querySelector("#books-section tbody")
    .addEventListener("click", function (e) {
      const btn = e.target.closest(".edit-btn, .delete-btn");
      if (!btn) return;

      const row = btn.closest("tr");
      const id = btn.dataset.id;
      const isBook = true;

      if (btn.classList.contains("edit-btn")) {
        const modalId = "add-book-modal";
        const storageKey = "books";
        const items = JSON.parse(localStorage.getItem(storageKey)) || [];
        const item = items.find((item) => item.id == id);

        if (item) {
          const modal = document.getElementById(modalId);
          if (modal) {
            modal.querySelector('[name="title"]').value = item.title || "";
            modal.querySelector('[name="author"]').value = item.author || "";
            modal.querySelector('[name="isbn"]').value = item.isbn || "";
            modal.querySelector('[name="genre"]').value = item.genre || "";
            modal.querySelector('[name="publicationYear"]').value =
              item.publication_year || "";
            modal.querySelector('[name="description"]').value =
              item.description || "";
            let editIdInput = modal.querySelector("#edit-id");
            if (!editIdInput) {
              editIdInput = document.createElement("input");
              editIdInput.type = "hidden";
              editIdInput.id = "edit-id";
              editIdInput.name = "id";
              modal.querySelector(".modal-form").appendChild(editIdInput);
            }
            editIdInput.value = id;
            modal.style.display = "block";
          }
        } else {
          alert("Item not found");
        }
      } else if (btn.classList.contains("delete-btn")) {
        const title = row.cells[0].textContent;
        showConfirm(
          `Are you sure you want to delete "${title}"?`,
          (confirmed) => {
            if (confirmed) {
              const storageKey = "books";
              let items = JSON.parse(localStorage.getItem(storageKey)) || [];
              items = items.filter((item) => item.id != id);
              localStorage.setItem(storageKey, JSON.stringify(items));
              row.remove();
              showNotification("Item deleted successfully!");
              loadBooks();
              updateStats();
            }
          }
        );
      }
    });

  document
    .querySelector("#users-section tbody")
    .addEventListener("click", function (e) {
      const btn = e.target.closest(".edit-btn, .delete-btn");
      if (!btn) return;

      const row = btn.closest("tr");
      const id = btn.dataset.id;
      const isBook = false;

      if (btn.classList.contains("edit-btn")) {
        const modalId = "add-user-modal";
        const storageKey = "users";
        const items = JSON.parse(localStorage.getItem(storageKey)) || [];
        const item = items.find((item) => item.id == id);

        if (item) {
          const modal = document.getElementById(modalId);
          if (modal) {
            modal.querySelector('[name="Full Name"]').value = item.name || "";
            modal.querySelector('[name="Email"]').value = item.email || "";
            modal.querySelector('[name="Password"]').value = "";
            modal.querySelector('[name="Role"]').value = item.role || "";
            let editIdInput = modal.querySelector("#edit-id");
            if (!editIdInput) {
              editIdInput = document.createElement("input");
              editIdInput.type = "hidden";
              editIdInput.id = "edit-id";
              editIdInput.name = "id";
              modal.querySelector(".modal-form").appendChild(editIdInput);
            }
            editIdInput.value = id;
            modal.style.display = "block";
          }
        } else {
          alert("Item not found");
        }
      } else if (btn.classList.contains("delete-btn")) {
        const title = row.cells[0].textContent;
        showConfirm(
          `Are you sure you want to delete "${title}"?`,
          (confirmed) => {
            if (confirmed) {
              const storageKey = "users";
              let items = JSON.parse(localStorage.getItem(storageKey)) || [];
              items = items.filter((item) => item.id != id);
              localStorage.setItem(storageKey, JSON.stringify(items));
              row.remove();
              showNotification("Item deleted successfully!");
              loadUsers();
              updateStats();
            }
          }
        );
      }
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
    const books = JSON.parse(localStorage.getItem("books")) || [];
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const data = {
      books: books.map((book) => ({
        title: book.title,
        author: book.author,
        status: book.status,
        genre: book.genre,
        isbn: book.isbn,
        publication_year: book.publication_year,
        description: book.description,
      })),
      users: users.map((user) => ({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      })),
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

  let currentAction = null;

  const removeAllBooksBtn = document.querySelector(".remove-all-books-btn");
  const removeAllUsersBtn = document.querySelector(".remove-all-users-btn");
  const resetWebappBtn = document.querySelector(".reset-webapp-btn");

  if (removeAllBooksBtn) {
    removeAllBooksBtn.addEventListener("click", function () {
      currentAction = "removeBooks";
      openModal("password-confirm-modal");
    });
  }

  if (removeAllUsersBtn) {
    removeAllUsersBtn.addEventListener("click", function () {
      currentAction = "removeUsers";
      openModal("password-confirm-modal");
    });
  }

  if (resetWebappBtn) {
    resetWebappBtn.addEventListener("click", function () {
      currentAction = "resetWebapp";
      openModal("password-confirm-modal");
    });
  }

  const passwordConfirmForm = document.getElementById("password-confirm-form");
  if (passwordConfirmForm) {
    passwordConfirmForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const password = document.getElementById("confirm-password").value;
      if (password === "admin") {
        performAction(currentAction);
        closeModal("password-confirm-modal");
        document.getElementById("confirm-password").value = "";
      } else {
        showNotification("Incorrect password", "error");
      }
    });
  }

  function performAction(action) {
    switch (action) {
      case "removeBooks":
        localStorage.removeItem("books");
        loadBooks();
        updateStats();
        addActivity("system", "All books removed");
        showNotification("All books removed successfully");
        break;
      case "removeUsers":
        localStorage.removeItem("users");
        loadUsers();
        updateStats();
        addActivity("system", "All users removed");
        showNotification("All users removed successfully");
        break;
      case "resetWebapp":
        localStorage.clear();
        loadBooks();
        loadUsers();
        updateStats();
        loadActivities();
        addActivity("system", "Webapp reset");
        showNotification("Webapp reset successfully");
        break;
    }
  }

  window.addEventListener("resize", function () {
    if (window.innerWidth <= 768) {
      menuToggle.style.display = "block";
    } else {
      menuToggle.style.display = "none";
      sidebar.classList.remove("show");
    }
  });
});
