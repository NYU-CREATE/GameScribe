function objUIAnimate( obj, action ){
  switch( action ){
    case "bounce"				: $( obj ).velocity( "callout.bounce" ); break;
    case "pulse"				: $( obj ).velocity( "callout.pulse", "fast" ); break;
    case "shake"				: $( obj ).velocity( "callout.shake", "fast" ); break;
    case "flash"				: $( obj ).velocity( "callout.flash" ); break;
    case "fadeIn"				: $( obj ).velocity( "transition.fadeIn" ); break;
    case "fadeOut"				: $( obj ).velocity( "transition.fadeOut" ); break;
    case "shrinkIn"				: $( obj ).velocity( "transition.shrinkIn" ); break;
    case "expandIn"				: $( obj ).velocity( "transition.expandIn" ); break;
    case "bounceIn"				: $( obj ).velocity( "transition.bounceIn" ); break;
    case "slideUpIn"			: $( obj ).velocity( "transition.slideUpIn" ); break;
    case "slideUpOut"			: $( obj ).velocity( "transition.slideUpOut" ); break;
    case "slideDownIn"			: $( obj ).velocity( "transition.slideDownIn" ); break;
    case "slideDownOut"			: $( obj ).velocity( "transition.slideDownOut" ); break;
    case "slideDownBigOut"		: $( obj ).velocity( "transition.slideDownBigOut" ); break;
    case "slideLeftOut"			: $( obj ).velocity( "transition.slideLeftOut", { duration: 1500 } ); break;
    case "slideRightOut" 		: $( obj ).velocity( "transition.slideRightOut" ); break;
    case "perspectiveDownOut" 	: $( obj ).velocity( "transition.perspectiveDownOut" ); break;
    case "moveDown" 			: $( obj ).velocity( { translateY: "+1500px" } ); break;
    case "blur" 				: $( obj ).velocity( { blur: 1 }, 100 );
    case "unblur" 				: $( obj ).velocity( { blur: 0 }, 100 );
  } 
}