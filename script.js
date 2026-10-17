const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");

menuToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".main-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

const modal = document.querySelector("#donateModal");
const openModal = () => {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.querySelector(".modal-panel input").focus();
};
const closeModal = () => {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
};

document.querySelector("#donateButton").addEventListener("click", openModal);
document.querySelector("#closeModal").addEventListener("click", closeModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("open")) closeModal();
});

document.querySelectorAll(".amounts button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(".amounts .selected").classList.remove("selected");
    button.classList.add("selected");
  });
});

document.querySelectorAll(".tracker-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelector(".tracker-tab.active").classList.remove("active");
    tab.classList.add("active");
    const category = tab.dataset.category;
    document.querySelectorAll(".tracker-card").forEach((item) => {
      item.classList.toggle("hidden", category !== "all" && item.dataset.category !== category);
    });
  });
});

document.querySelector("#volunteerForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const message = event.currentTarget.querySelector(".form-message");
  message.textContent = "Thank you — we’ll be in touch soon.";
  event.currentTarget.reset();
});

document.querySelector(".modal-submit").addEventListener("click", () => {
  const email = document.querySelector(".modal-panel input");
  if (!email.value || !email.checkValidity()) {
    email.reportValidity();
    return;
  }
  document.querySelector(".modal-panel").innerHTML = '<button class="modal-close" id="closeModal" aria-label="Close donation form">×</button><p class="eyebrow">Thank you</p><h2>Your kindness matters.</h2><p>We have saved your donation intention. A secure giving link will be sent to your inbox shortly.</p><button class="button" onclick="document.querySelector(\'#donateModal\').classList.remove(\'open\')">Back to CareConnect <span>↗</span></button>';
});
