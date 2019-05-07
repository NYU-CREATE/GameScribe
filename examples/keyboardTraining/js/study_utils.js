/*
--------------------EXPERIMENT METHODS---------------------
  Designed and Developed by NYU CREATE (c)  2016
-----------------------------------------------------------
*/
var debug       = true;
var INTERIM     = 500;
/**
 * [shuffle The de-facto unbiased shuffle algorithm is the Fisher-Yates (aka Knuth) Shuffle - https://github.com/coolaj86/knuth-shuffle]
 * @param  {[array]} array [array wished to be shuffled]
 * @return {[array]}       [array after shuffling]
 */
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}
/**
 * Returns a random number between min (inclusive) and max (exclusive)
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 */
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
 * [getTimestamp returns client's computer clock]
 * @return {[int]} [timestamp in milliseconds]
 */
function getTimestamp(){
  return new Date().getTime();
}
/**
 * [startTimeout starts a countdown and then fire a callback function]
 * @return {[void]} [void, but invokes a call back function]
 */
function startTimeoutWithCallback( callbackfxn ){

  TIMER = setTimeout(function(){
    if(debug){console.warn("Time's up!");}
    callbackfxn();
  }, TIMEOUTINTERVAL);
}
/**
 * [clearTimer ends the timeout]
 * @return {[void]} [Returns Nothing]
 */
function clearTimer(){
  clearTimeout(TIMER)
}
/**
 * [interim handles the interstitialScreen]
 * @param  {[function]} callbackfxn [triggered at the end of the interim]
 * @return {[void]}             [Returns nothing]
 */
function interim( callbackfxn ){
    if(debug){ console.warn("INTERIM");}
    $("#interstitialScreen").show();
    setTimeout(function(){
       $("#interstitialScreen").hide();
        callbackfxn();
    }, INTERIM );
}
/**
 * [taskStart sends start signal via GOPHER to DREAM]
 * @param  {[string]} instanceID [instanceID sent to APP by DREAM]
 * @return {[void]}             [Returns Nothing]
 */
function taskStart( instanceID ){
    //send signal to end to shell if you have one
}
/**
 * [taskEnd sends end signal via GOPHER to DREAM]
 * @param  {[string]} instanceID [instanceID sent to APP by DREAM]
 * @return {[void]}            [returns nothing]
 */
function taskEnd( instanceID ){
  //send signal to end to shell if you have one
}
/**
 * [closeApp sends a signal to SHELL to close and log App Close event]
 * @return {[void]} [returns nothing]
 */
function closeApp(){
    //send signal to end to shell if you have one
}
