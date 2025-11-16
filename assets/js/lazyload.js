// lazyload.js
function initLazyLoad() {
  const imgs = document.querySelectorAll('.post-content img');

  imgs.forEach(img => {
    if (!img.dataset.src) {
      img.dataset.src = img.src; 
      img.removeAttribute('src'); 
    }
  });

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;

        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');

          img.addEventListener('load', () => {
            const event = new CustomEvent('lazyloaded', { detail: { img } });
            document.dispatchEvent(event);
          }, { once: true });
        }

        obs.unobserve(img);
      }
    });
  }, {
    root: null,
    rootMargin: '666px 0px',
    threshold: 0
  });

  imgs.forEach(img => observer.observe(img));
}

// 页面首次加载时初始化
document.addEventListener("DOMContentLoaded", initLazyLoad);

// PJAX 切换后也要初始化
document.addEventListener("pjax:complete", initLazyLoad);