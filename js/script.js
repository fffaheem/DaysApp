(() => {

  let elements = {
    body: document.querySelector("body"),
    headPercentage: document.querySelector(".head-percentage"),
    headPercentageLabel: document.querySelector(".head-percentage-label"),
    headTime: document.querySelector(".head-time"),
    headLabel: document.querySelector(".head-label"),
    headBottomElapsed: document.querySelector("#head-bottom-elapsed"),
    headBottomLeft: document.querySelector("#head-bottom-left"),
    headBottomPercentage: document.querySelector(".head-bottom-percentage"),
    progressFill: document.querySelector("#progressFill"),
  }

  
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
    const startOfNextYear = new Date(now.getFullYear() + 1, 0, 1);

    const elapsedMs = now - startOfYear;
    const totalMs = startOfNextYear - startOfYear;
    const leftMs = startOfNextYear - now;

    return {
        elapsed: Math.floor(elapsedMs / (1000 * 60 * 60 * 24)),
        left: Math.ceil(leftMs / (1000 * 60 * 60 * 24)),
        leftPercentage: `${((leftMs / totalMs) * 100).toFixed(2)}%`
    };
  }

  
  function displayHeadTop(now) {
    if (elements.headTime.dataset.value === "full") {
      elements.headTime.innerText = getTimeUntilYearEnd(now)
      elements.headLabel.innerText = "TIME REMAINING"
    } else {
      elements.headTime.innerText = getTimeUntilYearEndHours(now)
      elements.headLabel.innerText = "TOTAL HOURS LEFT"
    }
  }

  function displayHeadMiddle(now) {
    const { year, progress } = getYearProgress(now);
    elements.headPercentage.innerText = progress;
    elements.headPercentageLabel.innerText = year;
  }

  function displayHeadBottom(now) {
    const { elapsed, left, leftPercentage } = getYearLeft(now)
    elements.headBottomElapsed.innerText = elapsed
    elements.headBottomLeft.innerText =left
    elements.headBottomPercentage.innerText =leftPercentage
    elements.progressFill.style.setProperty("--progress", leftPercentage);
  }

  function populateHead() {
    const now = new Date();
    displayHeadTop(now);
    displayHeadMiddle(now);
    displayHeadBottom(now);
  }


  elements.headTime.addEventListener("click", (e) => {
    if (e.target.dataset.value == "full") {
      e.target.dataset.value = "hours"
    } else {
      e.target.dataset.value = "full"
    }
  })


  function init() {
    setInterval(populateHead, 1000)
  }

  init();
  
  
})();