let tasks = [];
let currentDate = new Date();

let LOCAL_STORAGE_THEME = 'LightTheme';

(async function manageUser() {
    if (!localStorage.getItem('userToken')) {
        createNewUser();
    } else {
        const isAuthenticated = await authenticate();
        if (isAuthenticated === true) {
        } else {
            localStorage.removeItem('userToken');
            createNewUser();
        }
    }
})();

function toggleMode() { //Light Mode Toggle Function
    document.documentElement.classList.toggle('light-mode');
    document.documentElement.classList.toggle('dark-mode');
    if (document.querySelector('.material-icons').textContent == 'dark_mode') {
        document.querySelector('.material-icons').textContent = 'wb_sunny';
    }else {
        document.querySelector('.material-icons').textContent = 'dark_mode';
    }
    const valueToStroe = document.querySelector('.material-icons').textContent;
    localStorage.setItem(LOCAL_STORAGE_THEME, valueToStroe);
}

window.addEventListener("load", () => { //Prefrence loader (Light Mode)
    const theamStoredValue = localStorage.getItem(LOCAL_STORAGE_THEME);

    if (theamStoredValue != null) {
        document.querySelector('.material-icons').textContent = theamStoredValue;
    }else {
        document.querySelector('.material-icons').textContent = 'dark_mode';
    }
    loadUserContent();
});

async function createNewUser() {
    const payload = {
        type: 'create-user'
    };
    try {
        const response = await fetch("server/server.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (data.token) {
            localStorage.setItem("userToken", data.token);
        } else {
            console.error("Error creating user or generating JWT:", data.error);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

async function authenticate() {
    const payload = {
        type: 'authenticate-user',
        token: localStorage.getItem('userToken')
    };
    try {
        const response = await fetch("server/server.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload)
        });
        const auth = await response.json();

        if (auth.auth === true) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

async function loadUserContent() {
    const payload = {
        type: 'load-content',
        token: localStorage.getItem('userToken')
    };

    try {
        const response = await fetch("server/server.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (data.status === "success") {
            // Pass the tasks to a handler function
            handleUserContent(data.userTasks);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

async function addTaskToDataBase(currentTaskID, userInputName, userInputDescription, userInputPriority, userInputDueDate) {
    const payload = {
        type: 'create-task',
        token: localStorage.getItem('userToken'),
        taskID: currentTaskID,
        taskName: userInputName,
        taskDescription: userInputDescription,
        taskPriority: userInputPriority,
        dueDate: userInputDueDate
    };
    try {
        const response = await fetch("server/server.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        console.error("Error:", error);
    }
}

async function removeTaskFromDataBase(taskID) {
    const payload = {
        type: 'delete-task',
        token: localStorage.getItem('userToken'),
        taskID: taskID
    };
    try {
        const response = await fetch("server/server.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        console.error("Error:", error);
    }
}



//###################################################################################################################################
// Calendar Functions   - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - >
//###################################################################################################################################



function renderCalendar(date) {
    const calendarHeader = document.querySelector("#current-date");
    const calendarGrid = document.querySelector(".grid-container");

    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const pastLastDay = new Date(date.getFullYear(), date.getMonth() , 0);

    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    const daysInMonth = lastDay.getDate();
    const pastDaysInMonth = pastLastDay.getDate();
    const startDay = firstDay.getDay();

    const maxSize = 42;

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ];
    calendarHeader.textContent = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

    calendarGrid.innerHTML = "";
    for (let i = startDay - 1; i >= 0; i--) {
        const blankDay = document.createElement("div");
        blankDay.classList.add("blank-day");
        blankDay.textContent = (pastDaysInMonth - i);
        calendarGrid.appendChild(blankDay);
    }
    let tDay
    for (let day = 1; day <= daysInMonth; day++) {
        tDay =  day;
        if (day < 10) {
            day = '0'+day;
        }
        const dayBox = document.createElement("div");
        dayBox.textContent = tDay;
        dayBox.classList.add("day-box");

        const theDate = (`${year}-${month}-${day}`);
        tasks.forEach(task => {
            if (task.dueDate == theDate) {
                dayBox.classList.add(task.priority);
            }
            
        });
        
        const click = new Date();
    if  (
        tDay === click.getDate() &&
        date.getMonth() === click.getMonth() &&
        date.getFullYear() === click.getFullYear()
    )   {
        dayBox.classList.add("today");
    }

    calendarGrid.appendChild(dayBox);
    }
    for (let i = (daysInMonth + startDay); i < maxSize; i++) {
        const blankDay = document.createElement("div");
        blankDay.classList.add("blank-day");
        blankDay.textContent = (i - daysInMonth - startDay + 1);
        calendarGrid.appendChild(blankDay);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const calendarHeader = document.querySelector("#current-date");
    const calendarGrid = document.querySelector(".grid-container");
    const prevButton = document.querySelector("#prev");
    const nextButton = document.querySelector("#next");
    
    if (!calendarHeader || !calendarGrid || !prevButton || !nextButton) {
        alert("Required elements are missing in the DOM.");
        return;
    }
  
    prevButton.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });
  
    nextButton.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });

    calendarGrid.addEventListener("click", (event) => {
        if (event.target.className != "day-box" && event.target.className != "blank-day") {
            let day = event.target.textContent;
            let month = currentDate.getMonth() + 1;
            let year = currentDate.getFullYear();

            let selectedDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            let i;

            tasks.forEach(task => {
                i++;
                if (task.dueDate === selectedDate) {
                    createOverlay(task.id, 'elements-list');
                }
            });
        }
    });
    renderCalendar(currentDate);
});



//###################################################################################################################################
// Task List Functions  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - >
//###################################################################################################################################



document.getElementById('taskForm').addEventListener('submit', function (e) { //
    e.preventDefault();
    const taskId = Date.now();
    const taskName = document.getElementById('taskName').value.trim();
    const taskDescription = document.getElementById('taskDescription').value.trim();
    const taskPriority = document.getElementById('taskPriority').value;
    const dueDate = document.getElementById('dueDate').value;
    if (!taskName) {
        alert('Task name is required!');
        return;
    }

    addTaskToDataBase(taskId, taskName, taskDescription, taskPriority, dueDate);

    createTask(taskId, taskName, taskDescription, taskPriority, dueDate);
    this.reset();
});

function createTask(taskId, taskName, taskDescription, taskPriority, dueDate) { // This Fuction Is Used To Create Tasks Dynamically
    const formattedDueDate = new Date(dueDate);
    const day = formattedDueDate.getDate().toString().padStart(2, '0');
    const month = (formattedDueDate.getMonth() + 1).toString().padStart(2, '0');
    const year = formattedDueDate.getFullYear();
    let formattedDueDateString = `Not assigned`;
    if (dueDate) {
        formattedDueDateString = `${day}-${month}-${year}`;
    }
    const taskList = document.getElementById('taskList');
    const row = document.createElement('tr');
    row.className = "child";
    row.setAttribute('data-task-id', taskId);
    tasks.push({
        id: taskId,
        name: taskName,
        description: taskDescription,
        priority: taskPriority,
        dueDate: dueDate
    });
    //Element To Be Created
    row.innerHTML = `
    <td class="name">${taskName}</td>
    <td class="description">${taskDescription || '-'}</td>
    <td class="priority-${taskPriority}">${taskPriority.charAt(0).toUpperCase() + taskPriority.slice(1)}</td>
    <td hidden>${dueDate}</td>
    <td class="due-date">${formattedDueDateString}</td>
    <td class="actions">
    <button class="edit" onclick="editTask(this)">Edit</button>
    <button onclick="deleteConfirmation(this)">Delete</button>
    <button class ="view" onclick="viewElement(this)">View</button>
    <button onclick="copyElement(this)" class="material-icons copy">content_copy</button>
    </td>
    `;

    const container = document.querySelector('.task-container')
    container.hidden = false; 
    
    taskList.appendChild(row);
    
    renderCalendar(currentDate);
}

function handleUserContent(UserTasks) {
    UserTasks.forEach(task => {
        createTask(task.taskID, task.taskName, task.taskDescription, task.taskPriority, task.dueDate)
    });
}

function deleteConfirmation(button) { //Delete Button Function
    const row = button.parentElement.parentElement
    const id = row.dataset.taskId;
    createOverlay(id, "delete");
    const overlayCard = document.getElementById('overlay-card')
    function handleSubmit(e) {
        e.preventDefault();
        closeOverlay();
        deleteTask(button);
        overlayCard.removeEventListener('submit', handleSubmit)
    };

    overlayCard.addEventListener('submit', handleSubmit);
}

function deleteTask(button) { //Delete Button Function
    const row = button.parentElement.parentElement;
    
    tasks.forEach((task, index) => {
        if (task.id == row.getAttribute('data-task-id')) {
            removeTaskFromDataBase(task.id);
            tasks.splice(index, 1);
        };
    });
    row.remove();
    if (!document.querySelector('.child')) {
        const container = document.querySelector('.task-container')
        container.hidden = true; 
    }
    renderCalendar(currentDate);
}

function editTask(button) { // Edit Button Function
    const taskId = Date.now();
    const row = button.parentElement.parentElement;
    const taskName = row.children[0].textContent;
    const taskDescription = row.children[1].textContent;
    const taskPriority = row.children[2].textContent.toLowerCase();
    const dueDate = row.children[3].textContent;
    const id = row.dataset.taskId;

    createOverlay(id, 'edit');

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
                alert('Error: Task name is required!');
                return;
            }
            addTaskToDataBase(taskId, editedTaskName, editedTaskDescription, editedTaskPriority, editedDueDate);
            createTask(taskId, editedTaskName, editedTaskDescription, editedTaskPriority, editedDueDate);
            closeOverlay();
            deleteTask(button);
            overlayCard.removeEventListener('submit', handleSubmit)
        };
        overlayCard.addEventListener('submit', handleSubmit);
}

function viewElement(button) { // View Button Function

    const row = button.parentElement.parentElement;
    const id = row.dataset.taskId;
    createOverlay(id, "normal");
}

function copyElement(button)  { // copy Button Function

    const row = button.parentElement.parentElement;
    const taskId = Date.now();
    const taskName = row.children[0].textContent;
    const taskDescription = row.children[1].textContent;
    const taskPriority = row.children[2].textContent.toLowerCase();
    const dueDate = row.children[3].textContent;

    addTaskToDataBase(taskId, taskName, taskDescription, taskPriority, dueDate);
    createTask(taskId, taskName, taskDescription, taskPriority, dueDate)
}



//###################################################################################################################################
// Overlay Functions    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - >
//###################################################################################################################################



function createOverlay(id = null, type = null) { // Create & Open Overlay Button Function 

    let task = tasks.find(task => String(task.id) === String(id));

    taskName = task.name;
    taskDescription = task.description;
    taskPriority = task.priority;
    dueDate = task.dueDate;

    const overlay = document.getElementById('overlay');
    const content = document.getElementById('content');
    const rowOverlay = document.createElement('form');
    rowOverlay.className = 'overlay-card';
    rowOverlay.id = 'overlay-card';
    //Overlay Element To Be Created
    if (type == 'normal') {
        rowOverlay.className = 'overlay-card '+ taskPriority;
        rowOverlay.innerHTML = `
        <button class="close-btn" onclick="closeOverlay()">&times;</button>
        <div class="overlay-content">
            <h1 class="task-title" class="name">${taskName}</h1>
            <div class="task-details">
                <p class="task-description-label"><strong>Description:</strong></p>
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
            </div>
        </div>
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
    }else if (type == 'delete') {
        rowOverlay.innerHTML = `
        <strong class="cfStrong">Are you sure you want to delete this task ?</strong>
        <div class="cfButton">
            <button class="no-btn" onclick="closeOverlay()">No</button>
            <button class="yes-btn" type="submit">Yes</button>
        </div>
        `;
    }else if (type == 'elements-list') {
        document.body.classList.add('no-scroll');
        rowOverlay.className = 'overlay-card '+ taskPriority;
        rowOverlay.innerHTML = `
        <div class="overlay-content">
            <h1 class="task-title">${taskName}</h1>
            <div class="task-details">
                <p class="task-description-label"><strong>Description:</strong></p>
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
            </div>
        </div>
        `;
        document.querySelector('.overlay-no-btn').style.display = 'flex';
    }else {
        alert("Error: Type of overlay was not determined");
        return;
    }
    
    overlay.style.display = 'flex';
    content.appendChild(rowOverlay);
}

function closeOverlay() {
    const overlay = document.getElementById('overlay');
    const element = overlay.querySelectorAll('.overlay-card');
    document.body.classList.remove('no-scroll');
    document.querySelector('.overlay-no-btn').style.display = 'none';
    element.forEach (element => {
        element.remove();
    });
    overlay.style.display = 'none';
}

function getGridSize(gridElement) {

    const computedStyle = window.getComputedStyle(gridElement);
    const rows = computedStyle.getPropertyValue("grid-template-rows").split(" ").length;
    const columns = computedStyle.getPropertyValue("grid-template-columns").split(" ").length;
    const size = (rows*columns);

    return { rows, columns, size};
}

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { // Check if the pressed key is 'Esc'
        closeOverlay();
    }
});