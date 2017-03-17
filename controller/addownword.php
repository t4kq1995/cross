<?php
	/* Json Header */
	header('Content-type: application/json');
	/* Include DataBase */
	require_once('../model/DataBase.php');

	/* Get data */
	$word = $_POST["word"];
	$clue = $_POST["clue"];

	/* Send query to DataBase */
	$answer = array();

	/* Charset */
	mysqli_set_charset($mysqli, "utf8");

	/* Form data */
	$query = "INSERT INTO `_words` (`word`, `clue`, `category`) VALUES ('$word', '$clue', 'own')";
	$result = mysqli_query($mysqli, $query);
	$id_word = mysqli_insert_id($mysqli);

	/* Return answer */
	echo json_encode(array('data' => $id_word));