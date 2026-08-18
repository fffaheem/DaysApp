// preferences
[
  {
    "id":"user_settings",
    "theme":"dark",
    "neutralWeight":4,
    "offDays":{},
    "defaultDayStatus":"WASTED",
    "lastSynced":null
  }
]


// Home Dots
[
{"date":"2025-01-01","status":"NEUTRAL","note":""},
{"date":"2025-01-02","status":"NEUTRAL","note":""},
{"date":"2025-01-03","status":"NEUTRAL","note":""},
{"date":"2025-01-04","status":"NEUTRAL","note":""},
{"date":"2026-10-04","status":"VACATION","note":""},
{"date":"2026-10-05","status":"FUTURE","note":""}
]


// Year Checklist
[
  {"text":"Hello","isCompleted":false,"year":"2026","id":1},
  {"text":"World","isCompleted":true,"year":"2026","id":2}
]


// Goals
[
  {
    id: 1,
    title: "Build Portfolio Website",
    description: "Create a modern JS portfolio",
    startDate: "2026-08-01",
    originalEndDate: "2026-08-31", // Never changes
    currentEndDate: "2026-08-31", // Active deadline
    
    goalYear: 2026, // Never changed by RECOMMITMENT.
    goalMonth: 8,   // Never changed by RECOMMITMENT.
  
    delayStartDate: null,  // null until first missed deadline.
  
    scheduledDays: [1, 2, 3, 4, 5], // 0: Sunday, 1: Monday, ... 
    
    status: "ONGOING",
  
    history: [
      {
        id: 1,
        type: "REVISION",
        timestamp: "2026-08-10T14:30:00",
    
        previousEndDate: "2026-11-30",
        newEndDate: "2026-12-20",
    
        previousGoalYear: 2026,
        previousGoalMonth: 11,
    
        newGoalYear: 2026,
        newGoalMonth: 12
      },
    
      {
        id: 2,
        type: "REVISION",
        timestamp: "2026-08-20T12:10:00",
    
        previousEndDate: "2026-12-20",
        newEndDate: "2027-01-15",
    
        previousGoalYear: 2026,
        previousGoalMonth: 12,
    
        newGoalYear: 2027,
        newGoalMonth: 1
      },
    
      {
        id: 3,
        type: "RECOMMITMENT",
        timestamp: "2027-01-20T10:30:00",
    
        previousEndDate: "2027-01-15",
        newEndDate: "2027-02-15"
      },
    
      {
        id: 4,
        type: "RECOMMITMENT",
        timestamp: "2027-02-18T09:20:00",
    
        previousEndDate: "2027-02-15",
        newEndDate: "2027-03-10"
      }
    ]
  }
]

// Goal Checklist
[
  {
    id: 1,
    goalId: 1,
    text: "Design wireframes",
    isCompleted: true
  },
  {
    id: 2,
    goalId: 1,
    text: "Setup IndexedDB",
    isCompleted: true
  }
]

// Goal Dots


// Habits



// to get data
let tx1 = db.transaction("Preferences", "readonly");
let store1 = tx1.objectStore("Preferences");
let request1 = store1.getAll();
request1.onsuccess = (e) => {
   target = e.target.result;
   target = JSON.stringify(target);
  console.log(target)
}



