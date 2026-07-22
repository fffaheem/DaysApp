const request = indexedDB.open("Days",1)
let db = null;

request.onupgradeneeded = (e) => {
  db = e.target.result;
  if (!db.objectStoreNames.contains("Preferences")) {
      db.createObjectStore("Preferences", {
          keyPath: "id"
      });
  }
}

request.onsuccess = (e) => {
  db = e.target.result;
  addDefaultSettings();
};


request.onerror = (e) => {
  console.log("Error is called")
}

function addDefaultSettings() {
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
          console.log(getRequest.result);
      }
  };
}


function getCurrentYear() {
  
}