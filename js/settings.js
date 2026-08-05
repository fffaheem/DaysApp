(() => {
  
  let elements = {
    body: document.querySelector("body"),
    appearanceLight: document.querySelector(".appearance-light"),
    appearanceDark: document.querySelector(".appearance-dark"),
    helpBtn: document.querySelector(".help-out"),
    defaultProductive: document.querySelector(".data-productive"),
    defaultNeutral: document.querySelector(".data-neutral"),
    defaultWasted: document.querySelector(".data-wasted"),
    dataSliderCurrent: document.querySelector(".data-second-decide-slider-current"),
    dataSlider: document.querySelector(".data-second-decide-slider"),
    scheduleBtns: document.querySelector(".schedule-dots"),
  }

  // Functions
  function setAppearanceLight() {
    const tx = db.transaction("Preferences", "readwrite");
    const store = tx.objectStore("Preferences");
    const request = store.get("user_settings");
    request.onsuccess = (e) => {
      const record = e.target.result;
      if (!record) return;
      record.theme = "light"
      store.put(record);
      elements.appearanceLight.classList.add("active");
      elements.appearanceDark.classList.remove("active");
    }

    request.onerror = (e) => {
      console.log("error")
    }
  }

  function setAppearanceDark() {
    const tx = db.transaction("Preferences", "readwrite");
    const store = tx.objectStore("Preferences");
    const request = store.get("user_settings");
    request.onsuccess = (e) => {
      const record = e.target.result;
      if (!record) return;
      record.theme = "dark"
      store.put(record);
      elements.appearanceDark.classList.add("active");
      elements.appearanceLight.classList.remove("active");
    }

    request.onerror = (e) => {
      console.log("error")
    }
  }

  function getAppearance() {
    const tx = db.transaction("Preferences", "readonly");
    const store = tx.objectStore("Preferences");
    const request = store.get("user_settings");
    request.onsuccess = (e) => {
      const record = e.target.result;
      if (!record) return;
      
      if (record.theme === "dark") {
        elements.appearanceDark.classList.add("active");
      } else if (record.theme === "light") {
        elements.appearanceLight.classList.add("active");
      }
      
    }
    request.onerror = (e) => {
      console.log("error")
    }
  }

  function setDefaultDay(defday) {
    const tx = db.transaction("Preferences", "readwrite");
    const store = tx.objectStore("Preferences");
    const request = store.get("user_settings");
    request.onsuccess = (e) => {
      const record = e.target.result;
      if (!record) return;
      record.defaultDayStatus = defday.toUpperCase();
      store.put(record);

      if (defday === "productive") {
        elements.defaultProductive.classList.add("active");
        elements.defaultNeutral.classList.remove("active");
        elements.defaultWasted.classList.remove("active");
      } else if (defday === "wasted") {
        elements.defaultProductive.classList.remove("active");
        elements.defaultNeutral.classList.remove("active");
        elements.defaultWasted.classList.add("active");
      } else if (defday === "neutral") {
        elements.defaultProductive.classList.remove("active");
        elements.defaultNeutral.classList.add("active");
        elements.defaultWasted.classList.remove("active");
      }
      
    }
    request.onerror = (e) => {
      console.log("error")
    }
  }

  function getDefaultDay() {
    const tx = db.transaction("Preferences", "readonly");
    const store = tx.objectStore("Preferences");
    const request = store.get("user_settings");
    request.onsuccess = (e) => {
      const record = e.target.result;
      if (!record) return;
      let defday = record.defaultDayStatus.toLowerCase();
      if (defday === "productive") {
        elements.defaultProductive.classList.add("active");
        elements.defaultNeutral.classList.remove("active");
        elements.defaultWasted.classList.remove("active");
      } else if (defday === "wasted") {
        elements.defaultProductive.classList.remove("active");
        elements.defaultNeutral.classList.remove("active");
        elements.defaultWasted.classList.add("active");
      } else if (defday === "neutral") {
        elements.defaultProductive.classList.remove("active");
        elements.defaultNeutral.classList.add("active");
        elements.defaultWasted.classList.remove("active");
      }
      
    }
    request.onerror = (e) => {
      console.log("error")
    }
  }

  function setSlider(v) {
    const tx = db.transaction("Preferences", "readwrite");
    const store = tx.objectStore("Preferences");
    const request = store.get("user_settings");
    request.onsuccess = (e) => {
      const record = e.target.result;
      if (!record) return;
      record.neutralWeight = Number(v)/10;
      store.put(record);
    }
    
    request.onerror = (e) => {
      console.log("error")
    }
  }

  function getSlider() {
    const tx = db.transaction("Preferences", "readonly");
    const store = tx.objectStore("Preferences");
    const request = store.get("user_settings");
    request.onsuccess = (e) => {
      const record = e.target.result;
      if (!record) return;
      let v = record.neutralWeight * 10;
      elements.dataSliderCurrent.textContent = `${v}%`;
      elements.dataSlider.value = v;
    }
    
    request.onerror = (e) => {
      console.log("error")
    }
  }

  function setScheduleDayDots(offDays) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    
    const todayString = `${yyyy}-${mm}-${dd}`;

    const tx = db.transaction("HomeDots", "readwrite");
    const store = tx.objectStore("HomeDots");
    const request = store.getAll(IDBKeyRange.lowerBound(todayString));
    request.onsuccess = (e) => {
      const records = e.target.result;
      if (!records) return;
      for (let record of records) {
        const date = new Date(record.date);
        const dayName = date.toLocaleDateString("en-US", {
            weekday: "short"
        });
        if (offDays.has(dayName)) {
            record.status = "VACATION";
            store.put(record); 
        } else {
            record.status = "FUTURE";
            store.put(record); 
        }
      }
    }
    request.onerror = () => {
        console.error(request.error);
    };
  }
  
  function setScheduleDay(d) {
    const tx = db.transaction("Preferences", "readwrite");
    const store = tx.objectStore("Preferences");
    const request = store.get("user_settings");
    request.onsuccess = (e) => {
      const record = e.target.result;
      if (!record) return;
      record.offDays.add(d)
      store.put(record);
      const element = document.querySelector(`.schedule-dot[data-value="${d}"]`);
      element.classList.add("active");
      setScheduleDayDots(record.offDays);
    }
    
    request.onerror = (e) => {
      console.log("error")
    }
  }
  
  function unsetScheduleDay(d) {
    const tx = db.transaction("Preferences", "readwrite");
    const store = tx.objectStore("Preferences");
    const request = store.get("user_settings");
    request.onsuccess = (e) => {
      const record = e.target.result;
      if (!record) return;
      record.offDays.delete(d)
      store.put(record);
      const element = document.querySelector(`.schedule-dot[data-value="${d}"]`);
      element.classList.remove("active");
      setScheduleDayDots(record.offDays);
    }
    
    request.onerror = (e) => {
      console.log("error")
    }
  }

  function getScheduleDay() {
    const tx = db.transaction("Preferences", "readonly");
    const store = tx.objectStore("Preferences");
    const request = store.get("user_settings");
    request.onsuccess = (e) => {
      const record = e.target.result;
      if (!record) return;
      let offDays = record.offDays;
      for (const offDay of offDays) {
        const element = document.querySelector(`.schedule-dot[data-value="${offDay}"]`);
        element.classList.add("active");
      }
    }
    request.onerror = (e) => {
      console.log("error")
    }
  }
  
  function init() {
    getAppearance();
    getDefaultDay();
    getSlider();
    getScheduleDay();
  }
  
  // Event Listeners
  elements.appearanceLight.addEventListener("click",setAppearanceLight)
  
  elements.appearanceDark.addEventListener("click", setAppearanceDark)
  
  elements.helpBtn.addEventListener("click", (e) => {
    console.log("run tutorial");
  })

  elements.defaultProductive.addEventListener("click", (e) => {
    setDefaultDay("productive");
  })
  
  elements.defaultNeutral.addEventListener("click", (e) => {
    setDefaultDay("neutral");
  })
  
  elements.defaultWasted.addEventListener("click", (e) => {
    setDefaultDay("wasted");
  })

  elements.dataSlider.addEventListener("input", (e) => {
    let v = elements.dataSlider.value;
    elements.dataSliderCurrent.textContent = `${v}%`;
    setSlider(v);
  })

  elements.scheduleBtns.addEventListener("click", (e) => {
    let target = e.target.closest(".schedule-dot");
    if (!target) return;
    if (target.classList.contains("active")) {
      unsetScheduleDay(target.dataset.value);
    } else {
      setScheduleDay(target.dataset.value);
    }
  })

  document.addEventListener("dbReady",init)
  
})();