(() => {

  const params = new URLSearchParams(window.location.search);
  
  let elements = {
    body: document.querySelector("body"),
    goalSearchInput: document.querySelector("#goal-search-input"),
    goalSearchInputIcon: document.querySelector(".fa.fa-search"),
    goalStatusFilter: document.querySelector(".goals-status-filter"),
    goalMonth: document.querySelector(".goals-month"),
    goalMonthSelectedValue: document.querySelector(".goals-month-selected-value"),
    goalMonthArrow: document.querySelector(".goals-month .arrow"),
    goalMonthOptions: document.querySelector(".goals-month-options"),
    goalYear: document.querySelector(".goals-year"),
    goalYearSelectedValue: document.querySelector(".goals-year-selected-value"),
    goalYearArrow: document.querySelector(".goals-year .arrow"),
    goalYearOptions: document.querySelector(".goals-year-options"),
    goalsOut: document.querySelector(".goals-out"),
    addGoalBtn: document.querySelector(".add-goal-btn"),
    addModalOut: document.querySelector(".add-modal-out"),
    goalTitle: document.querySelector("#goal-title"),
    goalDesc: document.querySelector("#goal-desc"),
    modalGoalDays: document.querySelector(".modal-goal-days"),
    calenderOut: document.querySelector(".calender-out"),
    calenderInputOut: document.querySelector(".calender-input-out"),
    calenderBox: document.querySelector(".calender-box"),
    startDate: document.querySelector("#start-date"),
    endDate: document.querySelector("#end-date"),
    calenderQuickDurations: document.querySelector(".calender-quick-durations"),
    totalWorkingDaysCount: document.querySelector(".total-working-days-count"),
    totalWorkingDaysCountUp: document.querySelector("#total-working-days-count-up"),
    totalWorkingDaysCountDown: document.querySelector("#total-working-days-count-down"),
    summaryStart: document.querySelector("#summary-start"),
    summaryEffectiveStart: document.querySelector("#summary-effective-start"),
    summaryEnd: document.querySelector("#summary-end"),
    summaryEffectiveEnd: document.querySelector("#summary-effective-end"),
    summaryWork: document.querySelector("#summary-work"),
    summarySpan: document.querySelector("#summary-span"),
    validation: document.querySelector("#validation"),
    CalenderCancelBtn: document.querySelector("#calender-cancel-btn"),
    CalenderStartBtn: document.querySelector("#calender-start-btn"),
  }

  // =======================
  // Functions
  // =======================
  // this is temporary 
  function populateGoals(targets) {
    if (targets.length < 1) return;
    const fragment = document.createDocumentFragment();
    for (const item of targets) {
      let goalBox = document.createElement("div");
      goalBox.classList.add("goal-box");

      let div = document.createElement("div")
      let id = document.createElement("div")
      id.classList.add("id");
      id.textContent = item.id;
      
      let title = document.createElement("div")
      title.classList.add("title");
      title.textContent = item.title;
      
      let start = document.createElement("div")
      start.classList.add("start");
      start.textContent = item.startDate
      
      let orgEnd = document.createElement("div")
      orgEnd.classList.add("org-end");
      orgEnd.textContent = item.originalEndDate;
      
      let end = document.createElement("div")
      end.classList.add("end");
      end.textContent = item.currentEndDate;

      div.append(id, title, start, orgEnd, end);
      
      let dlt = document.createElement("div");
      dlt.classList.add("delete");
      dlt.textContent = "Delete";

      goalBox.append(div, dlt);
      fragment.append(goalBox);
    }
    elements.goalsOut.replaceChildren(fragment);
  }

  function populateYearFilter() {
    return new Promise(resolve => {
      
      const tx = db.transaction("Goals", "readonly");
      const store = tx.objectStore("Goals");
      const index = store.index("by_year");
      const request = index.getAll();
      request.onsuccess = (e) => {
        let arr = e.target.result
        arr =  [...new Set(arr.map(goal => goal.goalYear))]
          .sort((a, b) => a - b);
  
        const fragment = document.createDocumentFragment();
        let allDiv = document.createElement("div");
        allDiv.dataset.value = "all";
        allDiv.textContent = "All Years";
        allDiv.classList.add("goals-year-option")
        fragment.appendChild(allDiv)
        
        for (const item of arr) {
          let div = document.createElement("div");
          div.dataset.value = item;
          div.textContent = item;
          div.classList.add("goals-year-option")
          fragment.appendChild(div)
        }
  
        elements.goalYearOptions.replaceChildren(fragment);

        resolve();
      }
    })
  }
  
  function populateFiltersActive() {
    let search = params.get("search");
    let status = params.get("status");
    let month = params.get("month");
    let year = params.get("year");

    if (!search) search = "";
    if (!status) status = "all";
    if (!year) year = "all";
    if (!month) month = "all";

    elements.goalSearchInput.value = search;
    if (status === "all") {
      elements.goalStatusFilter.children[0].classList.add("active");
    } else if (status === "active") {
      elements.goalStatusFilter.children[1].classList.add("active");
    } else if (status === "upcoming") {
      elements.goalStatusFilter.children[2].classList.add("active");
    } else if (status === "completed") {
      elements.goalStatusFilter.children[3].classList.add("active");
    } else if (status === "failed") {
      elements.goalStatusFilter.children[4].classList.add("active");
    }

    let monthElem;
    if (month === "all") {
      monthElem = elements.goalMonthOptions.children[0]
    } else {
      monthElem = elements.goalMonthOptions.children[Number(month)]
    }

    let monthText = monthElem.textContent;
    let monthValue = monthElem.dataset.value;

    elements.goalMonthSelectedValue.textContent = monthText;
    elements.goalMonthSelectedValue.dataset.value = monthValue;

    let yearElem;
    if (year === "all") {
      yearElem = elements.goalYearOptions.children[0]
    } else {
      yearElem = document.querySelector(`.goals-year-option[data-value="${year}"]`)
    }
    let yearText = yearElem.textContent;
    let yearValue = yearElem.dataset.value;

    elements.goalYearSelectedValue.textContent = yearText;
    elements.goalYearSelectedValue.dataset.value = yearValue;
    
    
  }
  
  async function getFilteredGoals(params) {
    const search = (params.get("search") || "").trim().toLowerCase();
    const status = params.get("status") || "all";
    const year = params.get("year") || "all";
    const month = params.get("month") || "all";
  
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("Goals", "readonly");
      const store = transaction.objectStore("Goals");
  
      let request;
  
      // Year + Month
      if (year !== "all" && month !== "all") {
        request = store
          .index("by_goal_period")
          .getAll([
            Number(year),
            Number(month)
          ]);
      }
  
      // Year only
      else if (year !== "all") {
        request = store
          .index("by_year")
          .getAll(Number(year));
      }
  
      // Month only
      else if (month !== "all") {
        request = store
          .index("by_month")
          .getAll(Number(month));
      }
  
      // Status only
      else if (status !== "all") {
        request = store
          .index("by_status")
          .getAll(status);
      }
  
      // No IndexedDB filters
      else {
        request = store.getAll();
      }
  
      request.onsuccess = () => {
        let goals = request.result;
  
        // Status filter
        // This is needed when status is combined
        // with year/month.
        if (status !== "all") {
          goals = goals.filter(
            goal => goal.status === status
          );
        }
  
        // Search filter
        if (search) {
          goals = goals.filter(goal => {
            const title = (goal.title || "").toLowerCase();
            const description = (goal.description || "").toLowerCase();
  
            return (
              title.includes(search) ||
              description.includes(search)
            );
          });
        }
  
        resolve(goals);
      };
  
      request.onerror = () => {
        reject(request.error);
      };
    });
  }
  
  // when user click filters
  function goalSearchInputSearch(e, event) {
    if (event === "keydown" && e.key !== "Enter") {
      return;
    }
    let searchText = elements.goalSearchInput.value;

    let search = searchText
    let status = params.get("status");
    let year = params.get("year");
    let month = params.get("month");

    if (!status) status = "all";
    if (!year) year = "all";
    if (!month) month = "all";

    params.set("search", search);
    params.set("status", status);
    params.set("year", year);
    params.set("month", month);
    
    window.location.search = params.toString();
  }
  
  function setGoalStatusFilter(e) {
    if (!e.target.classList.contains("goals-status")) return;

    let search = params.get("search");
    let status = e.target.dataset.value
    let year = params.get("year");
    let month = params.get("month");

    if (!search) search = "";
    if (!year) year = "all";
    if (!month) month = "all";

    params.set("search", search);
    params.set("status", status);
    params.set("month", month);
    params.set("year", year);
    
    window.location.search = params.toString();
  }

  function setGoalMonthFilter(e) {
    if (!e.target.classList.contains("goals-month-option"))
      return
    
    let search = params.get("search");
    let status = params.get("status");
    let month = e.target.dataset.value;
    let year = params.get("year");

    if (!search) search = "";
    if (!status) status = "all";
    if (!year) year = "all";

    params.set("search", search);
    params.set("status", status);
    params.set("month", month);
    params.set("year", year);
    
    window.location.search = params.toString();
  }

  function setGoalYearFilter(e) {
    if (!e.target.classList.contains("goals-year-option"))
      return

    let search = params.get("search");
    let status = params.get("status");
    let month = params.get("month");
    let year = e.target.dataset.value;

    if (!search) search = "";
    if (!status) status = "all";
    if (!month) month = "all";

    params.set("search", search);
    params.set("status", status);
    params.set("month", month);
    params.set("year", year);
    
    window.location.search = params.toString();
  }
  
  // For Modal
  function getFormattedTime(date) {
    const formattedDate = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");

    return formattedDate;
  }
  
  function getDates() {
    let current = new Date();
    let currentNext = new Date();
    currentNext.setDate(currentNext.getDate() + 1);
    let year = current.getFullYear();
    let min = new Date(year, 0, 1);
    let max = new Date(year, 11, 31);
    let maxEnd = new Date(year+5, 11, 31);
    min = getFormattedTime(min);
    current = getFormattedTime(current);
    currentNext = getFormattedTime(currentNext);
    max = getFormattedTime(max);
    maxEnd = getFormattedTime(maxEnd);
    return { min, current, currentNext, max, maxEnd };
  }
  
  // setting modal dates
  function setDates() {
    const { min, current, currentNext, max, maxEnd }  = getDates();
    elements.startDate.min = min;
    elements.startDate.max = max;
    elements.startDate.value = current;
    
    elements.endDate.min = currentNext;
    elements.endDate.max = maxEnd;
  }

  function setQuickDuration(e) {
    let target = e.target.closest(".calender-quick-duration");
    if (!target) return;
    elements.calenderQuickDurations.querySelectorAll('.calender-quick-duration.active')
            .forEach(el => el.classList.remove('active'));
    
    target.classList.add("active");
    let type = target.dataset.type;
    let value = Number(target.dataset.value);
    let startDate = new Date(elements.startDate.value);
    if (type === "w") {
      startDate.setDate(startDate.getDate() + value * 7);
    } else if (type === "m") {
      startDate.setMonth(startDate.getMonth() + value);
    } else if (type === "y") {
      startDate.setFullYear(startDate.getFullYear() + value);
    }
    startDate = getFormattedTime(startDate);
    elements.endDate.value = startDate;
    getGoalSummary();
  }

  function setCalenderStartOnChange(e) {
    const { min, current,currentNext, max, maxEnd } = getDates();
    let setDateValue = e.target.value;
    let setDate = new Date(setDateValue);
    if (Number.isNaN(setDate.getTime())) {
      return;
    }

    if (setDate < new Date(min) || setDate > new Date(max)) {
      return;
    }

    
    let endDateMin = new Date(setDate);
    endDateMin.setDate(endDateMin.getDate() + 1);
    if (new Date(currentNext) > endDateMin) {
      endDateMin = new Date(currentNext);
    }
    let endDateMinFormatted = getFormattedTime(endDateMin);
    elements.endDate.min = endDateMinFormatted;
    if (!elements.endDate.value 
    ||  new Date(elements.endDate.value) < endDateMin
    ||  new Date(elements.endDate.value) > new Date(maxEnd)) {
      elements.endDate.value = endDateMinFormatted;
    }
    getGoalSummary();
  }

  function setCalenderStartOnFocusOut(e) {
    const { min, current, currentNext, max, maxEnd } = getDates();
    let setDateValue = e.target.value;
    let setDate = new Date(setDateValue);
    
    if (Number.isNaN(setDate.getTime())) {
        setDates();
        getGoalSummary();
        return;
    }
    
    if (setDate < new Date(min) || setDate > new Date(max)) {
      setDates();
    }

    
    let endDateMin = new Date(setDate);
    endDateMin.setDate(endDateMin.getDate() + 1);
    if (new Date(currentNext) > endDateMin) {
      endDateMin = new Date(currentNext);
    }
    let endDateMinFormatted = getFormattedTime(endDateMin);
    elements.endDate.min = endDateMinFormatted;
    if (!elements.endDate.value 
    ||  new Date(elements.endDate.value) < endDateMin
    ||  new Date(elements.endDate.value) > new Date(maxEnd)) {
      elements.endDate.value = endDateMinFormatted;
    }
    getGoalSummary();
  }

  function setCalenderEndOnChange(e) {
    let setDateValue = e.target.value;
    let setDate = new Date(setDateValue);

    let startDateValue = elements.startDate.value;
    let startDate = new Date(startDateValue);
    startDate.setDate(startDate.getDate() + 1);
    if (setDate < startDate) {
      e.target.value = getFormattedTime(startDate);
    }
    getGoalSummary();
  }

  function getDetails() {
    let title = elements.goalTitle.value;
    let desc = elements.goalDesc.value;
    let goalDays = elements.modalGoalDays.querySelectorAll(".modal-goal-day.active");
    goalDays = [...goalDays].map((d) => d.dataset.value);
    let start = elements.startDate.value;
    let end = elements.endDate.value;

    return { title, desc, goalDays, start, end }
  }

  function getGoalSummary() {
    const details = getDetails();
  
    const start = details.start;
    const end = details.end;
    const goalDays = details.goalDays.map(Number);
  
    if (!start) {
      return null;
    }
  
    const DAY_MS = 24 * 60 * 60 * 1000;
  
    const isWorkingDay = (date) => {
      return goalDays.includes(date.getDay());
    };
  
    const formatDate = (date) => {
      if (!date) return null;
  
      return date.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };
  
    const startDate = new Date(`${start}T00:00:00`);
  
    let endDate = null;
    let effectiveStart = null;
    let effectiveEnd = null;
    let workingDays = 0;
    let calendarDays = 0;
  
    // --------------------------------------------------
    // If an end date exists, calculate the complete range
    // --------------------------------------------------
    if (end) {
      endDate = new Date(`${end}T00:00:00`);
  
      if (startDate <= endDate) {
        // Inclusive calendar-day count.
        //
        // Example:
        // 11 Sep -> 14 Sep = 4 days
        //
        calendarDays =
          Math.floor((endDate - startDate) / DAY_MS) + 1;
  
        // Find working days ONLY inside the selected range.
        const current = new Date(startDate);
  
        while (current <= endDate) {
          if (isWorkingDay(current)) {
            workingDays++;
  
            // First working day in the selected range.
            if (!effectiveStart) {
              effectiveStart = new Date(current);
            }
  
            // Keep updating so this ends up being
            // the last working day in the selected range.
            effectiveEnd = new Date(current);
          }
  
          current.setDate(current.getDate() + 1);
        }
      }
    } else {
      // --------------------------------------------------
      // No end date:
      // Find the first working day on/after the start.
      // --------------------------------------------------
      const current = new Date(startDate);
  
      while (!isWorkingDay(current)) {
        current.setDate(current.getDate() + 1);
      }
  
      effectiveStart = current;
    }
  
    const data = {
      startDate: formatDate(startDate),
      scheduledStart: formatDate(effectiveStart),
      endDate: formatDate(endDate),
      scheduledEnd: formatDate(effectiveEnd),
      workingDays,
      calendarDays,
    };
  
    // --------------------------------------------------
    // Update UI
    // --------------------------------------------------
  
    elements.totalWorkingDaysCount.textContent =
      data.workingDays;
  
    elements.summaryStart.textContent =
      data.startDate;
  
    elements.summaryEffectiveStart.textContent =
      data.scheduledStart ?? "—";
  
    elements.summaryEnd.textContent =
      data.endDate ?? "—";
  
    elements.summaryEffectiveEnd.textContent =
      data.scheduledEnd ?? "—";
  
    elements.summaryWork.textContent =
      data.workingDays;
  
    elements.summarySpan.textContent =
      data.calendarDays;
  
    return data;
  }

  function calculateEndDate(start, workingDays, goalDays) {
    if (!start || workingDays <= 0 || !goalDays?.length) {
      return null;
    }
  
    const workingDayNumbers = goalDays.map(Number);
  
    const startDate = new Date(`${start}T00:00:00`);
    const date = new Date(startDate);
  
    // Maximum allowed date = 5 years from the start year,
    // ending on December 31.
    //
    // Example:
    // start = 2026-09-11
    // max   = 2031-12-31
    const maxDate = new Date(
      startDate.getFullYear() + 5,
      11,
      31
    );
  
    let count = 0;
  
    while (count < workingDays) {
      // Don't allow the calculation to enter the 6th year.
      if (date > maxDate) {
        return null;
      }
  
      if (workingDayNumbers.includes(date.getDay())) {
        count++;
      }
  
      // We found the final working day.
      if (count === workingDays) {
        break;
      }
  
      date.setDate(date.getDate() + 1);
    }
  
    // Return YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
  
    return `${year}-${month}-${day}`;
  }
  
  function addGoal() {
    let details = getDetails();
    let title = details.title;
    let desc = details.desc;
    if (title.length < 3) {
      elements.validation.classList.add("error");
      elements.validation.textContent = "Title should be atleast max 3 word";
      // alert("Title should be atleast max 3 word");
      return;
    }
    
    let goalDays = details.goalDays
    
    if (goalDays.length < 1) {
      elements.validation.classList.add("error");
      elements.validation.textContent = "Please Select at least one goal day";
      // alert("Please Select at least one goal day");
      return;
    }

    let start = details.start
    let end = details.end
    if (!end) {
      elements.validation.classList.add("error");
      elements.validation.textContent = "Please select end date";
      // alert("Please select end date");
      return;
    }

    let count = elements.totalWorkingDaysCount.textContent;
    count = Number(count);
    if (count < 1) {
      elements.validation.classList.add("error");
      elements.validation.textContent = "Total Working Days Cannot be 0";
      return;
    }

    let status = "active";
    
    const startt = new Date(start);
    const today = new Date();
    
    today.setHours(0, 0, 0, 0);
    startt.setHours(0, 0, 0, 0);
    
    if (startt > today) {
      status = "upcoming";
    }

    const [year, month] = end.split("-").map(Number);
    let obj = {
      title: title,
      description: desc,
      startDate: start,
      originalEndDate: end,
      currentEndDate: end,
      goalYear: year,
      goalMonth: month,
      delayStartDate: null, 
      scheduledDays: goalDays, 
      status: status,
      history: []
    }

    const transaction = db.transaction("Goals", "readwrite");
    const store = transaction.objectStore("Goals");
    
    const request = store.add(obj);
    
    request.onsuccess = (e)=>{
      window.location.reload();
    };
    
    request.onerror = (e)=>{
      console.error("Failed to add goal:", e.target.error);
    };
    
  }

  
  // Initializing function
  async function init() {
    await populateYearFilter();
    populateFiltersActive();
    const goals = await getFilteredGoals(params);
    populateGoals(goals);
    setDates();
  
  }
  
  // =======================
  // Event Listener
  // =======================
  
  elements.goalSearchInput.addEventListener("input", (e) => {
    let searchText = e.target.value;

    if (searchText.length > 0) {
      elements.goalSearchInput.classList.add("active")
      elements.goalSearchInputIcon.classList.add("active")
      return
    }

    elements.goalSearchInput.classList.remove("active")
    elements.goalSearchInputIcon.classList.remove("active")
  })

  elements.goalSearchInput.addEventListener("keydown", (e) => {
    goalSearchInputSearch(e, "keydown");
  });

  elements.goalSearchInputIcon.addEventListener("click", (e) => {
    goalSearchInputSearch(e, "click");
  })

  elements.goalStatusFilter.addEventListener("click", setGoalStatusFilter);
  
  elements.goalMonth.addEventListener("click", (e) => {
    if (elements.goalMonthOptions.classList.contains("active")) {
      elements.goalMonthOptions.classList.remove("active");
      elements.goalMonthArrow.textContent = "▼";
      return;
    }
    elements.goalMonthOptions.classList.add("active");
    elements.goalMonthArrow.textContent = "▲";
  })

  elements.goalMonthOptions.addEventListener("click", setGoalMonthFilter)

  elements.goalYear.addEventListener("click", (e) => {
    if (elements.goalYearOptions.classList.contains("active")) {
      elements.goalYearOptions.classList.remove("active");
      elements.goalYearArrow.textContent = "▼";
      return;
    }
    elements.goalYearOptions.classList.add("active");
    elements.goalYearArrow.textContent = "▲";
  })

  elements.goalYearOptions.addEventListener("click",setGoalYearFilter)

  // Open Modal
  elements.addGoalBtn.addEventListener("click", (e) => {
    elements.body.classList.add("modal-active");
    elements.addModalOut.classList.add("active");
  })

  // Close Modal
  elements.CalenderCancelBtn.addEventListener("click", (e) => {
    elements.body.classList.remove("modal-active");
    elements.addModalOut.classList.remove("active");
  })

  // Close Modal
  elements.addModalOut.addEventListener("click", (e) => {
    if (e.target !== elements.addModalOut) return;
    elements.body.classList.remove("modal-active");
    elements.addModalOut.classList.remove("active");
  })

  // Open Calender Picker
  elements.calenderOut.addEventListener("click", (e) => {
    if (!e.target.matches(".fa-solid.fa-calendar-days")) return;
    e.target.parentElement.children[0].showPicker();
  })

  // set Goal Days as active
  elements.modalGoalDays.addEventListener("click", (e) => {
    let target = e.target.closest(".modal-goal-day");
    if (!target) return;
    let activeElemsCount = elements.modalGoalDays.querySelectorAll(".modal-goal-day.active").length;
    if (!target.classList.contains("active")) {
      target.classList.add("active");
      getGoalSummary();
      return;
    }
    if (activeElemsCount < 2) return;
    if (target.classList.contains("active")) {
      target.classList.remove("active");
    }

    getGoalSummary();
  })

  // set Quick Duration
  elements.calenderQuickDurations.addEventListener("click", setQuickDuration)

  // set Calender start Date works when user change via keybaord or calender picker
  elements.startDate.addEventListener("change",setCalenderStartOnChange)

  // set Calender start Date works 
  // if on every change we correct date user wont be able to enter date via keybaord 
  // so this fixes the issue when user focus out
  elements.startDate.addEventListener("focusout",setCalenderStartOnFocusOut)

  elements.endDate.addEventListener("focusout",setCalenderEndOnChange)

  elements.endDate.addEventListener("change", (e) => {
    elements.calenderQuickDurations.querySelectorAll('.calender-quick-duration.active')
            .forEach(el => el.classList.remove('active'));
    getGoalSummary();
  })

  elements.totalWorkingDaysCountUp.addEventListener("click", (e) => {
    let count = elements.totalWorkingDaysCount.textContent;
    count = Number(count) + 1;
    elements.totalWorkingDaysCount.textContent = count;

    let details = getDetails();
    let end = calculateEndDate(details.start, count, details.goalDays);
    elements.endDate.value = end;
    getGoalSummary();
    
  })
  
  elements.totalWorkingDaysCountDown.addEventListener("click", (e) => {
    let count = elements.totalWorkingDaysCount.textContent;
    count = Number(count);
    if (count < 2) return;
    count -= 1;
    elements.totalWorkingDaysCount.textContent = count;
    let details = getDetails();
    let end = calculateEndDate(details.start, count, details.goalDays);
    elements.endDate.value = end;
    getGoalSummary();
  })
  
  // Add Goal
  elements.CalenderStartBtn.addEventListener("click",addGoal)

  document.addEventListener("dbReady",init)
  
  
})();