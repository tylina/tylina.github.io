const languageKey = "tylina-language";
const root = document.documentElement;

function preferredLanguage() {
  const saved = localStorage.getItem(languageKey);
  if (saved === "zh" || saved === "en") return saved;
  return navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

function setLanguage(language, persist = true) {
  root.dataset.lang = language;
  root.lang = language === "zh" ? "zh-CN" : "en";
  if (persist) localStorage.setItem(languageKey, language);
  document.querySelectorAll("[data-language-toggle]").forEach((button) => {
    button.setAttribute("aria-label", language === "zh" ? "Switch to English" : "切换到中文");
  });
}

setLanguage(preferredLanguage(), false);

document.querySelectorAll("[data-language-toggle]").forEach((button) => {
  button.addEventListener("click", () => setLanguage(root.dataset.lang === "zh" ? "en" : "zh"));
});

document.querySelectorAll("[data-current-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});
