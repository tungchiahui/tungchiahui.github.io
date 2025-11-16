function addCopyButtons() {
  document.querySelectorAll('div[class*="language-"].highlighter-rouge').forEach((highlightDiv) => {
    if (highlightDiv.querySelector('.copy-button')) return; // 防止重复添加
    const codePre = highlightDiv.querySelector('td.rouge-code pre');
    if (!codePre) return;

    const button = document.createElement('button');
    button.className = 'copy-button';
    button.type = 'button';
    button.innerText = '复制';

    button.addEventListener('click', () => {
      const text = codePre.innerText.trim();
      navigator.clipboard.writeText(text).then(() => {
        button.innerText = '已复制';
        setTimeout(() => button.innerText = '复制', 2000);
      });
    });

    highlightDiv.style.position = 'relative';
    button.style.position = 'absolute';
    button.style.top = '8px';
    button.style.right = '8px';
    button.style.padding = '4px 8px';
    button.style.fontSize = '0.8em';
    button.style.cursor = 'pointer';

    highlightDiv.appendChild(button);
  });
}

// 页面首次加载
document.addEventListener('DOMContentLoaded', addCopyButtons);

// PJAX 页面切换后也调用
document.addEventListener('pjax:complete', addCopyButtons);
