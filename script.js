let tasks = [];
let currentDate = new Date();
const apiUrl = 'http://localhost/myapp/tasks.php'; 

function toggleMode() {
    document.body.classList.toggle('light-mode');
    const icon = document.querySelector('.material-icons');
    icon.textContent = icon.textContent === 'dark_mode' ? 'wb_sunny' : 'dark_mode';
}

function fetchTasks() {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            tasks = data; 
            renderTaskList();
        })
        .catch(error => console.error('Error fetching tasks:', error));
}

function addTaskToServer(task) {
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            action: 'add',
            name: task.name,
            description: task.description,
            priority: task.priority,
            due_date: task.dueDate,
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                fetchTasks(); 
            } else {
                alert('Error adding task: ' + data.message);
            }
        })
        .catch(error => console.error('Error adding task:', error));
}

function updateTaskOnServer(task) {
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            action: 'update',
            id: task.id,
            name: task.name,
            description: task.description,
            priority: task.priority,
            due_date: task.dueDate,
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                fetchTasks();
            } else {
                alert('Error updating task: ' + data.message);
            }
        })
        .catch(error => console.error('Error updating task:', error));
}

function deleteTaskFromServer(taskId) {
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            action: 'delete',
            id: taskId,
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                fetchTasks(); 
            } else {
                alert('Error deleting task: ' + data.message);
            }
        })
        .catch(error => console.error('Error deleting task:', error));
}

function renderTaskList() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = ''; 

    tasks.forEach(task => {
        const row = document.createElement('tr');
        row.className = 'child';
        row.setAttribute('data-task-id', task.id);

        const formattedDueDate = task.due_date ? new Date(task.due_date).toLocaleDateString() : 'None';

        row.innerHTML = `
            <td>${task.name}</td>
            <td class="description">${task.description || '-'}</td>
            <td class="priority-${task.priority}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</td>
            <td hidden>${task.due_date || 'None'}</td>
            <td>${formattedDueDate}</td>
            <td class="actions">
                <button class="edit" onclick="editTask(this)">Edit</button>
                <button onclick="deleteConfirmation(this)">Delete</button>
                <button class="view" onclick="viewElement(this)">View</button>
                <button onclick="copyElement(this)" class="material-icons copy">content_copy</button>
            </td>
        `;
        taskList.appendChild(row);
    });

    const container = document.querySelector('.task-container');
    container.hidden = tasks.length === 0;
}

document.getElementById('taskForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const taskName = document.getElementById('taskName').value.trim();
    const taskDescription = document.getElementById('taskDescription').value.trim();
    const taskPriority = document.getElementById('taskPriority').value;
    const dueDate = document.getElementById('dueDate').value;

    if (!taskName) {
        alert('Task name is required!');
        return;
    }

    const task = {
        name: taskName,
        description: taskDescription,
        priority: taskPriority,
        dueDate: dueDate,
    };

    addTaskToServer(task); 
    this.reset();
});

function deleteTask(button) {
    const row = button.parentElement.parentElement;
    const taskId = row.getAttribute('data-task-id');

    deleteTaskFromServer(taskId); 
}


function editTask(button) {
    const row = button.parentElement.parentElement;
    const taskId = row.getAttribute('data-task-id');
    const task = tasks.find(t => t.id == taskId);

    const editedTask = {
        id: taskId,
        name: prompt('Edit Task Name:', task.name) || task.name,
        description: prompt('Edit Task Description:', task.description) || task.description,
        priority: prompt('Edit Task Priority (low, medium, high):', task.priority) || task.priority,
        dueDate: prompt('Edit Task Due Date (YYYY-MM-DD):', task.due_date) || task.due_date,
    };

    updateTaskOnServer(editedTask); 
}

document.addEventListener('DOMContentLoaded', fetchTasks);
