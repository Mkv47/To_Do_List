function toggleMode() { //Light Mode Toggle Function
    document.body.classList.toggle('dark-mode');
    if (document.querySelector('.material-icons').textContent == 'wb_sunny') {
        document.querySelector('.material-icons').textContent = 'dark_mode';
    }else {
        document.querySelector('.material-icons').textContent = 'wb_sunny';
    }
}

// Task List Functions - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - >

document.getElementById('taskForm').addEventListener('submit', function (e) { //
    e.preventDefault();
    const taskName = document.getElementById('taskName').value.trim();
    const taskDescription = document.getElementById('taskDescription').value.trim();
    const taskPriority = document.getElementById('taskPriority').value;
    const dueDate = document.getElementById('dueDate').value;
    if (!taskName) {
        alert('Task name is required!');
        return;
    }

    /* Back-End Should Be Here To Send Elements to the Data Base*/

    createTask(taskName, taskDescription, taskPriority, dueDate);
    this.reset();
});

function createTask(taskName, taskDescription, taskPriority, dueDate) { // This Fuction Is Used To Create Tasks Dynamically
    const formattedDueDate = new Date(dueDate);
    const day = formattedDueDate.getDate().toString().padStart(2, '0');
    const month = (formattedDueDate.getMonth() + 1).toString().padStart(2, '0');
    const year = formattedDueDate.getFullYear();
    let formattedDueDateString = `Not assigned`;
    if (dueDate) {
        formattedDueDateString = `${day}-${month}-${year}`
    }
    const taskList = document.getElementById('taskList');
    const row = document.createElement('tr');
    row.className = "child";
    //Element To Be Created
    row.innerHTML = `
    <td>${taskName}</td>
    <td class="description">${taskDescription || '-'}</td>
    <td class="priority-${taskPriority}">${taskPriority.charAt(0).toUpperCase() + taskPriority.slice(1)}</td>
    <td hidden>${dueDate || 'None'}</td>
    <td>${formattedDueDateString || 'None'}</td>
    <td class="actions">
    <button class="edit" onclick="editTask(this)">Edit</button>
    <button onclick="deleteTask(this)">Delete</button>
    <button class ="view" onclick="viewElement(this)">View</button>
    </td>
    `;

    const container = document.querySelector('.task-container')
    container.hidden = false; 

    taskList.appendChild(row);
}

function deleteTask(button) { //Delete Button Function
    const row = button.parentElement.parentElement;

    /* Back-End Should Be Here To Delete Elements From The Data Base*/

    row.remove();
    if (!document.querySelector('.child')) {
        const container = document.querySelector('.task-container')
        container.hidden = true; 
    }
}

function editTask(button) { // Edit Button Function
    const row = button.parentElement.parentElement;
    const taskName = row.children[0].textContent;
    const taskDescription = row.children[1].textContent;
    const taskPriority = row.children[2].textContent.toLowerCase();
    const dueDate = row.children[3].textContent;

    createOverlay(taskName, taskDescription, taskPriority, dueDate, 'edit');

    document.getElementById('overlayTaskName').value = taskName;
    document.getElementById('overlayTaskDescription').value = taskDescription === '-' ? '' : taskDescription;
    document.getElementById('overlayTaskPriority').value = taskPriority;
    document.getElementById('overlayDueDate').value = dueDate === 'None' ? '' : dueDate;

    const overlayCard = document.getElementById('overlay-card')
        function handleSubmit(e) {
            e.preventDefault();
            const editedTaskName = document.getElementById('overlayTaskName').value.trim();
            const editedTaskDescription = document.getElementById('overlayTaskDescription').value.trim();
            const editedTaskPriority = document.getElementById('overlayTaskPriority').value;
            const editedDueDate = document.getElementById('overlayDueDate').value;
            if (!editedTaskName) {
                alert('Task name is required!');
                return;
            }
            createTask(editedTaskName, editedTaskDescription, editedTaskPriority, editedDueDate);
            closeOverlay();
            deleteTask(button);
            overlayCard.removeEventListener('submit', handleSubmit)
        };
        overlayCard.addEventListener('submit', handleSubmit);
}

function viewElement(button) { // View Button Function

    const row = button.parentElement.parentElement;
    const taskName = row.children[0].textContent;
    const taskDescription = row.children[1].textContent;
    const taskPriority = row.children[2].textContent.toLowerCase();
    const dueDate = row.children[3].textContent;
    createOverlay(taskName, taskDescription, taskPriority, dueDate, "normal");

}

// Overlay Functions - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - >

function createOverlay(taskName, taskDescription, taskPriority, dueDate, type) { // Create & Open Overlay Button Function 
//Parameters {taskName = String, taskDescription = String, taskPriority = Low/Meduim/High, dueDate = dd/mm/yyyy, type = normal/edit}
    const overlay = document.getElementById('overlay');
    const rowOverlay = document.createElement('form');
    rowOverlay.className = 'overlay-card';
    rowOverlay.id = 'overlay-card';
    //Overlay Element To Be Created
    if (type == 'normal') {
        rowOverlay.innerHTML = `
        <button class="close-btn" onclick="closeOverlay()">&times;</button>
        <div class="overlay-content">
            <h1 class="task-title">${taskName}</h1>
            <div class="task-details">
                <p class="task-description-label">Description:</p>
                <p class="task-description">${taskDescription || 'No description available'}</p>
                <p class="task-priority">
                    <strong>Priority:</strong> 
                    <span class="priority-${taskPriority}">
                        ${taskPriority.charAt(0).toUpperCase() + taskPriority.slice(1)}
                    </span>
                </p>
                <p class="task-due-date">
                    <strong>Due Date:</strong> 
                    <span>${dueDate || 'Not assigned'}</span>
                </p>
        `;
    }else if (type == 'edit') {
        rowOverlay.innerHTML = `
        <button class="close-btn" onclick="closeOverlay()">&times;</button>
        <label for="overlayTaskName">Task Name:</label>
        <input maxlength="24" type="text" id="overlayTaskName" placeholder="Enter task name" required>
        <label for="overlayTaskDescription">Description:</label>
        <textarea class="overlayTextarea" id="overlayTaskDescription" placeholder="Enter task description" maxlength="528"></textarea>
        <label for="overlayTaskPriority">Priority:</label>
        <select id="overlayTaskPriority">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
        </select>
        <label for="overlayDueDate">Due Date:</label>
        <input type="date" id="overlayDueDate">
        <button type="submit">Submit</button>
        `;
    }else {
        console.log("Type of overlay was not determined");
    }
    
    overlay.style.display = 'flex'; // Shows The Overlay Contents

    overlay.appendChild(rowOverlay); // Set A Location To Insert HTML
}

function closeOverlay() { // Close Overlay Button Function
    const element = document.querySelector('.overlay-card').remove();
    const overlay = document.getElementById('overlay');
    overlay.style.display = 'none';
}