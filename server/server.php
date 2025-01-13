<?php
$db = new PDO('sqlite:database.db');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$secret = 'Pq4$#d0568RbE@7fh&L%j!Zj4M99Q2#D!t781@4#xBz9!u@V8D3b&f3';

function verifyJWT($jwtToken, $secret) {
    if (!empty($jwtToken)) {
        $parts = explode('-', $jwtToken);
        $base64Header = $parts[0];
        $base64Payload = $parts[1];
        $base64Signature = $parts[2];
    
        $signature = hash_hmac('sha256', "$base64Header.$base64Payload", $secret, true);
        if (base64_encode($signature) !== $base64Signature) {
            return false;
        }
    
        $payload = base64_decode($base64Payload);
        $temp = str_replace('{"userID":','',$payload);
        $sgID = str_replace('}','',$temp);
    
        return $sgID;
    }
}

function verifyDataBase($db, $ID) {
    $stmt = $db->prepare("SELECT * FROM Users WHERE userID = :userSignatureID");
    $stmt->bindParam(':userSignatureID', $ID, PDO::PARAM_INT);
    $stmt->execute();

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    return $user !== false;
}

function loadUserContent($db, $userID) {
    try {
        $stmt = $db->prepare("SELECT userTasks FROM Users WHERE userID = :userID");
        $stmt->bindParam(':userID', $userID, PDO::PARAM_INT);
        $stmt->execute();

        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result && !empty($result['userTasks'])) {
            $userTasks = json_decode($result['userTasks'], true);
            echo json_encode(["status" => "success", "userTasks" => $userTasks]);
        }
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}

function addUserToDB($db, $userSignatureID) {
    $emptyString = '[]';
    $query = "INSERT INTO Users (userID, userTasks) VALUES (:userID, :userTasks)";
    $stmt1 = $db->prepare($query);
    $stmt1->bindParam(':userID', $userSignatureID);
    $stmt1->bindParam(':userTasks', $emptyString);
    if (!$stmt1->execute()) {
        echo "Error could not insert userID";
    }
}

function addInfoToJSONField($db, $userID, $newInfo) {
    try {
        $stmt = $db->prepare("SELECT userTasks FROM Users WHERE userID = :userID");
        $stmt->bindParam(':userID', $userID, PDO::PARAM_INT);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);


        if ($result) {
            $userTasks = json_decode($result['userTasks'], true);
            if (!is_array($userTasks)) {
                $userTasks = [];
            }

            $userTasks[] = $newInfo;

            $updatedTasks = json_encode($userTasks);
            $updateStmt = $db->prepare("UPDATE Users SET userTasks = :userTasks WHERE userID = :userID");
            $updateStmt->bindParam(':userTasks', $updatedTasks);
            $updateStmt->bindParam(':userID', $userID, PDO::PARAM_INT);

            if ($updateStmt->execute()) {
                return "Info added successfully.";
            } else {
                return "Failed to update the record.";
            }
        } else {
            return "User not found.";
        }
    } catch (PDOException $e) {
        return "Database error: " . $e->getMessage();
    }
}

function deleteTaskByID($db, $userID, $taskID) {
    try {
        $stmt = $db->prepare("SELECT userTasks FROM Users WHERE userID = :userID");
        $stmt->bindParam(':userID', $userID, PDO::PARAM_INT);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result) {
            $userTasks = json_decode($result['userTasks'], true);
            if (!is_array($userTasks)) {
                return "Invalid userTasks format.";
            }

            $updatedTasks = array_filter($userTasks, function ($task) use ($taskID) {
                return $task['taskID'] !== $taskID;
            });

            $updatedTasks = array_values($updatedTasks);

            $jsonTasks = json_encode($updatedTasks);
            $updateStmt = $db->prepare("UPDATE Users SET userTasks = :userTasks WHERE userID = :userID");
            $updateStmt->bindParam(':userTasks', $jsonTasks);
            $updateStmt->bindParam(':userID', $userID, PDO::PARAM_INT);

            if ($updateStmt->execute()) {
                return "Task deleted successfully.";
            } else {
                return "Failed to update the record.";
            }
        } else {
            return "User not found.";
        }
    } catch (PDOException $e) {
        return "Database error: " . $e->getMessage();
    }
}

header("Content-Type: application/json");

try {
    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        $data = json_decode(file_get_contents("php://input"), true);
        if (isset($data['type'])) {
            switch ($data['type']) {
                case 'create-user':
                    $userID = time();

                    $payload = json_encode(["userID" => $userID]);
                    $header = json_encode(["alg" => "HS256", "typ" => "JWT"]);
                    $base64Header = base64_encode($header);
                    $base64Payload = base64_encode($payload);
                    $signature = hash_hmac('sha256', "$base64Header.$base64Payload", $secret, binary: true);
                    $base64Signature = base64_encode($signature);
                    $jwt = "$base64Header-$base64Payload-$base64Signature";

                    if (!verifyDataBase($db, $userID)) {
                        addUserToDB($db, $userID);
                    }

                    echo json_encode(["token" => $jwt]);
                    break;

                case 'authenticate-user':
                    $token = $data['token'];
                    $ID = verifyJWT($token, $secret);
                    if ($ID) {
                        echo json_encode(["auth" => verifyDataBase($db, $ID)]);
                    } else {
                        echo json_encode(["auth" => false]);
                    }
                    break;

                case 'create-task':
                    $token = $data['token'];
                    $ID = verifyJWT($token, $secret);
                    if (verifyDataBase($db, $ID)) {
                        $task = [
                            "taskID" => $data['taskID'],
                            "taskName" => $data['taskName'],
                            "taskDescription" => $data['taskDescription'],
                            "taskPriority" => $data['taskPriority'],
                            "dueDate" => $data['dueDate']
                        ];
                        addInfoToJSONField($db, $ID, $task);
                    }
                    break;

                case 'delete-task':
                    $token = $data['token'];
                    $ID = verifyJWT($token, $secret);
                    if (verifyDataBase($db, $ID)) {
                        $taskID = $data['taskID'];;
                        deleteTaskByID($db, $ID, $taskID);
                    }
                    echo "Deleting task with ID: " . $data['taskID'];
                    break;

                case 'load-content':
                    $token = $data['token'];
                    $ID = verifyJWT($token, $secret);
                    if ($ID) {
                        loadUserContent($db, $ID);
                    } else {
                        echo json_encode(["status" => "error", "message" => "Invalid token"]);
                    }

                    break;
                default:
                    echo "Unknown action type.";
                    break;
            }
        } else {
            echo "Type is required in the request body.";
        }
        exit;
    }
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
    exit;
}
?>