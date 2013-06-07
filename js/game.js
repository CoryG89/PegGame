/**
 *  Author: Cory Gross
 *  Last modified: June 6, 2013
 **/
(function () {
    /** Load assets before anything else, initialize only after */
    var boardTexture = new Image();
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
    var pegsRemainingText;

    function init() {
        var containerElement = document.getElementById('container');
        containerElement.style.width = stageWidth + 'px';
        containerElement.style.height = stageHeight + 'px';

        /** Create our KineticJS stage using our canvas container */
        stage = new Kinetic.Stage({
            container: 'container',
            width: stageWidth,
            height: stageHeight
        });

        /** Define where the center of the board will be positioned. Used as a
            reference point for positioning the pegs and holes on the board */
        boardCenter = {
            x: stage.getWidth() / 2 - 110,
            y: stage.getHeight() / 2 + 110
        };

        /** Create all needed game layers */
        bgLayer = new Kinetic.Layer();
        pegLayer = new Kinetic.Layer();
        textLayer = new Kinetic.Layer();

        /** Create and add a background image to its own layer, this layer will
            only be drawn once */
        var background = new Kinetic.Rect({
            width: 800, height: 600, fill: 'white'
        });
        bgLayer.add(background);

        /** Create the triangular wooden game board */
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

        /** Create multidimensional array to store current valid moves for
            each of the 15 different positions on the game board */
        validMoves = [];
        for (var i = 0; i < 15; i++) {
            validMoves[i] = [];
        }

        /** Array to store position objects for each board position */
        boardPos = [];

        /** Loop over each of the five rows of holes on the game board */
        for (var i = 0; i < 5; i++) {

            /** Calculate and loop for proper number of holes for this row */
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

                    /** Set corresponding hole occupied, increment peg count */
                    setHoleOccupied(holeCount, true);
                    pegCount++;

                }
                else {
                    /** Make sure the last hole is not marked occupied */
                    setHoleOccupied(holeCount, false);
                }
                holeCount++; 
            }
        }

        var hud = new Kinetic.Group({
            x: 430, y: 30
        });
        hud.add(createHUD());
        hud.add(createResetButton());


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
    function createHole (posX, posY) {
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
    function createPeg (posX, posY) {
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

    function createHUD() {
        var hud = new Kinetic.Group();

        var hudRect = new Kinetic.Rect({
            width: 340, height: 160,
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
            width: 340,
            padding: 10,
            align: 'center',
            cornerRadius: 10
        });

        /** Create on-screen text displaying some kind of instructions */
        var scoringText = new Kinetic.Text({
            y: 40,
            fill: '#4E1207',
            text: 'Leave 1 peg and you\'re a genius.\nLeave 2 pegs and ' +
            'you\'re pretty smart.\nLeave 3 pegs and you\'re just average.\n' +
            'Leave 4 or more and you\'re just plain dumb.',
            fontSize: 16,
            fontStyle: 'bold',
            fontFamily: 'Calibri',
            lineHeight: 1.5,
            padding: 10,
            width: 340,
            align: 'center'
        });

        hud.add(hudRect);
        hud.add(pegsRemainingText);
        hud.add(scoringText);
        return hud;
    }

    function createResetButton() {
        var resetButton = new Kinetic.Group({
            x: 88, y: 180
        });

        var resetButtonRect = new Kinetic.Rect({
            width: 170, height: 35,
            fill: '#DA9E62', stroke: '#4E1207', strokeWidth: 3
        });
        resetButton.add(resetButtonRect);

        var resetButtonText = new Kinetic.Text({
            fill: '#4E1207',
            text: 'Reset Game',
            fontSize: 18,
            fontFamily: 'Calibri',
            fontStyle: 'bold',
            width: 170,
            padding: resetButtonRect.getHeight() / 4,
            align: 'center'
        });
        resetButton.add(resetButtonText);

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

        return resetButton;
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
        var numValidMoves = 0;

        deactivatePegs();
        clearMoveList();

        /** Consider all enabled pegs */
        for (var i = 0; i < pegCount; i++) {
            if (isPegEnabled(i)) {
                var moveCount = 0;
                var pegActivated = false;

                /** Get the board position for the current peg */
                var pos = getPegPosition(i);

                /** Consider all possible moves for this peg */
                for (var j = 0; j < MoveTable[pos].length; j++) {

                    /** Get 'jump' and 'land' positions for this move */
                    var jumpPos = MoveTable[pos][j].jumpPos;
                    var landPos = MoveTable[pos][j].landPos

                    if (isMoveValid(jumpPos, landPos)) {
                        validMoves[i][moveCount] = MoveTable[pos][j];
                        moveCount++;
                        if (!pegActivated) 
                            activatePeg(peg[i]);
                    }
                }
                numValidMoves += moveCount;
            }
        }
        if (numValidMoves === 0) gameOverMessage();
    }

    function isMoveValid (jumpPos, landPos) {
        return isHoleOccupied(jumpPos) && !isHoleOccupied(landPos);
    }

    /** Displays particular game over msg based on number of remaining pegs */
    function gameOverMessage() {
        var msg;
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

    /** Resets the game to the original starting state */
    function resetGame() {
        deactivatePegs();
        for (var i = 0; i < holeCount; i++) {

            /** Reset pegs in all but the last hole */
            if (i != holeCount - 1) {
                setPegPosition(i, i);
                peg[i].setX(boardPos[i].x);
                peg[i].setY(boardPos[i].y);
                peg[i].setVisible(true);
                setPegEnabled(i, true);
                setHoleOccupied(i, true);
            }
            else {
                /** Make sure the last hole isn't set as occupied */
                setHoleOccupied(i, false);
            }
        }

        /** Redraw the peg layer for original peg layout */
        pegLayer.draw();
        
        /** Reset the GUI */
        pegsRemaining = 14;
        pegsRemainingText.setText('Pegs Remaining: ' + pegsRemaining);
        textLayer.draw();

        /** Rebuild the list of current possible moves */
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
            if (i != hole.length - 1) {
                peg[i].setDraggable(false);
                peg[i].off('dragstart');
                peg[i].off('mouseover');
                peg[i].off('mouseout');
                peg[i].attrs.active = false;
                peg[i].setStroke('white');
            }
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

})();