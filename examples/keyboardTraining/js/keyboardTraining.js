/*
--------------------TRANING MODULE-------------------------
		Designed and Developed by NYU CREATE (c) 2016
-----------------------------------------------------------
*/

//// THIS CODE IS ALL GAMESCRIBE SETTINGS
var api 				= "https://www.domainname.com/somedirectory/api.php"; //GAMESCRIBE API
var gs 					= new gsSheet(); // GAMESCRIBE
var writer 				= "general"; // We typically start with general, but each game level should be a writer during that level, that was it's easy to identify where the game log came from

// "Strict" is used for LIVE Production, for debugging user "trace", which will output in the javascript console in the Browser
// Uncomment line below when you go live
//var gsmode 				= "strict";
// Comment line below when you go live
var gsmode 				= "trace";


var gameKey 			= "YOURGAMEKEY"; // A game specific key, We would generate a key for each of your games
//Please read the GameScribe White paper to learn more about how these gamecodes are used
var gCodes  			= {
								"START_GAME"			: 1001,	// [gameName] version [#.#] started;
								"GAMESCRIBE_CREATED"	: 1002, // GameScribe initiated in [off/trace/permissive/strict] mode;
								"SETTINGS"				: 2001,	// Study Started for User [sesID]
								"TUTORIAL_START" 		: 3001, // Tutorial [#] start
								"TUTORIAL_END"			: 3002, // Tutorial [#] end
								"USER_SCORE"			: 5001, //

							}

//// END OF ALL GAMESCRIBE SETTINGS

/// EVERYTHING BELOW IS GAME CODE

var inTraningMode 	= true;

var prompts 		= ["Press <b class='blue'>C</b> to select <span class='blue'>blue</span>", "Press <b class='orange'>M</b> to select <span class='orange'>orange</span>"];
var trialLimit 		= 5;
var trialCount		= 0;
var countDown 		= false;

/**
 * [getPrompt randomly picks a prompt from available prompts]
  * @return {[void]} [Returns nothing]
 */
var getPrompt = function(){
	return prompts[getRandomInt(0,1)];
}
/**
 * [bindEvents adds keyboard event listeners to the window object ]
 * @return {[void]} [Returns nothing]
 */
var bindEvents = function(){
	$(window).on('keyup', function(e){
		//c = 67 , m = 77
		if( inTraningMode ){

			if( e.keyCode == 67 || e.keyCode == 77 ){
				if(debug){ console.log("valid key"); }

				if( e.keyCode == 67){
					leftImageResponse( e );

					interim( moveNext );
				}

				if( e.keyCode == 77 ){
					rightImageResponse( e );

					interim( moveNext );
				}
				// $("body").animate({backgroundColor: "rgba(0,255,0,.3)"}, function(){
				// 	$("body").animate({backgroundColor: "white"})
				// })
			}else{
				console.log("invalid key");
				objUIAnimate( $("#tutorial"), "shake" );
				// $("body").animate({backgroundColor: "rgba(255,0,0,.3)"}, function(){
				// 	$("body").animate({backgroundColor: "white"})
				// });

			}
		}

	});
}
var restartTutorial = function(){
	$("#tutorial").hide();
	$("#htp").html("Repeat Tutorial")
	$("#howto").show();
	$("#keyboardImg").show();
	$('#keys').html("<img src='img/keyboard.png' width='100%'/>");
	unbindEvents();
}
/**
 * [moveNext moves to the next prompt]
 * @return {[void]} [Returns nothing]]
 */
var moveNext = function(){
	$('#keys').html("<img src='img/keyboard_norm.png' width='100%'/>");
	console.log( trialCount )
	if( trialCount < trialLimit ){
		$("#prompt").html( getPrompt() );
		objUIAnimate( $("#prompt"), "bounceIn")
		trialCount++;
	}else{

/////////GAMESCRIBE JOT
		gs.jotDown( gCodes.TUTORIAL_END, "general", getTimestamp() );
///////////////////////

		restartTutorial();
	}
}
/**
 * [startTutorial starts the tutorial session]
 * @return {[void]} [Returns nothing]
 */
var startTutorial = function(){
	bindEvents();
	$("#prompt").html( getPrompt() );
	objUIAnimate( $("#prompt"), "bounceIn")
	trialCount++;

/////////GAMESCRIBE JOT
	gs.jotDown( gCodes.TUTORIAL_START, "general", getTimestamp() );
///////////////////////

}

var unbindEvents = function(){
	$(window).unbind('keyup');
}

/**
 * [bindTutorialEvents binds events for the HOW TO button]
 * @return {[void]} [Returns nothing]
 */
var bindTutorialEvents = function(){
	$("#howto").on( 'click', function(){
		console.info("START TUTORIAL");
		console.log( trialCount )
		trialCount = 0;
		console.log( trialCount )
		$("#tutorial").show();
		$(this).hide();
		$("#keyboardImg").hide();
		$('#keys').html("<img src='img/keyboard_norm.png' width='100%'/>");

		startTutorial();
	});

}
/**
 * [leftImageResponse issues a response for when this image is selected]
 * @param  {[event]} e [Keyboard event]
 * @return {[void]} [Returns nothing]
 */
var leftImageResponse = function(e){
	console.log(e);
	$('#keys').html("<img src='img/keyboard_c.png' width='100%'/>");
}
/**
 * [rightImageResponse issues a response for when this image is selected]
 * @param  {[event]} e [Keyboard event]
 * @return {[void]} [Returns nothing]
 */
var rightImageResponse = function(e){
	console.log(e);
	$('#keys').html("<img src='img/keyboard_m.png' width='100%'/>");
}
/**
 * [init starts program]
 * @return {[void]} [Returns nothing]
 */
var init = function(){
	objUIAnimate( $("#keyboardImg"), "blur" );
	bindTutorialEvents();
	setTimeout(function(){

		// in a timer in case you need to wait for a userID to be generated
		captureSessionID()

	}, 150);
}

var captureSessionID = function( ){
	sesID 		= "SOMESESSIONIDENTIFIER CAN BE PHP SESSION";

/////////GAMESCRIBE JOT
 	gs.registerSheet( gameKey, gsmode, api, function(){ gs.launchSheet( sesID ); });
	gs.jotDown( gCodes.SETTINGS, "general", sesID );
///////////////////////
}

$( document ).ready( function(){
	console.log( "ready...");
	init();
} );
