define(["require", "exports", "./ConnectionModel", "../Utils/Strings"], function (require, exports, ConnectionModel_1, Strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Route {
        constructor(_id, connectionCache) {
            this._id = _id;
            this.connectionCache = connectionCache;
            this._stations = [];
            this.color = [Strings_1.Strings.defaultColor];
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
        getStations() {
            return this._stations;
        }
        // todo check ringed lines
        isReversedRelativeTo(connection) {
            return this._stations.indexOf(connection.from) > this._stations.indexOf(connection.to);
        }
        findConnection(connection, reverse) {
            let connections = this.getConnections(reverse);
            return connections.find(c => c.from == connection.from && c.to == connection.to);
        }
        getConnections(reverse) {
            if (this._stations.length < 2)
                return [];
            let start = reverse ? this._stations.length - 1 : 0;
            let end = reverse ? 0 : this._stations.length - 1;
            let getNext = reverse ? n => n - 1 : n => n + 1;
            let result = [];
            let prev = null;
            while (start != end) {
                let from = this._stations[start];
                let to = this._stations[getNext(start)];
                let routes = this.connectionCache.get(from, to);
                let current = new ConnectionModel_1.Connection(from, to, Array.from(routes), prev);
                result.push(current);
                prev = current;
                start = getNext(start);
            }
            return result;
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
            for (let i = index - 1; i <= index; i++) {
                if (i < 0 || (i + 1) > this._stations.length - 1) { // bounds for start or end of stations array
                    continue;
                }
                let from = this._stations[i];
                let to = this._stations[i + 1];
                this.connectionCache.remove(from, to, this);
            }
            this._stations.splice(index, 1);
            this.reconnect();
            this.removeConnection(station); // recurcive removal for ring routes
        }
        reconnect() {
            if (this._stations.length <= 1)
                return;
            for (let i = 0; i < this._stations.length - 1; i++) {
                let from = this._stations[i];
                let to = this._stations[i + 1];
                this.connectionCache.add(from, to, this);
            }
        }
    }
    exports.Route = Route;
});
//# sourceMappingURL=Route.js.map