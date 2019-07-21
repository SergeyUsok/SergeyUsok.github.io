define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ConnectionsManager {
        constructor() {
            this.connections = new Map();
        }
        get(from, to) {
            let key = this.getKey(from, to);
            if (!this.connections.has(key)) {
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
    exports.ConnectionsManager = ConnectionsManager;
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
});
//# sourceMappingURL=ConnectionModel.js.map