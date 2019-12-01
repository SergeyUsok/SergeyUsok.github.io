define(["require", "exports", "./ConnectionModel", "../Utils/Strings"], function (require, exports, ConnectionModel_1, Strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Route {
        constructor(_id, connectionCache) {
            this._id = _id;
            this.connectionCache = connectionCache;
            this._stations = [];
            this._connections = null;
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
        get isInitialized() {
            return this._connections != null;
        }
        get stations() {
            return this._stations;
        }
        reverse() {
            this._stations = this._stations.reverse();
        }
        findConnection(connection) {
            if (this._connections == null) {
                let reversed = this.isReversedRelativeTo(connection);
                this._connections = this.generateConnections(reversed);
            }
            return this._connections.find(c => c.from == connection.from && c.to == connection.to);
        }
        getConnections() {
            if (this._connections == null)
                this._connections = this.generateConnections();
            return this._connections;
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
        reset() {
            this._connections = null;
        }
        generateConnections(reverse) {
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
        reconnect() {
            if (this._stations.length <= 1)
                return;
            for (let i = 0; i < this._stations.length - 1; i++) {
                let from = this._stations[i];
                let to = this._stations[i + 1];
                this.connectionCache.add(from, to, this);
            }
        }
        // Since ringed lines are possible we have to check entire array because same station might be met several times
        isReversedRelativeTo(connection) {
            for (let i = 0; i < this._stations.length; i++) {
                if (this._stations[i] != connection.from)
                    continue;
                if (i != 0 && this._stations[i - 1] == connection.to)
                    return true; // to has lower index than from, reverse is required
                if (i != this._stations.length - 1 && this._stations[i + 1] == connection.to)
                    return false; // to has greater index than from, reverse is not required
            }
            throw new Error(`Cannot find connection between ${connection.from.id} and ${connection.to.id} on route ${this.id}`);
        }
    }
    exports.Route = Route;
});
//# sourceMappingURL=Route.js.map