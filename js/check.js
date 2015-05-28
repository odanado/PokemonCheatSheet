/*
PokemonCheatSheet

Copyright (c) 2015 odan

This software is released under the MIT License.
http://opensource.org/licenses/mit-license.php


Pokemon-Showdown

The MIT License

Copyright (c) 2011-2015 Guangcong Luo and other contributors
http://pokemonshowdown.com/


jQuery v1.11.2

jquery.org/license

(c) 2005, 2014 jQuery Foundation, Inc.


jQuery UI - v1.11.4

http://jqueryui.com

Copyright 2015 jQuery Foundation and other contributors; Licensed MIT

*/


function toId(str) {
	return str.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function submit() {
	var names = $(".line .inputNames").val().split(/\n/);

	var types = "";
	var abilities = "";
	var moves = "";
	var weightDamages = "";
	var typeChart = "";
	var baseStats = "";
	var jaNames = "";

	for(var i=0;i<names.length;i++) {
		var id = toId(toEn(names[i]));
		console.log(toJa(id));
		if (BattlePokedex.hasOwnProperty(id)) {
			for(var j=0;j<BattlePokedex[id]["types"].length;j++) {
				types += toJa(BattlePokedex[id]["types"][j], "type");
			}

			
			abilities += getAbility(id);
			moves += getMove(id);
			weightDamages += getWeightDamage(id);
			typeChart += getTypeChart(id);
			baseStats += getBaseStats(id);
			jaNames += toJa(id);
		}
		types += "<br>";
		abilities += "<br>";
		moves += "<br>";
		weightDamages += "<br>";
		typeChart += "<br>";
		baseStats += "<br>";
		jaNames += "<br>";
	}

	$(".line .types").html(types);
	$(".line .abilities").html(abilities);
	$(".line .moves").html(moves);
	$(".line .weightDamages").html(weightDamages);
	$(".line .names").html(jaNames);
	$(".line .typeChart").html(typeChart);
	$(".line .baseStats").html(baseStats);
	putOverallTypeChart(names);
}
$(function () {
	$(".line .inputNames").keypress(function(e) {
		if (e.which == 13) {
			var names = $(".line .inputNames").val().split(/\n/);
			if (names.length == 6) {
				submit();
				return false;
			}
		}
	});
});

function putOverallTypeChart(names) {
	var weakness = {};
	var strength = {};
	var invalid = {};
	
	for (var i=0; i<names.length; i++) {
		var id = toId(toEn(names[i]));
		var effects = getEffect(id);

		for (var type in effects) {
			if (effects.hasOwnProperty(type)) {
				weakness[type] = weakness[type] || 0;
				strength[type] = strength[type] || 0;
				invalid[type] = invalid[type] || 0;
				if (effects[type] > 1) weakness[type] += 1;
				else if (effects[type] == 0) invalid[type] += 1;
				else if (effects[type] < 1) strength[type] += 1;
			}
		}
	}

	var obj = {0:"overallTypeChartColor0", 1:"overallTypeChartColor1", 2:"overallTypeChartColor2",  
	3:"overallTypeChartColor3", 4:"overallTypeChartColor3", 5:"overallTypeChartColor3", 6:"overallTypeChartColor3"};

	var ret = "";

	for (var key in weakness) {
		if (weakness.hasOwnProperty(key)) {
			var attr = "class=\"" + obj[weakness[key]] +"\"";
			ret += makeDivTag(weakness[key], attr);
		}
	}
	$(".overallTypeChart .weakness").html(ret);
	ret = "";

	for (var key in strength) {
		if (strength.hasOwnProperty(key)) {
			var attr = "class=\"" + obj[strength[key]] +"\"";
			ret += makeDivTag(strength[key], attr);
		}
	}
	$(".overallTypeChart .strength").html(ret);
	ret = "";

	for (var key in invalid) {
		if (invalid.hasOwnProperty(key)) {
			var attr = "class=\"" + obj[invalid[key]] +"\"";
			ret += makeDivTag(invalid[key], attr);
		}
	}
	$(".overallTypeChart .invalid").html(ret);

}

function makeDivTag(val, attr) {
	var ret = "";
	ret += "<div ";
	ret += attr;
	ret += ">";
	ret += val;
	ret += "</div>";

	return ret;
}

function getBaseStats(id) {
	var ret = "";
	var baseStats = BattlePokedex[id]["baseStats"];
	var sum = 0;

	for (var key in baseStats) {
		if (baseStats.hasOwnProperty(key)) {
			sum += baseStats[key];
			var baseStat = String(baseStats[key]);
			for (var i=0; i<8 - 2 * baseStat.length; i++) {
				ret += " ";
			}
			ret += baseStat;
		}
	}

	ret = ret.replace(/ /g, "&nbsp;");

	ret += "&nbsp;&nbsp;&nbsp;&nbsp;<div class=\"sum\">" + sum + "</div>";

	return ret;
}

function hasImmunity(ability, type) {
	// TODO ヌケニンの処理を実装
	if (ability["id"] == "wonderguard") return false;
	var target = {};
	var source = {};
	var move = {"type": type};

	ability["heal"] = function(val) { return false; };
	ability["boost"] = function(val) { return false; };
	ability["add"] = function(val1, val2, val3) { ability["msg"] = val1; };
	target["addVolatile"] = function(val) { return false; };
	target["maxhp"] = 0;
	move["flags"] = {};
	move["flags"]["reflectable"] = null;

	if (ability.hasOwnProperty("onImmunity") && ability["onImmunity"](type) == false) return true;
	if (ability.hasOwnProperty("onTryHit") && ability["onTryHit"](target, source, move) === null && ability["msg"] == "-immune") {
		 return true;
	}
	return false;
}

function getEffect(id) {
	var sortedTypes = ["Normal","Fire","Water","Electric","Grass","Ice","Fighting","Poison","Ground","Flying","Psychic","Bug","Rock","Ghost","Dragon","Dark","Steel","Fairy"];

	var effects = {};
	if (!BattlePokedex.hasOwnProperty(id)) {
		return effects;
	}
	var types = BattlePokedex[id]["types"];
	var abilities = BattlePokedex[id]["abilities"];


	for (var i=0; i<sortedTypes.length; i++) {
		var sortedType = sortedTypes[i];
		for (var j=0; j<types.length; j++) {
			var damageTaken = BattleTypeChart[types[j]]["damageTaken"];
			if(typeof effects[sortedType] === "undefined") effects[sortedType] = 1;

			if ($(".chkSakasa").prop("checked")) {
				if (damageTaken[sortedType] == 1) effects[sortedType] /= 2;
				if (damageTaken[sortedType] == 2) effects[sortedType] *= 2;
				if (damageTaken[sortedType] == 3) effects[sortedType] *= 2;
			}
			else {
				if (damageTaken[sortedType] == 1) effects[sortedType] *= 2;
				if (damageTaken[sortedType] == 2) effects[sortedType] /= 2;
				if (damageTaken[sortedType] == 3) effects[sortedType] =  0;
			}
		}

		for (var key in abilities) {
			if (abilities.hasOwnProperty(key)) {
				if (key != "H" || key == "H" && !BattleFormatsData[id]["unreleasedHidden"]) {

					var ability = BattleAbilities[toId(abilities[key])];
					if (hasImmunity(ability, sortedType)) {
						effects[sortedType] = 0;
					}
				}
			}
		}
	}

	return effects;
}


function getTypeChart(id) {
	var colors = {4:"#ff2828", 2:"#ea7d28", 1:"#040404", 0.5:"#2d6b6b", 0.25:"#74376f", 0:"#565656"};
	var effects = getEffect(id);

	var ret = "";

	for (var key in effects) {
		if (effects.hasOwnProperty(key)) {
			ret += "<font color=\"" + colors[effects[key]] + "\">"+ toJa(key, "type") + "</font>";
		}
	}

	return ret;
}

function getWeightDamage(id) {
	var weight = BattlePokedex[id]["weightkg"];
	var ret = "  120";
	if (weight <= 10) ret = "    20";
	else if (weight <= 20) ret = "    40";
	else if (weight <= 45) ret = "    60";
	else if (weight <= 90) ret = "    80";
	else if (weight <= 175) ret = "  100";

	return ret.replace(/ /g, "&nbsp;");
}

function toJa(text, category) {
	category = category || "other"
	text = toId(text);
	for (var i=0; i<dictionary[category].length; i++) {
		if (dictionary[category][i]["en"] == text) {
			return dictionary[category][i]["ja"];
		}
	}
	return "";
}

function toEn(text, category) {
	category = category || "other"
	for (var i=0; i<dictionary[category].length; i++) {
		if (dictionary[category][i]["ja"] == text) {
			return dictionary[category][i]["en"];
		}
	}
	return "";
}

function getAbility(id) {
	var ret = [];

	var ability = BattlePokedex[id]["abilities"];
	for (var key in ability) {
		if (ability.hasOwnProperty(key)) {
			var ja = toJa(ability[key])
			if (key != "H" || key == "H" && !BattleFormatsData[id]["unreleasedHidden"]) {
				ret.push(ja);
			}
		}
	}

	return ret.join(",");
}

function getMove(id) {
	var ret = "";
	if (id.match(/mega(x|y|)$/)) {
		if (!BattleLearnsets.hasOwnProperty(id)) {
			id = id.replace(/mega(x|y|)/,'');
		}
	}
	var learnset = {}
	if (BattleLearnsets.hasOwnProperty(id)) {
		$.extend(learnset, BattleLearnsets[id]["learnset"]);
	}

	if (BattlePokedex[id]["baseSpecies"]) {
		id = toId(BattlePokedex[id]["baseSpecies"]);
		$.extend(learnset, BattleLearnsets[id]["learnset"]);
	}

	while (BattlePokedex[id]["prevo"]) {
		id = BattlePokedex[id]["prevo"];
		$.extend(learnset, BattleLearnsets[id]["learnset"]);
	}

	if ($(".chkCross").prop("checked")) {
		Object.keys(learnset).map(function(key, index) {
			if (learnset[key].length == 0) {
				delete learnset[key];
			}
		});
	}

	var priorityMoves = ["aquajet", "bulletpunch", "extremespeed", "fakeout", "feint", "iceshard", "machpunch", "quickattack", "shadowsneak", "suckerpunch", "vacuumwave", "watershuriken"];

	for (var i=0; i<priorityMoves.length; i++) {
		if (learnset.hasOwnProperty(priorityMoves[i])) {
			ret += makeDivTag("先", "title=\"先制技\"");
			break;
		}
	}
	if (ret.search("先") == -1) ret += makeDivTag("", "");
	
	if (learnset.hasOwnProperty("fakeout")) ret += makeDivTag("猫", "title=\"猫騙し\"");
	else ret += makeDivTag("", "");
	
	if (learnset.hasOwnProperty("tailwind")) ret += makeDivTag("風", "title=\"追い風\"");
	else ret += makeDivTag("", "");

	if (learnset.hasOwnProperty("trickroom")) ret += makeDivTag("遅", "title=\"トリックルーム\"");
	else ret += makeDivTag("", "");

	if (learnset.hasOwnProperty("trick") || learnset.hasOwnProperty("switcheroo")) ret += makeDivTag("換", "title=\"トリック系\"");
	else ret += makeDivTag("", "");

	if (learnset.hasOwnProperty("voltswitch") || learnset.hasOwnProperty("uturn")) ret += makeDivTag("帰", "title=\"蜻蛉ルチェン\"");
	else ret += makeDivTag("", "");

	if (learnset.hasOwnProperty("thunderwave") || learnset.hasOwnProperty("glare")) ret += makeDivTag("痺", "title=\"麻痺系\"");
	else ret += makeDivTag("", "");

	if (learnset.hasOwnProperty("willowisp")) ret += makeDivTag("火", "title=\"鬼火\"");
	else ret += makeDivTag("", "");

	if (learnset.hasOwnProperty("taunt")) ret += makeDivTag("挑", "title=\"挑発\"");
	else ret += makeDivTag("", "");
	
	if (learnset.hasOwnProperty("disable")) ret += makeDivTag("縛", "title=\"金縛り\"");
	else ret += makeDivTag("", "");

	if (learnset.hasOwnProperty("encore")) ret += makeDivTag("ア", "title=\"アンコール\"");
	else ret += makeDivTag("", "");
	
	if (learnset.hasOwnProperty("quickguard")) ret += makeDivTag("ﾌｧ", "title=\"ファストガード\"");
	else ret += makeDivTag("", "");
	
	if (learnset.hasOwnProperty("wideguard")) ret += makeDivTag("ワ", "title=\"ワイドガード\"");
	else ret += makeDivTag("", "");

	return ret;
}