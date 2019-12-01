define(["require", "exports", "../Utils/Strings"], function (require, exports, Strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ConnectionsManager {
        constructor() {
            // map of connection between 2 stations. i.e "1-2" to number of Route Ids passing through this connection
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
                let connectionInfo = this.connections.get(key);
                if (connectionInfo.has(route.id)) // connection already exists
                    return false;
                connectionInfo.add(route.id);
            }
            else {
                let connectionInfo = new Set();
                connectionInfo.add(route.id);
                this.connections.set(key, connectionInfo);
            }
            return true;
        }
        remove(from, to, route) {
            let key = this.getKey(from, to);
            if (!this.connections.has(key)) {
                return;
            }
            let connectionInfo = this.connections.get(key);
            connectionInfo.delete(route.id);
            if (connectionInfo.size == 0) {
                this.connections.delete(key);
            }
        }
        removeEntireRoute(route) {
            for (let key of this.connections.keys()) {
                let routes = this.connections.get(key);
                if (routes.delete(route.id) && routes.size == 0)
                    this.connections.delete(key);
            }
        }
        getRouteAdjacentsMap() {
            let routeAdjacents = new Map();
            for (let ids of this.connections.values()) {
                for (let id of ids) {
                    if (!routeAdjacents.has(id)) {
                        routeAdjacents.set(id, new Set());
                    }
                    ids.forEach(i => routeAdjacents.get(id).add(i));
                }
            }
            let result = new Map();
            for (let keyValue of routeAdjacents) {
                result.set(keyValue[0], keyValue[1].size);
            }
            return result;
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
        constructor(_from, _to, _passingRoutes, prev) {
            this._from = _from;
            this._to = _to;
            this._passingRoutes = _passingRoutes;
            this._next = null;
            this._prev = null;
            this._direction = this.determineDirection(_from, _to);
            if (prev != null) {
                this._prev = prev;
                this._prev.addNext(this);
            }
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
        get prev() {
            return this._prev;
        }
        get next() {
            return this._next;
        }
        get passingRoutes() {
            return this._passingRoutes;
        }
        determineDirection(stationA, stationB) {
            if (stationA.x == stationB.x && stationA.y < stationB.y)
                return Direction.south;
            if (stationA.x == stationB.x && stationA.y > stationB.y)
                return Direction.north;
            if (stationA.x < stationB.x && stationA.y == stationB.y)
                return Direction.east;
            if (stationA.x > stationB.x && stationA.y == stationB.y)
                return Direction.west;
            // first check diagonal drawing direction (moves from top to bottom or from bottom to top)
            // from top to Bottom case
            if (stationA.y < stationB.y) {
                if (stationA.x > stationB.x)
                    return Direction.southWest;
                if (stationA.x < stationB.x)
                    return Direction.southEast;
            }
            // from Bottom to top case
            else if (stationA.y > stationB.y) {
                if (stationA.x > stationB.x)
                    return Direction.northWest;
                if (stationA.x < stationB.x)
                    return Direction.northEast;
            }
        }
        addNext(next) {
            this._next = next;
        }
    }
    exports.Connection = Connection;
    // the idea here is that directions laying on the same line
    // have absolute difference equal to 1, i.e. south and north both lay on vertical line
    // and have diffrence Math.abs(0-1)=1 or Math.abs(1-0)=1
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
    })(Direction = exports.Direction || (exports.Direction = {}));
});
//# sourceMappingURL=ConnectionModel.js.map