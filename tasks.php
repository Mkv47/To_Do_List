
<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$host = 'localhost'; 
$username = 'root'; 
$password = '';
$dbname = 'task_management';

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
else {
    echo "Database connected successfully!";
}


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'];

    if ($action === 'add') {
        $name = $conn->real_escape_string($_POST['name']);
        $description = $conn->real_escape_string($_POST['description']);
        $priority = $conn->real_escape_string($_POST['priority']);
        $due_date = $conn->real_escape_string($_POST['due_date']);

        $sql = "INSERT INTO tasks (name, description, priority, due_date) VALUES ('$name', '$description', '$priority', '$due_date')";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["status" => "success", "message" => "Task added successfully!"]);
        } else {
            echo json_encode(["status" => "error", "message" => "SQL Error: " . $conn->error]);
        }
        
    } elseif ($action === 'update') {
        // Update an existing task
        $id = $conn->real_escape_string($_POST['id']);
        $name = $conn->real_escape_string($_POST['name']);
        $description = $conn->real_escape_string($_POST['description']);
        $priority = $conn->real_escape_string($_POST['priority']);
        $due_date = $conn->real_escape_string($_POST['due_date']);

        $sql = "UPDATE tasks SET name='$name', description='$description', priority='$priority', due_date='$due_date' WHERE id=$id";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["status" => "success", "message" => "Task updated successfully!"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Error: " . $conn->error]);
        }
    } elseif ($action === 'delete') {
        // Delete a task
        $id = $conn->real_escape_string($_POST['id']);

        $sql = "DELETE FROM tasks WHERE id=$id";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["status" => "success", "message" => "Task deleted successfully!"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Error: " . $conn->error]);
        }
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Retrieve all tasks
    $sql = "SELECT * FROM tasks";
    $result = $conn->query($sql);

    $tasks = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $tasks[] = $row;
        }
    }
    echo json_encode($tasks);
}

$conn->close();
?>
