(() => {
  const DEBUG = true;
  let elements = {
    body: document.querySelector("body"),
    homeBtn: document.getElementById("home-btn"),
    sidebarOut: document.querySelector(".sidebar-out"),
    sidebar: document.querySelector(".sidebar"),
    dotOutBottom: document.querySelector(".dot-out-bottom"),
    goalsStatusFilterOut: document.querySelector(".goals-status-filter-out"),
  }

  if (DEBUG) {
    let div = document.createElement("div");
    div.className = "sidebar-debug";
    
    let divHead = document.createElement("div");
    divHead.className = "sidebar-debug-heading";
    divHead.textContent = "Debug Tools"
    
    let divMenu = document.createElement("div");
    divMenu.className = "sidebar-debug-menu";
    
    let divMenuItem1 = document.createElement("div");
    divMenuItem1.textContent = "Current Date";
    divMenuItem1.id = "debug-date-change";
    
    let divMenuItem2 = document.createElement("div");
    divMenuItem2.textContent = "Clear Database";
    divMenuItem2.id = "debug-clear-database";
    divMenu.append(divMenuItem1, divMenuItem2);

    div.append(divHead, divMenu);
    
    elements.sidebar.appendChild(div);
  }

  function clearDatabase() {
      const confirmDelete = confirm("⚠️ Are you sure? This will delete all dots, settings, goals, and cache. The app will reload.");
      
      if (confirmDelete) {
          // 1. Clear Local and Session Storage (Removes mocked dates and minor settings)
          localStorage.clear();
          sessionStorage.clear();
          
          // 2. Delete the IndexedDB database
          const req = indexedDB.deleteDatabase("Days");
          
          req.onsuccess = function () {
              console.log("Deleted database successfully");
              window.location.href = "./index.html"; // Redirect to home to rebuild DB
          };
          
          req.onerror = function () {
              console.error("Couldn't delete database");
              alert("Failed to delete database. Try closing other tabs of this app.");
          };
          
          req.onblocked = function () {
              console.warn("Database deletion blocked. Force reloading.");
              window.location.href = "./index.html";
          };
      }
  }

  
  elements.homeBtn.addEventListener("click", (e) => {
    elements.sidebarOut.classList.add("sidebar-active");
    elements.body.classList.add("modal-active");
    elements.sidebar.classList.add("sidebar-slide");
  })

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
    
    if (elements.goalsStatusFilterOut && elements.goalsStatusFilterOut.contains(e.target)) {
      isSwiping = false;
    }
    // isActive is from dotFishEyeEffect if hold and press is active then do not do anything
    if (typeof isActive !== 'undefined' && isActive) {
      // currentX = startX; // Nullify the horizontal distance
      isSwiping = false;
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

  elements.sidebar.addEventListener("click", (e) => {
    if (e.target.id === "debug-date-change") {
      
    }

    if (e.target.id === "debug-clear-database") {
      clearDatabase();
    }
  })


  
  
})();