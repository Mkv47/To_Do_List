<?php


header("Content-Type: AUTHENTICATION/json");
try {
    // Connect to SQLite database
    $db = new PDO('sqlite:database.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Handle GET request (Retrieve tasks)
    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        $data = json_decode(file_get_contents("php://input"), true);
        $id = htmlspecialchars($data['id']);

        $stmt = $db->prepare("SELECT * FROM Users WHERE userID = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user == true) {
            echo "Found ID.";
        }else{
            $data = [
                ['userID' => $id],
            ];

            $userID = $data[0]['userID'];

            $query = "INSERT INTO Users (userID, userTasks) VALUES (:userID, :userTasks)";

            $stmt1 = $db->prepare($query);
            $stmt1->bindParam(':userID', $userID);
            if($stmt1->execute()){
                echo "Inserted userID: ", $id, " Without any informaton";
            }else{
                echo "Error could not insert userID";
            }
        }
        exit;
    }
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
    exit;
}
?>