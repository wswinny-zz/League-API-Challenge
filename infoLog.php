<?php

	error_reporting(E_ALL);
	ini_set('display_errors', 'on');

	$CONNECTION = mysql_connect("localhost","root","!swagmastas","swinny.me");
	if (!$CONNECTION)
	{
		echo "Failed to connect to MySQL: " . mysql_error();
	}
	mysql_select_db("swinny.me", $CONNECTION);
	
	$IP = $_GET['ip'];
	$RETURNED_JSON = json_decode(file_get_contents("http://ipinfo.io/{$IP}/json"));
	$LOCATION = $RETURNED_JSON->city. ", " . $RETURNED_JSON->region;
	
	$DATETIME = date('Y-m-d H:i:s');

	$summonerName = $_GET['summonerName'];	
	$summonerName = mysql_real_escape_string($summonerName) . "";
	
	$RESULT = mysql_query("INSERT INTO Logs(ip, location, summonerName, date) VALUES ('$IP', '$LOCATION', '$summonerName', '$DATETIME');");
	
	mysql_close($CONNECTION);

?>