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

function addUserToDB($db, $userSignatureID) {
    $query = "INSERT INTO Users (userID, userTasks) VALUES (:userID, :userTasks)";
    $stmt1 = $db->prepare($query);
    $stmt1->bindParam(':userID', $userSignatureID);
    if (!$stmt1->execute()) {
        echo "Error could not insert userID";
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
                    echo "Creating task with ID: " . $data['taskID'];
                    break;

                case 'delete-task':
                    echo "Deleting task with ID: " . $data['taskID'];
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