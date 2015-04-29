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

function setting() {
	$(".settingDialog").dialog({
		title: '設定',
		modal: true,
		buttons: {
			'閉じる': function () {
				// thisは、ダイアログボックス
				$(this).dialog("close");
			}
		}
	});
}