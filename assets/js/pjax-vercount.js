function reloadVercount() {
  // 移除之前的 script（如果有的话）
  const oldScript = document.querySelector('script[data-vercount]');
  if (oldScript) oldScript.remove();

  // 创建新的 script
  const script = document.createElement('script');
  script.defer = true;
  script.src = "https://events.vercount.one/js";
  script.setAttribute('data-vercount', 'true');
  document.body.appendChild(script);
}

// 首次加载
document.addEventListener("DOMContentLoaded", reloadVercount);

// PJAX 切换后
document.addEventListener("pjax:complete", reloadVercount);