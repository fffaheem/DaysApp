(() => {

  let elements = {
    body: document.querySelector("body"),
    homeBtn: document.getElementById("home-btn"),
    sidebarOut: document.querySelector(".sidebar-out"),
    sidebarCloseBtn: document.getElementById("sidebar-close-btn"),
  }




  elements.homeBtn.addEventListener("click", (e) => {
    elements.sidebarOut.classList.add("sidebar-active");
    elements.body.classList.add("modal-active");
  })

  elements.sidebarCloseBtn.addEventListener("click", (e) => {
    elements.sidebarOut.classList.remove("sidebar-active");
    elements.body.classList.remove("modal-active");
  })

  


  
})();