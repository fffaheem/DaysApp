(function overrideNativeDate() {
    const offsetStr = localStorage.getItem("debug_time_offset");
    
    // Save the original Date object before doing anything so our tools can use it
    const OriginalDate = window.Date;
    window.OriginalDate = OriginalDate; 
    
    if (offsetStr) {
        const offset = parseInt(offsetStr, 10);

        function MockedDate(...args) {
            if (!new.target) {
                if (args.length === 0) {
                    return new OriginalDate(OriginalDate.now() + offset).toString();
                }
                return OriginalDate(...args);
            }
            if (args.length === 0) {
                // Return real time + the offset so time keeps ticking!
                return new OriginalDate(OriginalDate.now() + offset);
            }
            return new OriginalDate(...args);
        }

        MockedDate.now = function () {
            return OriginalDate.now() + offset;
        };
        MockedDate.parse = OriginalDate.parse;
        MockedDate.UTC = OriginalDate.UTC;
        MockedDate.prototype = OriginalDate.prototype;
        
        window.Date = MockedDate;
    }
})();

// Tools for the UI to interact with
window.debugTools = {
    setMockDate: (dateTimeString) => {
        // Calculate how far in the past or future the mock time is
        const targetTime = new window.OriginalDate(dateTimeString).getTime();
        const realTime = window.OriginalDate.now();
        const offset = targetTime - realTime;
        
        localStorage.setItem("debug_time_offset", offset.toString());
        localStorage.setItem("debug_mock_date_display", dateTimeString); // Saved for the UI input
        location.reload(); 
    },
    clearMockDate: () => {
        localStorage.removeItem("debug_time_offset");
        localStorage.removeItem("debug_mock_date_display");
        location.reload();
    }
};

const request = indexedDB.open("Days", 1)
let db = null;

request.onupgradeneeded = (e) => {
  db = e.target.result;
  if (!db.objectStoreNames.contains("Preferences")) {
    db.createObjectStore("Preferences", {
      keyPath: "id"
    });
  }
  if (!db.objectStoreNames.contains("HomeDots")) {
    db.createObjectStore("HomeDots", {
      keyPath: "date"
    });
  }
  if (!db.objectStoreNames.contains("YearChecklist")) {
    const store = db.createObjectStore("YearChecklist", {
      keyPath: "id",
      autoIncrement: true
    });
    store.createIndex("year", "year", { unique: false });
  }
  if (!db.objectStoreNames.contains("Goals")) {
    const store = db.createObjectStore("Goals", {
      keyPath: "id",
      autoIncrement: true
    });

    store.createIndex("by_year", "goalYear", { unique: false });
    store.createIndex("by_goal_period", ["goalYear", "goalMonth"], { unique: false });
    store.createIndex("by_status", "status", { unique: false });
    
  }
  if (!db.objectStoreNames.contains("GoalDots")) {
    const store = db.createObjectStore("GoalDots", { 
      keyPath: ["goalId", "date"] 
    });

    // 1. Index to instantly fetch all dots for a single goal
    store.createIndex("by_goal", "goalId", { unique: false });
      
    // 2. Index to group dots by year for the timeline dropdowns
    store.createIndex("by_year", "year", { unique: false });
  }
}

request.onsuccess = async (e) => {
  db = e.target.result;
  await addDefaultSettings(db);
  initializeLastYear(db);
  initializeCurrentYearDots(db);
  document.dispatchEvent(new Event("dbReady"));
};

request.onerror = (e) => {
  console.log("Error")
}

let defaultSettings = {}

function addDefaultSettings(db) {
  return new Promise((resolve) => {
    defaultSettings = {
      id: "user_settings",
      theme: "dark",
      neutralWeight: 5,
      offDays: new Set(),
      defaultDayStatus: "NEUTRAL",
      lastSynced: null
    };
  
    const tx = db.transaction("Preferences", "readwrite");
    const store = tx.objectStore("Preferences");
  
    // Check if settings already exist
    const getRequest = store.get("user_settings");
    getRequest.onsuccess = () => {
      // First time opening the app
      if (!getRequest.result) {
        store.add(defaultSettings);
        console.log("Default settings created.");
      } else {
        console.log("Existing settings found.");
      }
      resolve();
    };
  })
}

function getOffDays() {
  return new Promise((resolve,reject) => {
    const tx = db.transaction("Preferences", "readonly");
    const store = tx.objectStore("Preferences");
    const request = store.get("user_settings");
    request.onsuccess = (e) => {
      resolve(e.target.result.offDays)
    }
    request.onerror = () => {
        reject(request.error);
    };
  })
}

async function initializeCurrentYearDots(db) {
  // Today's date (without time)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const year = today.getFullYear();
  
  const firstDay = `${year}-01-01`;
  
  const tx = db.transaction("HomeDots", "readwrite");
  const store = tx.objectStore("HomeDots");
  
  // Check if current year already exists
  const request = store.get(firstDay);
  let offDays = await getOffDays();
  request.onsuccess = () => {
    // Already initialized
    if (request.result) {
        console.log("Year already exists.");
        return;
    }

    console.log("Generating year...");
    let current = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);

    while (current <= end) {

      const dayName = current.toLocaleDateString("en-US", {
          weekday: "short"
      });

      // Format YYYY-MM-DD in LOCAL time
      const yyyy = current.getFullYear();
      const mm = String(current.getMonth() + 1).padStart(2, "0");
      const dd = String(current.getDate()).padStart(2, "0");

      const dateString = `${yyyy}-${mm}-${dd}`;
      let status = null;
      if (current < today) {
        status = defaultSettings.defaultDayStatus;
      } else if (current > today) {
        status = "FUTURE";
      } else {
        status = "PRESENT";
      }

      if (current >= today && offDays.has(dayName)) {
        status = "VACATION";
      }

      store.add({
          date: dateString,
          status: status,
          note: ""
      });

      current.setDate(current.getDate() + 1);
      
    }

    console.log("Year generated.");
  };
  
  request.onerror = () => {
      console.error(request.error);
  };
}

function initializeLastYear(db) {
  const firstDay = `2025-01-01`;
  
  const tx = db.transaction("HomeDots", "readwrite");
  const store = tx.objectStore("HomeDots");
  
  const request = store.get(firstDay);
  
  request.onsuccess = () => {
  
      // Already initialized
      if (request.result) {
          return;
      }
  
      const start = new Date(2025, 0, 1);
      const end = new Date(2025, 11, 31);
  
      while (start <= end) {
  
          // Format YYYY-MM-DD in LOCAL time
          const yyyy = start.getFullYear();
          const mm = String(start.getMonth() + 1).padStart(2, "0");
          const dd = String(start.getDate()).padStart(2, "0");
  
          const dateString = `${yyyy}-${mm}-${dd}`;
  
          store.add({
              date: dateString,
              status: "NEUTRAL",
              note: ""
          });
  
          start.setDate(start.getDate() + 1);
      }
  };
  
  request.onerror = () => {
      console.error(request.error);
  };
}