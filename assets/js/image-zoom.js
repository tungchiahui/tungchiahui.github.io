// 引入 Medium Zoom 库(图片点击放大效果)
window.addEventListener("load", () => {
  // 等所有资源（包括图片）加载完后再执行，防止初始化阻塞
  const images = document.querySelectorAll('.post-content img');

  // 过滤掉不需要放大的图片（例如代码块、表格中的图）
  const validImages = Array.from(images).filter(img => {
    return !img.closest('pre, code, table');
  });

  // 初始化 Medium Zoom
  const zoom = mediumZoom(validImages, {
    margin: 24, // 放大时边距
    background: 'rgba(0,0,0,0.8)', // 背景遮罩色
    scrollOffset: 40 // 滚动多少距离后关闭放大
  });

  // 如果页面有懒加载，确保新加载图片也能被放大
  document.addEventListener('lazyloaded', () => {
    zoom.detach();
    zoom.attach('.post-content img');
  });
});