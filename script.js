const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const count = document.getElementById("count");
const themeToggle = document.getElementById("themeToggle");

const tasks = [];
let nextTaskId = 1;
const THEME_STORAGE_KEY = "todo-theme";
const TASKS_STORAGE_KEY = "todo-tasks";

function saveTasks() {
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
  const savedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
  if (!savedTasks) return;

  try {
    const parsed = JSON.parse(savedTasks);
    if (!Array.isArray(parsed)) return;

    parsed.forEach((task) => {
      if (
        typeof task === "object" &&
        task !== null &&
        typeof task.id === "number" &&
        typeof task.text === "string" &&
        typeof task.completed === "boolean"
      ) {
        tasks.push(task);
      }
    });

    const maxId = tasks.reduce((currentMax, task) => Math.max(currentMax, task.id), 0);
    nextTaskId = maxId + 1;
  } catch (error) {
    console.error("Unable to load saved tasks:", error);
  }
}

function updateCount() {
  const total = tasks.length;
  const done = tasks.filter((task) => task.completed).length;
  count.textContent = `${done}/${total} completed`;
}

function renderTasks(newTaskId = null) {
  taskList.innerHTML = "";

  tasks.forEach((task) => {
    const item = document.createElement("li");
    if (task.completed) item.classList.add("done");
    if (task.id === newTaskId) item.classList.add("task-enter");

    const label = document.createElement("label");
    label.className = "task-label";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      item.classList.toggle("done", task.completed);
      item.classList.remove("task-complete-pulse");
      // Restart animation when toggled quickly multiple times.
      void item.offsetWidth;
      item.classList.add("task-complete-pulse");
      saveTasks();
      updateCount();
    });

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    label.appendChild(checkbox);
    label.appendChild(text);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.type = "button";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => {
      item.classList.add("task-exit");
      item.addEventListener(
        "animationend",
        () => {
          const taskIndex = tasks.findIndex((entry) => entry.id === task.id);
          if (taskIndex !== -1) {
            tasks.splice(taskIndex, 1);
          }
          saveTasks();
          renderTasks();
        },
        { once: true }
      );
    });

    item.appendChild(label);
    item.appendChild(deleteBtn);
    taskList.appendChild(item);
  });

  updateCount();
}

function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  const newTask = { id: nextTaskId++, text, completed: false };
  tasks.push(newTask);
  saveTasks();
  taskInput.value = "";
  taskInput.focus();
  renderTasks(newTask.id);
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark-theme", isDark);
  themeToggle.textContent = isDark ? "Light Mode" : "Dark Mode";
}

function initializeTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === "dark" || savedTheme === "light") {
    applyTheme(savedTheme);
    return;
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(prefersDark ? "dark" : "light");
}

themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.contains("dark-theme");
  const nextTheme = isDark ? "light" : "dark";
  applyTheme(nextTheme);
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
});

initializeTheme();
loadTasks();
renderTasks();
addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") addTask();
});
