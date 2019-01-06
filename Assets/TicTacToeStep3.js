#pragma downcast
#pragma implicit
#pragma strict


var customGUISkin : GUISkin;

//////////////
// BACKGROUND
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

//////////////
// SCORE LABELS
var xScoreLeftDigits : Texture2D[];
var xScoreRightDigits : Texture2D[];
private var xScoreOffsetX : int;
private var xScoreOffsetY : int;
private var oScoreOffsetX : int;
private var oScoreOffsetY : int;
xScoreOffsetX = 90;
xScoreOffsetY = 12;
oScoreOffsetX = 112;
oScoreOffsetY = 12;




/////////////////////////////////////////////
// Playing of the Game
/////////////////////////////////////////////
private var turn : int; 
turn = -1;
private var boardState: int[]; // State of the baord
// Set board state to off
boardState = new int[9];
for (state in boardState) {
	state = 0;
}
private var scoreBoard : int[];
scoreBoard = new int[3];
for (score in scoreBoard) {
	score = 0;
}

// Scoring variables
private var winner : int;
private var tie : boolean;
private var scoreSums : int[];
winner = 0;
tie = false;
scoreSums = new int[8];
for (score in scoreSums) {
	score = 0;
}

/////////////////////////////////////////////
// Main UI rendering process
/////////////////////////////////////////////
function OnGUI () {
	GUI.skin = customGUISkin;

	// Render out the blank background
	GUI.Label(Rect(0,0,320,480), GUIContent(backGround));
	
	// Rendering the Score
	var lDigit : int;
	var rDigit : int;
	// Render the X score board
	lDigit = scoreBoard[0]/10;
	rDigit = scoreBoard[0]%10;
	if (lDigit>9)
		lDigit = 9;
	GUI.Box(Rect(90,12,xScoreLeftDigits[lDigit].width, xScoreLeftDigits[lDigit].height), xScoreLeftDigits[lDigit]);
	GUI.Box(Rect(90+xScoreRightDigits[rDigit].width,12,xScoreRightDigits[rDigit].width, xScoreRightDigits[rDigit].height), xScoreRightDigits[rDigit]);	
	// Rendering the 0 score board
	lDigit = scoreBoard[2]/10;
	rDigit = scoreBoard[2]%10;
	if (lDigit>9)
		lDigit = 9;
	GUI.Box(Rect(171,12,xScoreLeftDigits[lDigit].width, xScoreLeftDigits[lDigit].height), xScoreLeftDigits[lDigit]);
	GUI.Box(Rect(171+xScoreRightDigits[rDigit].width,12,xScoreRightDigits[rDigit].width, xScoreRightDigits[rDigit].height), xScoreRightDigits[rDigit]);	

	// Rendering the buttons on the top of empty background
	var index : int;
	index = 0;
	for (state in boardState) {			
		var xPos : int;
		var yPos : int;
		xPos = xOffset + index%3 * boardButtonWidth + index%3 * xSpacing;
		yPos = yOffset + index/3 * boardButtonHeight + index/3 * ySpacing;
		
		if (GUI.Button(Rect(xPos,yPos,boardButtonWidth, boardButtonHeight), boardButton[state+1])) {
			if (tie || winner!=0) {
				ResetBoard();
			}
			else if (state==0) {
				state = turn;
				turn = turn * -1;
			}
			
			// Update Board State
			UpdateBoardState();
		}	
		index++;
	}
}

function Update () {
}
/////////////////////////////////////////////
// Main concept of the Tic tac toe game
/////////////////////////////////////////////
function SumScore ( index1 : int, index2 : int, index3 : int) : int {
	return boardState[index1] + boardState[index2] + boardState[index3];	
}

function ResetBoard() {
	for (state in boardState) {
		state = 0;	
	}
	for (score in scoreSums) {
		score = 0;
	}
	winner = 0;
	tie = false;
}

function UpdateBoardState() {
	// Updating the sum of row and column
	scoreSums[0] = SumScore(0,1,2);
	scoreSums[1] = SumScore(3,4,5);
	scoreSums[2] = SumScore(6,7,8);
	scoreSums[3] = SumScore(0,3,6);
	scoreSums[4] = SumScore(1,4,7);
	scoreSums[5] = SumScore(2,5,8);
	scoreSums[6] = SumScore(0,4,8);
	scoreSums[7] = SumScore(6,4,2);

	// condition for the sum.
	var index : int;
	index = 0;
	for (score in scoreSums) {
		if (Mathf.Abs(score)==3) {
			winner = score/Mathf.Abs(score);
			winState = index;
			scoreBoard[winner+1] = scoreBoard[winner+1]+1;
			return;
		}
		index=index+1;	
	}
	// Check the condition for the draw
	tie = true;
	for (state in boardState) {
		if (state==0) {
			tie = false;
			return;
		}
	}	
	scoreBoard[1] = scoreBoard[1] + 1;
}

