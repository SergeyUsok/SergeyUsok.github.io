define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Metadata {
        constructor(gridConfig) {
            this.stations = [];
            this.routes = [];
            this.labels = [];
            this.lineWidthFactor = 0.2;
            this.currentRoute = null;
            this.connectionsCache = new ConnectionCache();
            this.gridConfig = gridConfig;
        }
        // Route API
        newRoute(id) {
            let newRoute = new RouteMetadata(id, this.connectionsCache);
            this.routes.push(newRoute);
            return newRoute;
        }
        getRoute(id) {
            for (let i = 0; i < this.routes.length; i++) {
                if (this.routes[i].id == id)
                    return this.routes[i];
            }
        }
        removeRoute(id) {
            let newArr = [];
            for (let i = 0; i < this.routes.length; i++) {
                let route = this.routes[i];
                if (route.id != id)
                    newArr.push(route);
            }
            this.routes = newArr;
        }
        // Station API
        newStation(id, x, y) {
            let newStation = new StationMetadata(id, x, y);
            this.stations.push(newStation);
            return newStation;
        }
        getStation(id) {
            for (let i = 0; i < this.stations.length; i++) {
                if (this.stations[i].id == id)
                    return this.stations[i];
            }
        }
        removeStation(station) {
            let index = this.stations.indexOf(station);
            // 1. remove from general stations array
            if (index > -1)
                this.stations.splice(index, 1);
            // 2. remove from any route referenced to this station and from connection cache under the hood
            this.routes.forEach(route => route.removeConnection(station));
        }
        // Connection API
        newConnection(route, station) {
            if (route.last == null) {
                return {
                    error: "",
                    ok: route.addConnection(station)
                };
            }
            if (route.last == station) {
                return {
                    error: `Loop connections between same station are not allowed. Station Id: ${station.id}, Label: ${station.label.name.join(" ")}`,
                    ok: false
                };
            }
            let added = this.connectionsCache.add(route.last, station, route);
            if (added) {
                return {
                    error: "",
                    ok: route.addConnection(station)
                };
            }
            else {
                return {
                    error: `Connection between ${route.last.label.name.join(" ")} (id: ${route.last.id}) and ` +
                        `${station.label.name.join(" ")} (id: ${station.id}) already exist for selected route`,
                    ok: false
                };
            }
        }
        removeConnection(route, station) {
            route.removeConnection(station);
        }
    }
    exports.Metadata = Metadata;
    class StationMetadata {
        constructor(_id, _x, _y) {
            this._id = _id;
            this._x = _x;
            this._y = _y;
            this.label = null;
            this.label = new LabelMetadata(`Station ${_id}`);
        }
        get id() {
            return this._id;
        }
        get x() {
            return this._x;
        }
        get y() {
            return this._y;
        }
        updateLabel() {
        }
    }
    exports.StationMetadata = StationMetadata;
    class RouteMetadata {
        constructor(_id, connectionCache) {
            this._id = _id;
            this.connectionCache = connectionCache;
            this._stations = [];
            this.color = "red"; // default color
        }
        get id() {
            return this._id;
        }
        get first() {
            return this._stations.length > 0 ? this._stations[0] : null;
        }
        get last() {
            return this._stations.length > 0 ? this._stations[this._stations.length - 1] : null;
        }
        *getConnections() {
            for (let i = 0; i < this._stations.length - 1; i++) {
                let from = this._stations[i];
                let to = this._stations[i + 1];
                yield this.connectionCache.get(from, to);
            }
        }
        passesThrough(station) {
            return this._stations.indexOf(station) > -1;
        }
        addConnection(station) {
            this._stations.push(station);
            return true;
        }
        removeConnection(station) {
            let index = this._stations.indexOf(station);
            if (index <= -1)
                return;
            if (this._stations.length == 1) {
                this._stations.splice(index, 1);
                return;
            }
            if (index > 0) { // check if this station is not first
                let from = this._stations[index - 1];
                let to = station;
                this.connectionCache.remove(from, to, this);
                this._stations.splice(index, 1);
                this.removeConnection(station); // recurcive removal for ring lines
                return;
            }
            if (index < this._stations.length - 2) { // check if this station is not last
                let from = station;
                let to = this._stations[index + 1];
                this.connectionCache.remove(from, to, this);
                this._stations.splice(index, 1);
                this.removeConnection(station); // recurcive removal for ring lines
                return;
            }
        }
    }
    exports.RouteMetadata = RouteMetadata;
    class LabelMetadata {
        constructor(...name) {
            this.name = name;
        }
    }
    exports.LabelMetadata = LabelMetadata;
    class Connection {
        constructor(_from, _to) {
            this._from = _from;
            this._to = _to;
            this.passingRoutes = [];
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
    }
    exports.Connection = Connection;
    class GridSettings {
        constructor(gridSize, canvasSize) {
            this.gridSize = gridSize;
            this.canvasSize = canvasSize;
        }
    }
    exports.GridSettings = GridSettings;
    class ConnectionCache {
        constructor() {
            this.connections = new Map();
        }
        get(from, to) {
            let key = this.getKey(from, to);
            if (!this.connections.has(key)) {
                console.error(`No connection found between ${from.id} and ${to.id} stations`);
                throw new Error(`No connection found between ${from.id} and ${to.id} stations`);
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
                this.connections.delete(key);
            }
        }
        getKey(from, to) {
            if (from.id > to.id) {
                return `${to.id}-${from.id}`;
            }
            return `${from.id}-${to.id}`;
        }
    }
});
//# sourceMappingURL=Metadata.js.map