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
  }

  // Functions

  
  

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
  
})();