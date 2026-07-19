(() => {

  let elements = {
    body: document.querySelector("body"),
    homeBtn: document.getElementById("home-btn"),
    sidebarOut: document.querySelector(".sidebar-out"),
    // sidebarCloseBtn: document.getElementById("sidebar-close-btn"),
    sidebar: document.querySelector(".sidebar"),
    dotOutBottom: document.querySelector(".dot-out-bottom"),
  }


  elements.homeBtn.addEventListener("click", (e) => {
    elements.sidebarOut.classList.add("sidebar-active");
    elements.body.classList.add("modal-active");
    elements.sidebar.classList.add("sidebar-slide");
  })

  // elements.sidebarCloseBtn.addEventListener("click", (e) => {
  //   elements.sidebar.classList.remove("sidebar-slide");
  //   elements.sidebarOut.classList.remove("sidebar-active");
  //   elements.body.classList.remove("modal-active");
  // })

  elements.sidebarOut.addEventListener("click", (e) => {
    if (e.target === elements.sidebarOut) {
      elements.sidebar.classList.remove("sidebar-slide");
      elements.sidebarOut.classList.remove("sidebar-active");
      elements.body.classList.remove("modal-active");
    }
  })

  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let currentY = 0;
  let directionChanged = false;
  let isSwiping = false; // Tracks if the user actually dragged their finger
  document.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    directionChanged = false;
    isSwiping = false;
  });

  document.addEventListener("touchmove", e => {
    isSwiping = true;
    currentX = e.touches[0].clientX;
    currentY = e.touches[0].clientY;

    // isActive is from dotFishEyeEffect if hold and press is active then do not do anything
    if (typeof isActive !== 'undefined' && isActive) {
      currentX = startX; // Nullify the horizontal distance
    }
    
    const dy = currentY - startY;
    if (Math.abs(dy) > 50) {
      directionChanged = true;
    }

  })
  
  document.addEventListener("touchend", e => {
    const dx = currentX - startX;
    if (!isSwiping) {
      return;
    }
    
    if (directionChanged) {
      return;
    }
      
    if (dx > 50 ) {
      elements.sidebarOut.classList.add("sidebar-active");
      elements.body.classList.add("modal-active");
      elements.sidebar.classList.add("sidebar-slide");
    }
    if (dx < -50) {
      elements.sidebar.classList.remove("sidebar-slide");
      elements.sidebarOut.classList.remove("sidebar-active");
      elements.body.classList.remove("modal-active");
    }

    currentX = startX
  });
  
})();