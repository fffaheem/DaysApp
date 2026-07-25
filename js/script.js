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
    productiveStat: document.querySelector("#productive-stat"),
    neutralStat: document.querySelector("#neutral-stat"),
    wastedStat: document.querySelector("#wasted-stat"),
    totalDaysStat: document.querySelector("#total-days-stat"),
    availableDaysStat: document.querySelector("#available-days-stat"),
    vacationStat: document.querySelector("#vacation-stat"),
    currentProductiveRateStat: document.querySelector("#current-productive-rate-stat"),
    currentWastedRateStat: document.querySelector("#current-wasted-rate-stat"),
    overAllProductivityRateStat: document.querySelector("#over-all-productivity-rate-stat"),
    currentStreakStat: document.querySelector("#current-streak-stat"),
    bestProductiveStreakStat: document.querySelector("#best-productive-streak-stat"),
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
      elapsed: Math.floor(elapsedMs / (1000 * 60 * 60 * 24)) + 1,
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
    elements.headBottomLeft.innerText = left
    elements.headBottomPercentage.innerText = `${leftPercentage}%`;
    elements.progressFill.style.setProperty("--progress", `${100 - leftPercentage}%`);
  }

  function populateHead(date) {
    displayHeadTop(date);
    displayHeadMiddle(date);
    displayHeadBottom(date);
  }
  // head end

  // for dots and topbar year

  function getDefaultFromSetting() {
    return new Promise((resolve, reject) => {
      let tx = db.transaction("Preferences", "readonly");
      let store = tx.objectStore("Preferences");
      store.get("user_settings").onsuccess = (e) => {
        const setting = e.target.result;
        let defaultDayStatus = setting.defaultDayStatus;
        resolve(defaultDayStatus);
      };
    });
  };

  async function updateDotsToday() {
    let defaultDayStatus = await getDefaultFromSetting();
    return new Promise((resolve, reject) => {

      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const dateString = `${yyyy}-${mm}-${dd}`;
      
      const range = IDBKeyRange.upperBound(dateString);
      
      let tx = db.transaction("HomeDots", "readwrite");
      let store = tx.objectStore("HomeDots");
      let request = store.openCursor(range);
      request.onsuccess = (e) => {
        const cursor = e.target.result;
        if (!cursor) {
          return;
        }
        if(cursor.value.date === dateString &&
            (cursor.value.status === "PRESENT" ||
            cursor.value.status === "FUTURE")
          ){
          cursor.update({
            ...cursor.value,
            status: "PRESENT"
          });
        }else if(cursor.value.status === "PRESENT" || cursor.value.status === "FUTURE") {
          cursor.update({
            ...cursor.value,
            status: defaultDayStatus
          });
        }
        
        cursor.continue();
      }

      tx.oncomplete = () => resolve();
      request.onerror = () => reject(request.error);
    })
  }
  
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

  function topYearSelectorHandler(e) {
    const target = e.target.closest("div[data-value]");
    if (!target) return;
    
    clearInterval(intervalId);
    
    const today = new Date();
    const year = today.getFullYear();
    
    const dateSelected = new Date(target.dataset.value,11,31);
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
    elements.rightYear.innerText = target.textContent.trim();
  }
  
  async function populateDots(dots) {
    let today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    today = `${yyyy}-${mm}-${dd}`;
    
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < dots.length; i++) {
      let dot = document.createElement("div")
      dot.classList.add("dot")
      dot.classList.add(dots[i].status.toLowerCase())
      if (dots[i].date === today) {
        dot.classList.add("today")
      }
      dot.dataset.value = dots[i].date
      fragment.appendChild(dot);
    }
    elements.dotOutBottom.replaceChildren(fragment);

    document.dispatchEvent(new Event("dotsReady"));
  }

  function getDefault() {
    return new Promise((resolve) => {
      const tx = db.transaction("Preferences", "readonly");
      const store = tx.objectStore("Preferences");
      const request = store.get("user_settings")
      request.onsuccess = (e) => {
        resolve(e.target.result.neutralWeight)
      }
      request.onerror = (e) => {
        console.log(e, "Some error occured");
      }
    })
      
  }

  function getStreak(dots, today) {
    let bestProductiveStreak = 0;
    let tempProdStreak = 0;
    
    const pastAndPresentDots = dots.filter(dot => {
      let dotDate = new Date(dot.date);
      dotDate.setHours(0, 0, 0);
      return dotDate <= today;
    });
  
    // Calculate Best Productive Streak
    pastAndPresentDots.forEach(dot => {
      const status = dot.status.toLowerCase();
      
      if (status === 'productive') {
        tempProdStreak++;
        if (tempProdStreak > bestProductiveStreak) {
          bestProductiveStreak = tempProdStreak;
        }
      } else if (status === 'vacation' || status === 'present') {
        // FREEZE: Ignore undecided days and vacations so they don't break the streak
      } else {
        // BREAK: Any other status (neutral, wasted) breaks the streak
        tempProdStreak = 0;
      }
    });
  
    // Calculate Current Active Streak
    let currentStreakCount = 0;
    let currentStreakType = 'none'; // Default to lowercase 'none'
    
    if (pastAndPresentDots.length > 0) {
      let latestIndex = pastAndPresentDots.length - 1;
      
      // Skip over both 'vacation' and 'present' at the end of the array to find the true anchor
      while (latestIndex >= 0 && (pastAndPresentDots[latestIndex].status.toLowerCase() === 'vacation' || pastAndPresentDots[latestIndex].status.toLowerCase() === 'present')) {
        latestIndex--;
      }
      
      if (latestIndex >= 0) {
        currentStreakType = pastAndPresentDots[latestIndex].status.toLowerCase();
        
        for (let i = latestIndex; i >= 0; i--) {
          const status = pastAndPresentDots[i].status.toLowerCase();
          
          if (status === currentStreakType) {
            currentStreakCount++;
          } else if (status === 'vacation' || status === 'present') {
            // FREEZE: Skip over these statuses while counting backwards
            continue;
          } else {
            // BREAK: We hit a different status, streak is over
            break;
          }
        }
      }
    }
  
    // Format the output string and generate the CSS class
    let currentStreakString = 'None';
    let currentStreakClass = ''; // Empty string if no active streak
    
    if (currentStreakCount > 0 && currentStreakType !== 'none') {
      const formattedType = currentStreakType.charAt(0).toUpperCase() + currentStreakType.slice(1);
      currentStreakString = `${formattedType} - ${currentStreakCount} days`;
      
      // Generate the CSS class (e.g., 'wasted-streak')
      currentStreakClass = `${currentStreakType}-streak`;
    }
  
    return {
      currentStreak: currentStreakString,
      currentStreakClass: currentStreakClass,
      bestProductiveStreak: bestProductiveStreak
    };
  }
  
  async function populateStats(dots) {
    let neutralWeight = await getDefault()
    neutralWeight = neutralWeight / 10;
    let productive = 0;
    let neutral = 0;
    let wasted = 0;
    let vacation = 0;
    
    let today = new Date()
    today.setHours(0, 0, 0);
    
    let elapsedDots = [];
    let elapsedVacations = 0;
    dots.forEach(dot => {
      let dotDate = new Date(dot.date);
      dotDate.setHours(0, 0, 0);

      let status = dot.status.toLowerCase();
      if (status === 'productive') productive++;
      else if (status === 'neutral') neutral++;
      else if (status === 'wasted') wasted++;
      else if (status === 'vacation') vacation++;

      if (['productive', 'neutral', 'wasted', 'vacation'].includes(status) && dotDate <= today) {
        elapsedDots.push(dot);
        if (status === 'vacation') elapsedVacations++;
      }
    })

    const totalDays = dots.length;
    const availableDays = totalDays - vacation; 
      
    const elapsedDaysCount = elapsedDots.length;
    const elapsedAvailableDays = elapsedDaysCount - elapsedVacations;

    let overallProductiveRate = 0;
    let currentProductiveRate = 0;
    let currentWastedRate = 0;
    if (availableDays > 0) {
      overallProductiveRate = (((productive * 1) + (neutral * neutralWeight)) / availableDays) * 100;
    }
    
    if (elapsedAvailableDays > 0) {
      currentProductiveRate = ( ( (productive * 1) + (neutral * neutralWeight) ) / elapsedAvailableDays ) * 100;
      currentWastedRate = 100 - currentProductiveRate;
    }
    overallProductiveRate = overallProductiveRate.toFixed(2);
    currentProductiveRate = currentProductiveRate.toFixed(2);
    currentWastedRate = currentWastedRate.toFixed(2);
    
    elements.productiveStat.textContent = productive;
    elements.neutralStat.textContent = neutral;
    elements.wastedStat.textContent = wasted;
    elements.totalDaysStat.textContent = totalDays;
    elements.availableDaysStat.textContent = availableDays;
    elements.vacationStat.textContent = vacation;
    elements.currentProductiveRateStat.textContent = `${currentProductiveRate}%`;
    elements.currentWastedRateStat.textContent = `${currentWastedRate}%`;
    elements.overAllProductivityRateStat.textContent = `${overallProductiveRate}%`;
    const { currentStreak, currentStreakClass, bestProductiveStreak } = getStreak(dots,today);
    elements.currentStreakStat.textContent = currentStreak;
    elements.currentStreakStat.classList.add(currentStreakClass);
    elements.bestProductiveStreakStat.textContent = bestProductiveStreak;
  }
  
  async function init() {
    await updateDotsToday();
    let { dots, years } = await getDistinctYearsAndDots();
    populateTopbarYearSelector(years);
    populateDots(dots);
    populateStats(dots)
    // async even listeners
    elements.topbarYearSelector.addEventListener("click", topYearSelectorHandler);
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