const typeOptions = document.querySelectorAll(".donation-type");
const amountOptions = document.querySelectorAll(".donation-amounts button");
const donorListFull = document.querySelector("#donorListFull");
const donorListPreview = document.querySelector("#donorListPreview");
const donorCount = document.querySelector("#donorCount");
const storedDonors = JSON.parse(localStorage.getItem("careconnectDonors") || "[]");

const donorColorClasses = ["", "avatar-blue", "avatar-pink", "avatar-yellow", "avatar-mint"];
const readDonorRows = (list) => [...list.querySelectorAll(".donor-row")].map((row) => ({
  name: row.querySelector("strong").textContent,
  cause: row.querySelector("small").textContent,
  amount: row.querySelector("b").textContent
}));
const donors = storedDonors.length ? storedDonors : readDonorRows(donorListFull);

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
  donorListFull.replaceChildren(...donors.map(renderDonor));
  donorListPreview.replaceChildren(...donors.slice(0, 5).map(renderDonor));
  donorCount.textContent = `${donors.length} donors`;
};

renderDonorLists();

typeOptions.forEach((option) => {
  option.addEventListener("click", () => {
    document.querySelector(".donation-type.selected").classList.remove("selected");
    option.classList.add("selected");
  });
});

amountOptions.forEach((option) => {
  option.addEventListener("click", () => {
    document.querySelector(".donation-amounts button.selected").classList.remove("selected");
    option.classList.add("selected");
    document.querySelector(".custom-amount input").value = "";
  });
});

document.querySelector("#donate-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const email = form.querySelector('input[type="email"]').value;
  const name = form.querySelector('input[type="text"]').value.trim();
  const customAmount = form.querySelector(".custom-amount input").value;
  const amount = customAmount ? `₹${Number(customAmount).toLocaleString("en-IN")}` : form.querySelector(".donation-amounts button.selected").textContent;
  const type = form.querySelector(".donation-type.selected strong").textContent;
  const accountNumber = String(Math.floor(1000000000 + Math.random() * 9000000000));
  const branchCode = String(Math.floor(1000 + Math.random() * 9000));
  const upiId = `careconnect${Math.floor(100 + Math.random() * 900)}@upi`;

  document.querySelector("#paymentEmail").textContent = email;
  document.querySelector("#accountName").textContent = "CareConnect Demo Trust";
  document.querySelector("#bankName").textContent = "Unity Community Bank";
  document.querySelector("#accountNumber").textContent = accountNumber;
  document.querySelector("#ifscCode").textContent = `UCBK0CC${branchCode}`;
  document.querySelector("#upiId").textContent = upiId;
  document.querySelector("#paymentQr").src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=CareConnect%20Demo&am=${amount.replace(/[^\d]/g, "")}&cu=INR`)}`;

  donors.unshift({ name, cause: type, amount });
  localStorage.setItem("careconnectDonors", JSON.stringify(donors));
  renderDonorLists();
  document.querySelector("#paymentModal").classList.add("open");
  document.querySelector("#paymentModal").setAttribute("aria-hidden", "false");
  document.querySelector("#closePayment").focus();
});

const donorModal = document.querySelector("#donorModal");
const showDonorList = document.querySelector("#showDonorList");
const closeDonorList = document.querySelector("#closeDonorList");

const openDonorList = () => {
  donorModal.classList.add("open");
  donorModal.setAttribute("aria-hidden", "false");
  closeDonorList.focus();
};

const hideDonorList = () => {
  donorModal.classList.remove("open");
  donorModal.setAttribute("aria-hidden", "true");
  showDonorList.focus();
};

showDonorList.addEventListener("click", openDonorList);
closeDonorList.addEventListener("click", hideDonorList);
donorModal.addEventListener("click", (event) => {
  if (event.target === donorModal) hideDonorList();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && donorModal.classList.contains("open")) hideDonorList();
});

const paymentModal = document.querySelector("#paymentModal");
const closePayment = document.querySelector("#closePayment");
const paymentDone = document.querySelector("#paymentDone");

const hidePayment = () => {
  paymentModal.classList.remove("open");
  paymentModal.setAttribute("aria-hidden", "true");
};

closePayment.addEventListener("click", hidePayment);
paymentDone.addEventListener("click", hidePayment);
paymentModal.addEventListener("click", (event) => {
  if (event.target === paymentModal) hidePayment();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && paymentModal.classList.contains("open")) hidePayment();
});
