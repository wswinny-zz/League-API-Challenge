/*
 * Author: William Swinny
 * Class: COSC 3353
 * Professor: Alihan
 * Date Created: 3/15/2015 through 5/4/2015
 */

var API_KEY = "7cdd5c89-765f-4e21-a39c-64e2834d0349"; //my api key for the league api
var DATA_DRAGON_VERSION = "5.10.1"; //the version of the game server i am getting data from

var FEATURED_GAMES_ARRAY = []; //the array of current games
var FEATURED_SUMMONER_NAME = 0; //index of the above array
var FEATURED_CHAMPION_ICON = 1; //index of the above array

var gameNum = 0;
var displayCurrentGameData = true;

var championJSON;
var itemJSON;
var summonerSpellJSON;

/*
 * Querys the league api by makeing an ajax call to a php script that will retrive the data and
 * return the result at which time the function will stringify it and return it to the calling 
 * program line.
 */
function queryAPI(url, async)
{
	//if the champion json has not yet been defined define it
	if(championJSON == undefined && async != true)
	{
		championJSON = queryAPI('https://global.api.pvp.net/api/lol/static-data/na/v1.2/champion?version=' + DATA_DRAGON_VERSION + '&dataById=true&champData=image&api_key=' + API_KEY, true);
	}
	
	if(!async)
		async = false;

	var returned;

	url = url.replace(/&/g, '@');
	console.log("/query.php?url=" + url);

	$.ajax({
		url: "./query.php?url=" + url,
		type: 'GET',
		dataType: 'json',
		data: {

		},
		//we got da data :D
		success: function (json) {
			console.log(JSON.stringify(json));
			returned = json;
		},
		//prints an error message
		error: function (XMLHttpRequest, textStatus, errorThrown) {
			document.getElementById("dataDiv").innerHTML = "<div class='error'>ERROR: one or more of the below could have occured<br><ul>" + 
			"<li>The game has just ended or has not yet started.</li>" + 
			"<li>The summoner does not exist.</li>" + 
			"<li>The summoner or someone in the game has special characters in their name.</li>" + 
			"<li>You are trying to query a custom game.</li>" + 
			"</ul></div>";
		},
		async: false
	});
	
	return returned;
}

//logs data that people query into a database
function logData(summonerName)
{
	$.ajax({
		url: "http://ipinfo.io/json",
		type: 'GET',
		dataType: 'json',
		data: {

		},
		success: function (json) {
			$.ajax({
				url: "./infoLog.php?summonerName=" + summonerName + "&ip=" + json['ip'],
				type: 'GET',
				dataType: 'text',
				data: ""
			});
		}
	});
}

//makes sure you pressed the enter key
function validateForm(e)
{
	var summonerName = $("#summonerName").val();

	if (e.keyCode != 13) //if they pressed enter
		return 0;

	requestData(summonerName);
}

//requests the data and checks more error conditions
function requestData(summonerName)
{	
	document.getElementById('summonerName').value = summonerName;
	
	//if the summoner name is blank
	if(summonerName == "")
	{
		document.getElementById("dataDiv").innerHTML = "<h2>The summoner name can not be blank!</h2>";
		return;
	}
	
	displayCurrentGameData = false; //stop displaying current game data
	
	logData(summonerName); //log the data to the database
	
	//spawn the loading circle
	document.getElementById("dataDiv").innerHTML = "<notification>Fetching Data!</notification><div class='wrapperloading'><div class='loading up'><div class='loading down'></div></div></div>";
	
	//give dom time to refresh
	setTimeout(function()
	{
		getData(summonerName);
	}, 1000);
}

//gets the data from the api by calling the approiate functions depending on the option selected
function getData(summonerName)
{
	document.getElementById('summonerName').value = summonerName;

	//checks if the item json or spell json is null if so it defines them here
	if(itemJSON == undefined || summonerSpellJSON == undefined)
	{
		itemJSON = queryAPI('https://global.api.pvp.net/api/lol/static-data/na/v1.2/item?version=' + DATA_DRAGON_VERSION + '&itemListData=image&api_key=' + API_KEY, true);
		summonerSpellJSON = queryAPI('https://global.api.pvp.net/api/lol/static-data/na/v1.2/summoner-spell?version=' + DATA_DRAGON_VERSION + '&dataById=true&spellData=image&api_key=' + API_KEY, true);
	}
	
	//checks if the summoner name is blank
	if(summonerName == "")
	{
		document.getElementById("dataDiv").innerHTML = "<h2>The summoner name can not be blank!</h2>";
		return;
	}
	
	logData(summonerName); //logs the data to the database
	
	if(document.getElementById('liveData').checked) //gets live game data
		getLiveData(summonerName);
	
	else if(document.getElementById('summonerInfo').checked) //gets summoner info
		getSummonerData(summonerName);
	
	else
		document.getElementById("dataDiv").innerHTML = "<h2>Select an option!</h2>"; //if you have no option selected how did you do this it is impossible
}

/*
 * gets the featured games to display on the front page of the site
 */
function getFeaturedGames()
{
	//queries featured games
	var featuredJSON = queryAPI('https://na.api.pvp.net/observer-mode/rest/featured?api_key=' + API_KEY);
	var championJSON = queryAPI('https://global.api.pvp.net/api/lol/static-data/na/v1.2/champion?dataById=true&champData=image&api_key=' + API_KEY);
	
	//gets the array of games from the json
	var games = featuredJSON['gameList'];
	
	//gathers data into an array to be displayed later
	for(var i = 0; i < games.length; ++i)
	{
		var game = [];

		for(var participant = 0; participant < games[i]['participants'].length/2; ++participant)
		{
			var player1 = [];
			var player2 = [];
			
			var summonerName1 = games[i]['participants'][participant]['summonerName'];
			var champ_id1 = games[i]['participants'][participant]['championId'];
			
			var summonerName2 = games[i]['participants'][participant + games[i]['participants'].length/2]['summonerName'];
			var champ_id2 = games[i]['participants'][participant + games[i]['participants'].length/2]['championId'];

			player1.push(summonerName1);
			player1.push("<img class='TinyIcon' src='http://ddragon.leagueoflegends.com/cdn/" + DATA_DRAGON_VERSION + "/img/champion/" + championJSON['data'][champ_id1]['image']['full'] + "'/>");
			
			player2.push(summonerName2);
			player2.push("<img class='TinyIcon' src='http://ddragon.leagueoflegends.com/cdn/" + DATA_DRAGON_VERSION + "/img/champion/" + championJSON['data'][champ_id2]['image']['full'] + "'/>");

			game.push(player1);
			game.push(player2);
		}
		
		FEATURED_GAMES_ARRAY.push(game);
	}
}

/*
 * Displays all the featured games
 */
function displayFeaturedGames()
{
	var HTML_String = "";
	
	//regets the featured games list
	getFeaturedGames();
	
	//displays all featured games at once
	for(var i = 0; i < FEATURED_GAMES_ARRAY.length; ++i)
	{
		HTML_String += "<table id='currentGame' align='center'>";

		for(var participant = 0; participant < FEATURED_GAMES_ARRAY[i].length; participant += 2)
		{
			HTML_String += 	"<tr><td id='currentSummoner'>" + FEATURED_GAMES_ARRAY[i][participant][FEATURED_CHAMPION_ICON] + "  <u>" + 
							FEATURED_GAMES_ARRAY[i][participant][FEATURED_SUMMONER_NAME] + "</u></td>";

			if(participant == FEATURED_GAMES_ARRAY[i].length/2 - 1)
				HTML_String += "<td id='vs'>VS.</td>";
			else
				HTML_String += "<td id='vs'> </td>";

			HTML_String += 	"<td id='currentSummoner'>" + FEATURED_GAMES_ARRAY[i][participant + 1][FEATURED_CHAMPION_ICON] + "  <u>" + 
							FEATURED_GAMES_ARRAY[i][participant + 1][FEATURED_SUMMONER_NAME] + "</u></td></tr>";
		}

		HTML_String += "</table>";
	}
	
	document.getElementById("dataDiv").innerHTML = HTML_String;
}

function displayNextGame()
{
	gameNum = gameNum % FEATURED_GAMES_ARRAY.length; //calculates game num

	//create a string to put html in
	var HTML_String = "<table id='currentGame' align='center'>";

	//puts the previous collected data into a html table
	for(var participant = 0; participant < FEATURED_GAMES_ARRAY[gameNum].length; participant += 2)
	{
		HTML_String += 	"<tr><td id='currentSummoner' class='leftTeam' onClick='requestData(\"" + FEATURED_GAMES_ARRAY[gameNum][participant][FEATURED_SUMMONER_NAME] + "\");'>" + FEATURED_GAMES_ARRAY[gameNum][participant][FEATURED_CHAMPION_ICON] + "  <u>" + 
						FEATURED_GAMES_ARRAY[gameNum][participant][FEATURED_SUMMONER_NAME] + "</u></td>";

		if(participant == FEATURED_GAMES_ARRAY[gameNum].length/2 - 1)
			HTML_String += "<td id='vs'>VS.</td>";
		else
			HTML_String += "<td id='vs'> </td>";

		HTML_String += 	"<td id='currentSummoner' class='rightTeam' onClick='requestData(\"" + FEATURED_GAMES_ARRAY[gameNum][participant + 1][FEATURED_SUMMONER_NAME] + "\")'><u>" + FEATURED_GAMES_ARRAY[gameNum][participant + 1][FEATURED_SUMMONER_NAME] + "</u>  " + 
						FEATURED_GAMES_ARRAY[gameNum][participant + 1][FEATURED_CHAMPION_ICON] + "</td></tr>";
	}

	HTML_String += "</table>"; //end the table

	gameNum++; //increment game num for next time

	if(displayCurrentGameData)
		document.getElementById("dataDiv").innerHTML = HTML_String;
}

/*
 * Retrives a list of the past 10 games a summoner has played as well as there level and rank
 */
function getSummonerData(summonerName)
{		
	//get the summoner name
	summonerName = summonerName.replace(/\s+/g, '');
	summonerName = summonerName.toLowerCase().trim();

	//query the summoners name for more data
	var url = 'https://na.api.pvp.net/api/lol/na/v1.4/summoner/by-name/' + summonerName + '?api_key=' + API_KEY;
	var json = queryAPI(url);
	
	var summonerID = json[summonerName].id; //get the summoners id from the query
	var level = json[summonerName].summonerLevel;

	//queries for the summoners rank by their summoner id
	var url = 'https://na.api.pvp.net/api/lol/na/v2.5/league/by-summoner/' + summonerID + '/entry?api_key=' + API_KEY;
	var json = queryAPI(url);

	var tier = "";
	var division = "";
	
	if(json == undefined) //if the player is unranked
	{
		tier = "ILLUMINATI";
		division = "";
	}
	else //if the player is ranked
	{
		if(json[summonerID] == undefined) //if the player is somehow unranked
		{
			tier = "UNRANKED";
			division = "";
		}
		else //if the player is ranked
		{
			//retrive rank data
			tier = json[summonerID][0]['tier'];
			division = json[summonerID][0]['entries'][0]['division'];
		}
	}

	if(summonerID == 38109605) //only amzi
	{
		tier = "PAPER";
		division = "III";
	}

	if(summonerID == 49271327) //only kitty
	{
		tier = "PUSHEEN";
		division = "";
	}

	//query for the past 10 games
	var url = "https://na.api.pvp.net/api/lol/na/v1.3/game/by-summoner/" + summonerID + "/recent?api_key=" + API_KEY;
	var json = queryAPI(url);
	
	var HTML_String = "";

	//stores the level and rank of the summoner
	HTML_String += "<div id='overallStats'>";

	HTML_String += "<div id='rank'>";
	HTML_String += "<div id='rankMedal' class='" + (tier + "_" + division).toLowerCase() + "'></div>";
	HTML_String += "<div id='text'>" + tier + " " + division + "<br>Level " + level + "</div>";
	HTML_String += "</div>";

	HTML_String += "</div>";

	//table stores the game data each row is 1 game
	HTML_String += "<table id='gameHistory' align='center'>";
	
	for(var i = 0; i < json['games'].length; ++i)
	{
		//get data from json
		var champID = json['games'][i]['championId'];
		var champName = championJSON['data'][champID]['name'];
		var champLevel= json['games'][i]['stats']['level'];
		var gameWon = json['games'][i]['stats']['win'];
		var kills = json['games'][i]['stats']['championsKilled'];
		var deaths = json['games'][i]['stats']['numDeaths'];
		var assists = json['games'][i]['stats']['assists'];
		var wards = json['games'][i]['stats']['wardPlaced'];
		var gold = json['games'][i]['stats']['goldEarned'];
		var creep = json['games'][i]['stats']['minionsKilled'];
		var spell1 = json['games'][i]['spell1'];
		var spell2 = json['games'][i]['spell2'];
		
		//change undefined fields to 0
		if(kills == undefined)
			kills = 0;
		if(deaths == undefined)
			deaths = 0;
		if(assists == undefined)
			assists = 0;
		if(wards == undefined)
			wards = 0;
		if(creep == undefined)
			creep = 0;

		//gets items bought during the game
		var items = [];
		for(var j = 0; j < 7; ++j)
		{
			if(json['games'][i]['stats'][('item' + j)] != undefined)
				items.push(json['games'][i]['stats'][('item' + j)]);
		}
		
		//checks if the game has been won
		if(gameWon)
			HTML_String += "<tr class='win'>"; //green background
		else 
			HTML_String += "<tr class='lose'>"; //red background
		
		//stored the rest of the game data into the table
		HTML_String += "<td><img class='SummonerIcon' src='http://ddragon.leagueoflegends.com/cdn/" + DATA_DRAGON_VERSION + "/img/champion/" + championJSON['data'][champID]['image']['full'] + "'/></td>";
		HTML_String += "<td><img class='ItemIcon' src='http://ddragon.leagueoflegends.com/cdn/" + DATA_DRAGON_VERSION + "/img/spell/" + summonerSpellJSON['data'][spell1]['image']['full'] + "'/><br/>" + "<img class='ItemIcon' src='http://ddragon.leagueoflegends.com/cdn/" + DATA_DRAGON_VERSION + "/img/spell/" + summonerSpellJSON['data'][spell2]['image']['full'] + "'/>" + "</td>";
		HTML_String += "<td>" + kills + " <tiny>kills</tiny><br>" + deaths + " <tiny>deaths</tiny><br>" + assists + " <tiny>assists</tiny></td>";
		HTML_String += "<td>" + (gold - (gold % 1000)) / 1000 + "<tiny>K</tiny><br>" + creep + " <tiny>Creep</tiny><br>" + wards+ " <tiny>wards</tiny></td>";
		HTML_String += "<td>";
		
		//gets the items images and puts them into the table
		for(var j = 0; j < items.length; ++j)
		{
			if(itemJSON['data'][items[j]] != undefined)
				HTML_String += "<img class='ItemIcon' src='http://ddragon.leagueoflegends.com/cdn/" + DATA_DRAGON_VERSION + "/img/item/" + itemJSON['data'][items[j]]['image']['full'] + "'/>";
			if(j ==  3)
				HTML_String += "<br/>";

		}
		
		HTML_String += "</td>";
		HTML_String += "</tr>";
	}
	
	HTML_String += "</table>";
	
	document.getElementById("dataDiv").innerHTML = HTML_String; //set dom to html above
}

/*
 * Gets live game data by useing s summoners name
 */
function getLiveData(summonerName)
{
	//array and vars for the indexes
	var SUMMONER_COUNT = 0;
	var SUMMONER_ARRAY = [];

	var TEAM_ID = 0;
	var	CHAMP_ID = 1;
	var SPELL1 = 2;
	var SPELL2 = 3;
	var	SUMMONER_ID = 4;
	var	SUMMONER_NAME = 5;
	var	SUMMONER_LEVEL = 6;
	var	SUMMONER_RANK = 7;
	
	//replace spaces in the summoner name
	summonerName = summonerName.replace(/\s+/g, '');
	summonerName = summonerName.toLowerCase().trim();

	//query the summoners name for more data
	var url = 'https://na.api.pvp.net/api/lol/na/v1.4/summoner/by-name/' + summonerName + '?api_key=' + API_KEY;
	var json = queryAPI(url);
	
	var summonerID = json[summonerName].id; //get the summoners id from the query
	//query for the current match data of the summoner that you entered
	url = 'https://na.api.pvp.net/observer-mode/rest/consumer/getSpectatorGameInfo/NA1/' + summonerID + '?api_key=' + API_KEY;
	json = queryAPI(url);
	
	//push the team, champ, and spells to the array
	SUMMONER_COUNT = json['participants'].length; //get the number of summoners in the match
	for(var i = 0; i < SUMMONER_COUNT; ++i)
	{
		var tempArr = [];
		tempArr.push(json['participants'][i]['teamId']);
		tempArr.push(json['participants'][i]['championId']);
		tempArr.push(json['participants'][i]['spell1Id']);
		tempArr.push(json['participants'][i]['spell2Id']);
		SUMMONER_ARRAY.push(tempArr);
	}
	
	//create an array of the summoners in the game
	var summonerNameArray = [];

	for(var i = 0; i < SUMMONER_COUNT; ++i)
		summonerNameArray.push(json['participants'][i]['summonerName'].replace(/\s+/g, '').toLowerCase());
	
	//create url for the number of summoners in the current match
	url = 'https://na.api.pvp.net/api/lol/na/v1.4/summoner/by-name/';
	for(var i = 0; i < SUMMONER_COUNT; ++i)
		url += summonerNameArray[i] + ',';
	url += '?api_key=' + API_KEY;
	
	url = url.replace(/\s+/g, ''); //gets rid of all spaces in the query
	
	json = queryAPI(url); //query all the summoners in the match
	
	//push all of the level and id and name info to the array
	for(var i = 0; i < SUMMONER_COUNT; ++i)
	{
		if(json[summonerNameArray[i]] == undefined) 
			continue;
		
		SUMMONER_ARRAY[i].push(json[summonerNameArray[i]].id);
		SUMMONER_ARRAY[i].push(json[summonerNameArray[i]].name);
		SUMMONER_ARRAY[i].push(json[summonerNameArray[i]].summonerLevel);
	}
	
	//create url for the number of summoners' leagues in the current match
	url = 'https://na.api.pvp.net/api/lol/na/v2.5/league/by-summoner/';
	for(var i = 0; i < SUMMONER_COUNT; ++i)
		url += SUMMONER_ARRAY[i][SUMMONER_ID] + ',';
	url += '/entry?api_key=' + API_KEY;
	
	url = url.replace(/\s+/g, ''); //gets rid of all spaces in the query
	
	json = queryAPI(url); //query all the summoners' leagues in the match
	
	//get the ranks of every player in the game
	if(json != undefined)
	{
		for(var i = 0; i < SUMMONER_COUNT; ++i)
		{
			if(json[SUMMONER_ARRAY[i][SUMMONER_ID]] == undefined)
			{
				SUMMONER_ARRAY[i].push("UNRANKED");
				continue;
			}
			
			var tier = json[SUMMONER_ARRAY[i][SUMMONER_ID]][0]['tier'];
			var division = json[SUMMONER_ARRAY[i][SUMMONER_ID]][0]['entries'][0]['division'];
			
			SUMMONER_ARRAY[i].push(tier + " " + division);
		}
	}
	
	//print tables for the red and blue teams
	var summonerBlueTeam = "<table id='summonerTableBlue' align='center'>";
	summonerBlueTeam += "<tr><th> Name </th><th> Champ </th><th> Level </th><th> Rank </th></tr>";
	
	var summonerRedTeam = "<table id='summonerTableRed' align='center'>";
	summonerRedTeam += "<tr><th> Name </th><th> Champ </th><th> Level </th><th> Rank </th></tr>";
	
	for(var i = 0; i < SUMMONER_COUNT; ++i)
	{
		if(SUMMONER_ARRAY[i][TEAM_ID] == 100) //this is the blue team table
		{
			summonerBlueTeam += " <td id='summonerNameColumn'> " + SUMMONER_ARRAY[i][SUMMONER_NAME];
			summonerBlueTeam +=	" </td><td id='champInfoColumn'> ";
			summonerBlueTeam += " <img id='currentGameChampIcon' src='http://ddragon.leagueoflegends.com/cdn/" + DATA_DRAGON_VERSION + "/img/champion/" + championJSON['data'][(SUMMONER_ARRAY[i][CHAMP_ID])]['image']['full'] + "'/>";
			summonerBlueTeam +=	" <div id='currentGameSpells'>";
			summonerBlueTeam += " <img class='SpellIcon' src='http://ddragon.leagueoflegends.com/cdn/" + DATA_DRAGON_VERSION + "/img/spell/" + summonerSpellJSON['data'][(SUMMONER_ARRAY[i][SPELL1])]['image']['full'] + "'/>";
			summonerBlueTeam +=	" <br/> ";
			summonerBlueTeam += " <img class='SpellIcon' src='http://ddragon.leagueoflegends.com/cdn/" + DATA_DRAGON_VERSION + "/img/spell/" + summonerSpellJSON['data'][(SUMMONER_ARRAY[i][SPELL2])]['image']['full'] + "'/>";
			summonerBlueTeam += " </div>";
			summonerBlueTeam +=	" <span id='currentGameChamp'>" + championJSON['data'][SUMMONER_ARRAY[i][CHAMP_ID]]['name'] + "</span>"; 
			summonerBlueTeam +=	" </td><td id='summonerLevelColumn'> " + SUMMONER_ARRAY[i][SUMMONER_LEVEL];
			summonerBlueTeam +=	" </td><td id='summonerRankColumn'> " + SUMMONER_ARRAY[i][SUMMONER_RANK];
			summonerBlueTeam +=	" </td></tr>";
		}
		else //this is the red team table
		{	
			summonerRedTeam += " <td id='summonerNameColumn'> " + SUMMONER_ARRAY[i][SUMMONER_NAME];
			summonerRedTeam += " </td> <td id='champInfoColumn'> ";
			summonerRedTeam += " <img id='currentGameChampIcon' src='http://ddragon.leagueoflegends.com/cdn/" + DATA_DRAGON_VERSION + "/img/champion/" + championJSON['data'][(SUMMONER_ARRAY[i][CHAMP_ID])]['image']['full'] + "'/>";
			summonerRedTeam += " <div id='currentGameSpells'>";
			summonerRedTeam += " <img class='SpellIcon' src='http://ddragon.leagueoflegends.com/cdn/" + DATA_DRAGON_VERSION + "/img/spell/" + summonerSpellJSON['data'][(SUMMONER_ARRAY[i][SPELL1])]['image']['full'] + "'/>";
			summonerRedTeam += " <br/> ";
			summonerRedTeam += " <img class='SpellIcon' src='http://ddragon.leagueoflegends.com/cdn/" + DATA_DRAGON_VERSION + "/img/spell/" + summonerSpellJSON['data'][(SUMMONER_ARRAY[i][SPELL2])]['image']['full'] + "'/>";
			summonerRedTeam += " </div>";
			summonerRedTeam += " <span id='currentGameChamp'>" + championJSON['data'][SUMMONER_ARRAY[i][CHAMP_ID]]['name'] + "</span>"; 
			summonerRedTeam += " </td><td id='summonerLevelColumn'> " + SUMMONER_ARRAY[i][SUMMONER_LEVEL];
			summonerRedTeam += " </td><td id='summonerRankColumn'> " + SUMMONER_ARRAY[i][SUMMONER_RANK];
			summonerRedTeam += " </td></tr>";
		}
	}
	
	summonerBlueTeam += "</table>";
	summonerRedTeam += "</table>";
	
	document.getElementById("dataDiv").innerHTML = summonerBlueTeam + summonerRedTeam; //set dom to html created above
}