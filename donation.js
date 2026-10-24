const typeOptions = document.querySelectorAll(".donation-type");
const amountOptions = document.querySelectorAll(".donation-amounts button");
const currencySelect = document.querySelector("#currencySelect");
const donorListFull = document.querySelector("#donorListFull");
const donorListPreview = document.querySelector("#donorListPreview");
const donorCount = document.querySelector("#donorCount");
const accountNav = document.querySelector("#accountNav");
const profileNav = document.querySelector("#profileNav");
const currentUser = JSON.parse(localStorage.getItem("careconnectUser") || "null");
const currencyRates = { INR: 1, USD: 0.012, EUR: 0.011, GBP: 0.0095, AED: 0.044, AUD: 0.018, CAD: 0.016, SGD: 0.016 };
const currencySymbols = { INR: "₹", USD: "$", EUR: "€", GBP: "£", AED: "د.إ", AUD: "A$", CAD: "C$", SGD: "S$" };
const storedDonors = JSON.parse(localStorage.getItem("careconnectDonors") || "[]");
const storedActivity = JSON.parse(localStorage.getItem("careconnectActivity") || "[]");

const donorColorClasses = ["", "avatar-blue", "avatar-pink", "avatar-yellow", "avatar-mint"];
const readDonorRows = (list) => [...list.querySelectorAll(".donor-row")].map((row) => ({
  name: row.querySelector("strong").textContent,
  cause: row.querySelector("small").textContent,
  amount: row.querySelector("b").textContent,
  isPublic: true
}));
const donors = storedDonors.length ? storedDonors : readDonorRows(donorListFull);
const formatMoney = (inrAmount, currency = currencySelect.value) => {
  const value = inrAmount * currencyRates[currency];
  return `${currencySymbols[currency]}${value.toLocaleString("en", { maximumFractionDigits: 2 })}`;
};
const getSelectedInr = () => Number(document.querySelector(".donation-amounts button.selected").dataset.inr);

const renderDonor = (donor, index) => {
  const row = document.createElement("div");
  row.className = "donor-row";
  const initials = donor.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  row.innerHTML = `<span class="donor-avatar ${donorColorClasses[index % donorColorClasses.length]}">${initials}</span><div><strong></strong><small></small></div><b></b>`;
  row.querySelector("strong").textContent = donor.name;
  row.querySelector("small").textContent = donor.cause;
  row.querySelector("b").textContent = donor.amount;
  return row;
};

const renderDonorLists = () => {
  const publicDonors = donors.filter((donor) => donor.isPublic !== false);
  donorListFull.replaceChildren(...publicDonors.map(renderDonor));
  donorListPreview.replaceChildren(...publicDonors.slice(0, 5).map(renderDonor));
  donorCount.textContent = `${publicDonors.length} donors`;
};

const updateCurrency = () => {
  const currency = currencySelect.value;
  document.querySelectorAll(".donation-amounts button").forEach((button) => {
    button.textContent = formatMoney(Number(button.dataset.inr), currency);
  });
  const customAmount = document.querySelector("#customAmount");
  customAmount.placeholder = `Enter amount in ${currencySymbols[currency]}`;
};

const renderActivity = (email) => {
  const activity = storedActivity.filter((item) => item.email.toLowerCase() === email.toLowerCase());
  const content = document.querySelector("#activityContent");
  const message = document.querySelector("#profileMessage");
  content.hidden = activity.length === 0;
  if (!activity.length) {
    message.textContent = "No donations found for this email in this browser.";
    return;
  }
  message.textContent = "";
  const total = activity.reduce((sum, item) => sum + item.inrAmount, 0);
  document.querySelector("#activityTotal").textContent = `${formatMoney(total)} donated`;
  document.querySelector("#activityCount").textContent = `${activity.length} contribution${activity.length === 1 ? "" : "s"}`;
  document.querySelector("#activityList").replaceChildren(...activity.map((item) => {
    const row = document.createElement("article");
    row.className = "activity-item";
    row.innerHTML = `<div><strong></strong><small></small></div><b></b>`;
    row.querySelector("strong").textContent = `${item.cause} · ${item.amount}`;
    row.querySelector("small").textContent = new Date(item.date).toLocaleDateString();
    row.querySelector("b").textContent = item.cause === "Money" ? `Private use: ${item.expenditure}` : "Thank you";
    return row;
  }));
};

const setupProfile = () => {
  const profileEmail = document.querySelector("#profileEmail");
  const profileName = document.querySelector("#profileName");
  const profileStatus = document.querySelector("#profileStatus");
  const profileAvatar = document.querySelector("#profileAvatar");
  if (currentUser) {
    profileEmail.value = currentUser.email;
    profileName.textContent = currentUser.name;
    profileStatus.textContent = `Logged in as ${currentUser.email}`;
    profileAvatar.textContent = currentUser.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
    accountNav.textContent = "Log out";
    accountNav.href = "#personal-profile";
    accountNav.insertAdjacentHTML("beforeend", " <span>↗</span>");
    accountNav.addEventListener("click", (event) => {
      event.preventDefault();
      localStorage.removeItem("careconnectUser");
      window.location.reload();
    });
    renderActivity(currentUser.email);
  } else {
    accountNav.textContent = "Log in";
    accountNav.insertAdjacentHTML("beforeend", " <span>↗</span>");
    profileNav.href = "login.html";
    document.querySelector("#viewActivity").textContent = "Log in to view activity →";
    document.querySelector("#viewActivity").addEventListener("click", () => {
      window.location.href = "login.html";
    });
  }
};

renderDonorLists();
updateCurrency();
setupProfile();

currencySelect.addEventListener("change", updateCurrency);
typeOptions.forEach((option) => option.addEventListener("click", () => {
  document.querySelector(".donation-type.selected").classList.remove("selected");
  option.classList.add("selected");
}));
amountOptions.forEach((option) => option.addEventListener("click", () => {
  document.querySelector(".donation-amounts button.selected").classList.remove("selected");
  option.classList.add("selected");
  document.querySelector("#customAmount").value = "";
}));

document.querySelector("#donate-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const email = form.querySelector('input[type="email"]').value.trim();
  const name = form.querySelector('input[type="text"]').value.trim();
  const customAmount = Number(form.querySelector("#customAmount").value);
  const currency = currencySelect.value;
  const inrAmount = customAmount ? customAmount / currencyRates[currency] : getSelectedInr();
  const amount = formatMoney(inrAmount, currency);
  const type = form.querySelector(".donation-type.selected strong").textContent;
  const isAnonymous = document.querySelector("#anonymousDonation").checked;
  const expenditure = type === "Money" ? `${formatMoney(inrAmount * 0.7, currency)} education materials, ${formatMoney(inrAmount * 0.2, currency)} meals, ${formatMoney(inrAmount * 0.1, currency)} centre care` : "";
  const accountNumber = String(Math.floor(1000000000 + Math.random() * 9000000000));
  const branchCode = String(Math.floor(1000 + Math.random() * 9000));
  const upiId = `careconnect${Math.floor(100 + Math.random() * 900)}@upi`;

  document.querySelector("#paymentEmail").textContent = email;
  document.querySelector("#accountName").textContent = "CareConnect Demo Trust";
  document.querySelector("#bankName").textContent = "Unity Community Bank";
  document.querySelector("#accountNumber").textContent = accountNumber;
  document.querySelector("#ifscCode").textContent = `UCBK0CC${branchCode}`;
  document.querySelector("#upiId").textContent = upiId;
  document.querySelector("#paymentQr").src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=CareConnect%20Demo&am=${(inrAmount * currencyRates.INR).toFixed(2)}&cu=INR`)}`;

  storedActivity.unshift({ email, cause: type, amount, inrAmount, expenditure, date: new Date().toISOString() });
  localStorage.setItem("careconnectActivity", JSON.stringify(storedActivity));
  if (!isAnonymous) {
    donors.unshift({ name, cause: type, amount, isPublic: true });
    localStorage.setItem("careconnectDonors", JSON.stringify(donors));
  }
  renderDonorLists();
  document.querySelector("#profileEmail").value = email;
  renderActivity(email);
  document.querySelector("#paymentModal").classList.add("open");
  document.querySelector("#paymentModal").setAttribute("aria-hidden", "false");
  document.querySelector("#closePayment").focus();
});

document.querySelector("#viewActivity").addEventListener("click", () => {
  if (!currentUser) return;
  const email = document.querySelector("#profileEmail").value.trim();
  if (!email || !document.querySelector("#profileEmail").checkValidity()) {
    document.querySelector("#profileEmail").reportValidity();
    return;
  }
  renderActivity(email);
});

const donorModal = document.querySelector("#donorModal");
const showDonorList = document.querySelector("#showDonorList");
const closeDonorList = document.querySelector("#closeDonorList");
const openDonorList = () => { donorModal.classList.add("open"); donorModal.setAttribute("aria-hidden", "false"); closeDonorList.focus(); };
const hideDonorList = () => { donorModal.classList.remove("open"); donorModal.setAttribute("aria-hidden", "true"); showDonorList.focus(); };
showDonorList.addEventListener("click", openDonorList);
closeDonorList.addEventListener("click", hideDonorList);
donorModal.addEventListener("click", (event) => { if (event.target === donorModal) hideDonorList(); });

const paymentModal = document.querySelector("#paymentModal");
const hidePayment = () => { paymentModal.classList.remove("open"); paymentModal.setAttribute("aria-hidden", "true"); };
document.querySelector("#closePayment").addEventListener("click", hidePayment);
document.querySelector("#paymentDone").addEventListener("click", hidePayment);
paymentModal.addEventListener("click", (event) => { if (event.target === paymentModal) hidePayment(); });
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && donorModal.classList.contains("open")) hideDonorList();
  if (event.key === "Escape" && paymentModal.classList.contains("open")) hidePayment();
});
