#pragma downcast
#pragma implicit
#pragma strict



// Function of GUI Skin
var customGUISkin : GUISkin;


// Background 
var backGround : Texture2D;


// Buttons of the board
var boardButton : Texture2D[];
private var boardButtonWidth : int;
private var boardButtonHeight : int;
boardButtonWidth = boardButton[0].width;
boardButtonHeight = boardButton[0].height;
private var xOffset : int;
private var yOffset : int;
private var xSpacing : int;
private var ySpacing : int;
xOffset = 14;
yOffset = 83;
xSpacing = 6;
ySpacing = 5;





// GAMEPLAY

private var turn : int; 
turn = -1;
private var boardState: int[]; 

boardState = new int[9];
for (state in boardState) {
	state = 0;
}


// Logic for Rendering process

function OnGUI () {
	GUI.skin = customGUISkin;
	
	
	GUI.Label(Rect(0,0,320,480), GUIContent(backGround));
	
	
	var index : int;
	index = 0;
	for (state in boardState) {			
		var xPos : int;
		var yPos : int;
		xPos = xOffset + index%3 * boardButtonWidth + index%3 * xSpacing;
		yPos = yOffset + index/3 * boardButtonHeight + index/3 * ySpacing;
		
		if (GUI.Button(Rect(xPos,yPos,boardButtonWidth, boardButtonHeight), boardButton[state+1])) {
			state = turn;
			turn = turn * -1;
		}	
		index++;
	}
}

function Update () {
}


