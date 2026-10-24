const loginForm = document.querySelector("#loginForm");

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.querySelector("#loginName").value.trim();
  const email = document.querySelector("#loginEmail").value.trim().toLowerCase();
  const password = document.querySelector("#loginPassword").value;
  const message = document.querySelector("#loginMessage");

  if (!loginForm.checkValidity()) {
    loginForm.reportValidity();
    return;
  }

  if (password.length < 6) {
    message.textContent = "Please use at least 6 characters for the demo password.";
    return;
  }

  localStorage.setItem("careconnectUser", JSON.stringify({ name, email, signedInAt: new Date().toISOString() }));
  window.location.href = "donation.html#personal-profile";
});
