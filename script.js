let tasks = [];
let currentDate = new Date();

let LOCAL_STORAGE_KEY = 'UserID';
let LOCAL_STORAGE_THEME = 'LightTheme';

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

window.addEventListener("load", () => { //Set an ID Type Key to Use in Back-end
    const storedValue = localStorage.getItem(LOCAL_STORAGE_KEY);
    const theamStoredValue = localStorage.getItem(LOCAL_STORAGE_THEME);
    if (theamStoredValue != null) {
        document.querySelector('.material-icons').textContent = theamStoredValue;
    }else {
        document.querySelector('.material-icons').textContent = 'dark_mode';
    }
    if (!storedValue) {
        const valueToStroe = Date.now();
        localStorage.setItem(LOCAL_STORAGE_KEY, valueToStroe);
    }else {
        const taskData = {
            id: storedValue,
            name: 'dasd',
            description: 'this',
            priority: low,
            due_date: '21-442-45'
        };
        pushTasks(taskData);
    }
    postTasks();
});

//Temp Code Don't Delete

//async function postTasks() {
//    try {
//      const response = await fetch("server.php");
//      const tasks = await response.json();
//
//      // Populate task list
//      console.log(tasks)
//    } catch (error) {
//      console.error("Error fetching tasks:", error);
//    }
//  }
//
//async function pushTasks(taskData) {
//    const response = await fetch("server.php", {
//        method: "POST",
//        headers: {
//            "Content-Type": "application/json",
//        },
//        body: JSON.stringify(taskData),
//    });
//    const result = await response.json();
//    console.log(result.message);
//}



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
    if (dueDate && dueDate != 'None') {
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
    <td class="name">${taskName}</td>
    <td class="description">${taskDescription || '-'}</td>
    <td class="priority-${taskPriority}">${taskPriority.charAt(0).toUpperCase() + taskPriority.slice(1)}</td>
    <td hidden>${dueDate || 'None'}</td>
    <td class="due-date">${formattedDueDateString || 'None'}</td>
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
            createTask(editedTaskName, editedTaskDescription, editedTaskPriority, editedDueDate);
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
    const taskName = row.children[0].textContent;
    const taskDescription = row.children[1].textContent;
    const taskPriority = row.children[2].textContent.toLowerCase();
    const dueDate = row.children[3].textContent;
    createTask(taskName, taskDescription, taskPriority, dueDate)

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