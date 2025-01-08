<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

$servername = "localhost";
$username = "root";
$password = ""; 
$dbname = "task_manager"; 

try {
    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $sql = "SELECT * FROM tasks";
        $result = $conn->query($sql);

        if ($result->num_rows > 0) {
            $tasks = [];
            while ($row = $result->fetch_assoc()) {
                $tasks[] = $row;
            }
            echo json_encode($tasks); 
        } else {
            echo json_encode([]); 
        }
    }

    
    elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        
        $input = file_get_contents('php://input');
        parse_str($input, $data);

        if (isset($data['action'])) {
            $action = $data['action'];

            if ($action === 'add') {
                $name = $conn->real_escape_string($data['name']);
                $description = $conn->real_escape_string($data['description']);
                $priority = $conn->real_escape_string($data['priority']);
                $due_date = $conn->real_escape_string($data['due_date']);

                $sql = "INSERT INTO tasks (name, description, priority, due_date) VALUES ('$name', '$description', '$priority', '$due_date')";
                if ($conn->query($sql)) {
                    echo json_encode(['status' => 'success', 'message' => 'Task added successfully']);
                } else {
                    throw new Exception("Failed to add task: " . $conn->error);
                }
            }

            elseif ($action === 'update') {
                $id = intval($data['id']);
                $name = $conn->real_escape_string($data['name']);
                $description = $conn->real_escape_string($data['description']);
                $priority = $conn->real_escape_string($data['priority']);
                $due_date = $conn->real_escape_string($data['due_date']);

                $sql = "UPDATE tasks SET name='$name', description='$description', priority='$priority', due_date='$due_date' WHERE id=$id";
                if ($conn->query($sql)) {
                    echo json_encode(['status' => 'success', 'message' => 'Task updated successfully']);
                } else {
                    throw new Exception("Failed to update task: " . $conn->error);
                }
            }

            elseif ($action === 'delete') {
                $id = intval($data['id']);
                $sql = "DELETE FROM tasks WHERE id=$id";
                if ($conn->query($sql)) {
                    echo json_encode(['status' => 'success', 'message' => 'Task deleted successfully']);
                } else {
                    throw new Exception("Failed to delete task: " . $conn->error);
                }
            }

            else {
                throw new Exception("Invalid action");
            }
        } else {
            throw new Exception("Action parameter is required");
        }
    }

    // Handle unsupported HTTP methods
    else {
        throw new Exception("Unsupported request method");
    }

    $conn->close();
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
