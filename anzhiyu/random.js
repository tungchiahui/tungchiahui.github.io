var posts=["2025/08/07/测试2/","2025/08/07/这是一篇测试博文/","2025/08/07/hello-world/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };