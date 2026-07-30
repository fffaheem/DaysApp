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
    dotOut: document.querySelector(".dot-out"),
    dotGotoChecklistBtn: document.querySelector("#dot-goto-checklist-btn"),
    dotOutBottom: document.querySelector(".dot-out-bottom"),
    checkOut: document.querySelector(".check-out"),
    checkGotoOverviewBtn: document.querySelector("#check-goto-overview-btn"),
    checkOutBottom: document.querySelector(".check-out-bottom"),
    checklistItemOut: document.querySelector(".checklist-item-out"),
    checklistAddText: document.querySelector("#checklist-add-text"),
    checklistAddTextIcon: document.querySelector(".fa.fa-check"),
    statsModalOut: document.querySelector(".stats-modal-out"),
    statsModalHead: document.querySelector(".stats-modal-head"),
    statsModalText: document.querySelector(".stats-modal-text"),
    statsModalBtn: document.querySelector(".stats-modal-btn"),
    statBoxes: document.querySelector(".stat-boxes"),
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

  const params = new URLSearchParams(window.location.search);
  let setYear = params.get("year");

  function getAllData() {
    return new Promise((resolve, reject) => {
      const currentYear = String(new Date().getFullYear());
      const tx = db.transaction("HomeDots", "readonly");
      const store = tx.objectStore("HomeDots");
      
      // Fetch all records in one go. IndexedDB handles thousands of objects in milliseconds.
      const request = store.getAll();
  
      request.onsuccess = (e) => {
        const allDots = e.target.result;
        
        // 1. Extract unique years
        let yearsRaw = [...new Set(allDots.map(dot => dot.date.slice(0, 4)))];
  
        if (!setYear) {
          setYear = currentYear;
        }
  
        if (!yearsRaw.includes(String(setYear))) {
          window.location.href = "./index.html";
          return;
        }
        
        // 2. Format the years for the topbar
        let years = yearsRaw.map(year =>
          year === currentYear ? `${year} (Current)` : year
        );
  
        // 3. Filter dots for the selected year
        const dots = allDots.filter(dot => dot.date.startsWith(String(setYear)));
  
        resolve({years, dots });
      };
  
      request.onerror = (e) => reject(e.target.error);
    });
  }

  // for topbar
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

    window.location.href = `./index.html?year=${target.dataset.value}`;
    return;
  }

  function initializeHeader() {
    const today = new Date();
    const year = today.getFullYear();
    if (!setYear) {
      setYear = year;
    }
    elements.rightYear.innerText = setYear;   
    const dateSelected = new Date(setYear,11,31);
    dateSelected.setHours(23, 59, 59, 0);
    const yearSelected = dateSelected.getFullYear()
    
    if (yearSelected == year) {
      setInterval(() => {
        let newTime = new Date();
        if (newTime.getFullYear() > Number(setYear)) {
          window.location.href = "./index.html"
        }
        populateHead(newTime);
      }, 1000);
    } else {
      populateHead(dateSelected);
    }
  }
  // topbar end
  
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

  // for dots
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
  // dots end
  
  // for stats
  function getNeutralWeightForStatsModal() {
    return new Promise((resolve) => {
      const tx = db.transaction("Preferences", "readonly");
      const store = tx.objectStore("Preferences");
      const request = store.get("user_settings");
      request.onsuccess = () => {
        let neutralWeight = request.result?.neutralWeight ?? 5
        neutralWeight *= 10;
        resolve(`${neutralWeight}%`);
      };
  
      request.onerror = () => {
        reject(request.error);
      };
    })
  }
  
  async function populateStatsModalTextOnClick(e) {
    let neutralWeight = await getNeutralWeightForStatsModal();
    console.log(neutralWeight);
    let element = e.target.closest(".info")
    if (!element) {
      return;
    }
    let parent = element.parentElement;
    let label = parent.children[2].textContent;

    const modalDescriptions = {
      "Productive": "Days you consider meaningfully spent.",
      "Neutral": "Ordinary Days that were neither good nor bad.",
      "Wasted": "Days you feel were largely unutilized or utterly unproductive.",
      "Total Days": "Total number of days in this year.",
      "Available Days": "Days realistically available for effort, excluding vacations.",
      "Vacation": "Days marked as rest, breaks, or time off.",
      "Current Productive Rate": `Your Productivity up until today, excluding vacation days.<br>Neutral Days count as ${neutralWeight}.`,
      "Current Wasted Rate": "Your unutilized or utterly unproductive days up until today.",
      "Overall Productive Rate": `Your Productivity calculated from available days, excluding vacations.<br>Neutral days count as ${neutralWeight}.`,
      "Current Streak": "Your current run of similar days.",
      "Best Productive Streak": "Your longest consecutive run of productive days this year.",
      "Overall Wasted Rate": "Your overall percentage of unutilized or utterly unproductive days."
    };
    
    modalText = modalDescriptions[label] || "";
    elements.statsModalHead.textContent = label;
    elements.statsModalText.innerHTML = modalText;
    
    elements.body.classList.add("modal-active");
    elements.statsModalOut.classList.add("active");
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
    if(currentStreakClass) elements.currentStreakStat.classList.add(currentStreakClass);
    elements.bestProductiveStreakStat.textContent = bestProductiveStreak;
  }

  function hideUnwantedStats() {
    elements.statBoxes.children[6].children[2].textContent = "Overall Productive Rate";
    elements.statBoxes.children[6].style.gridColumn  = "span 3"
    elements.statBoxes.children[7].children[2].textContent = "Overall Wasted Rate";
    elements.statBoxes.children[7].style.gridColumn  = "span 3"
    elements.statBoxes.children[8].style.display = "none"
    
    elements.statBoxes.children[9].style.display = "none"
    elements.statBoxes.children[10].style.gridColumn = "1 / -1"
  }
  
  function hideUnwantedStatsHandler() {
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // meaning previous year
    if (setYear) {
      let date = new Date(setYear).getFullYear();
      if (date < today.getFullYear()) {
        hideUnwantedStats();
        return
      }
    }
  
    // meaning current year
    if (today.getMonth() === 11 && today.getDate() === 31){
      hideUnwantedStats();
    }
  }
  // stats end

  // year checklist
  function getYearChecklistData() {
    return new Promise((resolve, reject) => {
      const tx = db.transaction("YearChecklist", "readonly");
      const store = tx.objectStore("YearChecklist");
      const index = store.index("year");
      const request = index.getAll(setYear);
      request.onsuccess = (e) => {
        resolve(e.target.result);
      }
      request.onerror = (e) => reject(e.target.error);
    })
  }

  function populateCheckList(data) {
    const fragment = document.createDocumentFragment();
    for (const item of data) {
      
      const div = document.createElement("div");
      div.className = "checklist-item";
      
      const icon = document.createElement("i");
      icon.id = `icon-${item.id}`
      
      const textarea = document.createElement("textarea");
      textarea.id = item.id;
      textarea.rows = Math.max(1, item.text.split("\n").length);
      textarea.value = item.text;

      if (item.isCompleted) {
        icon.className = "fa fa-check-square";
        textarea.className = "checklist-text done";
      } else {
        icon.className = "fa-regular fa-square";
        textarea.className = "checklist-text";
      }
      
      div.append(icon, textarea);
      fragment.appendChild(div);
    }
    elements.checklistItemOut.replaceChildren(fragment);
  }

  function createChecklistElementAndPopulate(id) {
    const item = document.createElement("div");
    item.className = "checklist-item";
    const icon = document.createElement("i");
    icon.className = "fa-regular fa-square";
    icon.id = `icon-${id}`
    const textarea = document.createElement("textarea");
    textarea.className = "checklist-text";
    textarea.rows = 1;
    textarea.id = id;
    textarea.value = elements.checklistAddText.value;
    item.append(icon, textarea);

    elements.checklistItemOut.append(item);

    elements.checklistAddText.value = ""
    elements.checklistAddTextIcon.style.display = "none"

    elements.checklistItemOut.scrollTo({
      top: elements.checklistItemOut.scrollHeight,
      behavior: "smooth"
    });
  }
  
  function addChecklist(e) {
    const isAddAction =
      (e.type === "click") ||
      (e.type === "keyup" && e.key === "Enter");

    if (isAddAction && elements.checklistAddText.value.length > 0) {
      const tx = db.transaction("YearChecklist", "readwrite");
      const store = tx.objectStore("YearChecklist");
      const request = store.add({
          text: elements.checklistAddText.value,
          isCompleted: false,
          year: setYear
      });
      request.onsuccess = () => {
          const id = request.result;
          createChecklistElementAndPopulate(id);
      };
    }
   
    // showing and hiding icon to add button
    elements.checklistAddTextIcon.style.display = e.target.value.length > 0 ? "" : "none";
  }

  function editChecklist(e) {
    if (!e.target.classList.contains("checklist-text")) return;
    const tx = db.transaction("YearChecklist", "readwrite");
    const store = tx.objectStore("YearChecklist");
    let id = Number(e.target.id);
    
    if (e.target.value.length < 1) {
      store.delete(id);
      e.target.parentElement.remove();
    }
    
    const request = store.get(id);
    request.onsuccess = () => {
        const item = request.result;
        if (!item) return;
        item.text = e.target.value;
        store.put(item);
    };

    // for height adjustment
    e.target.rows = "1"
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  }
  
  function checklistDoneManagement(e) {
    if (!e.target.matches("i")) return;
    e.target.classList.toggle("fa-regular");
    e.target.classList.toggle("fa");
    e.target.classList.toggle("fa-square");
    e.target.classList.toggle("fa-check-square");
    e.target.parentElement.children[1].classList.toggle("done")
    let isCompleted = e.target.parentElement.children[1].classList.contains("done");
    let id = e.target.id.split("-")[1];
    id = Number(id);
    
    const tx = db.transaction("YearChecklist", "readwrite");
    const store = tx.objectStore("YearChecklist");
    const request = store.get(id);
    request.onsuccess = () => {
      const item = request.result;
      if (!item) return; // No record with this id
      item.isCompleted = isCompleted;
      store.put(item);
    };
  }
  
  // year checklist done 

  
  async function init() {
    await updateDotsToday();
    let {years, dots} = await getAllData();
    let checklistData = await getYearChecklistData();
    initializeHeader();
    populateTopbarYearSelector(years);
    populateDots(dots);
    populateStats(dots);
    hideUnwantedStatsHandler(); // if the year is finished
    populateCheckList(checklistData);
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

  elements.dotGotoChecklistBtn.addEventListener("click", (e) => {
    elements.dotOut.classList.add("active");
    elements.checkOut.classList.add("active");
  })

  elements.checkGotoOverviewBtn.addEventListener("click", (e) => {
    elements.dotOut.classList.remove("active");
    elements.checkOut.classList.remove("active");
  })

  // for editing in textarea 
  elements.checkOutBottom.addEventListener("input", editChecklist)
  
  // for checklist check done toggle
  elements.checklistItemOut.addEventListener("click", checklistDoneManagement)
  
  // for adding checklist
  elements.checklistAddText.addEventListener("keyup", addChecklist)

  elements.checklistAddTextIcon.addEventListener("click", addChecklist)

  elements.statBoxes.addEventListener("click", populateStatsModalTextOnClick)

  elements.statsModalOut.addEventListener("click", (e) => {
    if (e.target === elements.statsModalOut) {
      elements.body.classList.remove("modal-active");
      elements.statsModalOut.classList.remove("active");
    }
  })

  elements.statsModalBtn.addEventListener("click", (e) => {
    elements.body.classList.remove("modal-active");
    elements.statsModalOut.classList.remove("active");
  })
  
  // calling init function
  document.addEventListener("dbReady",init)

})();