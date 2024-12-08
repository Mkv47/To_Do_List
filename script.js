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
    row.innerHTML = `
        <td>${taskName}</td>
        <td>${taskDescription || '-'}</td>
        <td class="priority-${taskPriority}">${taskPriority.charAt(0).toUpperCase() + taskPriority.slice(1)}</td>
        <td>${dueDate || 'No date'}</td>
        <td class="actions">
            <button class="edit" onclick="editTask(this)">Edit</button>
            <button onclick="deleteTask(this)">Delete</button>
        </td>
    `;

    taskList.appendChild(row);

    this.reset();
});

function deleteTask(button) {
    const row = button.parentElement.parentElement;
    row.remove();
}

function editTask(button) {
    const row = button.parentElement.parentElement;
    const taskName = row.children[0].textContent;
    const taskDescription = row.children[1].textContent;
    const taskPriority = row.children[2].textContent.toLowerCase();
    const dueDate = row.children[3].textContent;

    document.getElementById('taskName').value = taskName;
    document.getElementById('taskDescription').value = taskDescription === '-' ? '' : taskDescription;
    document.getElementById('taskPriority').value = taskPriority;
    document.getElementById('dueDate').value = dueDate === 'No date' ? '' : dueDate;

    row.remove();
}