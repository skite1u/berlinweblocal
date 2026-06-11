const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const modal = document.querySelector("#contactModal");
const openModalButtons = document.querySelectorAll("[data-open-modal]");
const closeModalButtons = document.querySelectorAll("[data-close-modal]");
const contactForm = document.querySelector("#contactForm");
const formStatus = document.querySelector("#formStatus");
const packageSelect = document.querySelector("#packageSelect");
const stickyWhatsapp = document.querySelector(".whatsapp-sticky");
const revealSections = document.querySelectorAll(".reveal-section");
const faqItems = document.querySelectorAll(".faq-item");
const trackedElements = document.querySelectorAll("[data-track-event]");
let cookieConsent = document.querySelector("#cookieConsent");
const CONSENT_COOKIE = "lwb-cookie-consent";

function isLocalDev() {
  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}

function getCookie(name) {
  return document.cookie
    .split("; ")
    .find(row => row.startsWith(`${name}=`))
    ?.split("=")[1] || "";
}

function setConsentCookie(value) {
  const maxAge = 60 * 60 * 24 * 180;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
}

function loadConsentScripts() {
  if (window.lwbConsentScriptsLoaded) {
    return;
  }

  window.lwbConsentScriptsLoaded = true;

  const plausibleDomain = "";
  if (plausibleDomain) {
    const script = document.createElement("script");
    script.defer = true;
    script.src = "https://plausible.io/js/script.js";
    script.dataset.domain = plausibleDomain;
    document.head.appendChild(script);
  }

  const pirschCode = "";
  if (pirschCode) {
    const script = document.createElement("script");
    script.defer = true;
    script.src = "https://api.pirsch.io/pirsch.js";
    script.id = "pirschjs";
    script.dataset.code = pirschCode;
    document.head.appendChild(script);
  }
}

function applyConsent(value) {
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      analytics_storage: value === "all" ? "granted" : "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
  }

  if (value === "all") {
    loadConsentScripts();
  }
}

function ensureCookieConsentMarkup() {
  if (cookieConsent) {
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <div class="cookie-consent" id="cookieConsent" role="dialog" aria-modal="true" aria-labelledby="cookieTitle" hidden>
      <div class="cookie-card">
        <div>
          <p class="eyebrow">Datenschutz</p>
          <h2 id="cookieTitle">Cookies & Analyse</h2>
          <p>Wir nutzen Google Analytics zur Reichweitenmessung. Die Analytics-Speicherung ist standardmäßig blockiert und wird erst nach Ihrer Zustimmung aktiviert.</p>
        </div>
        <div class="cookie-actions">
          <button class="btn btn-primary" type="button" data-cookie-accept="all">Alle akzeptieren</button>
          <button class="btn btn-secondary" type="button" data-cookie-accept="essential">Nur essenzielle akzeptieren</button>
        </div>
      </div>
    </div>
  `;
  cookieConsent = wrapper.firstElementChild;
  document.body.appendChild(cookieConsent);
}

function initCookieConsent() {
  const consent = getCookie(CONSENT_COOKIE);

  if (consent) {
    applyConsent(consent);
    return;
  }

  ensureCookieConsentMarkup();
  cookieConsent?.removeAttribute("hidden");
}

function trackEvent(eventName) {
  if (!eventName) {
    return;
  }

  if (typeof window.plausible === "function") {
    window.plausible(eventName);
    return;
  }

  if (typeof window.pirsch === "function") {
    window.pirsch(eventName);
  }
}

if (navToggle && header) {
  navToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

function openModal(selectedPackage = "") {
  if (!modal || !contactForm) {
    window.location.href = "/#kontakt";
    return;
  }

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  if (selectedPackage && packageSelect) {
    packageSelect.value = selectedPackage;
  }
  setTimeout(() => {
    contactForm.elements.name.focus();
  }, 50);
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

trackedElements.forEach(element => {
  element.addEventListener("click", () => {
    trackEvent(element.dataset.trackEvent);
  });
});

document.addEventListener("click", event => {
  const button = event.target.closest("[data-cookie-accept]");
  if (!button) {
    return;
  }

  const value = button.dataset.cookieAccept === "all" ? "all" : "essential";
  setConsentCookie(value);
  cookieConsent?.setAttribute("hidden", "");
  applyConsent(value);
});

initCookieConsent();

closeModalButtons.forEach(button => {
  button.addEventListener("click", closeModal);
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && modal?.classList.contains("is-open")) {
    closeModal();
  }
});

window.addEventListener("scroll", () => {
  stickyWhatsapp?.classList.toggle("is-visible", window.scrollY > 420);
});

if ("IntersectionObserver" in window) {
  const revealSection = section => {
    section.classList.add("is-visible");
  };

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        revealSection(entry.target);
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: "0px 0px -40px 0px"
  });

  revealSections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
      revealSection(section);
      return;
    }

    revealObserver.observe(section);
  });
} else {
  revealSections.forEach(section => section.classList.add("is-visible"));
}

faqItems.forEach(item => {
  const question = item.querySelector(".faq-question");
  const answer = item.querySelector(".faq-answer");

  if (!question || !answer) {
    return;
  }

  question.addEventListener("click", () => {
    const isOpen = item.classList.toggle("is-open");
    question.setAttribute("aria-expanded", String(isOpen));
    answer.style.maxHeight = isOpen ? `${answer.scrollHeight}px` : "0px";
  });
});

if (contactForm) {
  contactForm.addEventListener("submit", async event => {
    event.preventDefault();

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const formData = new FormData(contactForm);

    if (window.location.protocol !== "https:" && !isLocalDev()) {
      formStatus.textContent = "Bitte nutze eine sichere HTTPS-Verbindung, um das Formular zu senden.";
      formStatus.classList.add("is-error");
      return;
    }

    formStatus.textContent = "Anfrage wird gesendet...";
    formStatus.classList.remove("is-error");
    submitButton.disabled = true;

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        headers: {
          "Accept": "application/json"
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Die Anfrage konnte nicht gesendet werden.");
      }

      formStatus.textContent = "Vielen Dank! Ihre Anfrage wurde gesendet. Wir melden uns schnellstmöglich.";
      contactForm.reset();
    } catch (error) {
      formStatus.textContent = error.message;
      formStatus.classList.add("is-error");
    } finally {
      submitButton.disabled = false;
    }
  });
}


