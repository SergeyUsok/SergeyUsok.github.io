define(["require", "exports", "./StationModel", "./Route", "./ConnectionModel"], function (require, exports, StationModel_1, Route_1, ConnectionModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SizeSettings {
        constructor(gridSize, canvasSize, lineWidthFactor) {
            this.gridSize = gridSize;
            this.canvasSize = canvasSize;
            this.lineWidthFactor = lineWidthFactor;
        }
    }
    exports.SizeSettings = SizeSettings;
    class SubwayMap {
        constructor(_sizeSettings) {
            this._sizeSettings = _sizeSettings;
            this._stations = [];
            this._routes = [];
            this.connectionsCache = new ConnectionModel_1.ConnectionsManager();
            // Getters API
            this.currentRoute = null;
        }
        get sizeSettings() {
            return this._sizeSettings;
        }
        get stations() {
            return this._stations;
        }
        get routes() {
            return this._routes;
        }
        // Route API
        newRoute(id) {
            let newRoute = new Route_1.Route(id, this.connectionsCache);
            this.routes.push(newRoute);
            return newRoute;
        }
        getRoute(id) {
            for (let i = 0; i < this.routes.length; i++) {
                if (this.routes[i].id == id)
                    return this.routes[i];
            }
        }
        removeRoute(route) {
            for (let connection of route.getConnections()) {
                this.connectionsCache.remove(connection.from, connection.to, route);
            }
            let index = this.routes.indexOf(route);
            if (index > -1)
                this.routes.splice(index, 1);
            if (this.currentRoute == route)
                this.currentRoute = null;
        }
        // Station API
        newStation(id, x, y) {
            let newStation = new StationModel_1.Station(id, x, y);
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
    exports.SubwayMap = SubwayMap;
});
//# sourceMappingURL=SubwayMap.js.map