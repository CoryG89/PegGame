/** For each of the 15 board positions (0-14), we have a list of possible moves defined by
    a jumping position which must be occupied, and a landing position which cannot be
    occupied in order for the move to be valid  */
    
var MoveTable = [];

MoveTable[0] = [{jumpPos:1, landPos:2}, {jumpPos:5, landPos:9}];
MoveTable[1] = [{jumpPos:2, landPos:3}, {jumpPos:6, landPos:10}];
MoveTable[2] = [{jumpPos:1, landPos:0}, {jumpPos:3,landPos:4}, {jumpPos:6,landPos:9}, {jumpPos:7,landPos:11}];
MoveTable[3] = [{jumpPos:2, landPos:1}, {jumpPos:7, landPos:10}];
MoveTable[4] = [{jumpPos:3, landPos:2}, {jumpPos:8, landPos:11}];
MoveTable[5] = [{jumpPos:6, landPos:7}, {jumpPos:9, landPos:12}];
MoveTable[6] = [{jumpPos:7, landPos:8}, {jumpPos:10, landPos:13}];
MoveTable[7] = [{jumpPos:6, landPos:5}, {jumpPos:10, landPos:12}];
MoveTable[8] = [{jumpPos:7, landPos:6}, {jumpPos:11, landPos:13}];
MoveTable[9] = [{jumpPos:5, landPos:0}, {jumpPos:6, landPos:2}, {jumpPos:10, landPos:11}, {jumpPos:12, landPos:14}];
MoveTable[10] = [{jumpPos:6, landPos:1}, {jumpPos:7, landPos:3}];
MoveTable[11] = [{jumpPos:7, landPos:2}, {jumpPos:8, landPos:4}, {jumpPos:10, landPos:9}, {jumpPos:13, landPos:14}];
MoveTable[12] = [{jumpPos:9, landPos:5}, {jumpPos:10, landPos:7}];
MoveTable[13] = [{jumpPos:10, landPos:6}, {jumpPos:11, landPos:8}];
MoveTable[14] = [{jumpPos:12, landPos:9}, {jumpPos:13, landPos:11}];
