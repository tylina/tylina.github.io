const picker = document.querySelector('[data-platform-picker]');
if (picker) {
  const buttons = [...picker.querySelectorAll('[data-platform]')];
  const panels = [...document.querySelectorAll('[data-platform-panel]')];
  picker.dataset.enhanced = '';
  picker.parentElement.dataset.enhanced = '';
  picker.setAttribute('role', 'tablist');
  const select = (name) => {
    for (const button of buttons) {
      const selected = button.dataset.platform === name;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    }
    for (const panel of panels) {
      panel.setAttribute('role', 'tabpanel');
      panel.hidden = panel.dataset.platformPanel !== name;
    }
  };
  // Detect the OS only. CPU architecture stays an explicit download choice.
  const platform = navigator.userAgentData?.platform ?? navigator.platform;
  const name = platform.toLowerCase();
  select(name.includes('win') ? 'windows' : name.includes('linux') ? 'linux' : 'mac');
  picker.addEventListener('click', (event) => {
    const button = event.target.closest('[data-platform]');
    if (button) select(button.dataset.platform);
  });
  picker.addEventListener('keydown', (event) => {
    const current = buttons.indexOf(document.activeElement);
    if (current < 0) return;
    const next = event.key === 'ArrowRight' ? (current + 1) % buttons.length
      : event.key === 'ArrowLeft' ? (current + buttons.length - 1) % buttons.length
      : event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : undefined;
    if (next === undefined) return;
    event.preventDefault(); select(buttons[next].dataset.platform); buttons[next].focus();
  });
}
const copy = document.querySelector('[data-copy-command]');
const feedback = document.querySelector('.command-feedback');
let copied;
function updateLanguage() {
  const chinese = document.documentElement.dataset.lang === 'zh';
  picker?.setAttribute('aria-label', chinese ? '操作系统' : 'Operating system');
  copy?.setAttribute('aria-label', chinese ? '复制安装命令' : 'Copy installation command');
  if (copied !== undefined) feedback.textContent = copied
    ? (chinese ? '已复制安装命令' : 'Installation command copied')
    : (chinese ? '请选中上方命令并复制。' : 'Select the command above to copy it.');
}
updateLanguage();
new MutationObserver(updateLanguage).observe(document.documentElement, {attributes:true,attributeFilter:['data-lang']});
copy?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(document.querySelector('[data-command]').textContent);
    copied = true;
  } catch { copied = false; }
  updateLanguage();
});
