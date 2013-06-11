/**
 *  Author: Cory Gross
 *  Last modified: June 6, 2013
 **/
(function () {

    /** Load assets before anything else, initialize only afterwards */
    var boardTexture = new Image();
    boardTexture.onload = function () { init(); };
    boardTexture.src = 'img/wood-texture.jpg';

    /** Properties which can be set in order to customize the game */
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

    /** Declare needed globals set during initialization */
    var gameLayer, hudLayer;
    var hole, holeCount, peg, pegCount;
    var validMoves, boardPos;
    var pegsRemaining, pegsRemainingText;

    function init() {
        var containerElement = document.getElementById('container');
        containerElement.style.width = stageWidth + 'px';
        containerElement.style.height = stageHeight + 'px';

        /** Create our KineticJS stage using our canvas container */
        var stage = new Kinetic.Stage({
            container: 'container',
            width: stageWidth,
            height: stageHeight
        });

        /** Define where the center of the board will be positioned. Used as a
            reference point for positioning the pegs and holes on the board */
        var boardCenter = {
            x: stage.getWidth() / 2 - 110,
            y: stage.getHeight() / 2 + 110
        };

        /** Create and add a background image to its own layer,
            this layer will only be drawn once */
        var bgLayer = new Kinetic.Layer();
        var background = new Kinetic.Rect({
            width: 800, height: 600, fill: 'white'
        });
        bgLayer.add(background);

        /** Create our dynamic layers */
        gameLayer = new Kinetic.Layer();
        hudLayer = new Kinetic.Layer();
        
        /** Create the triangular wooden game board */
        var wood = new Kinetic.RegularPolygon({
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
        bgLayer.add(wood);

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

                /** Calculate x,y offset from board center for current hole */
                var posX = (numHoles - 1) * -30 + j * 60 + boardCenter.x;
                var posY = -60 * i + 70 + boardCenter.y;
                boardPos[holeCount] = { x: posX, y: posY };

                /** Create a new hole with the calculated position  */
                hole[holeCount] = createHole(posX, posY);
                gameLayer.add(hole[holeCount]);

                /** Also create pegs for all positions, except the last */
                if (holeCount < 14) {

                    /** Create a new peg and add it to the group */
                    var newPeg = createPeg(posX, posY);
                    peg[pegCount] = newPeg;

                    /** Initialize peg properties */
                    peg[pegCount].attrs.active = false;
                    peg[pegCount].attrs.pegIndex = pegCount;
                    peg[pegCount].attrs.boardPos = pegCount;
                    peg[pegCount].attrs.enabled = true;

                    /** Set corresponding hole occupied, increment peg count */
                    hole[holeCount].attrs.occupied = true;
                    gameLayer.add(peg[pegCount]);
                    pegCount++;
                }
                else {
                    /** Make sure the last hole is marked not occupied */
                    hole[holeCount].attrs.occupied = false;
                }

                holeCount++; 
            }
        }

        /** Create the HUD */
        var hud = createHUD(hudLayer);
        hudLayer.add(hud);

        /** Add all of the game layers to the stage */
        stage.add(bgLayer);
        stage.add(gameLayer);
        stage.add(hudLayer);

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

    /** Create the on-screen heads up display */
    function createHUD() {
        var hud = new Kinetic.Group({
            x: 430, y: 30
        });

        var main = new Kinetic.Group();

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

        main.add(hudRect);
        main.add(pegsRemainingText);
        main.add(scoringText);

        hud.add(main);
        hud.add(createResetButton());

        return hud;
    }

    /** Create a button for the HUD to reset the game */
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
            hudLayer.draw();
        });

        resetButton.on('mouseleave', function () {
            resetButtonRect.setFill('#DA9E62');
            document.body.style.cursor = 'auto';
            hudLayer.draw();
        });

        resetButton.on('click tap', function () {
            if (pegsRemaining != 14) resetGame();
        });

        return resetButton;
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
        return xAligned && yAligned;
    }

    /** Removes a peg at a given index from the board. This involves
        setting visibility, setting its enabled state false, setting
        the hole unoccupied, and redrawing the peg layer */
    function removePeg(index) {
        peg[index].setVisible(false);
        peg[index].attrs.enabled = false;
        peg[index].attrs.active = false;
        hole[peg[index].attrs.boardPos].attrs.occupied = false;
        gameLayer.draw();
        pegsRemaining--;
        pegsRemainingText.setText('Pegs Remaining: ' + pegsRemaining);
        hudLayer.draw();
    }

    /** Builds a list of valid moves for the current board configuration
        using the lookup table containing all the possible moves */
    function buildMoveList() {
        var numValidMoves = 0;

        deactivatePegs();
        clearMoveList();

        /** Consider all enabled pegs */
        for (var i = 0; i < pegCount; i++) {
            if (peg[i].attrs.enabled) {
                var moveCount = 0;
                var pegActivated = false;

                /** Get the board position for the current peg */
                var pos = peg[i].attrs.boardPos;

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

    /** Determines whether or not a move is valid by checking that the
        the hole to be jumped is occupied and the hole to land on is not */
    function isMoveValid (jumpPos, landPos) {
        return hole[jumpPos].attrs.occupied && !hole[landPos].attrs.occupied;
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
                peg[i].attrs.boardPos = i;
                peg[i].setX(boardPos[i].x);
                peg[i].setY(boardPos[i].y);
                peg[i].setVisible(true);
                peg[i].attrs.enabled = true;
                hole[i].attrs.occupied = true;
            }
            else {
                /** Make sure the last hole isn't set as occupied */
                hole[i].attrs.occupied = false;
            }
        }

        /** Redraw the game layer */
        gameLayer.draw();
        
        /** Reset the GUI */
        pegsRemaining = 14;
        pegsRemainingText.setText('Pegs Remaining: ' + pegsRemaining);
        hudLayer.draw();

        /** Rebuild the list of current possible moves */
        buildMoveList();
    }

    /** Returns the peg at the given board position, returns null if
        there is no peg at that position */
    function getPegAtPosition(pos) {
        for (var i = 0; i < pegCount; i++)
            if (peg[i].attrs.boardPos === pos && peg[i].attrs.enabled)
                return peg[i];
        return null;
    }

    /** Activates a given peg, adding necessary event handlers and
        setting the pegs active flag */
    function activatePeg(peg) {
        peg.on('dragstart', onActivePegDragStart);
        peg.on('dragend', onActivePegDragEnd);
        peg.on('mouseover', onActivePegMouseOver);
        peg.on('mouseout', onActivePegMouseOut);
        peg.setDraggable(true);
        peg.attrs.active = true;
    }

    /** Sets the peg position based on the given move, removes
        the peg being jumped, and recalculates new valid moves */
    function movePeg(peg, move) {
        var jumpPeg = getPegAtPosition(move.jumpPos);
        var pIndex = peg.attrs.pegIndex;
        peg.setX(boardPos[move.landPos].x);
        peg.setY(boardPos[move.landPos].y);
        removePeg(jumpPeg.attrs.pegIndex);
        hole[peg.attrs.boardPos].attrs.occupied = false;
        hole[move.landPos].attrs.occupied = true;
        peg.attrs.boardPos = move.landPos;
        buildMoveList();
    }

    /** Deactivates all of the pegs after a move has been made */
    function deactivatePegs() {
        for (var i = 0; i < hole.length; i++) {
            if (i != hole.length - 1) {
                peg[i].setDraggable(false);
                peg[i].off('dragstart');
                peg[i].off('dragend');
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
    function onActivePegDragStart() {
        var moveList = validMoves[this.attrs.pegIndex];

        for (var i = 0; i < moveList.length; i++) {
            var move = moveList[i];
            var jumpPeg = getPegAtPosition(move.jumpPos);

            jumpPeg.setStroke(jumpStrokeColor);
            hole[move.landPos].setStroke(landStrokeColor);
        }
        this.moveToTop();
    }

    /** Invoked on an active peg when it is dropped, this will update
        necessary data structures and determine if a collision with
        a proper hole has been made so that a move can be made */
    function onActivePegDragEnd() {
        var pIndex = this.attrs.pegIndex;
        var pegPosition = this.attrs.boardPos;
        var moveList = validMoves[pIndex];

        for (var i = 0; i < moveList.length; i++) {
            var move = moveList[i];
            var jumpPeg = getPegAtPosition(move.jumpPos);

            hole[move.landPos].setStroke('black');
            jumpPeg.setStroke('white');

            if (isPegNearHole(pIndex, move.landPos)) {
                movePeg(this, move);
            } else if (i == moveList.length - 1) {
                this.setX(boardPos[pegPosition].x);
                this.setY(boardPos[pegPosition].y);
            }
        }
        gameLayer.draw();
    }

    /** Invoked whenever a mouse cursor is over an active peg */
    function onActivePegMouseOver() {
        this.setStroke(activeStrokeColor);
        gameLayer.draw();
    }

    /** Invoked whenever the mouse cursor leaves an active peg */
    function onActivePegMouseOut () {
        this.setStroke('white');
        gameLayer.draw();
    }

})();