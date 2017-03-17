<?php
	/* Json Header */
	header('Content-type: application/json');
	/* Include DataBase */
	require_once('../model/DataBase.php');

	/* GET data */
	$category = $_POST["category"];

	/* Send query to DataBase */
	$answer = array();

	/* Charset */
	mysqli_set_charset($mysqli, "utf8");

	/* Form data */
	if ($category == "all") {
		$query = "SELECT * FROM `_words` WHERE `language` = 'ru'";
	} else {
		$query = "SELECT * FROM `_words` WHERE `category` = '$category'";
	}

	$result = mysqli_query($mysqli, $query);
	while ($data = mysqli_fetch_assoc($result)) {
		array_push($answer, $data);
	}

	/* Return answer */
	echo json_encode(array('data' => $answer));