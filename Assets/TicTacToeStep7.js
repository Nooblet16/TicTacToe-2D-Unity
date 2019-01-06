#pragma strict
#pragma implicit
#pragma downcast


// Audio conditions
var sndXWins : AudioSource;
var sndOWins : AudioSource;
var sndYouWin : AudioSource;
var sndYouLose : AudioSource;
var sndDraw : AudioSource;
var sndButtonPress : AudioSource;
var sndLetsPlay : AudioSource;
var sndReset : AudioSource;


// Art folder


//////////////
// Skin of the GUI
var customGUISkin : GUISkin;

//////////////
// Condition for the background
var backGround : Texture2D;

//////////////
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
// Labels of the Score
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
var xTurnImage : Texture2D[];
var oTurnImage : Texture2D[];

//////////////
// Setting the buttons in the bottom side
var resetImage : Texture2D[];
private var resetImageX : int;
private var resetImageY : int;
private var resetImageIndex : int;
resetImageX = 23;
resetImageY = 387;
resetImageIndex = 1;

/////////////////////////////////////////////
// GAMEPLAY
/////////////////////////////////////////////
private var turn : int; // -1 = X, 1 = O
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
private var winState : int;
winState = 0;

// Intermediate A.I. / Scoring Variables
private var winner : int;
private var tie : boolean;
private var scoreSums : int[];
winner = 0;
tie = false;
scoreSums = new int[8];
for (score in scoreSums) {
	score = 0;
}

// Slider settings
private var fIsTwoPlayer : float;
private var bIsTwoPlayer : boolean;
private var fDifficulty : float;
fIsTwoPlayer = 0;
bIsTwoPlayer = false;
fDifficulty = 1;


/////////////////////////////////////////////
// MAIN UI RENDERING
/////////////////////////////////////////////
function OnGUI () {
	GUI.skin = customGUISkin;

	// Render out the blank background
	GUI.Label(Rect(0,0,320,480), GUIContent(backGround));
	
	// Render out turn indicators
	if (turn==-1) {
		GUI.Label(Rect(15,3,xTurnImage[1].width,xTurnImage[1].height+5), xTurnImage[1]);
		GUI.Label(Rect(227,3,oTurnImage[0].width,oTurnImage[0].height+5), oTurnImage[0]);
	}
	else if (turn==1) {
		GUI.Label(Rect(15,3,xTurnImage[0].width,xTurnImage[0].height+5), xTurnImage[0]);
		GUI.Label(Rect(227,3,oTurnImage[1].width,oTurnImage[1].height+5), oTurnImage[1]);
	}

	// Render out the score
	var lDigit : int;
	var rDigit : int;
	// Render X score board
	lDigit = scoreBoard[0]/10;
	rDigit = scoreBoard[0]%10;
	if (lDigit>9)
		lDigit = 9;
	GUI.Box(Rect(90,12,xScoreLeftDigits[lDigit].width, xScoreLeftDigits[lDigit].height), xScoreLeftDigits[lDigit]);
	GUI.Box(Rect(90+xScoreRightDigits[rDigit].width,12,xScoreRightDigits[rDigit].width, xScoreRightDigits[rDigit].height), xScoreRightDigits[rDigit]);	
	// Render O score board
	lDigit = scoreBoard[2]/10;
	rDigit = scoreBoard[2]%10;
	if (lDigit>9)
		lDigit = 9;
	GUI.Box(Rect(171,12,xScoreLeftDigits[lDigit].width, xScoreLeftDigits[lDigit].height), xScoreLeftDigits[lDigit]);
	GUI.Box(Rect(171+xScoreRightDigits[rDigit].width,12,xScoreRightDigits[rDigit].width, xScoreRightDigits[rDigit].height), xScoreRightDigits[rDigit]);	

	// Render the buttons on top of the blank background
	var index : int;
	index = 0;
	for (state in boardState) {			
		var xPos : int;
		var yPos : int;
		xPos = xOffset + index%3 * boardButtonWidth + index%3 * xSpacing;
		yPos = yOffset + index/3 * boardButtonHeight + index/3 * ySpacing;
		
		var imageToDisplay : int;
		var isWinningButton : boolean;

		if (winner && IsWinningButtonIndex(index))
			isWinningButton = true;
		else
			isWinningButton = false;

		// Alternate the board to bland every 1/2 second
		if ((isWinningButton || tie) && (Time.time-Mathf.Floor(Time.time)>0.5)) 
			imageToDisplay = 1;
		else
			imageToDisplay = state+1;

		if (GUI.Button(Rect(xPos,yPos,boardButtonWidth, boardButtonHeight), boardButton[imageToDisplay])) {
			if (tie || winner!=0) {
				ResetBoard();
			}
			else if (state==0) {
				state = turn;
				turn = turn * -1;
			}
			
			// Update Board State
			UpdateBoardState();

			sndButtonPress.Play();
		}	
		index++;
	}
	
	// Sliders	
	fIsTwoPlayer = Mathf.Round(GUI.HorizontalSlider(Rect(129, 400, 53, 19), fIsTwoPlayer, 0.0, 1.0));
	fDifficulty = Mathf.Round(GUI.HorizontalSlider(Rect(129,436, 53, 19), fDifficulty, 0.0, 2.0));

	// RESET BUTTON
	//
	if (GUI.Button(Rect(resetImageX, resetImageY, resetImage[0].width+5, resetImage[0].height+5), resetImage[resetImageIndex])) {
		if (resetImageIndex==1) {
			// reset the score
			scoreBoard[0] = scoreBoard[1] = scoreBoard[2] = 0;
			sndReset.Play();
		}
		else
		{
			sndLetsPlay.Play();
		}
		ResetBoard();
		resetImageIndex = 1;
	}
	
}

function Update () {
	// Game Setting update
	bIsTwoPlayer = fIsTwoPlayer > 0.5;

	if (!winner)
	{
		if (!bIsTwoPlayer && turn==1) // This is the A.I. Player
		{
			// "A.I. - You mean Artificial Intelligence?" - Neo
			// Start with easy (random)
			if (fDifficulty < 0.5) { // Consider this easy
				TakeRandom();
			}
			else if (fDifficulty >= 0.5 && fDifficulty <= 1.5) { // This is medium
				// Win if you can
				if (!TakeWin()) {
					if (!TakeBlock()) {
						TakeRandom();
					}
				}
			} 
			else { // This is hard
				// Win if you can
				if (!TakeWin()) {
					if (!TakeBlock()) {
						if (!TakeCenter()) {
							if(!TakeCorner()) {
								TakeRandom();
							}
						}
					}
				}
			}	
			UpdateBoardState();	
		}	
	}
	
}
/////////////////////////////////////////////
// GAME LOGIC
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
function IsWinningButtonIndex(index:int) : boolean {
	if (!winner) return false;
	var potentialPositions = new Array();
	potentialPositions[0] = new Array(0,1,2);
	potentialPositions[1] = new Array(3,4,5);
	potentialPositions[2] = new Array(6,7,8);
	potentialPositions[3] = new Array(0,3,6);
	potentialPositions[4] = new Array(1,4,7);
	potentialPositions[5] = new Array(2,5,8);
	potentialPositions[6] = new Array(0,4,8);
	potentialPositions[7] = new Array(6,4,2);
	for( winIndex in potentialPositions[winState] )
	{
		if (winIndex==index)
			return true;
	}
	return false;
}
function UpdateBoardState() {
	// Update row/column/diagnal sums
	scoreSums[0] = SumScore(0,1,2);
	scoreSums[1] = SumScore(3,4,5);
	scoreSums[2] = SumScore(6,7,8);
	scoreSums[3] = SumScore(0,3,6);
	scoreSums[4] = SumScore(1,4,7);
	scoreSums[5] = SumScore(2,5,8);
	scoreSums[6] = SumScore(0,4,8);
	scoreSums[7] = SumScore(6,4,2);

	if (winner || tie)
		return;
	// Check win
	var index : int;
	index = 0;
	for (score in scoreSums) {
		if (Mathf.Abs(score)==3) {
			winner = score/Mathf.Abs(score);
			winState = index;
			scoreBoard[winner+1] = scoreBoard[winner+1]+1;
			// Play the correct sound
			if (bIsTwoPlayer)
			{
				if (winner == -1)
					sndXWins.Play();
				else
					sndOWins.Play();
			}
			else
			{
				if (winner == -1)
					sndYouWin.Play();
				else
					sndYouLose.Play();
			}

			return;
		}
		index=index+1;	
	}
	// Check tie and game start
	tie = true;
	resetImageIndex = 1;
	for (state in boardState) {
		if (state==0) {
			tie = false;
		}
		if (state!=0) {
			resetImageIndex = 0;
		}
	}	
	if (tie) {
		scoreBoard[1] = scoreBoard[1] + 1;
		sndDraw.Play();
	}
}

/////////////////////////////////////////////
// GAME A.I.
/////////////////////////////////////////////
function TakeRandom() {
	var freeIndex : int;
	var freeSpotArray = new Array();
	var boardIndex : int;
	freeIndex = boardIndex = 0;
	for (boardStateVal in boardState) {
		if (boardStateVal == 0) {
			freeSpotArray[freeIndex] = boardIndex;
			freeIndex = freeIndex + 1;
		}
		boardIndex = boardIndex + 1;
	}
	// Now we have the list of all free positions, pick one at random
	if (freeSpotArray.length == 0)
		return;
	var newIndex = freeSpotArray[Random.Range(0,freeSpotArray.length)];
	boardState[newIndex] = turn;
	turn = turn * -1;
}
function TakeCenter() : boolean {
	if (boardState[4] == 0) {
		boardState[4] = turn;
		turn = turn * -1;
		return true;
	}
	return false;
}
function TakeCorner() : boolean {

	if (boardState[0] == 0) {
		boardState[0] = turn;
		turn = turn * -1;
		return true;
	}
	else if (boardState[2] == 0) {
		boardState[2] = turn;
		turn = turn * -1;
		return true;
	}
	else if (boardState[6] == 0) {
		boardState[6] = turn;
		turn = turn * -1;
		return true;
	}
	else if (boardState[8] == 0) {
		boardState[8] = turn;
		turn = turn * -1;
		return true;
	}
	return false;
}

function TakeWin() : boolean {
	var winningIndex : int;
	var bIsWinningMove : boolean;
	bIsWinningMove = false;
	winningIndex = 0;

	for (score in scoreSums)
	{
		if (score == 2) // This is a win!
		{
			bIsWinningMove = true;
			break;
		}
		winningIndex = winningIndex+1;		
	}

	if (!bIsWinningMove)
		return false;
		
	var potentialPositions = new Array();
	potentialPositions[0] = new Array(0,1,2);
	potentialPositions[1] = new Array(3,4,5);
	potentialPositions[2] = new Array(6,7,8);
	potentialPositions[3] = new Array(0,3,6);
	potentialPositions[4] = new Array(1,4,7);
	potentialPositions[5] = new Array(2,5,8);
	potentialPositions[6] = new Array(0,4,8);
	potentialPositions[7] = new Array(6,4,2);
	for (spot in potentialPositions[winningIndex]) {
		if (boardState[spot] == 0) {
			boardState[spot] = turn;
			turn = turn * -1;
		}
	}
	return true;		
}
function TakeBlock() : boolean {
	var blockingIndex : int;
	var bIsBlockingMove : boolean;
	bIsBlockingMove = false;
	blockingIndex = 0;

	for (score in scoreSums)
	{
		if (score == -2) // This is a block!
		{
			bIsBlockingMove = true;
			break;
		}
		blockingIndex = blockingIndex+1;		
	}

	if (!bIsBlockingMove)
		return false;
		
	var potentialPositions = new Array();
	potentialPositions[0] = new Array(0,1,2);
	potentialPositions[1] = new Array(3,4,5);
	potentialPositions[2] = new Array(6,7,8);
	potentialPositions[3] = new Array(0,3,6);
	potentialPositions[4] = new Array(1,4,7);
	potentialPositions[5] = new Array(2,5,8);
	potentialPositions[6] = new Array(0,4,8);
	potentialPositions[7] = new Array(6,4,2);
	for (spot in potentialPositions[blockingIndex]) {
		if (boardState[spot] == 0) {
			boardState[spot] = turn;
			turn = turn * -1;
		}
	}
	return true;		
}

