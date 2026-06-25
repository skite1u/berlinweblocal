const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const modal = document.querySelector("#contactModal");
const openModalButtons = document.querySelectorAll("[data-open-modal]");
const closeModalButtons = document.querySelectorAll("[data-close-modal]");
const contactForm = document.querySelector("#contactForm");
const formStatus = document.querySelector("#formStatus");
const packageSelect = document.querySelector("#packageSelect");
const appointmentInput = document.querySelector("#appointmentInput");
const selectedAppointment = document.querySelector("#selectedAppointment");
const faqItems = document.querySelectorAll(".faq-item");
const revealSections = document.querySelectorAll(".reveal-section");
const trackedElements = document.querySelectorAll("[data-track-event]");
const cookieConsent = document.querySelector("#cookieConsent");
const consentCookieName = "bwl-cookie-consent";

function isLocalDev() {
  return ["localhost", "127.0.0.1", "::1", ""].includes(window.location.hostname);
}

function getCookie(name) {
  return document.cookie
    .split("; ")
    .find(row => row.startsWith(`${name}=`))
    ?.split("=")[1] || "";
}

function setCookie(name, value) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${value}; Max-Age=${60 * 60 * 24 * 180}; Path=/; SameSite=Lax${secure}`;
}

function updateAnalyticsConsent(value) {
  if (typeof window.gtag !== "function") {
    return;
  }

  window.gtag("consent", "update", {
    analytics_storage: value === "all" ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  });
}

function initCookieConsent() {
  const consent = getCookie(consentCookieName);

  if (consent) {
    updateAnalyticsConsent(consent);
    return;
  }

  cookieConsent?.removeAttribute("hidden");
}

function trackEvent(name) {
  if (!name || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", name, {
    event_category: "engagement",
    event_label: name
  });
}

navToggle?.addEventListener("click", () => {
  const isOpen = header?.classList.toggle("nav-open") || false;
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

nav?.addEventListener("click", event => {
  if (!event.target.closest("a")) {
    return;
  }

  header?.classList.remove("nav-open");
  navToggle?.setAttribute("aria-expanded", "false");
});

function openModal(selectedPackage = "", appointmentText = "") {
  if (!modal || !contactForm) {
    window.location.href = "#kontakt";
    return;
  }

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  if (selectedPackage && packageSelect) {
    packageSelect.value = selectedPackage;
  }

  if (appointmentInput) {
    appointmentInput.value = appointmentText;
  }

  if (selectedAppointment) {
    const appointmentLabel = selectedAppointment.querySelector("strong");

    if (appointmentText) {
      if (appointmentLabel) {
        appointmentLabel.textContent = appointmentText;
      }
      selectedAppointment.removeAttribute("hidden");
    } else {
      if (appointmentLabel) {
        appointmentLabel.textContent = "";
      }
      selectedAppointment.setAttribute("hidden", "");
    }
  }

  window.setTimeout(() => {
    contactForm.elements.name?.focus();
  }, 60);
}

function closeModal() {
  if (!modal) {
    return;
  }

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

openModalButtons.forEach(button => {
  button.addEventListener("click", () => {
    openModal(button.dataset.package || "");
  });
});

closeModalButtons.forEach(button => {
  button.addEventListener("click", closeModal);
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && modal?.classList.contains("is-open")) {
    closeModal();
  }
});

faqItems.forEach(item => {
  const question = item.querySelector(".faq-question");
  const answer = item.querySelector(".faq-answer");
  const icon = question?.querySelector("strong");

  if (!question || !answer) {
    return;
  }

  question.addEventListener("click", () => {
    const isOpen = item.classList.toggle("is-open");
    question.setAttribute("aria-expanded", String(isOpen));
    answer.style.maxHeight = isOpen ? `${answer.scrollHeight}px` : "0px";

    if (icon) {
      icon.textContent = isOpen ? "−" : "+";
    }
  });
});

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: "0px 0px -40px 0px"
  });

  revealSections.forEach(section => observer.observe(section));
} else {
  revealSections.forEach(section => section.classList.add("is-visible"));
}

trackedElements.forEach(element => {
  element.addEventListener("click", () => {
    trackEvent(element.dataset.trackEvent);
  });
});

document.addEventListener("click", event => {
  const consentButton = event.target.closest("[data-cookie-accept]");

  if (!consentButton) {
    return;
  }

  const value = consentButton.dataset.cookieAccept === "all" ? "all" : "essential";
  setCookie(consentCookieName, value);
  updateAnalyticsConsent(value);
  cookieConsent?.setAttribute("hidden", "");
});

initCookieConsent();

contactForm?.addEventListener("submit", async event => {
  event.preventDefault();

  const submitButton = contactForm.querySelector('button[type="submit"]');
  const formData = new FormData(contactForm);

  if (window.location.protocol !== "https:" && !isLocalDev()) {
    formStatus.textContent = "Bitte nutzen Sie eine sichere HTTPS-Verbindung, um das Formular zu senden.";
    formStatus.classList.add("is-error");
    return;
  }

  formStatus.textContent = "Anfrage wird gesendet...";
  formStatus.classList.remove("is-error");

  if (submitButton) {
    submitButton.disabled = true;
  }

  try {
    const response = await fetch(contactForm.action, {
      method: "POST",
      headers: {
        Accept: "application/json"
      },
      body: formData
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Die Anfrage konnte nicht gesendet werden.");
    }

    formStatus.textContent = "Vielen Dank. Ihre Anfrage wurde gesendet.";
    contactForm.reset();
  } catch (error) {
    formStatus.textContent = error.message;
    formStatus.classList.add("is-error");
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
    }
  }
});
