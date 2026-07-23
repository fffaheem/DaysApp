
document.addEventListener("dotsReady", () => {

  const container = document.querySelector(".dot-out-bottom");
  const dots = [...container.querySelectorAll(".dot")];
  // --- Configuration ---
  const EFFECT_RADIUS = 150; // Distance the cursor affects
  const MAX_SCALE = 2;     // Maximum size multiplier for the center dot
  const PUSH_AMOUNT = 20;    // How far surrounding dots slide away
  const SHARPNESS = 700;    // The lower this is, the sharper the center dot stands out

  let positions = [];

  function cachePositions() {
    // Briefly reset styles so we get accurate base positions
    dots.forEach(dot => {
      dot.style.setProperty('--s', 1);
      dot.style.setProperty('--push-x', '0px');
      dot.style.setProperty('--push-y', '0px');
    });

    positions = dots.map(dot => {
      const rect = dot.getBoundingClientRect();
      return {
        x: rect.left + window.scrollX + (rect.width / 2),
        y: rect.top + window.scrollY + (rect.height / 2)
      };
    });
  }

  // Cache positions immediately and on window resize
  cachePositions();
  window.addEventListener("resize", cachePositions);
  setTimeout(cachePositions, 500); // Failsafe for slow CSS rendering

  let mouseX = 0;
  let mouseY = 0;
  let frame = null;
  let isActive = false;

  function update() {
    if (!isActive) return;
    frame = null;

    for (let i = 0; i < dots.length; i++) {
      const dx = positions[i].x - mouseX;
      const dy = positions[i].y - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > EFFECT_RADIUS) {
        dots[i].style.setProperty('--s', 1);
        dots[i].style.setProperty('--push-x', '0px');
        dots[i].style.setProperty('--push-y', '0px');
        dots[i].style.zIndex = "1";
        continue;
      }

      // 1. GAUSSIAN SIZE MATH: Creates a sharp peak for the single closest dot
      const sizeInfluence = Math.exp(-(distance * distance) / SHARPNESS);
      const sizeMultiplier = 1 + (sizeInfluence * (MAX_SCALE - 1));

      // 2. SINE WAVE PUSH MATH: Surrounding dots smoothly make room
      const distanceRatio = distance / EFFECT_RADIUS;
      const pushInfluence = Math.sin(distanceRatio * Math.PI);
        
      let pushX = 0;
      let pushY = 0;
        
      if (distance > 0) {
        const push = pushInfluence * PUSH_AMOUNT;
        pushX = (dx / distance) * push;
        pushY = (dy / distance) * push;
      }

      // Apply via CSS Variables
      dots[i].style.setProperty('--s', sizeMultiplier);
      dots[i].style.setProperty('--push-x', `${pushX}px`);
      dots[i].style.setProperty('--push-y', `${pushY}px`);
      dots[i].style.zIndex = Math.round(sizeMultiplier * 10);
    }
  }

  function startInteraction(x, y) {
    if (!isActive) {
      isActive = true;
      container.classList.add("is-active");

      // Disable scrolling now
      container.style.touchAction = "none";
    }
    mouseX = x;
    mouseY = y;
    
    if (frame === null) {
      frame = requestAnimationFrame(update);
    }
  }

  function stopInteraction() {
    isActive = false;
    container.classList.remove("is-active");
    container.style.touchAction = "";
    if (frame !== null) {
      cancelAnimationFrame(frame);
      frame = null;
    }
    
    dots.forEach(dot => {
      dot.style.setProperty('--s', 1);
      dot.style.setProperty('--push-x', '0px');
      dot.style.setProperty('--push-y', '0px');
      dot.style.zIndex = "1";
    });

    removeToolkit();
      
  }

  function removeToolkit() {
    let toolkit = document.querySelector(".toolkit");
    toolkit.classList.remove("active");
  }

  function addToolkit(target) {
    let toolkit = document.querySelector(".toolkit");
    let toolkitDate = document.querySelector(".toolkit-date");
    let toolkitStatus = document.querySelector(".toolkit-status");
    if (target.classList.contains("dot")) {
      toolkit.classList.add("active");
      const date = new Date(target.dataset.value);
      
      const formatted = date.toLocaleDateString("en-US", {
        month: "long",
        day: "2-digit",
        weekday: "long",
      }).replace(",", " -");

      toolkitDate.textContent = formatted;
      let status = `Dtoolkit-${target.classList[1]}`;
      toolkit.classList.forEach(className => {
        if (className.startsWith("D")) {
          toolkit.classList.remove(className);
        }
      });
      toolkit.classList.add(status)
      toolkitStatus.classList.forEach(className => {
        if (className.startsWith("D")) {
          toolkitStatus.classList.remove(className);
        }
      });
      toolkitStatus.classList.add(status)
    }
  }

  function addToolkitAtPoint(x, y) {
    const dot = document.elementFromPoint(x, y)?.closest(".dot");
    if (!dot) return;
    addToolkit(dot)
  }

  // Desktop Events (Fixed 'Stuck on Tap' bug) ---
  // Using Pointer Events, but explicitly ignoring mobile touch
  container.addEventListener("pointermove", e => {
    if (e.pointerType === "touch") return; 
    startInteraction(e.pageX, e.pageY);
    addToolkit(e.target);
  });
  
  container.addEventListener("pointerleave", e => {
    if (e.pointerType === "touch") return;
    stopInteraction();
  });

  container.addEventListener("click", (e) => {
    if (e.target.classList.contains("dot")) {
      console.log(e.target);
      stopInteraction();
      window.location.href = `./dotOpen.html?date=${e.target.dataset.value}`
    }
  });

  // --- Mobile Touch Events (Long Press) ---
  const HOLD_DELAY = 250;      // ms
  const MOVE_THRESHOLD = 10;   // px

  let holdTimer = null;
  let touchStartX = 0;
  let touchStartY = 0;

  container.addEventListener("touchstart", e => {
    const touch = e.touches[0];

    touchStartX = touch.pageX;
    touchStartY = touch.pageY;

    // Prevent default scrolling right away if touching the dot container
    // e.preventDefault(); 

    holdTimer = setTimeout(() => {
      startInteraction(touch.pageX, touch.pageY);
      addToolkitAtPoint(touch.clientX, touch.clientY);
    }, HOLD_DELAY);
  }, { passive: false }); // CRITICAL: Change passive to false here so preventDefault works!

  container.addEventListener("touchmove", e => {
    const touch = e.touches[0];

    const dx = touch.pageX - touchStartX;
    const dy = touch.pageY - touchStartY;

    // Cancel long press if finger moved too much before activation
    if (!isActive && Math.hypot(dx, dy) > MOVE_THRESHOLD) {
      clearTimeout(holdTimer);
      return;
    }

    // Always prevent default when interacting or preparing to interact
    e.preventDefault();
    
    if (isActive) {
      startInteraction(touch.pageX, touch.pageY);
      addToolkitAtPoint(touch.clientX, touch.clientY);
    }
  }, { passive: false });

  container.addEventListener("touchend", e => {
    const touch = e.changedTouches[0];
    clearTimeout(holdTimer);

    if (isActive) {
      const dot = document.elementFromPoint(touch.clientX, touch.clientY)?.closest(".dot");
      if (dot) {
        window.location.href = `./dotOpen.html?date=${dot.dataset.value}`
      }
      stopInteraction();
    }
  });

  container.addEventListener("touchcancel", () => {
    clearTimeout(holdTimer);

    if (isActive) {
      stopInteraction();
    }
  });

  // Prevent the native mobile "long press" menu (text selection/save image) from popping up
  container.addEventListener("contextmenu", e => {
    e.preventDefault();
  });

  
})