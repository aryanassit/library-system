document.addEventListener("DOMContentLoaded", function () {
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
        showError("success-message", "Form submitted successfully!");
        modal.style.display = "none";
        form.reset();

        document
          .querySelectorAll(".error-message")
          .forEach((el) => (el.style.display = "none"));
        generatedCode = null;
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

  // FAQ Show More Functionality
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

  // Policy Modal Functionality
  const policyModal = document.getElementById("policy-modal");
  const policyModalBody = document.getElementById("policy-modal-body");
  const expandBtns = document.querySelectorAll(".expand-btn");

  expandBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const policySection = btn.closest(".policy-section");
      const policyTitle = policySection.querySelector("h2").textContent;
      const policyContent = policySection.querySelector(".policy-content").innerHTML;

      policyModalBody.innerHTML = `<h2>${policyTitle}</h2>${policyContent}`;
      policyModal.style.display = "block";
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    });
  });

  // Close Policy Modal
  const policyCloseBtn = policyModal.querySelector(".close");
  policyCloseBtn.addEventListener("click", () => {
    policyModal.style.display = "none";
    document.body.style.overflow = "auto"; // Restore scrolling
  });

  window.addEventListener("click", (event) => {
    if (event.target === policyModal) {
      policyModal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });
});
