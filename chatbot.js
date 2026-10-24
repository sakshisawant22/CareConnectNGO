const chatToggle = document.querySelector("#chatToggle");
const chatPanel = document.querySelector("#chatPanel");
const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const chatMessages = document.querySelector("#chatMessages");

const answers = [
  { words: ["donat", "give"], answer: "You can donate money, food, clothes, or learning spaces from our Donate page." },
  { words: ["currency", "currencies"], answer: "We accept INR, USD, EUR, GBP, AED, AUD, CAD, and SGD in the demo." },
  { words: ["anonymous", "private"], answer: "Yes. Select “Give anonymously” and your name will stay off the public supporter list." },
  { words: ["profile", "activity", "history"], answer: "Log in to view all donations connected to your email in your private profile." },
  { words: ["volunteer", "help"], answer: "You can volunteer your time, share a skill, or organise a fundraiser through our Get involved form." },
  { words: ["hello", "hi", "hey"], answer: "Hi! I can answer simple questions about donating, volunteering, privacy, and your profile." }
];

const getAnswer = (question) => {
  const normalized = question.toLowerCase();
  if (normalized.includes("anonymous") || normalized.includes("private")) {
    return "Yes. Select “Give anonymously” and your name will stay off the public supporter list.";
  }
  const match = answers.find((item) => item.words.some((word) => normalized.includes(word)));
  return match ? match.answer : "I can help with donations, currencies, anonymous giving, volunteering, and your private profile.";
};

const addMessage = (text, sender) => {
  const message = document.createElement("p");
  message.className = `chat-message ${sender}`;
  message.textContent = text;
  chatMessages.append(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

chatToggle.addEventListener("click", () => {
  const isOpen = chatPanel.classList.toggle("open");
  chatToggle.setAttribute("aria-expanded", String(isOpen));
  if (isOpen) chatInput.focus();
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = chatInput.value.trim();
  if (!question) return;
  addMessage(question, "user");
  addMessage(getAnswer(question), "bot");
  chatInput.value = "";
});
