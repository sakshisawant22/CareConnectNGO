const typeOptions = document.querySelectorAll(".donation-type");
const amountOptions = document.querySelectorAll(".donation-amounts button");

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
  const message = document.querySelector(".donation-message");
  const type = document.querySelector(".donation-type.selected strong").textContent;
  message.textContent = `Thank you — your ${type.toLowerCase()} donation is ready to continue.`;
  event.currentTarget.querySelector(".button").textContent = "Thank you for caring ✓";
});
