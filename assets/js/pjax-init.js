const pjax = new Pjax({
  elements: "a:not([target='_blank']):not([no-pjax])",
  selectors: ["title", "#pjax-container"]
});
