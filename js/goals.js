(() => {
  
  let elements = {
    body: document.querySelector("body"),
    goalStatusFilter: document.querySelector(".goals-status-filter"),
    goalMonth: document.querySelector(".goals-month"),
    goalMonthSelectedValue: document.querySelector(".goals-month-selected-value"),
    goalMonthArrow: document.querySelector(".goals-month .arrow"),
    goalMonthOptions: document.querySelector(".goals-month-options"),
    goalYear: document.querySelector(".goals-year"),
    goalYearSelectedValue: document.querySelector(".goals-year-selected-value"),
    goalYearArrow: document.querySelector(".goals-year .arrow"),
    goalYearOptions: document.querySelector(".goals-year-options"),
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
    CalenderCancelBtn: document.querySelector("#calender-cancel-btn"),
    CalenderStartBtn: document.querySelector("#calender-start-btn"),
  }

  // Functions
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

  function setDates() {
    const { min, current, currentNext, max, maxEnd }  = getDates();
    elements.startDate.min = min;
    elements.startDate.max = max;
    elements.startDate.value = current;
    
    elements.endDate.min = currentNext;
    elements.endDate.max = maxEnd;
  }
  
  function init() {
    setDates();
  }
  

  // Event Listener

  elements.goalStatusFilter.addEventListener("click", (e) => {
    if (!e.target.classList.contains("goals-status")) return;

    elements.goalStatusFilter.querySelectorAll('.goals-status.active')
            .forEach(el => el.classList.remove('active'));
    
    e.target.classList.add("active");

  })
  
  
  elements.goalMonth.addEventListener("click", (e) => {
    if (elements.goalMonthOptions.classList.contains("active")) {
      elements.goalMonthOptions.classList.remove("active");
      elements.goalMonthArrow.textContent = "▼";
      return;
    }
    elements.goalMonthOptions.classList.add("active");
    elements.goalMonthArrow.textContent = "▲";
  })

  elements.goalMonthOptions.addEventListener("click", (e) => {
    if (!e.target.classList.contains("goals-month-option"))
      return

    let text = e.target.textContent;
    let value = e.target.dataset.value;

    elements.goalMonthSelectedValue.dataset.value = value;
    elements.goalMonthSelectedValue.textContent = text;
    
  })

  elements.goalYear.addEventListener("click", (e) => {
    if (elements.goalYearOptions.classList.contains("active")) {
      elements.goalYearOptions.classList.remove("active");
      elements.goalYearArrow.textContent = "▼";
      return;
    }
    elements.goalYearOptions.classList.add("active");
    elements.goalYearArrow.textContent = "▲";
  })

  elements.goalYearOptions.addEventListener("click", (e) => {
    if (!e.target.classList.contains("goals-year-option"))
      return

    let text = e.target.textContent;
    let value = e.target.dataset.value;

    elements.goalYearSelectedValue.dataset.value = value;
    elements.goalYearSelectedValue.textContent = text;
    
  })

  elements.addGoalBtn.addEventListener("click", (e) => {
    elements.body.classList.add("modal-active");
    elements.addModalOut.classList.add("active");
  })

  elements.CalenderCancelBtn.addEventListener("click", (e) => {
    elements.body.classList.remove("modal-active");
    elements.addModalOut.classList.remove("active");
  })

  elements.addModalOut.addEventListener("click", (e) => {
    if (e.target !== elements.addModalOut) return;
    elements.body.classList.remove("modal-active");
    elements.addModalOut.classList.remove("active");
  })

  elements.calenderOut.addEventListener("click", (e) => {
    if (!e.target.matches(".fa-solid.fa-calendar-days")) return;
    e.target.parentElement.children[0].showPicker();
  })

  elements.modalGoalDays.addEventListener("click", (e) => {
    let target = e.target.closest(".modal-goal-day");
    if (!target) return;
    target.classList.toggle("active");
  })
  
  elements.calenderQuickDurations.addEventListener("click", (e) => {
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
  })

  elements.startDate.addEventListener("change", (e) => {
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
  })
  
  elements.startDate.addEventListener("focusout", (e) => {
    const { min, current, currentNext, max, maxEnd } = getDates();
    let setDateValue = e.target.value;
    let setDate = new Date(setDateValue);
    
    if (Number.isNaN(setDate.getTime())) {
        setDates();
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
  })

  elements.endDate.addEventListener("focusout", (e) => {
    let setDateValue = e.target.value;
    let setDate = new Date(setDateValue);

    let startDateValue = elements.startDate.value;
    let startDate = new Date(startDateValue);
    startDate.setDate(startDate.getDate() + 1);
    if (setDate < startDate) {
      e.target.value = getFormattedTime(startDate);
    }
  })

  elements.endDate.addEventListener("change", (e) => {
    elements.calenderQuickDurations.querySelectorAll('.calender-quick-duration.active')
            .forEach(el => el.classList.remove('active'));
  })

  elements.CalenderStartBtn.addEventListener("click", (e) => {
    let title = elements.goalTitle.value;
    let desc = elements.goalDesc.value;
    if (title.length < 3) {
      alert("Title should be atleast max 3 word");
      return;
    }
    
    let goalDays = elements.modalGoalDays.querySelectorAll(".modal-goal-day.active");
    goalDays = [...goalDays].map((d) => d.dataset.value);
    
    if (goalDays.length < 1) {
      alert("Please Select at least one goal day");
      return;
    }

    let start = elements.startDate.value;
    let end = elements.endDate.value;
    if (!end) {
      alert("Please select end date");
    }
    console.log(title, desc, goalDays, start, end);
    
  })

  document.addEventListener("dbReady",init)
  
  
})();