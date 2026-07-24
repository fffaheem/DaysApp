(() => {
  const params = new URLSearchParams(window.location.search);
  let date = params.get("date");

  let elements = {
    body: document.querySelector("body"),
    calenderMonth: document.querySelector(".calender-month"),
    calenderYear: document.querySelector(".calender-year"),
    calenderChangeLeft: document.querySelector("#calender-change-left"),
    calenderChangeRight: document.querySelector("#calender-change-right"),
    calenderDots: document.querySelector(".calender-dots"),
    calenderSetter: document.querySelector("#calender-setter"),
    calenderSetterHead: document.querySelector(".calender-setter-head"),
    categories: document.querySelector(".categories"),
    categoryProductive: document.querySelector(".category.productive"),
    categoryWasted: document.querySelector(".category.wasted"),
    categoryNeutral: document.querySelector(".category.neutral"),
    categoryVacation: document.querySelector(".category.vacation"),
    calenderBack: document.querySelector(".calender-back"),
    note: document.querySelector("#note"),
    saveBtn: document.querySelector(".save-btn"),
  }

  function isValidDate(date) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(date)) return false;
    const [year, month, day] = date.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    return (
      d.getFullYear() === year &&
      d.getMonth() === month - 1 &&
      d.getDate() === day
    );
  }

  function mod(n, m) {
    return ((n % m) + m) % m;
  }
  
  function verifyDate(date) {
    if (!isValidDate(date)) {
      window.location.href = "./index.html";
      return;
    }

    const year = (new Date(date)).getFullYear();


    const tx = db.transaction("HomeDots", "readonly");
    const store = tx.objectStore("HomeDots");
    store.getAllKeys().onsuccess = (e) => {
      const years = [...new Set(
          e.target.result.map(date => date.slice(0, 4))
      )];

      if (!years.includes(String(year))) {
        window.location.href = "./index.html";
        return;
      }
    
    };
  }

  function convertToDbString(date){
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    const dateString = `${yyyy}-${mm}-${dd}`;
    return dateString
  }
  
  function getData(data) {
    return new Promise((resolve) => {
      let date = new Date(data)
      let year = date.getFullYear();
      let month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const today = date;
      const lastDay = new Date(year, month + 1, 0);
  
      const tx = db.transaction("HomeDots", "readonly");
      const store = tx.objectStore("HomeDots");
      const range = IDBKeyRange.bound(convertToDbString(firstDay), convertToDbString(lastDay));
  
      store.getAll(range).onsuccess = (e) => {
        resolve(e.target.result);
      };
    })
    
  }

  function populateCalenderSetter(todayData) {
    const todayDate = todayData.date;
    const date = new Date(todayDate);
    const monthDayYear = date.toLocaleDateString("en-US", {
      month: "long",
      day: "2-digit",
      year: "numeric",
    });
    const weekday = date.toLocaleDateString("en-US", {
      weekday: "long",
    });
    const formatted = `${monthDayYear} (${weekday})`;
    elements.calenderSetterHead.textContent = formatted;

    let note = todayData.note
    elements.note.textContent = note

    elements.categoryProductive.classList.remove("active");
    elements.categoryNeutral.classList.remove("active");
    elements.categoryWasted.classList.remove("active");
    elements.categoryVacation.classList.remove("active");
    let status = todayData.status.toLowerCase();
    if (status === "neutral") {
      elements.categoryNeutral.classList.add("active");
    } else if (status === "productive") {
      elements.categoryProductive.classList.add("active");
    } else if (status === "wasted") {
      elements.categoryWasted.classList.add("active");
    } else if (status === "vacation") {
      elements.categoryVacation.classList.add("active");
    }
  }

  function populateCalender(todayData,data) {
    let date = new Date(data[0].date)
    let year = String(date.getFullYear());
    let month = date.toLocaleDateString("en-US", {
      month: "long",
    });
    let day = date.toLocaleDateString("en-US", {
      weekday: "long",
    }).toLowerCase();

    elements.calenderMonth.textContent = month;
    elements.calenderYear.textContent = year;

    // dots
    let empty = 0;
    if (day === "monday") {
      empty = 1;
    }else if (day === "tuesday") {
      empty = 2;
    }else if (day === "wednesday") {
      empty = 3;
    }else if (day === "thursday") {
      empty = 4;
    }else if (day === "friday") {
      empty = 5;
    }else if (day === "saturday") {
      empty = 6;
    }
    const fragment = document.createDocumentFragment();
    for (let i = 0 - empty; i < data.length; i++) {
      let calenderDot = document.createElement("div");
      calenderDot.classList.add("calender-dot");
      if (i < 0) {
        fragment.appendChild(calenderDot);
        continue;
      }

      if (data[i].date === convertToDbString(new Date(todayData.date))) {
        calenderDot.classList.add("active");
      }
      
      if (data[i].status.toLowerCase() === "productive") {
        calenderDot.classList.add("productive");
      }else if (data[i].status.toLowerCase() === "neutral") {
        calenderDot.classList.add("neutral");
      }else if (data[i].status.toLowerCase() === "wasted") {
        calenderDot.classList.add("wasted");
      }else if (data[i].status.toLowerCase() === "vacation") {
        calenderDot.classList.add("vacation");
      }else if (data[i].status.toLowerCase() === "future") {
        calenderDot.classList.add("future");
      } else {
        calenderDot.classList.add("present");
      }
      calenderDot.textContent = i + 1;
      calenderDot.dataset.value = i + 1;
      fragment.appendChild(calenderDot);
    }
    elements.calenderDots.replaceChildren(fragment);
  }

  async function changeCalender(direction) {
    const [y, m, d] = date.split("-").map(Number);
    const datee = new Date(y, m - 1, d);
    let month = datee.getMonth()
    if (direction === "previous") {
      month = mod(month - 1, 12);
    } else {
      month = mod(month + 1, 12);
    }

    let previousMonth = new Date(y, month, 1);
    let newDate = convertToDbString(previousMonth);

    // could just do this but wont
    // window.location.href = `./dotOpen.html?date=${newDate}`;

    const url = new URL(window.location);
    url.searchParams.set("date", newDate);
    history.replaceState({}, "", url);
    date = newDate;
    
    let data = await getData(newDate);
    let todayData = data.filter((item) => {
      return item.date === newDate
    })[0]
    populateCalenderSetter(todayData);
    populateCalender(todayData,data);
  }
  
  async function dotClick(e) {
    const target = e.target.closest(".calender-dot");
    if (!target) return;
    if (target.classList.length < 2) return;
    elements.calenderSetter.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    const [y, m, d] = date.split("-").map(Number);
    let newDate = new Date(y, m-1, target.textContent);
    newDate = convertToDbString(newDate);

    const url = new URL(window.location);
    url.search = "";
    url.searchParams.set("date", newDate);
    history.replaceState({}, "", url);
    date = newDate;

    let data = await getData(newDate);
    let todayData = data.filter((item) => {
      return item.date === newDate
    })[0]
    populateCalenderSetter(todayData);
    populateCalender(todayData,data);
  }

  function categoryClick(e) {
    const target = e.target.closest(".category");
    if (!target) return;

    elements.categoryProductive.classList.remove("active");
    elements.categoryNeutral.classList.remove("active");
    elements.categoryWasted.classList.remove("active");
    elements.categoryVacation.classList.remove("active");

    if (target.classList.contains("productive")) {
      elements.categoryProductive.classList.add("active");
    } else if (target.classList.contains("neutral")) {
      elements.categoryNeutral.classList.add("active");
    } else if (target.classList.contains("wasted")) {
      elements.categoryWasted.classList.add("active");
    } else if (target.classList.contains("vacation")) {
      elements.categoryVacation.classList.add("active");
    }
    
    const url = new URL(window.location);
    url.searchParams.set("status", target.dataset.value);
    history.replaceState({}, "", url);
  }

  function saveRecord() {
    const url = new URL(window.location);
    const date = url.searchParams.get("date");
    let status = url.searchParams.get("status");
    const note = elements.note.value;

    const tx = db.transaction("HomeDots", "readwrite");
    const store = tx.objectStore("HomeDots");
    store.get(date).onsuccess = (e) => {
      const record = e.target.result;
      if (!record) {
        console.error("Record not found");
        return;
      }
      if (status) {
        record.status = status;
      } else {
        status = record.status;
      }
      record.note = note;
      store.put(record);
    };

    request.onerror = (e) => {
      console.error(e.target.error);
    };

    tx.oncomplete = () => {

      let dn = Number(date.split("-")[2]);
      let d = elements.calenderDots.querySelector(`[data-value="${dn}"]`)
      d.classList.remove("neutral");
      d.classList.remove("productive");
      d.classList.remove("wasted");
      d.classList.remove("vacation");
      d.classList.remove("future");
      d.classList.remove("present");

      d.classList.add(status.toLowerCase())
      
    };
  }
  
  async function init() {
    const url = new URL(window.location);
    
    if (url.searchParams.has("status")) {
      url.searchParams.delete("status");
      history.replaceState({}, "", url);
    }

    verifyDate(date)
    let data = await getData(date);
    let todayData = data.filter((item) => {
      return item.date === date
    })[0]
    populateCalenderSetter(todayData);
    populateCalender(todayData,data);
  }

  elements.calenderChangeLeft.addEventListener("click", (e) => {
    changeCalender("previous");
  });

  elements.calenderChangeRight.addEventListener("click", (e) => {
    changeCalender("Upcoming");
  });
  
  document.addEventListener("click", dotClick)

  elements.categories.addEventListener("click", categoryClick);

  elements.calenderBack.addEventListener("click", (e) => {
    window.location.href = `./index.html`
  })

  elements.saveBtn.addEventListener("click", saveRecord)

  document.addEventListener("dbReady",init)
  
})();

  