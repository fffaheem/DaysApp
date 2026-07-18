(() => {

  let elements = {
    body: document.querySelector("body"),
    homeBtn: document.getElementById("home-btn"),
    sidebarOut: document.querySelector(".sidebar-out"),
    sidebarCloseBtn: document.getElementById("sidebar-close-btn"),
    sidebar: document.querySelector(".sidebar"),
  }


  elements.homeBtn.addEventListener("click", (e) => {
    elements.sidebarOut.classList.add("sidebar-active");
    elements.body.classList.add("modal-active");
    elements.sidebar.classList.add("sidebar-slide");
  })

  elements.sidebarCloseBtn.addEventListener("click", (e) => {
    elements.sidebar.classList.remove("sidebar-slide");
    elements.sidebarOut.classList.remove("sidebar-active");
    elements.body.classList.remove("modal-active");
  })

  elements.sidebarOut.addEventListener("click", (e) => {
    if (e.target === elements.sidebarOut) {
      elements.sidebar.classList.remove("sidebar-slide");
      elements.sidebarOut.classList.remove("sidebar-active");
      elements.body.classList.remove("modal-active");
    }
  })

  let startX = 0;
  let currentX = 0;
  document.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
  });

  document.addEventListener("touchmove", e => {
    currentX = e.touches[0].clientX;
  })
  
  document.addEventListener("touchend", e => {
    const dx = currentX - startX;

    if (dx > 50) {
      elements.sidebarOut.classList.add("sidebar-active");
      elements.body.classList.add("modal-active");
      elements.sidebar.classList.add("sidebar-slide");
    }
    if (dx < -50) {
      elements.sidebar.classList.remove("sidebar-slide");
      elements.sidebarOut.classList.remove("sidebar-active");
      elements.body.classList.remove("modal-active");
    }
  });
  
})();