let tasks = [];
let currentDate = new Date();

function toggleMode() { //Light Mode Toggle Function
    document.body.classList.toggle('light-mode');
    if (document.querySelector('.material-icons').textContent == 'dark_mode') {
        document.querySelector('.material-icons').textContent = 'wb_sunny';
    }else {
        document.querySelector('.material-icons').textContent = 'dark_mode';
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
    for (let day = 1; day <= daysInMonth; day++) {
        const dayBox = document.createElement("div");
        dayBox.textContent = day;
        dayBox.classList.add("day-box");

        if (day < 10) {
            day = '0'+day;
        }
        const theDate = (`${year}-${month}-${day}`);

        tasks.forEach(task => {
            console.log(theDate , "   |   ", task.dueDate);
            if (task.dueDate == theDate) {
                console.log(`Task with due date ${date} found:`, task);
                dayBox.classList.add("task-day");
            }
            
        });
        
        const click = new Date();
    if  (
        day === click.getDate() &&
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
  
    renderCalendar(currentDate);
});



//###################################################################################################################################
// Task List Functions  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - >
//###################################################################################################################################



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
    const taskId = Date.now();
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
    <td>${taskName}</td>
    <td class="description">${taskDescription || '-'}</td>
    <td class="priority-${taskPriority}">${taskPriority.charAt(0).toUpperCase() + taskPriority.slice(1)}</td>
    <td hidden>${dueDate || 'None'}</td>
    <td>${formattedDueDateString || 'None'}</td>
    <td class="actions">
    <button class="edit" onclick="editTask(this)">Edit</button>
    <button onclick="deleteConfirmation(this)">Delete</button>
    <button class ="view" onclick="viewElement(this)">View</button>
    </td>
    `;

    const container = document.querySelector('.task-container')
    container.hidden = false; 
    
    taskList.appendChild(row);
    
    renderCalendar(currentDate);
}

function deleteConfirmation(button) { //Delete Button Function
    createOverlay(null, null, null, null, "delete", button);
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

    /* Back-End Should Be Here To Delete Elements From The Data Base */
    
    tasks.forEach((task, index) => {
        if (task.id == row.getAttribute('data-task-id')) {
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



//###################################################################################################################################
// Overlay Functions    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - >
//###################################################################################################################################



function createOverlay(taskName = null, taskDescription = null, taskPriority = null, dueDate = null, type = null, info = null) { // Create & Open Overlay Button Function 
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
    }else {
        alert("Type of overlay was not determined");
    }
    
    overlay.style.display = 'flex';

    overlay.appendChild(rowOverlay);
}

function closeOverlay() {
    const overlay = document.getElementById('overlay');
    const element = overlay.querySelector('.overlay-card');
    
    if (element) {
        element.remove();
    }
    
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