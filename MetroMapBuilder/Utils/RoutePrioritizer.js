define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Direction;
    (function (Direction) {
        Direction[Direction["south"] = 0] = "south";
        Direction[Direction["north"] = 1] = "north";
        Direction[Direction["east"] = 3] = "east";
        Direction[Direction["west"] = 4] = "west";
        Direction[Direction["southEast"] = 6] = "southEast";
        Direction[Direction["northWest"] = 7] = "northWest";
        Direction[Direction["southWest"] = 9] = "southWest";
        Direction[Direction["northEast"] = 10] = "northEast";
    })(Direction || (Direction = {}));
    class RoutePrioritizer {
        prioritize(routes) {
        }
    }
    exports.RoutePrioritizer = RoutePrioritizer;
    let map = [
        [1, 2, 1, 1, 1, 2]
    ];
});
//# sourceMappingURL=RoutePrioritizer.js.map