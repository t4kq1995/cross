<?php
	/* Json Header */
	header('Content-type: application/json');
	/* Include DataBase */
	require_once('../model/DataBase.php');

	/* GET data */
	$words = $_POST["words"];
	$category = $_POST["category"];

	/* Send query to DataBase */
	$answer = array();

	/* Charset */
	mysqli_set_charset($mysqli, "utf8");

	/* Form data */
	if ($category == "all") {
		$query = "SELECT * FROM `_words` WHERE `language` = 'ru' AND `category` <> 'own' ORDER BY RAND() LIMIT 0,$words";
	} else {
		$query = "SELECT * FROM `_words` WHERE `category` = '$category' ORDER BY RAND() LIMIT 0,$words";
	}

	$result = mysqli_query($mysqli, $query);
	while ($data = mysqli_fetch_assoc($result)) {
		array_push($answer, $data);
	}

	/* Return answer */
	echo json_encode(array('data' => $answer));