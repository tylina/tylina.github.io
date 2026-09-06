import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpenCheck,
  BrainCircuit,
  Download,
  FilePenLine,
  FileSearch,
  Globe2,
  LayoutTemplate,
  ListChecks,
  Menu,
  MousePointerClick,
  NotebookPen,
  Presentation,
  ScanText,
  Settings2,
  Sparkles,
  WandSparkles,
  createIcons,
} from "lucide";
import { setupSiteNavigation } from "./site-navigation.js";

const languageKey = "tylina-language";
const root = document.documentElement;

createIcons({
  icons: {
    ArrowLeft,
    ArrowRight,
    ArrowUpRight,
    BadgeCheck,
    BookOpenCheck,
    BrainCircuit,
    Download,
    FilePenLine,
    FileSearch,
    Globe2,
    LayoutTemplate,
    ListChecks,
    Menu,
    MousePointerClick,
    NotebookPen,
    Presentation,
    ScanText,
    Settings2,
    Sparkles,
    WandSparkles,
  },
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
  document.querySelector(".site-nav")?.setAttribute("aria-label", language === "zh" ? "主导航" : "Primary navigation");
  document.querySelector(".site-nav-toggle")?.setAttribute("aria-label", language === "zh" ? "导航" : "Navigation");
  document.querySelector(".brand")?.setAttribute("aria-label", language === "zh" ? "Tylina 主页" : "Tylina home");
  document.querySelector("[data-language-menu]")?.setAttribute("aria-label", language === "zh" ? "语言" : "Language");
}

setLanguage(preferredLanguage(), false);

function closeLanguagePicker(picker, restoreFocus = false) {
  const trigger = picker.querySelector("[data-language-toggle]");
  const menu = picker.querySelector("[data-language-menu]");
  menu.hidden = true;
  trigger.setAttribute("aria-expanded", "false");
  if (restoreFocus) trigger.focus();
}

const navigation = setupSiteNavigation(() => {
  document.querySelectorAll("[data-language-picker]").forEach((picker) => closeLanguagePicker(picker));
});

document.querySelectorAll("[data-language-picker]").forEach((picker) => {
  const trigger = picker.querySelector("[data-language-toggle]");
  const menu = picker.querySelector("[data-language-menu]");
  const options = [...picker.querySelectorAll("[data-language-option]")];

  trigger.addEventListener("click", () => {
    navigation.close();
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
  picker.addEventListener("focusout", (event) => {
    if (!picker.contains(event.relatedTarget)) closeLanguagePicker(picker);
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

function selectPreview(buttons, buttonKey, panels, panelKey, value) {
  buttons.forEach((button) => {
    button.setAttribute("aria-selected", String(button.dataset[buttonKey] === value));
  });
  panels.forEach((panel) => {
    panel.hidden = panel.dataset[panelKey] !== value;
  });
}

document.querySelectorAll("[data-editor-preview]").forEach((preview) => {
  const buttons = [...preview.querySelectorAll("[data-editor-mode]")];
  const copies = [...preview.querySelectorAll("[data-editor-copy]")];
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      preview.dataset.mode = button.dataset.editorMode;
      selectPreview(buttons, "editorMode", copies, "editorCopy", button.dataset.editorMode);
    });
  });
});

const aiButtons = [...document.querySelectorAll("[data-ai-task]")];
const aiPanels = [...document.querySelectorAll("[data-ai-panel]")];
const aiPreviews = [...document.querySelectorAll("[data-agent-preview]")];
aiButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectPreview(aiButtons, "aiTask", aiPanels, "aiPanel", button.dataset.aiTask);
    aiPreviews.forEach((preview) => {
      preview.dataset.aiState = button.dataset.aiTask;
    });
  });
});

document.querySelectorAll("[data-slide-studio]").forEach((studio) => {
  const buttons = [...studio.querySelectorAll("[data-slide-src]")];
  const mainImage = studio.querySelector("[data-slide-main]");
  const current = studio.querySelector("[data-slide-current]");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((candidate) => {
        candidate.setAttribute("aria-selected", String(candidate === button));
      });
      mainImage.src = button.dataset.slideSrc;
      current.textContent = button.dataset.slideNumber;
    });
  });
});

document.querySelectorAll("[data-use-carousel]").forEach((carousel) => {
  const cards = [...carousel.querySelectorAll("[data-scene]")];
  const previous = document.querySelector("[data-carousel-prev]");
  const next = document.querySelector("[data-carousel-next]");
  const count = document.querySelector("[data-carousel-count]");
  let activeIndex = 0;
  let updateQueued = false;

  function updateControls() {
    const viewportCenter = carousel.getBoundingClientRect().left + carousel.clientWidth / 2;
    activeIndex = cards.reduce((best, card, index) => {
      const cardRect = card.getBoundingClientRect();
      const bestRect = cards[best].getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const bestCenter = bestRect.left + bestRect.width / 2;
      return Math.abs(cardCenter - viewportCenter) < Math.abs(bestCenter - viewportCenter) ? index : best;
    }, 0);
    count.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;
    previous.disabled = activeIndex === 0;
    next.disabled = activeIndex === cards.length - 1;
  }

  function goTo(index) {
    const targetIndex = Math.max(0, Math.min(cards.length - 1, index));
    const carouselLeft = carousel.getBoundingClientRect().left;
    const targetLeft = cards[targetIndex].getBoundingClientRect().left;
    carousel.scrollTo({ left: carousel.scrollLeft + targetLeft - carouselLeft, behavior: "smooth" });
  }

  previous.addEventListener("click", () => goTo(activeIndex - 1));
  next.addEventListener("click", () => goTo(activeIndex + 1));
  carousel.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    goTo(activeIndex + (event.key === "ArrowRight" ? 1 : -1));
  });
  carousel.addEventListener("scroll", () => {
    if (updateQueued) return;
    updateQueued = true;
    requestAnimationFrame(() => {
      updateQueued = false;
      updateControls();
    });
  }, { passive: true });
  window.addEventListener("resize", updateControls, { passive: true });
  updateControls();
});
