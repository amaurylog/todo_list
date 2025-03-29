const taskInput = document.getElementById('taskInput');
const addButton = document.getElementById('addButton');
const taskList = document.getElementById('taskList');
const filter = document.getElementById('filter')
const taskCounter = document.getElementById('taskCounter')

// Inicializar tareas al cargar la página
displayTasks();
updateTaskCounter()

// Agregar nueva tarea
addButton.addEventListener('click', () => {
    const taskText = taskInput.value.trim();
    if (taskText !== '') {
        const newTask = { text: taskText, completed: false };
        addTask(newTask);
        taskInput.value = '';
        updateTaskCounter()
    }
});

// Filtrar tareas al cambiar el filtro
filter.addEventListener('change', () => {
    displayTasks();
})

// Crear elemento de tarea
function createTaskElement(task) {
    const taskItem = document.createElement('li');
    taskItem.innerHTML = `
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}/>
        <span>${task.text}</span>
        <button class="deleteButton">Delete</button>
    `;
    if (task.completed) taskItem.classList.add('completed');
    return taskItem;
}

// Agregar tarea al DOM y al almacenamiento local
function addTask(task) {
    const taskItem = createTaskElement(task);
    taskList.appendChild(taskItem);

    const tasks = getTasksFromLocalStorage();
    tasks.push(task);
    saveTasksToLocalStorage(tasks);
}

// Mostrar tareas desde el almacenamiento local
function displayTasks() {
    const tasks = getTasksFromLocalStorage();
    const filterValue = filter.value;

    // Limpiar la lista antes de mostrar
    taskList.innerHTML = '';

    // Filtrar tareas según el valor seleccionado
    tasks.filter(task => {
        if (filterValue === 'all') return true;
        if (filterValue === 'completed') return task.completed
        if (filterValue === 'pending') return !task.completed
    })
    .forEach(task => {
        const taskItem = createTaskElement(task);
        taskList.appendChild(taskItem);
    })

    updateTaskCounter();
}

// Delegación de eventos para manejar acciones en las tareas
taskList.addEventListener('click', (event) => {
    const target = event.target;
    const taskItem = target.closest('li');
    if (!taskItem) return;

    const tasks = getTasksFromLocalStorage();
    const taskIndex = Array.from(taskList.children).indexOf(taskItem);

    if (target.classList.contains('deleteButton')) {
        // Eliminar tarea
        taskItem.remove();
        tasks.splice(taskIndex, 1);
        saveTasksToLocalStorage(tasks);
    } else if (target.classList.contains('task-checkbox')) {
        // Marcar como completado/incompleto
        const isChecked = target.checked;
        taskItem.classList.toggle('completed', isChecked);
        tasks[taskIndex].completed = isChecked;
        saveTasksToLocalStorage(tasks);
    }

    updateTaskCounter()
});

// Guardar tareas en el almacenamiento local
function saveTasksToLocalStorage(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Obtener tareas del almacenamiento local
function getTasksFromLocalStorage() {
    const tasksJSON = localStorage.getItem('tasks');
    return tasksJSON ? JSON.parse(tasksJSON) : [];
}

function updateTaskCounter() {
    const tasks = getTasksFromLocalStorage();
    const pendingTasks = tasks.filter(task => !task.completed).length;
    taskCounter.textContent = `Pending tasks: ${pendingTasks}`;
}