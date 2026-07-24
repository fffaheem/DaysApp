(() => {
  const params = new URLSearchParams(window.location.search);
  let data = params.get("date");

  let elements = {
    body: document.querySelector("body"),
    calenderDots: document.querySelector(".calender-dots"),
    calenderSetter: document.querySelector("#calender-setter"),
  }
  
  function verifyDate(date) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!date || !regex.test(date) || isNaN(new Date(date).getTime())) {
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
  
  async function init() {
    verifyDate(data)
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
  document.addEventListener("dbReady",init)
  
})();

  