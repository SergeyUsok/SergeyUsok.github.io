define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Color;
    (function (Color) {
        Color["none"] = "none";
        Color["green"] = "green";
        Color["red"] = "red";
        Color["yellow"] = "yellow";
        Color["blue"] = "blue";
        Color["orange"] = "orange";
        Color["black"] = "black";
        Color["brown"] = "brown";
    })(Color = exports.Color || (exports.Color = {}));
    var Direction;
    (function (Direction) {
        Direction[Direction["horizontal"] = 0] = "horizontal";
        Direction[Direction["vertical"] = 1] = "vertical";
        Direction[Direction["rightDiagonal"] = 2] = "rightDiagonal";
        Direction[Direction["leftDiagonal"] = 3] = "leftDiagonal";
    })(Direction = exports.Direction || (exports.Direction = {}));
    var Direction2;
    (function (Direction2) {
        Direction2[Direction2["south"] = 0] = "south";
        Direction2[Direction2["north"] = 1] = "north";
        Direction2[Direction2["west"] = 2] = "west";
        Direction2[Direction2["east"] = 3] = "east";
        Direction2[Direction2["southWest"] = 4] = "southWest";
        Direction2[Direction2["southEast"] = 5] = "southEast";
        Direction2[Direction2["northWest"] = 6] = "northWest";
        Direction2[Direction2["northEast"] = 7] = "northEast";
    })(Direction2 || (Direction2 = {}));
});
//# sourceMappingURL=Types.js.map