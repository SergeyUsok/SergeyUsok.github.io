define(["require", "exports", "../Utils/Strings"], function (require, exports, Strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ConnectionsManager {
        constructor() {
            this.connections = new Map();
        }
        get(from, to) {
            let key = this.getKey(from, to);
            if (!this.connections.has(key)) {
                throw new Error(Strings_1.Strings.noConnectionFound(from.id, to.id));
            }
            return this.connections.get(key);
        }
        add(from, to, route) {
            let key = this.getKey(from, to);
            if (this.connections.has(key)) {
                let connection = this.connections.get(key);
                return connection.addPassingRoute(route);
            }
            else {
                let connection = new Connection(from, to);
                this.connections.set(key, connection);
                from.onPositionChanged(key, () => connection.refresh());
                to.onPositionChanged(key, () => connection.refresh());
                return connection.addPassingRoute(route);
            }
        }
        remove(from, to, route) {
            let key = this.getKey(from, to);
            if (!this.connections.has(key)) {
                return;
            }
            let connection = this.connections.get(key);
            connection.removePassingRoute(route);
            if (connection.routesCount == 0) {
                from.unsubscribe(key);
                to.unsubscribe(key);
                this.connections.delete(key);
            }
        }
        clear() {
            this.connections.clear();
        }
        getKey(from, to) {
            if (from.id > to.id) {
                return `${to.id}-${from.id}`;
            }
            return `${from.id}-${to.id}`;
        }
    }
    exports.ConnectionsManager = ConnectionsManager;
    class Connection {
        constructor(_from, _to) {
            this._from = _from;
            this._to = _to;
            this.passingRoutes = [];
            this._direction = this.determineDirection(_from, _to);
        }
        get direction() {
            return this._direction;
        }
        get from() {
            return this._from;
        }
        get to() {
            return this._to;
        }
        get routesCount() {
            return this.passingRoutes.length;
        }
        addPassingRoute(route) {
            if (this.passingRoutes.indexOf(route) <= -1) {
                this.passingRoutes.push(route);
                return true;
            }
            return false;
        }
        removePassingRoute(route) {
            let index = this.passingRoutes.indexOf(route);
            if (index > -1) {
                this.passingRoutes.splice(index, 1);
            }
        }
        routeOrder(route) {
            return this.passingRoutes.sort(function (a, b) { return a.id - b.id; })
                .indexOf(route);
        }
        refresh() {
            this._direction = this.determineDirection(this.from, this.to);
        }
        //private determineDirection(stationA: Station, stationB: Station): Direction {
        //    if (stationA.x == stationB.x && stationA.y < stationB.y)
        //        return Direction.south;
        //    if (stationA.x == stationB.x && stationA.y > stationB.y)
        //        return Direction.north;
        //    if (stationA.x < stationB.x && stationA.y == stationB.y)
        //        return Direction.east;
        //    if (stationA.x > stationB.x && stationA.y == stationB.y)
        //        return Direction.west;
        //    // first check diagonal drawing direction (moves from top to bottom or from bottom to top)
        //    // from top to Bottom case
        //    if (stationA.y < stationB.y) {
        //        if (stationA.x > stationB.x)
        //            return Direction.southWest;
        //        if (stationA.x < stationB.x)
        //            return Direction.southEast;
        //    }
        //    // from Bottom to top case
        //    else if (stationA.y > stationB.y) {
        //        if (stationA.x > stationB.x)
        //            return Direction.northWest;
        //        if (stationA.x < stationB.x)
        //            return Direction.northEast;
        //    }
        //}
        determineDirection(stationA, stationB) {
            if (stationA.x == stationB.x && stationA.y != stationB.y)
                return Direction.vertical;
            if (stationA.x != stationB.x && stationA.y == stationB.y)
                return Direction.horizontal;
            // first check if diagonal drawing direction (moves from top to bottom or from bottom to top)
            // from top to Bottom case
            if (stationA.y < stationB.y) {
                if (stationA.x > stationB.x)
                    return Direction.rightDiagonal;
                if (stationA.x < stationB.x)
                    return Direction.leftDiagonal;
            }
            // from Bottom to top case
            else if (stationA.y > stationB.y) {
                if (stationA.x > stationB.x)
                    return Direction.leftDiagonal;
                if (stationA.x < stationB.x)
                    return Direction.rightDiagonal;
            }
            return Direction.horizontal;
        }
    }
    exports.Connection = Connection;
    var Direction;
    (function (Direction) {
        Direction[Direction["horizontal"] = 0] = "horizontal";
        Direction[Direction["vertical"] = 1] = "vertical";
        Direction[Direction["leftDiagonal"] = 2] = "leftDiagonal";
        Direction[Direction["rightDiagonal"] = 3] = "rightDiagonal";
    })(Direction = exports.Direction || (exports.Direction = {}));
});
// the idea here is that directions laying on the same line
// have absolute difference equal to 1, i.e. south and north both lay on vertical line
// and have diffrence Math.abs(0-1)=1 or Math.abs(1-0)=1 
//export enum Direction {
//    south = 0,
//    north = 1,
//    east = 3,
//    west = 4,
//    southEast = 6,
//    northWest = 7,
//    southWest = 9,
//    northEast = 10
//}
//# sourceMappingURL=ConnectionModel.js.map