const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const count = document.getElementById("count");

const tasks = [];
let nextTaskId = 1;

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
  taskInput.value = "";
  taskInput.focus();
  renderTasks(newTask.id);
}

addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") addTask();
});
