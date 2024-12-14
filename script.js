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
    
    const taskList = document.getElementById('taskList');
    
    const row = document.createElement('tr');
    row.className = "child";
    row.innerHTML = `
    <td>${taskName}</td>
    <td class="description">${taskDescription || '-'}</td>
    <td class="priority-${taskPriority}">${taskPriority.charAt(0).toUpperCase() + taskPriority.slice(1)}</td>
    <td>${dueDate || 'None'}</td>
    <td class="actions">
    <button class="edit" onclick="editTask(this)">Edit</button>
    <button onclick="deleteTask(this)">Delete</button>
    <button class ="view" onclick="viewElement(this)">View</button>
    </td>
    `;

    const container = document.querySelector('.task-container')
    container.hidden = false; 

    taskList.appendChild(row);
    this.reset();
});

// Function to close the pop-out window
function closeWindow() {
    const element = document.querySelector('.overlay-card').remove();
    const overlay = document.getElementById('overlay');
    overlay.style.display = 'none';
}

const currentDate = new Date();

const formattedDate = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
});
document.getElementById('current-date').textContent = formattedDate;

function deleteTask(button) {
    const row = button.parentElement.parentElement;
    row.remove();
    if (!document.querySelector('.child')) {
        const container = document.querySelector('.task-container')
        container.hidden = true; 
    }
}

function toggleMode() {
    document.body.classList.toggle('dark-mode');
    if (document.querySelector('.material-icons').textContent == 'wb_sunny') {
        document.querySelector('.material-icons').textContent = 'dark_mode';
    }else {
        document.querySelector('.material-icons').textContent = 'wb_sunny';
    }
}

function editTask(button) {
    console.log(button)
    const row = button.parentElement.parentElement;
    const taskName = row.children[0].textContent;
    const taskDescription = row.children[1].textContent;
    const taskPriority = row.children[2].textContent.toLowerCase();
    const dueDate = row.children[3].textContent;

    document.getElementById('taskName').value = taskName;
    document.getElementById('taskDescription').value = taskDescription === '-' ? '' : taskDescription;
    document.getElementById('taskPriority').value = taskPriority;
    document.getElementById('dueDate').value = dueDate === 'None' ? '' : dueDate;

    row.remove();
}

function viewElement(button) {
    console.log(button)
    
    const row = button.parentElement.parentElement;
    const overlay = document.getElementById('overlay');
    
    const taskName = row.children[0].textContent;
    const taskDescription = row.children[1].textContent;
    const taskPriority = row.children[2].textContent.toLowerCase();
    const dueDate = row.children[3].textContent;
    const rowOverlay = document.createElement('div');
    rowOverlay.className = 'overlay-card';

    rowOverlay.innerHTML = `
    <h1>${taskName}</h1>
    <p>Description</p>
    <span class = "overlay-card-span">${taskDescription}</span>
    <p>Priority: <span class="priority-${taskPriority}">${taskPriority.charAt(0).toUpperCase() + taskPriority.slice(1)}</span></p>
    <p>Due Date: <span>${dueDate}</span></p>
    `;
    
    overlay.style.display = 'flex';

    overlay.appendChild(rowOverlay);
}