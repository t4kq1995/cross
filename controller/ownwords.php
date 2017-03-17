<?php
	/* Json Header */
	header('Content-type: application/json');
	/* Include DataBase */
	require_once('../model/DataBase.php');

	/* Send query to DataBase */
	$answer = array();

	/* Charset */
	mysqli_set_charset($mysqli, "utf8");

	/* Form data */
	$query = "SELECT * FROM `_words` WHERE `category` = 'own'";

	$result = mysqli_query($mysqli, $query);
	while ($data = mysqli_fetch_assoc($result)) {
		array_push($answer, $data);
	}

	/* Return answer */
	echo json_encode(array('data' => $answer));