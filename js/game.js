/** Cracker Barrel Peg Game
 *
 *  Author: Cory Gross
 *  Last modified: April 3, 2013
 **/

/** Load assets before anything else */
var boardTexture = new Image();

/** Main entry point for our program on texture load */
boardTexture.onload = function () { init(); };
boardTexture.src = 'img/wood-texture.jpg';

/** Properties which can be set to customize the game */
var stageWidth = 800;
var stageHeight = 600;
var pegColor = '#dcdcdc';
var pegRadius = 15;
var holeColor = '#3E0906';
var holeRadius = 9;
var boardStrokeColor = '#4E1207';
var holeStrokeColor = '#090909';
var pegStrokeColor = 'white';
var activeStrokeColor = 'yellow';
var jumpStrokeColor = 'red';
var landStrokeColor = 'blue';

/** Declare variables to store our game objects */
var stage, bgLayer, pegLayer, textLayer;
var hole, holeCount, peg, pegCount, pegsRemaining;
var validMoves, boardPos, boardCenter;
var hud, hudRect;
var pegsRemainingText, scoringText, resetButtonText;

function init() {

    /** Create our KineticJS stage using our canvas container */
    stage = new Kinetic.Stage({
        container: 'container',
        width: stageWidth,
        height: stageHeight
    });

    /** Workaround for buggy drag/drop behavior in Chrome with Kinetic 4.5.1 */
    stage.getContent().addEventListener('mousedown', function (event) {
        event.preventDefault();
    });

    /** Create all needed game layers */
    bgLayer = new Kinetic.Layer();
    pegLayer = new Kinetic.Layer();
    textLayer = new Kinetic.Layer();

    var background = new Kinetic.Rect({
        width: 800, height: 600, fill: 'white'
    });
    bgLayer.add(background);

    boardCenter = { x: stage.getWidth() / 2 - 80, y: stage.getWidth() / 2 + 50 };

    /** Create the wood board */
    wood = new Kinetic.RegularPolygon({
        x: boardCenter.x,
        y: boardCenter.y,
        sides: 3,
        shadow: { color: 'black', blur: 10, offset: [0, -7], opacity: 0.6 },
        radius: 250,
        fillPatternImage: boardTexture,
		fillPatternOffset: [800, 0],
        stroke: boardStrokeColor,
        strokeWidth: 3
    });

    /** Create arrays to store hole and peg objects */
    hole = [];
    peg = [];

    /** Counters for holes and pegs */
    holeCount = 0;
    pegCount = 0;
    pegsRemaining = 14;

    /** Array of arrays to store current valid moves */
    validMoves = [];
    for (var i = 0; i < 15; i++) {
        validMoves[i] = [];
    }

    /** Array to store position objects for each board position */
    boardPos = [];

    for (var i = 0; i < 5; i++) {

        /** Calculate and loop for proper number of holes */
        var numHoles = 5 - i;
        for (var j = 0; j < numHoles; j++) {
            /** Calculate the x,y offset of the current hole */
            var posX = (numHoles - 1) * -30 + j * 60 + boardCenter.x;
            var posY = -60 * i + 70 + boardCenter.y;
            boardPos[holeCount] = { x: posX, y: posY };

            /** Create a new hole and add it to the group */
            var newHole = createHole(posX, posY);
            hole[holeCount] = newHole;

            if (holeCount < 14) {	/** pegs in all the but last hole */

                /** Create a new peg and add it to the group */
                var newPeg = createPeg(posX, posY);
                peg[pegCount] = newPeg;

                /** Initialize peg properties */
                peg[pegCount].attrs.active = false;
                peg[pegCount].attrs.pegIndex = pegCount;
                setPegPosition(pegCount, holeCount);
                setPegEnabled(pegCount, true);

                /** For each peg, mark the corresponding hole as occupied */
                setHoleOccupied(holeCount, true);

                pegCount++;	/** increment peg count */

            }   /** The last hole is not occupied */
            else setHoleOccupied(holeCount, false);

            holeCount++; // increment hole count
        }
    }

	var hud = new Kinetic.Group({
		x: 450, y: 20
	});
	
	var mainHud = new Kinetic.Group();
	
	var mainHudRect = new Kinetic.Rect({
		width: 325, height: 160,
		stroke: '#4E1207', strokeWidth: 3,
		fillPatternImage: boardTexture
	});
	
    /** Create on-screen counter to indicate number of pegs remaining */
    pegsRemainingText = new Kinetic.Text({
        fill: '#4E1207',
        text: 'Pegs Remaining: ' + pegsRemaining,
        fontSize: 20,
        fontFamily: 'Calibri',
		fontStyle: 'bold',
        width: 310,
        padding: 10,
        align: 'center',
        cornerRadius: 10
    });

    /** Create on-screen text displaying some kind of instructions */
    scoringText = new Kinetic.Text({
        y: 40,
        fill: '#4E1207',
        text: 'Leave 1 peg and you\'re a genius.\nLeave 2 pegs and you\'re ' +
        'pretty smart.\nLeave 3 pegs and you\'re just average.\nLeave 4 or ' +
        'more and you\'re just plain dumb.',
        fontSize: 16,
		fontStyle: 'bold',
        fontFamily: 'Calibri',
		lineHeight: 1.5,
		padding: 10,
        width: 325,
        align: 'center'
    });
	
	mainHud.add(mainHudRect);
	mainHud.add(pegsRemainingText);
	mainHud.add(scoringText);
	hud.add(mainHud);

	var resetButton = new Kinetic.Group({
	    x: 88, y: 180
	});

	var resetButtonRect = new Kinetic.Rect({
	    width: 150, height: 35,
	    fill: '#DA9E62', stroke: '#4E1207', strokeWidth: 3
	});

	resetButtonText = new Kinetic.Text({
	    fill: '#4E1207',
	    text: 'Reset Game',
	    fontSize: 18,
	    fontFamily: 'Calibri',
	    fontStyle: 'bold',
	    width: 150,
	    padding: resetButtonRect.getHeight() / 4,
	    align: 'center'
	});
	
    resetButton.on('mouseover', function () {
        resetButtonRect.setFill('#EAAE72');
        document.body.style.cursor = 'pointer';
        textLayer.draw();
    });

    resetButton.on('mouseleave', function () {
        resetButtonRect.setFill('#DA9E62');
        document.body.style.cursor = 'auto';
        textLayer.draw();
    });

    resetButton.on('click tap', function () {
        if (pegsRemaining != 14) resetGame();
    });
	
    resetButton.add(resetButtonRect);
    resetButton.add(resetButtonText);
    hud.add(resetButton);


    /** Add all objects to their respective layers */
    textLayer.add(hud);

    bgLayer.add(wood);
    for (var i = 0; i < holeCount; i++) {
        pegLayer.add(hole[i]);
        if (i < 14) pegLayer.add(peg[i]);
    }

    /** Add all of the game layers to the stage */
    stage.add(bgLayer);
    stage.add(pegLayer);
    stage.add(textLayer);

    /** Build the initial move list */
    buildMoveList();
}

/** Creates and returns a hole at a given (x,y) position */
function createHole(posX, posY) {
    return new Kinetic.Circle({
        x: posX,
        y: posY,
        radius: holeRadius,
        fill: holeColor,
        stroke: holeStrokeColor,
        strokeWidth: 2
    });
}

/** Creates and returns a peg at a given (x,y) position */
function createPeg(posX, posY) {
    return new Kinetic.Circle({
        x: posX,
        y: posY,
        radius: pegRadius,
        fill: pegColor,
        shadow: { color: 'black', blur: 10, offset: [0, -5], opacity: 0.7 },
        stroke: pegStrokeColor,
        strokeWidth: 2
    });
}

/** Returns whether or not a hole with a given index is currently
    occupied by a peg */
function isHoleOccupied(index) {
    if (index >= 0 && index < 15)
        return hole[index].attrs.occupied;
    else
        return null;
}

/** Returns the board position of a peg with a given index */
function getPegPosition(index) {
    if (index >= 0 && index < 14)
        return peg[index].attrs.boardPos;
    else
        return null;
}

/** Returns whether or not a peg with a given index is enabled.
    All pegs are initially enabled, becoming disabled when they
    are jumped and removed from the board */
function isPegEnabled(index) {
    if (index >= 0 && index < 14)
        return peg[index].attrs.enabled;
    else
        return null;
}

/** Returns whether or not a peg with a given index is active.
    All pegs are initially inactive, becoming active when the
    peg can make a valid move on the board */
function isPegActive(index) {
    if (index >= 0 && index < 14)
        return peg[index].attrs.active;
    else
        return null;
}


/** Sets the occupied state of a hole at a given index to the
    given boolean value */
function setHoleOccupied(index, boolValue) {
    if (boolValue === true || boolValue === false) {
        hole[index].attrs.occupied = boolValue;
        return true;
    }
    else return false;
}

/** Sets the enabled state of a peg at a given index to the
    given boolean value */
function setPegEnabled(index, boolValue) {
    if (boolValue === true || boolValue === false) {
        peg[index].attrs.enabled = boolValue;
        return true;
    }
    else return false;
}

/** Returns whether or not a peg is near a hole based on a
    certain offset */
function isPegNearHole(pegIndex, holeIndex) {

    /** Get peg and hole, x and y positions */
    var pegX = peg[pegIndex].getX()
    var pegY = peg[pegIndex].getY()
    var holeX = boardPos[holeIndex].x;
    var holeY = boardPos[holeIndex].y;

    /** Set a threshold offset */
    var offset = 30;

    var xAligned = pegX > holeX - offset && pegX < holeX + offset;
    var yAligned = pegY > holeY - offset && pegY < holeY + offset;

    /** Return correct value based on position and offset */
    if (xAligned && yAligned) return true;
    else return false;
}

/** Sets the board position of a peg at a given index to the
    position indicated by pos */
function setPegPosition(index, pos) {
    if (index >= 0 && index < 14 && pos >= 0 && pos < 15) {
        peg[index].attrs.boardPos = pos;
        return true;
    }
    else return false;
}

/** Removes a peg at a given index from the board. This involves
    setting visibility, setting its enabled state false, setting
    the hole unoccupied, and redrawing the peg layer */
function removePeg(index) {
    peg[index].setVisible(false);
    setPegEnabled(index, false);
    peg[index].attrs.active = false;
    setHoleOccupied(getPegPosition(index), false);
    pegLayer.draw();
    pegsRemaining--;
    pegsRemainingText.setText('Pegs Remaining: ' + pegsRemaining);
    textLayer.draw();
}

/** Builds a list of valid moves for the current board configuration
    using the lookup table containing all the possible moves */
function buildMoveList() {
    deactivatePegs();
    clearMoveList();

    var numValidMoves = 0;

    /** Consider all enabled pegs */

    for (var i = 0; i < pegCount; i++) {
        if (isPegEnabled(i)) {
            var pegActivated = false;

            /** Get the board position for the current peg */
            var pos = getPegPosition(i);

            var moveCount = 0;

            /** Consider all possible moves for each peg based on its
                current board position */
            for (var j = 0; j < MoveTable[pos].length; j++) {

                /** Get current move jump and land positions */
                var jumpPos = MoveTable[pos][j].jumpPos;
                var landPos = MoveTable[pos][j].landPos

                /** Activate peg if inactive, record valid move */
                if (isHoleOccupied(jumpPos) && !isHoleOccupied(landPos)) {
                    if (!pegActivated) activatePeg(peg[i]);
                    validMoves[i][moveCount] = MoveTable[pos][j];
                    moveCount++;
                }
            }
            numValidMoves += moveCount;
        }
    }
    if (numValidMoves == 0) {
        var msg = null;
        switch (pegsRemaining) {
            case 1:
                msg = 'You\'re a genius!!';
                break;
            case 2:
                msg = 'You\'re pretty smart.';
                break;
            case 3:
                msg = 'You\'re just average.';
                break;
            default:
                msg = 'You\'re just plain dumb!!';
                break;
        }
        alert(msg);
    }
}

function resetGame() {
    for (var i = 0; i < holeCount; i++) {

        /** Reset each peg */
        if (i != holeCount - 1) {
            setPegPosition(i, i);
            peg[i].setX(boardPos[i].x);
            peg[i].setY(boardPos[i].y);
            peg[i].setVisible(true);
            setPegEnabled(i, true);
            setHoleOccupied(i, true);
        }
        else {
            setHoleOccupied(i, false);
        }
    }
    pegLayer.draw();
    pegsRemaining = 14;
    pegsRemainingText.setText('Pegs Remaining: ' + pegsRemaining);
    textLayer.draw();
    buildMoveList();
}

/** Returns the peg at the given board position, returns null if
    there is no peg at that position */
function getPegAtPosition(pos) {
    for (var i = 0; i < pegCount; i++) {
        if (isPegEnabled(i)) {
            if (peg[i].attrs.boardPos == pos) return peg[i];
        }
    }
    return null;
}

/** Returns the index of the given peg */
function getPegIndex(peg) {
    return peg.attrs.pegIndex;
}

/** Activates a given peg, adding necessary event handlers and
    setting the pegs active flag */
function activatePeg(peg) {

    peg.setDraggable(true);
    peg.on('dragstart', function () { return onActivePegDragStart(peg); });
    peg.on('dragend', function () { return onActivePegDragEnd(peg); });
    peg.on('mouseover', function () {
        peg.setStroke(activeStrokeColor);
        pegLayer.draw();
    });
    peg.on('mouseout', function () {
        peg.setStroke('white');
        pegLayer.draw();
    });

    peg.attrs.active = true;
}

/** Sets the peg position based on the given move, removes
    the peg being jumped, and recalculates new valid moves */
function movePeg(peg, move) {

    var pIndex = getPegIndex(peg);
    var jIndex = getPegIndex(getPegAtPosition(move.jumpPos));

    peg.setX(boardPos[move.landPos].x);
    peg.setY(boardPos[move.landPos].y);
    removePeg(jIndex);
    setHoleOccupied(getPegPosition(pIndex), false);
    setHoleOccupied(move.landPos, true);
    setPegPosition(pIndex, move.landPos);
    buildMoveList();
}

/** Deactivates all of the pegs after a move has been made */
function deactivatePegs() {
    for (var i = 0; i < hole.length; i++) {
        if (isPegEnabled(i) && isPegActive(i)) {
            peg[i].setDraggable(false);
            peg[i].off('dragstart');
            peg[i].off('mouseover');
            peg[i].off('mouseout');
            peg[i].attrs.active = false;
        }
        if (i != hole.length - 1) peg[i].setStroke('white');
        hole[i].setStroke('black');
    }
}

/** Resets the valid move list after a move has been made */
function clearMoveList() {
    for (var i = 0; i < validMoves.length; i++) {
        validMoves[i].length = 0;
    }
}

/** Invoked on an active peg when it is dragged, this will add
    strokes to indicate the possible moves */
function onActivePegDragStart(peg) {
    var moveList = validMoves[peg.attrs.pegIndex];

    for (var i = 0; i < moveList.length; i++) {
        var move = moveList[i];
        var jumpPeg = getPegAtPosition(move.jumpPos);

        jumpPeg.setStroke(jumpStrokeColor);
        hole[move.landPos].setStroke(landStrokeColor);
    }
    peg.moveToTop();
}

/** Invoked on an active peg when it is dropped, this will update
    necessary data structures and determine if a collision with
    a proper hole has been made so that a move can be made */
function onActivePegDragEnd(peg) {
    var pIndex = getPegIndex(peg);
    var moveList = validMoves[pIndex];
    var pegPosition = getPegPosition(pIndex);

    for (var i = 0; i < moveList.length; i++) {
        var move = moveList[i];
        var jumpPeg = getPegAtPosition(move.jumpPos);

        hole[move.landPos].setStroke('black');
        jumpPeg.setStroke('white');

        if (isPegNearHole(getPegIndex(peg), move.landPos)) {
            movePeg(peg, move);
        } else if (i == moveList.length - 1) {
            peg.setX(boardPos[pegPosition].x);
            peg.setY(boardPos[pegPosition].y);
        }
    }
    pegLayer.draw();
}