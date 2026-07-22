(() => {
  let elements = {
    body: document.querySelector("body"),
    right: document.querySelector(".right"),
    rightYear: document.querySelector(".year"),
    topbarYearSelector: document.querySelector(".topbar-year-selector"),
    headPercentage: document.querySelector(".head-percentage"),
    headPercentageLabel: document.querySelector(".head-percentage-label"),
    headTime: document.querySelector(".head-time"),
    headLabel: document.querySelector(".head-label"),
    headBottomElapsed: document.querySelector("#head-bottom-elapsed"),
    headBottomLeft: document.querySelector("#head-bottom-left"),
    headBottomPercentage: document.querySelector(".head-bottom-percentage"),
    progressFill: document.querySelector("#progressFill"),
    dotOutBottom: document.querySelector(".dot-out-bottom"),
  }

  // For head
  function getYearProgress(now) {
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfNextYear = new Date(now.getFullYear() + 1, 0, 1);

    const elapsed = now - startOfYear;
    const total = startOfNextYear - startOfYear;

    return {
        year: `OF ${now.getFullYear()} GONE`,
        progress: `${((elapsed / total) * 100).toFixed(2)}%`
    };
  }

  function getTimeUntilYearEnd(now) {
    // Jan is 0, Dec is 11
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    let diff = endOfYear - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff %= 1000 * 60 * 60 * 24;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff %= 1000 * 60 * 60;
    const minutes = Math.floor(diff / (1000 * 60));
    diff %= 1000 * 60;
    const seconds = Math.floor(diff / 1000);
    let timeLeft = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    return timeLeft;
  }

  function getTimeUntilYearEndHours(now) {
    const endOfYear = new Date(now.getFullYear() + 1, 0, 1);

    let diff = endOfYear - now;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff %= 1000 * 60 * 60;

    const minutes = Math.floor(diff / (1000 * 60));
    diff %= 1000 * 60;

    const seconds = Math.floor(diff / 1000);
    let timeLeft = `${hours}hr ${minutes}min ${seconds}s`;
    return timeLeft;
  }

  function getYearLeft(now) {

    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfNextYear = new Date(now.getFullYear(), 11, 31);
    startOfNextYear.setHours(23, 59, 59, 0);

    const elapsedMs = now - startOfYear;
    const totalMs = startOfNextYear - startOfYear;
    const leftMs = startOfNextYear - now;

    return {
        elapsed: Math.floor(elapsedMs / (1000 * 60 * 60 * 24))+1,
        left: Math.floor(leftMs / (1000 * 60 * 60 * 24)),
        leftPercentage: `${((leftMs / totalMs) * 100).toFixed(2)}`
    };
  }
  
  function displayHeadTop(now) {
    const { year, progress } = getYearProgress(now);
    elements.headPercentage.innerText = progress;
    elements.headPercentageLabel.innerText = year;
  }
  
  function displayHeadMiddle(now) {
    if (elements.headTime.dataset.value === "full") {
      elements.headTime.innerText = getTimeUntilYearEnd(now)
      elements.headLabel.innerText = "TIME REMAINING"
    } else {
      elements.headTime.innerText = getTimeUntilYearEndHours(now)
      elements.headLabel.innerText = "TOTAL HOURS LEFT"
    }
  }

  function displayHeadBottom(now) {
    const { elapsed, left, leftPercentage } = getYearLeft(now)
    elements.headBottomElapsed.innerText = elapsed
    elements.headBottomLeft.innerText =left
    elements.headBottomPercentage.innerText = `${leftPercentage}%`;
    elements.progressFill.style.setProperty("--progress", `${100-leftPercentage}%`);
  }

  function populateHead(date) {
    displayHeadTop(date);
    displayHeadMiddle(date);
    displayHeadBottom(date);
  }
  // head end

  // for dots and topbar year
  function getDistinctYearsAndDots() {
    return new Promise((resolve, reject) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const year = today.getFullYear();
      const dots = [];
      const years = new Set();
      const tx = db.transaction("HomeDots", "readwrite");
      const store = tx.objectStore("HomeDots");
      const request = store.openCursor();
      request.onsuccess = (e) => {
        const cursor = e.target.result;
        if (!cursor) {
          resolve({ dots, years });
          return;
        }
        if (cursor.key.startsWith(year)) {
          dots.push(cursor.value);
          years.add(`${ cursor.key.substring(0, 4) } (Current)`)
        } else {
          years.add(cursor.key.substring(0, 4))
        }
        cursor.continue();
      }
    })
  }
  
  function populateTopbarYearSelector(years) {
    const fragment = document.createDocumentFragment();
    for (const year of years) {
      let d = document.createElement("div")
      d.innerText = year;
      d.dataset.value = year.split("(")[0].trim()
      fragment.appendChild(d)
    }
    elements.topbarYearSelector.replaceChildren(fragment)
  }
  
  // let populateDots = async ()=> {
  async function populateDots(dots){
    // elements.dotOutBottom.innerHTML = ""
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < dots.length; i++) {
      let dot = document.createElement("div")
      dot.classList.add("dot")
      dot.classList.add(dots[i].status.toLowerCase())
      dot.dataset.value = dots[i].date
      fragment.appendChild(dot);
    }
    elements.dotOutBottom.replaceChildren(fragment);

    document.dispatchEvent(new Event("dotsReady"));
  }

  async function init() {
    let { dots, years } = await getDistinctYearsAndDots();
    populateTopbarYearSelector(years);
    populateDots(dots);


    elements.topbarYearSelector.querySelectorAll("div").forEach((d) => {
      d.addEventListener("click", (e) => {
        clearInterval(intervalId);
        
        const today = new Date();
        const year = today.getFullYear();
        
        const dateSelected = new Date(e.target.dataset.value,11,31);
        dateSelected.setHours(23, 59, 59, 0);
        const yearSelected = dateSelected.getFullYear()
        
        if (yearSelected == year) {
          intervalId = setInterval(() => {
            populateHead(new Date());
          }, 1000);
        } else {
          populateHead(dateSelected);
        }
        
        elements.topbarYearSelector.classList.toggle("active");
        elements.rightYear.innerText = e.target.textContent.trim();
      })
    })
    
  }

  // Event listeners
  
  elements.right.addEventListener("click", (e) => {
    elements.topbarYearSelector.classList.toggle("active");
  })
  
  elements.headTime.addEventListener("click", (e) => {
    if (e.target.dataset.value == "full") {
      e.target.dataset.value = "hours"
    } else {
      e.target.dataset.value = "full"
    }
  })
  
  document.addEventListener("dbReady",init)
  let intervalId = null;
  intervalId = setInterval(() => {
      populateHead(new Date());
  }, 1000);

})();