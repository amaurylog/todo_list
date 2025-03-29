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
        <span class="task-text">${task.text}</span>
        <button class="editButton">Edit</button>
        <button class="deleteButton">Delete</button>
    `;
    if (task.completed) taskItem.classList.add('completed');
    return taskItem;
}

// Agregar tarea al DOM y al almacenamiento local
function addTask(task) {
    const taskItem = createTaskElement(task);
    taskItem.classList.add('task-added')
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
        // Agregar clase de animación para antes de eliminar
        taskItem.classList.add('task-deleted');
        setTimeout(() => {
            taskItem.remove();
            tasks.splice(taskIndex, 1);
            saveTasksToLocalStorage(tasks);   
        }, 500); // Espera a que termine la animación
    } else if (target.classList.contains('task-checkbox')) {
        // Marcar como completado/incompleto
        const isChecked = target.checked;
        taskItem.classList.toggle('completed', isChecked);

        // Agregar animación al cambioar de estado
        taskItem.classList.add('task-status-changed')
        setTimeout(() => taskItem.classList.remove('task-status-changed'), 500);

        tasks[taskIndex].completed = isChecked;
        saveTasksToLocalStorage(tasks);
    } else if (target.classList.contains('editButton')) {
        const taskTextElement = taskItem.querySelector('.task-text')
        if (!taskTextElement) {
            console.error('No se encontró el elemento con la clase .task-text')
            return;
        }
        const currentText = taskTextElement.textContent;

        const input = document.createElement('input')
        input.type = 'text'
        input.value = currentText
        input.classList.add('editInput')

        taskItem.replaceChild(input, taskTextElement)

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveEdit(input, taskItem, taskIndex, tasks)
        })

        input.focus()
    }

    updateTaskCounter()
});

function saveEdit(input, taskItem, taskIndex, tasks) {
    const newText = input.value.trim()

    if (newText !== '') {
        const taskTextElement = document.createElement('span')
        taskTextElement.classList.add('task-text')
        taskTextElement.textContent = newText

        // Reemplazar el campo de entrada con el nuevo texto
        taskItem.replaceChild(taskTextElement, input)
        
        // Resaltar la tarea editada
        taskItem.classList.add('task-edited')
        setTimeout(() => taskItem.classList.remove('task-edited'), 1000);

        tasks[taskIndex].text = newText
        saveTasksToLocalStorage(tasks)
    } else {
        alert('Task text cannot be empty!')
        input.focus()
    }
}

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