const request = indexedDB.open("Days",2)
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
}

request.onsuccess = (e) => {
  db = e.target.result;
  addDefaultSettings(db);
  initializeCurrentYearDots(db);
  document.dispatchEvent(new Event("dbReady"));
};

request.onerror = (e) => {
  console.log("Error")
}

function addDefaultSettings(db) {
  const defaultSettings = {
      id: "user_settings",
      theme: "dark",
      neutralWeight: 5,
      offDays: [],
      defaultDayStatus: "WASTED",
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
  };
}

function initializeCurrentYearDots(db) {
  // Today's date (without time)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const year = today.getFullYear();
  
  const firstDay = `${year}-01-01`;
  
  const tx = db.transaction("HomeDots", "readwrite");
  const store = tx.objectStore("HomeDots");
  
  // Check if current year already exists
  const request = store.get(firstDay);
  
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
  
          // Format YYYY-MM-DD in LOCAL time
          const yyyy = current.getFullYear();
          const mm = String(current.getMonth() + 1).padStart(2, "0");
          const dd = String(current.getDate()).padStart(2, "0");
  
          const dateString = `${yyyy}-${mm}-${dd}`;
  
          store.add({
              date: dateString,
              status: current < today ? "NEUTRAL" : "FUTURE",
              note: "",
              tasks: []
          });
  
          current.setDate(current.getDate() + 1);
      }
  
      console.log("Year generated.");
  };
  
  request.onerror = () => {
      console.error(request.error);
  };
}