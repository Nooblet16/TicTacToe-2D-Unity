#pragma strict
#pragma implicit
#pragma downcast

var backGround : Texture2D;


// Main GUI Rendering Process

function OnGUI () {
	
	// Render out black background
	GUI.Label(Rect(0,0,320,480), GUIContent(backGround));
}

function Update () {
}


