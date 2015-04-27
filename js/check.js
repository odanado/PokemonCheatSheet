/*
check.js

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

	for(var i=0;i<names.length;i++) {
		var id = toId(toEn(names[i]));
		console.log(dictionary[id]);
		if (BattlePokedex.hasOwnProperty(id)) {
			for(var j=0;j<BattlePokedex[id]["types"].length;j++) {
				types += dictionary[toId(BattlePokedex[id]["types"][j])];
			}

			
			abilities += getAbility(id);
			moves += getMove(id);
			weightDamages += getWeightDamage(id);
			typeChart += getTypeChart(id);
			baseStats += getBaseStats(id);
		}
		types += "<br>";
		abilities += "<br>";
		moves += "<br>";
		weightDamages += "<br>";
		typeChart += "<br>";
		baseStats += "<br>";
	}

	$(".line .types").html(types);
	$(".line .abilities").html(abilities);
	$(".line .moves").html(moves);
	$(".line .weightDamages").html(weightDamages);
	$(".line .names").html($(".line .inputNames").val().replace(/\n/g,"<br>"));
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
			ret += makeDivTag(weakness[key], obj, "&nbsp;&nbsp;");
		}
	}
	$(".overallTypeChart .weakness").html(ret);
	ret = "";

	for (var key in strength) {
		if (strength.hasOwnProperty(key)) {
			ret += makeDivTag(strength[key], obj, "&nbsp;&nbsp;");
		}
	}
	$(".overallTypeChart .strength").html(ret);
	ret = "";

	for (var key in invalid) {
		if (invalid.hasOwnProperty(key)) {
			ret += makeDivTag(invalid[key], obj, "&nbsp;&nbsp;");
		}
	}
	$(".overallTypeChart .invalid").html(ret);

}

function makeDivTag(val, obj, sp) {
	var ret = "";
	ret += "<div class=\"";
	ret += obj[val];
	ret += "\">";
	ret += val + sp;
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

			if (damageTaken[sortedType] == 1) effects[sortedType] *= 2;
			if (damageTaken[sortedType] == 2) effects[sortedType] /= 2;
			if (damageTaken[sortedType] == 3) effects[sortedType] =  0;
		}

		for (var key in abilities) {
			if (abilities.hasOwnProperty(key)) {
				if (key != "H" || key == "H" && !BattleFormatsData[id]["unreleasedHidden"]) {

					var ability = BattleAbilities[toId(abilities[key])];
					if (ability.hasOwnProperty("onImmunity") && ability["onImmunity"](sortedType) == false) {
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
			ret += "<font color=\"" + colors[effects[key]] + "\">"+ toJa(key) + "</font>";
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

function toJa(text) {
	return dictionary[toId(text)];
}

function toEn(text) {
	for (var key in dictionary) {
		if (dictionary.hasOwnProperty(key)) {
			if(dictionary[key]==text) {
				return key;
			}
		}
	}
	return "";
}

function getAbility(id) {
	var ret = [];

	var ability = BattlePokedex[id]["abilities"];
	for (var key in ability) {
		if (ability.hasOwnProperty(key)) {
			var ja = dictionary[toId(ability[key])]
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
	learnset = BattleLearnsets[id]["learnset"];

	var priorityMoves = ["aquajet", "bulletpunch", "extremespeed", "fakeout", "feint", "iceshard", "machpunch", "quickattack", "shadowsneak", "suckerpunch", "vacuumwave", "watershuriken"];

	for (var i=0; i<priorityMoves.length; i++) {
		if (learnset.hasOwnProperty(priorityMoves[i])) {
			ret += "先";
			break;
		}
	}
	if (ret.search("先") == -1) ret += "　";

	if (learnset.hasOwnProperty("trickroom")) ret += "遅";
	else ret += "　";

	if (learnset.hasOwnProperty("trick") || learnset.hasOwnProperty("switcheroo")) ret += "換";
	else ret += "　";

	if (learnset.hasOwnProperty("voltswitch") || learnset.hasOwnProperty("uturn")) ret += "帰";
	else ret += "　";

	if (learnset.hasOwnProperty("thunderwave") || learnset.hasOwnProperty("glare")) ret += "痺";
	else ret += "　";

	if (learnset.hasOwnProperty("willowisp")) ret += "火";
	else ret += "　";

	if (learnset.hasOwnProperty("taunt")) ret += "挑";
	else ret += "　";

	if (learnset.hasOwnProperty("encore")) ret += "ア";
	else ret += "　";

	return ret;
}