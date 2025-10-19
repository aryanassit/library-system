document.addEventListener("DOMContentLoaded", function () {
  checkLoginStatus();

  const logoutDropdown = document.querySelector(".logout-dropdown");
  const goToLibraryBtn = document.querySelector(".go-to-library-btn");
  const profileBtn = document.querySelector(".profile-btn");
  const dropdownMenu = document.querySelector(".dropdown-menu");

  if (logoutDropdown) {
    logoutDropdown.addEventListener("click", handleLogout);
  }

  if (goToLibraryBtn) {
    goToLibraryBtn.addEventListener("click", handleGoToLibrary);
  }

  if (profileBtn && dropdownMenu) {
    profileBtn.addEventListener("click", () => {
      dropdownMenu.classList.toggle("show");
    });

    document.addEventListener("click", (event) => {
      if (
        !profileBtn.contains(event.target) &&
        !dropdownMenu.contains(event.target)
      ) {
        dropdownMenu.classList.remove("show");
      }
    });
  }

  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });

  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
    });
  });

  const yearSpan = document.getElementById("current-year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  const animatedElements = document.querySelectorAll(".hidden");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
    }
  );

  animatedElements.forEach((el) => observer.observe(el));

  const modal = document.getElementById("auth-modal");
  const loginBtn = document.querySelector(".login-btn");
  const signupBtn = document.querySelector(".signup-btn");
  const closeBtn = document.querySelector(".close");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");
  const payButtons = document.querySelectorAll(".pay-btn");
  const submitButtons = document.querySelectorAll(".submit-btn");
  let generatedCode = null;

  loginBtn.addEventListener("click", () => {
    modal.style.display = "block";
    switchTab("login");
  });

  signupBtn.addEventListener("click", () => {
    modal.style.display = "block";
    switchTab("register");
  });

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tab = button.getAttribute("data-tab");
      switchTab(tab);
    });
  });

  const switchToRegister = document.querySelector(".switch-to-register");
  if (switchToRegister) {
    switchToRegister.addEventListener("click", (e) => {
      e.preventDefault();
      switchTab("register");
    });
  }

  const switchToLogin = document.querySelector(".switch-to-login");
  if (switchToLogin) {
    switchToLogin.addEventListener("click", (e) => {
      e.preventDefault();
      switchTab("login");
    });
  }

  function switchTab(tab) {
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    tabPanes.forEach((pane) => pane.classList.remove("active"));

    document.querySelector(`[data-tab="${tab}"]`).classList.add("active");
    document.getElementById(`${tab}-tab`).classList.add("active");
  }

  payButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const form = button.closest("form");
      const username = form.querySelector(
        'input[placeholder="Username (no spaces)"]'
      );
      const password = form.querySelector(
        'input[placeholder="Password (must contain letter, number, symbol)"]'
      );
      const confirmPassword = form.querySelector(
        'input[placeholder="Confirm Password"]'
      );
      const cardNumber = form.querySelector(
        'input[placeholder="Card Number (16 digits)"]'
      );
      const expiry = form.querySelector(
        'input[placeholder="Expiry Date (MM/YY)"]'
      );
      const cvv = form.querySelector('input[placeholder="CVV (3 digits)"]');

      let paymentValid = true;

      if (username && /\s/.test(username.value)) {
        paymentValid = false;
        showError("username-error", "Username cannot contain spaces.");
      } else {
        hideError("username-error");
      }

      if (password && !/(?=.*[a-zA-Z])(?=.*\d)(?=.*\W)/.test(password.value)) {
        paymentValid = false;
        showError(
          "password-error",
          "Password must contain at least one letter, one number, and one symbol."
        );
      } else {
        hideError("password-error");
      }

      if (
        password &&
        confirmPassword &&
        password.value !== confirmPassword.value
      ) {
        paymentValid = false;
        showError("confirm-password-error", "Passwords do not match.");
      } else {
        hideError("confirm-password-error");
      }

      if (cardNumber && !/^\d{16}$/.test(cardNumber.value)) {
        paymentValid = false;
        showError(
          "card-number-error",
          "Card number must be exactly 16 digits."
        );
      } else {
        hideError("card-number-error");
      }

      if (expiry && !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry.value)) {
        paymentValid = false;
        showError("expiry-error", "Expiry date must be in MM/YY format.");
      } else {
        hideError("expiry-error");
      }

      if (cvv && !/^\d{3}$/.test(cvv.value)) {
        paymentValid = false;
        showError("cvv-error", "CVV must be exactly 3 digits.");
      } else {
        hideError("cvv-error");
      }

      if (paymentValid) {
        const letters1 =
          String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
          String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
          String.fromCharCode(65 + Math.floor(Math.random() * 26));
        const numbers = Math.floor(100 + Math.random() * 900);
        const letters2 =
          String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
          String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
          String.fromCharCode(65 + Math.floor(Math.random() * 26));
        generatedCode = `${letters1}${numbers}-${letters2}`;

        const emailInput = form.querySelector('input[type="email"]');
        if (emailInput && emailInput.value) {
          console.log(
            `Verification code sent to ${emailInput.value}: ${generatedCode}`
          );
          showError(
            "success-message",
            `Verification code sent to ${emailInput.value}!`
          );
        }
        hideError("register-code-error");
      }
    });
  });

  submitButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const form = button.closest("form");
      const inputs = form.querySelectorAll("input[required]");
      let isValid = true;

      inputs.forEach((input) => {
        if (!input.value.trim()) {
          isValid = false;
          input.style.borderColor = "red";
        } else {
          input.style.borderColor = "var(--border-color)";
        }
      });

      if (form.closest("#register-tab")) {
        const username = form.querySelector(
          'input[placeholder="Username (no spaces)"]'
        );
        if (username && /\s/.test(username.value)) {
          isValid = false;
          showError("username-error", "Username cannot contain spaces.");
        } else {
          hideError("username-error");
        }

        const password = form.querySelector(
          'input[placeholder="Password (must contain letter, number, symbol)"]'
        );
        const confirmPassword = form.querySelector(
          'input[placeholder="Confirm Password"]'
        );
        if (
          password &&
          !/(?=.*[a-zA-Z])(?=.*\d)(?=.*\W)/.test(password.value)
        ) {
          isValid = false;
          showError(
            "password-error",
            "Password must contain at least one letter, one number, and one symbol."
          );
        } else {
          hideError("password-error");
        }

        if (
          password &&
          confirmPassword &&
          password.value !== confirmPassword.value
        ) {
          isValid = false;
          showError("confirm-password-error", "Passwords do not match.");
        } else {
          hideError("confirm-password-error");
        }

        const cardNumber = form.querySelector(
          'input[placeholder="Card Number (16 digits)"]'
        );
        if (cardNumber && !/^\d{16}$/.test(cardNumber.value)) {
          isValid = false;
          showError(
            "card-number-error",
            "Card number must be exactly 16 digits."
          );
        } else {
          hideError("card-number-error");
        }

        const expiry = form.querySelector(
          'input[placeholder="Expiry Date (MM/YY)"]'
        );
        if (expiry && !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry.value)) {
          isValid = false;
          showError("expiry-error", "Expiry date must be in MM/YY format.");
        } else {
          hideError("expiry-error");
        }

        const cvv = form.querySelector('input[placeholder="CVV (3 digits)"]');
        if (cvv && !/^\d{3}$/.test(cvv.value)) {
          isValid = false;
          showError("cvv-error", "CVV must be exactly 3 digits.");
        } else {
          hideError("cvv-error");
        }

        const registerCode = form.querySelector(
          'input[placeholder="Verification Code (e.g., ABC123-XYZ)"]'
        );
        if (
          registerCode &&
          !/^[A-Z]{3}\d{3}-[A-Z]{3}$/.test(registerCode.value)
        ) {
          isValid = false;
          showError(
            "register-code-error",
            "Verification code must be in ABC123-XYZ format."
          );
        } else if (
          registerCode &&
          generatedCode &&
          registerCode.value !== generatedCode
        ) {
          isValid = false;
          showError(
            "register-code-error",
            "Verification code does not match the generated code."
          );
        } else {
          hideError("register-code-error");
        }
      }

      if (form.closest("#login-tab")) {
        const loginEmail = form.querySelector('input[type="email"]');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (loginEmail && !emailRegex.test(loginEmail.value)) {
          isValid = false;
          showError("login-email-error", "Please enter a valid email address.");
        } else {
          hideError("login-email-error");
        }

        const loginPassword = form.querySelector('input[type="password"]');
        if (loginPassword && loginPassword.value.length < 8) {
          isValid = false;
          showError(
            "login-password-error",
            "Password must be at least 8 characters long."
          );
        } else {
          hideError("login-password-error");
        }

        const loginCode = form.querySelector(
          'input[placeholder="Verification Code (e.g., ABC123-XYZ)"]'
        );
        if (loginCode && !/^[A-Z]{3}\d{3}-[A-Z]{3}$/.test(loginCode.value)) {
          isValid = false;
          showError(
            "login-code-error",
            "Verification code must be in ABC123-XYZ format."
          );
        } else {
          hideError("login-code-error");
        }
      }

      if (isValid) {
        if (form.closest("#register-tab")) {
          const formData = new FormData(form);
          const data = {
            name: formData.get("name"),
            email: formData.get("email"),
            password: formData.get("password"),
            verificationCode: generatedCode,
          };

          fetch("/api/auth/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          })
            .then((response) => response.json())
            .then((result) => {
              if (result.error) {
                showError("general-error", result.error);
              } else {
                showError("success-message", "Registration successful!");
                modal.style.display = "none";
                form.reset();
                generatedCode = null;

                localStorage.setItem("userEmail", data.email);
                localStorage.setItem("userName", data.name);
                checkLoginStatus();
              }
            })
            .catch((error) => {
              console.error("Registration error:", error);
              showError(
                "general-error",
                "Registration failed. Please try again."
              );
            });
        } else if (form.closest("#login-tab")) {
          const formData = new FormData(form);
          const data = {
            email: formData.get("email"),
            password: formData.get("password"),
            verificationCode: formData.get("verificationCode"),
          };

          fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          })
            .then((response) => response.json())
            .then((result) => {
              if (result.error) {
                showError("general-error", result.error);
              } else {
                showError("success-message", "Login successful!");
                modal.style.display = "none";
                form.reset();

                localStorage.setItem("userEmail", data.email);

                checkLoginStatus();
              }
            })
            .catch((error) => {
              console.error("Login error:", error);
              showError("general-error", "Login failed. Please try again.");
            });
        }

        document
          .querySelectorAll(".error-message")
          .forEach((el) => (el.style.display = "none"));
      }
    });
  });

  function showError(id, message) {
    const errorEl = document.getElementById(id);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = "block";
    }
  }

  function hideError(id) {
    const errorEl = document.getElementById(id);
    if (errorEl) {
      errorEl.style.display = "none";
    }
  }

  const showMoreFaqsBtn = document.getElementById("show-more-faqs");
  const faqHidden = document.querySelector(".faq-hidden");

  if (showMoreFaqsBtn && faqHidden) {
    showMoreFaqsBtn.addEventListener("click", () => {
      if (faqHidden.style.display === "none") {
        faqHidden.style.display = "block";
        showMoreFaqsBtn.textContent = "Show Less FAQs";
      } else {
        faqHidden.style.display = "none";
        showMoreFaqsBtn.textContent = "Show More FAQs";
      }
    });
  }

  const policyModal = document.getElementById("policy-modal");
  const policyModalBody = document.getElementById("policy-modal-body");
  const expandBtns = document.querySelectorAll(".expand-btn");

  expandBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const policySection = btn.closest(".policy-section");
      const policyTitle = policySection.querySelector("h2").textContent;
      const policyContent =
        policySection.querySelector(".policy-content").innerHTML;

      policyModalBody.innerHTML = `<h2>${policyTitle}</h2>${policyContent}`;
      policyModal.style.display = "block";
      document.body.style.overflow = "hidden";
    });
  });

  const policyCloseBtn = policyModal.querySelector(".close");
  policyCloseBtn.addEventListener("click", () => {
    policyModal.style.display = "none";
    document.body.style.overflow = "auto";
  });

  window.addEventListener("click", (event) => {
    if (event.target === policyModal) {
      policyModal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });

  const stars = document.querySelectorAll(".rating-section .stars .fa-star");
  const ratingSubmitBtn = document.querySelector(".rating-submit-btn");
  const ratingTextarea = document.querySelector(".rating-section textarea");
  let selectedRating = 0;

  stars.forEach((star, index) => {
    star.addEventListener("click", () => {
      selectedRating = index + 1;
      updateStars(selectedRating);
    });
  });

  function updateStars(rating) {
    stars.forEach((star, index) => {
      if (index < rating) {
        star.classList.add("active");
      } else {
        star.classList.remove("active");
      }
    });
  }

  if (ratingSubmitBtn) {
    ratingSubmitBtn.addEventListener("click", (event) => {
      event.preventDefault();
      if (selectedRating === 0) {
        alert("Please select a rating.");
        return;
      }
      const message =
        ratingTextarea.value.trim() || `${selectedRating} star rating`;

      const userEmail = localStorage.getItem("userEmail");
      const userName = localStorage.getItem("userName") || "User";

      ratingSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      ratingSubmitBtn.disabled = true;

      fetch("/api/submissions/rating", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stars: selectedRating,
          message: message,
          user: userName,
          email: userEmail,
        }),
      })
        .then((response) => response.json())
        .then((result) => {
          if (result.error) {
            alert("Error submitting rating: " + result.error);
            ratingSubmitBtn.innerHTML = "Submit Rating";
            ratingSubmitBtn.disabled = false;
          } else {
            ratingSubmitBtn.innerHTML = '<i class="fas fa-check"></i> Sent';
            ratingSubmitBtn.style.backgroundColor = "var(--success)";
            setTimeout(() => {
              ratingSubmitBtn.innerHTML = "Submit Rating";
              ratingSubmitBtn.style.backgroundColor = "";
              ratingSubmitBtn.disabled = false;
              selectedRating = 0;
              updateStars(0);
              ratingTextarea.value = "";
            }, 2000);
          }
        })
        .catch((error) => {
          console.error("Rating submission error:", error);
          alert("Failed to submit rating. Please try again.");
          ratingSubmitBtn.innerHTML = "Submit Rating";
          ratingSubmitBtn.disabled = false;
        });
    });
  }

  const contactForm = document.querySelector(".contact-form");
  const contactSubmitBtn = contactForm.querySelector(".submit-btn");
  const nameInput = contactForm.querySelector('input[placeholder="Your Name"]');
  const emailInput = contactForm.querySelector(
    'input[placeholder="Your Email"]'
  );

  if (nameInput) {
    nameInput.addEventListener("focus", () => {
      const userName = localStorage.getItem("userName");
      if (userName && !nameInput.value.trim()) {
        nameInput.value = userName;
      }
    });
  }

  if (emailInput) {
    emailInput.addEventListener("focus", () => {
      const userEmail = localStorage.getItem("userEmail");
      if (userEmail && !emailInput.value.trim()) {
        emailInput.value = userEmail;
      }
    });
  }

  if (contactSubmitBtn) {
    contactSubmitBtn.addEventListener("click", (event) => {
      event.preventDefault();
      const messageTextarea = contactForm.querySelector(
        'textarea[placeholder="Your Message"]'
      );

      const userName = localStorage.getItem("userName");
      const userEmail = localStorage.getItem("userEmail");
      const name = userName || nameInput.value.trim();
      const email = userEmail || emailInput.value.trim();
      const message = messageTextarea.value.trim();

      if (!name) {
        alert("Please enter your name.");
        return;
      }

      const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      if (!gmailRegex.test(email)) {
        alert("Please enter a valid Gmail address (e.g., example@gmail.com).");
        return;
      }

      if (!message) {
        alert("Please enter your message.");
        return;
      }

      contactSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      contactSubmitBtn.disabled = true;

      fetch("/api/submissions/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          email: email,
          message: message,
        }),
      })
        .then((response) => response.json())
        .then((result) => {
          if (result.error) {
            alert("Error submitting contact form: " + result.error);
            contactSubmitBtn.innerHTML = "Send Message";
            contactSubmitBtn.disabled = false;
          } else {
            contactSubmitBtn.innerHTML = '<i class="fas fa-check"></i> Sent';
            contactSubmitBtn.style.backgroundColor = "var(--success)";
            setTimeout(() => {
              contactSubmitBtn.innerHTML = "Send Message";
              contactSubmitBtn.style.backgroundColor = "";
              contactSubmitBtn.disabled = false;
              contactForm.reset();
            }, 2000);
          }
        })
        .catch((error) => {
          console.error("Contact form submission error:", error);
          alert("Failed to send message. Please try again.");
          contactSubmitBtn.innerHTML = "Send Message";
          contactSubmitBtn.disabled = false;
        });
    });
  }

  function checkLoginStatus() {
    const userEmail = localStorage.getItem("userEmail");
    const loginBtn = document.querySelector(".login-btn");
    const signupBtn = document.querySelector(".signup-btn");
    const profileDropdown = document.querySelector(".profile-dropdown");
    const goToLibraryBtn = document.querySelector(".go-to-library-btn");
    const profilePic = document.querySelector(".profile-pic");

    if (userEmail) {
      if (loginBtn) loginBtn.style.display = "none";
      if (signupBtn) signupBtn.style.display = "none";
      if (profileDropdown) profileDropdown.style.display = "inline-block";
      if (goToLibraryBtn) goToLibraryBtn.style.display = "inline-block";

      if (profilePic) {
        const initial = userEmail.charAt(0).toUpperCase();
        profilePic.src = `https://via.placeholder.com/32x32/58a6ff/ffffff?text=${initial}`;
      }
      updateHeroButton(true);
    } else {
      if (loginBtn) loginBtn.style.display = "inline-block";
      if (signupBtn) signupBtn.style.display = "inline-block";
      if (profileDropdown) profileDropdown.style.display = "none";
      if (goToLibraryBtn) goToLibraryBtn.style.display = "none";
      updateHeroButton(false);
    }
  }

  function updateHeroButton(isLoggedIn) {
    const heroBtn = document.querySelector(".explore-btn");
    if (heroBtn) {
      if (isLoggedIn) {
        heroBtn.textContent = "Open Library";
        heroBtn.href = "dashboard.html";
      } else {
        heroBtn.textContent = "Explore Features";
        heroBtn.href = "#features";
      }
    }
  }

  function handleLogout() {
    localStorage.removeItem("userEmail");
    checkLoginStatus();
    window.location.href = "index.html";
  }

  function handleGoToLibrary() {
    window.location.href = "dashboard.html";
  }
});
