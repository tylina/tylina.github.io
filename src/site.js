import { createIcons, Globe2 } from "lucide";

const languageKey = "tylina-language";
const root = document.documentElement;

createIcons({
  icons: { Globe2 },
  attrs: { width: 18, height: 18, "stroke-width": 1.8 },
});

function preferredLanguage() {
  const saved = localStorage.getItem(languageKey);
  if (saved === "zh" || saved === "en") return saved;
  return "en";
}

function setLanguage(language, persist = true) {
  root.dataset.lang = language;
  root.lang = language === "zh" ? "zh-CN" : "en";
  if (persist) localStorage.setItem(languageKey, language);
  document.querySelectorAll("[data-language-toggle]").forEach((trigger) => {
    trigger.setAttribute("aria-label", language === "zh" ? "选择语言" : "Choose language");
  });
  document.querySelectorAll("[data-language-option]").forEach((option) => {
    option.setAttribute("aria-checked", String(option.dataset.languageOption === language));
  });
}

setLanguage(preferredLanguage(), false);

function closeLanguagePicker(picker, restoreFocus = false) {
  const trigger = picker.querySelector("[data-language-toggle]");
  const menu = picker.querySelector("[data-language-menu]");
  menu.hidden = true;
  trigger.setAttribute("aria-expanded", "false");
  if (restoreFocus) trigger.focus();
}

document.querySelectorAll("[data-language-picker]").forEach((picker) => {
  const trigger = picker.querySelector("[data-language-toggle]");
  const menu = picker.querySelector("[data-language-menu]");
  const options = [...picker.querySelectorAll("[data-language-option]")];

  trigger.addEventListener("click", () => {
    const willOpen = menu.hidden;
    document.querySelectorAll("[data-language-picker]").forEach((otherPicker) => {
      if (otherPicker !== picker) closeLanguagePicker(otherPicker);
    });
    menu.hidden = !willOpen;
    trigger.setAttribute("aria-expanded", String(willOpen));
    if (willOpen) {
      (options.find((option) => option.dataset.languageOption === root.dataset.lang) ?? options[0]).focus();
    }
  });

  options.forEach((option, index) => {
    option.addEventListener("click", () => {
      setLanguage(option.dataset.languageOption);
      closeLanguagePicker(picker, true);
    });
    option.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      options[(index + direction + options.length) % options.length].focus();
    });
  });

  picker.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeLanguagePicker(picker, true);
  });
});

document.addEventListener("pointerdown", (event) => {
  document.querySelectorAll("[data-language-picker]").forEach((picker) => {
    if (!picker.contains(event.target)) closeLanguagePicker(picker);
  });
});

document.querySelectorAll("[data-current-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});
