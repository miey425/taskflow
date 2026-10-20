// HTMLから操作する画面の部品を取得します。
const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const taskCount = document.querySelector("#task-count");
const remainingCount = document.querySelector("#remaining-count");
const todayLabel = document.querySelector("#today-label");

const STORAGE_KEY = "taskflow-tasks";

// 保存データがあれば読み込み、なければ空のリストから始めます。
let tasks = loadTasks();

// 日付を日本語で表示します（例：2026年10月20日（火））。
const today = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "long",
}).format(new Date());
todayLabel.textContent = today;

// フォームの送信時に、新しいタスクをリストへ追加します。
taskForm.addEventListener("submit", (event) => {
  event.preventDefault(); // 送信によるページ再読み込みを止めます。
  const title = taskInput.value.trim();

  if (!title) return;

  tasks.unshift({
    id: createId(),
    title,
    completed: false,
  });

  taskInput.value = "";
  saveAndRender();
  taskInput.focus();
});

// タスクの完了切り替えと削除を、リスト全体で受け取ります。
taskList.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const item = button.closest("li");
  const taskId = item?.dataset.taskId;
  if (!taskId) return;

  if (button.classList.contains("task-toggle")) {
    tasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task,
    );
  }

  if (button.classList.contains("delete-button")) {
    tasks = tasks.filter((task) => task.id !== taskId);
  }

  saveAndRender();
});

function createId() {
  // 時刻と乱数を組み合わせ、タスクを区別するIDを作ります。
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(savedTasks) ? savedTasks : [];
  } catch {
    // 保存データが壊れていても、アプリ自体は空の状態で起動できます。
    return [];
  }
}

function saveAndRender() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  renderTasks();
}

function renderTasks() {
  // 前の表示を空にして、現在のデータから画面を作り直します。
  taskList.replaceChildren();
  const completedTotal = tasks.filter((task) => task.completed).length;
  const remainingTotal = tasks.length - completedTotal;

  tasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " is-complete" : ""}`;
    item.dataset.taskId = task.id;

    const toggleButton = document.createElement("button");
    toggleButton.className = "task-toggle";
    toggleButton.type = "button";
    toggleButton.setAttribute("aria-pressed", String(task.completed));
    toggleButton.setAttribute(
      "aria-label",
      task.completed ? `「${task.title}」を未完了にする` : `「${task.title}」を完了にする`,
    );

    const title = document.createElement("span");
    title.className = "task-text";
    title.textContent = task.title;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "削除";
    deleteButton.setAttribute("aria-label", `「${task.title}」を削除`);

    item.append(toggleButton, title, deleteButton);
    taskList.append(item);
  });

  taskCount.textContent = `${tasks.length} 件`;
  remainingCount.textContent = `残り ${remainingTotal} 件`;
  emptyState.hidden = tasks.length > 0;
}

// 初回表示も保存済みデータから描画します。
renderTasks();
