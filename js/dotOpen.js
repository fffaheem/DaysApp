(() => {
  const params = new URLSearchParams(window.location.search);
  let date = params.get("date");

  let elements = {
    body: document.querySelector("body"),
    calenderDots: document.querySelector(".calender-dots"),
    calenderSetter: document.querySelector("#calender-setter"),
    calenderSetterHead: document.querySelector(".calender-setter-head"),
    categoryProductive: document.querySelector(".category.productive"),
    categoryWasted: document.querySelector(".category.wasted"),
    categoryNeutral: document.querySelector(".category.neutral"),
    categoryVacation: document.querySelector(".category.vacation"),
    note: document.querySelector("#note"),
    calenderBack: document.querySelector(".calender-back"),
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
    console.log(status)
  }
  
  async function init() {
    verifyDate(date)
    let data = await getData(date);
    let todayData = data.filter((item) => {
      return item.date === date
    })[0]
    populateCalenderSetter(todayData)
    // console.log(data);
  }
  
        
  // const formatted = date.toLocaleDateString("en-US", {
  //   month: "long",
  //   day: "2-digit",
  //   weekday: "long",
  // }).replace(",", " -");
  document.addEventListener("click", (e) => {
    const target = e.target.closest(".calender-dot");
    if (!target) return;
    if (target.classList.length < 2) return;
    elements.calenderSetter.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    console.log(target)
  })

  elements.calenderBack.addEventListener("click", (e) => {
    window.location.href = `./index.html`
  })

  document.addEventListener("dbReady",init)
  
})();

  