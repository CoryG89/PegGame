/**
 * Author: Cory Gross
 * Last Modified: June 6, 2013
 *
 * The game board is defined by the following 15 board positions
 * 
 *              14
 *            13  12
 *          11  10  09 
 *        08  07  06  05
 *      04  03  02  01  00
 *
 *  There are only two possible moves at each position, except for positions
 *  2, 9, and 11, at which there are four possible moves; giving at a total
 *  of 36 possible moves in the game. For each of the 14 positions, we define a
 *  list of possible moves. Each possible move consists of a 'jump' position and
 *  a 'land' position. For the move to be valid 3 conditions must be satisfied:
 *
 *   1) A peg must occupy the hole at the position for which the move is defined
 *   2) A peg must occupy the 'jump' position of the defined move
 *   3) A peg must not occupy the 'land' position of the defined move
 *   
 */
    
var MoveTable = [];

/** Row one (positions 0-4), bottom row */
MoveTable[0] = [{jumpPos:1, landPos:2}, {jumpPos:5, landPos:9}];
MoveTable[1] = [{jumpPos:2, landPos:3}, {jumpPos:6, landPos:10}];
MoveTable[2] = [{jumpPos:1, landPos:0}, {jumpPos:3, landPos:4},
                {jumpPos:6, landPos:9}, {jumpPos:7, landPos:11}];
MoveTable[3] = [{jumpPos:2, landPos:1}, {jumpPos:7, landPos:10}];
MoveTable[4] = [{jumpPos:3, landPos:2}, {jumpPos:8, landPos:11}];

/** Row two (positions 5-8) */
MoveTable[5] = [{jumpPos:6, landPos:7}, {jumpPos:9,  landPos:12}];
MoveTable[6] = [{jumpPos:7, landPos:8}, {jumpPos:10, landPos:13}];
MoveTable[7] = [{jumpPos:6, landPos:5}, {jumpPos:10, landPos:12}];
MoveTable[8] = [{jumpPos:7, landPos:6}, {jumpPos:11, landPos:13}];

/** Row three (positions 9-11) */
MoveTable[9] =  [{jumpPos:5,  landPos:0},  {jumpPos:6,  landPos:2}, 
                 {jumpPos:10, landPos:11}, {jumpPos:12, landPos:14}];
MoveTable[10] = [{jumpPos:6,  landPos:1},  {jumpPos:7,  landPos:3}];
MoveTable[11] = [{jumpPos:7,  landPos:2},  {jumpPos:8,  landPos:4}, 
                 {jumpPos:10, landPos:9},  {jumpPos:13, landPos:14}];

/** Row four (positions 12 and 13) */
MoveTable[12] = [{jumpPos:9,  landPos:5}, {jumpPos:10, landPos:7}];
MoveTable[13] = [{jumpPos:10, landPos:6}, {jumpPos:11, landPos:8}];

/** Row five (position 14), top row */
MoveTable[14] = [{jumpPos:12, landPos:9}, {jumpPos:13, landPos:11}];
