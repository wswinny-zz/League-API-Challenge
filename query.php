<?php

	error_reporting(E_ALL);
	ini_set('display_errors', 'on');

	$url = $_GET['url'];

	$url = str_replace("@", "&", $url);
	
	$json = file_get_contents($url);
	
	echo $json;
	
?>