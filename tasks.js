const addTaskBtn = document.getElementById("add-task-btn");
const deleteTaskBtn = document.getElementById("delete-task-btn");
const taskInputEl = document.getElementById("taskInput");
const popupMenu = document.getElementById("popup-menu");
const taskContainer = document.getElementById("task-container");
const ctx = document.getElementById('streakChart').getContext('2d');


let taskId = 0;
let isChecked = false;
let taskList = [];
let activeTask = null;
let streakData = JSON.parse(localStorage.getItem("streakData")) || [];


function addCheckboxListener(taskCheckbox, taskId) {
    taskCheckbox.addEventListener("change", function(){
        const taskIndex = taskList.findIndex(task => task.id === taskId );
        if(taskIndex !== -1){
            taskList[taskIndex].checked = taskCheckbox.checked;
            localStorage.setItem("tasks", JSON.stringify(taskList));
        }
    });
};


function createTask (taskValue, taskId, isChecked) {

    const taskDiv = document.createElement("div");
    taskDiv.classList.add("sec-2");
    taskDiv.setAttribute("data-id", taskId);

    const icon = document.createElement("i");
    icon.classList.add("fa-solid", "fa-bars-progress", "task-logo");

    const taskLabel = document.createElement("label");
    taskLabel.classList.add("taskName");
    taskLabel.textContent = taskValue;

    const taskCheckbox = document.createElement("input");
    taskCheckbox.type = "checkbox";
    taskCheckbox.classList.add("habitCheck");
    taskCheckbox.id = `habitCheck-${taskId}`;
    taskCheckbox.checked = isChecked;

    const customlabel = document.createElement("label");
    customlabel.classList.add("customCheck");
    customlabel.setAttribute("for", taskCheckbox.id);

    

    taskDiv.appendChild(icon);
    taskDiv.appendChild(taskLabel);
    taskDiv.appendChild(taskCheckbox);
    taskDiv.appendChild(customlabel);

    const taskContainer = document.getElementById("task-container");
    taskContainer.appendChild(taskDiv);

    addCheckboxListener(taskCheckbox, taskId);

};

const addTaskEvent = () => {
    const taskInputValue = taskInputEl.value.trim();
    if (taskInputValue){
        createTask(taskInputValue, taskId, isChecked);
        taskList.push({ id: taskId, value: taskInputValue, checked: isChecked});
        localStorage.setItem("tasks", JSON.stringify(taskList));
        taskId++;
        taskInputEl.value = "";
    }
    else{
        console.log("add value in input");
    }
};

const dblClickTask = (e) => {
    const taskEl = e.target.closest(".sec-2");
    if (!taskEl) return;

    if (activeTask) {
        activeTask.classList.remove("task-on-top");
    }

    activeTask = taskEl;
    activeTask.classList.add("task-on-top");

    taskEl.appendChild(popupMenu);

    popupMenu.classList.remove("hidden");
};

const deleteTaskEvent = () => {
    if (!activeTask){
        return;
    }
    const taskId = parseInt(activeTask.getAttribute("data-id"));
    const taskToDelete = taskList.findIndex(task => task.id === taskId );

    if(taskToDelete !== -1){
        taskList.splice(taskToDelete, 1);
        localStorage.setItem("tasks", JSON.stringify(taskList));
    }

    activeTask.remove();
    popupMenu.classList.add("hidden");
    activeTask = null;
};

const checkForMidnightReset = () => {
  console.log("checking midnight logic", new Date().toString());
  const now = new Date();
  const today = now.toDateString();
  const lastChecked = localStorage.getItem("lastCheckedDate");

  if (lastChecked && new Date(lastChecked).toDateString() === today) return;

  const taskData = localStorage.getItem("tasks");
  if (!taskData || JSON.parse(taskData).length === 0) {
    localStorage.setItem("streak", "0");
    localStorage.setItem("lastCheckedDate", today);
    document.querySelectorAll(".sec-2").forEach(task => task.remove());
    taskList = [];

    streakData.push({ date: now.toLocaleDateString(), streak: 0 });
    localStorage.setItem("streakData", JSON.stringify(streakData));

    chart.data.labels.push(now.toLocaleDateString());
    chart.data.datasets[0].data.push(0);
    chart.update();

    const streakCounter = document.getElementById("streak-count");
    if (streakCounter) {
        streakCounter.textContent = "0";
    }
    
    return;
  }
  
  taskList = JSON.parse(taskData);
  const allCompleted = taskList.length > 0 && taskList.every(task => task.checked === true);

  let currentStreak = parseInt(localStorage.getItem("streak") || "0");
  currentStreak = allCompleted ? currentStreak + 1 : 0;

  localStorage.setItem("streak", currentStreak);
  localStorage.setItem("lastCheckedDate", today);

  streakData.push({date: now.toLocaleDateString(), streak: currentStreak});
  localStorage.setItem("streakData", JSON.stringify(streakData));
  localStorage.removeItem("tasks");

  document.querySelectorAll(".sec-2").forEach(task => task.remove());
  taskList = [];

  chart.data.labels.push(now.toLocaleDateString());
  chart.data.datasets[0].data.push(currentStreak);
  chart.update();

  const streakCounter = document.getElementById("streak-count");
  if (streakCounter) {
    streakCounter.textContent = `🔥${currentStreak}`;
  }

}

taskContainer.addEventListener("dblclick", dblClickTask);
addTaskBtn.addEventListener("click", addTaskEvent);
deleteTaskBtn.addEventListener("click", deleteTaskEvent);

document.addEventListener("click", function (event) {
    const isClickInsidePopup = popupMenu.contains(event.target);
    if (!isClickInsidePopup) {
        if (activeTask) {
            activeTask.classList.remove("task-on-top");
            activeTask = null;
        }
        popupMenu.classList.add("hidden");
    }
});

window.addEventListener("load", () => {
    const savedTask = localStorage.getItem("tasks");
    if (savedTask) {
        taskList = JSON.parse(savedTask);
        taskList.forEach((task) => {
            createTask(task.value, task.id, task.checked);
            taskId = Math.max(taskId, task.id + 1);
        });
    }

    const currentStreak = localStorage.getItem("streak") || "0";
    const streakCounter = document.getElementById("streak-count");
    if (streakCounter) {
      if (parseInt(currentStreak) > 0) {
        streakCounter.textContent = `🔥${currentStreak}`;
      } else {
        streakCounter.textContent = currentStreak;
      }
    }
    
    const savedTheme = localStorage.getItem("theme") || "light-mode";
    document.body.classList.add(savedTheme);

    checkForMidnightReset();
    setInterval(checkForMidnightReset, 60000);
});

const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: streakData.map(entry => entry.date),
      datasets: [{
        label: 'Streak',
        data: streakData.map(entry => entry.streak),
        fill: true,
        borderColor: '#87CEFA',
        backgroundColor: 'rgba(135, 206, 250, 0.2)',
        pointBackgroundColor: '#fff',
        tension: 0.4
      }]
    },
    options: {
      plugins: {
        legend: {
          labels: {
            color: 'white',
            font: {
              size: 14,
              family: 'Poppins'
            }
          }
        },
        tooltip: {
          backgroundColor: '#1e3c72',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#87CEFA',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          ticks: {
            color: 'white'
          },
          title: {
            display: true,
            text: 'Date',
            color: 'white',
            font: {
              weight: 'bold'
            }
          },
          grid: {
            color: 'white' 
          }
        },
        y: {
          ticks: {
            color: 'white'
          },
          title: {
            display: true,
            text: 'Streak',
            color: 'white',
            font: {
              weight: 'bold'
            }
          },
          grid: {
            color: 'white' 
          }
        }
      }
    }
  });


  