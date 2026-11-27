

function isValidTask(item){
    if (typeof item?.id === "number" && typeof item?.title === "string"  && typeof item?.completed === "boolean")
    {return true
} else {return false}
}
function loadTasks() {
    try {
        const tasksLoaded = localStorage.getItem("tasks")
        if (tasksLoaded) {
            const data =  JSON.parse(tasksLoaded)
            if (Array.isArray(data)){
                const result = data.filter(item => isValidTask(item));
            return result}
            else {return []}
        }
        else { return [] }
    }
    catch { return [] }
}

let tasks = loadTasks()
const ALLOWED_FILTERS = ["all", "active", "completed"];
function getFilter() {
    const filter = localStorage.getItem("filter")
        return ALLOWED_FILTERS.includes(filter) ? filter : "all";
}
let currentFilter = getFilter();


function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

const taskStats = document.querySelector("#taskStats");
const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");
const status = document.querySelector("#status");
const log = document.querySelector("#log");
const clearLogButton = document.querySelector("#clearLog");
const filters = document.querySelector("#filters");
clearLogButton.addEventListener("click", () => {
    log.textContent = "";
    status.textContent = "Журнал очищен.";
});
function writeLog(message) {
    const line = document.createElement("div");
    line.textContent = message;
    log.append(line);
    log.scrollTop = log.scrollHeight;
    console.log(message);
}
const taskList = document.querySelector("#taskList");
renderTasks(tasks);
renderTaskStats(tasks);
function renderTasks(tasks) {
    taskList.textContent = ""
    const filteredTasks = filterTasks(tasks, currentFilter)
    filteredTasks.forEach(element => {
        const li = document.createElement("li");
        const checkbox = document.createElement("input")
        checkbox.type = "checkbox"
        checkbox.checked = element.completed

        const span = document.createElement("span");
        span.textContent = element.title;
        span.className = "task-text";
        const button = document.createElement("button");
        button.textContent = "Удалить";
        li.append(checkbox);
        li.append(span);
        li.append(button);
        li.dataset.id = element.id
        taskList.append(li)
    });
}

function addTask(tasks, title) {
    const max = tasks.reduce((acc, element) => { return element.id > acc ? element.id : acc; }, 0)
    const newTask = {
        id: max + 1,
        title,
        completed: false
    };
    const newTasks = [...tasks, newTask];
    return newTasks
}

taskForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = taskInput.value.trim();
    if (title) {
        tasks = addTask(tasks, title)
        renderTasks(tasks)
        renderTaskStats(tasks)
        saveTasks(tasks)
        writeLog(`Добавлена задача ${title}`)
        taskInput.value = ""
    }
});

function toggleTask(tasks, id) {
    return tasks.map(task => {
        if (task.id === id) {
            return {
                ...task,
                completed: !task.completed
            };
        }
        return task
        // если ID не совпадает — вернуть task
    });
}

taskList.addEventListener("change", (event) => {
    if (event.target.type === "checkbox") {
        const li = event.target.closest("li")
        const newId = Number(li.dataset.id)
        tasks = toggleTask(tasks, newId)
        writeLog(`Статус задачи ${li.children[1].textContent} измненен`)
        renderTasks(tasks)
        renderTaskStats(tasks)
        saveTasks(tasks)
    }
});

taskList.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (button) {
        const li = button.closest("li");
        if (li) {
            tasks = deleteTask(tasks, Number(li.dataset.id));
            writeLog(`Задача ${li.children[1].textContent} удалена`)
            renderTasks(tasks);
            renderTaskStats(tasks)
            saveTasks(tasks)
        }
    }


});
function deleteTask(tasks, id) {
    return tasks.filter(task => task.id !== id);
}

function filterTasks(tasks, filter) {
    if (filter === "active") {
        return tasks.filter(task => !task.completed)
    }
    else if (filter === "completed") {
        return tasks.filter(task => task.completed);
    }
    return tasks
}

function getTaskStats(tasks) {
    return {
        total: tasks.length,
        active: tasks.filter((task => !task.completed)).length,
        completed: tasks.filter((task => task.completed)).length,
    }
}
function renderTaskStats(tasks) {
    const stats = getTaskStats(tasks);
    taskStats.textContent = `Всего: ${stats.total} | Активных: ${stats.active} | Выполненных: ${stats.completed} `
}
filters.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (button) {
        currentFilter = button.dataset.filter
        renderTasks(tasks)
        localStorage.setItem("filter", currentFilter)
        renderFilters()
    }
})

function renderFilters() {
    const buttons = filters.querySelectorAll("button");

    buttons.forEach((button) => {
        button.classList.toggle(
            "active", button.dataset.filter === currentFilter
        )
    });
}
renderFilters()