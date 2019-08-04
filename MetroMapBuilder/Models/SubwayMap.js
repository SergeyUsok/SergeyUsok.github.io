define(["require", "exports", "./StationModel", "./Route", "./ConnectionModel", "../Utils/Strings"], function (require, exports, StationModel_1, Route_1, ConnectionModel_1, Strings_1) {
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
            this.subscribers = [];
            // Getters API
            this.currentRoute = null;
            this.name = "";
        }
        mapReloaded(callback) {
            this.subscribers.push(callback);
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
            if (station == null || station == undefined) {
                return {
                    error: Strings_1.Strings.nullOrUndefinedStation(),
                    ok: false
                };
            }
            ;
            if (route.last == null) {
                return {
                    error: Strings_1.Strings.empty,
                    ok: route.addConnection(station)
                };
            }
            if (route.last == station) {
                return {
                    error: Strings_1.Strings.loopsAreNotAllowedError(station.id, station.label.name.join(" ")),
                    ok: false
                };
            }
            let added = this.connectionsCache.add(route.last, station, route);
            if (added) {
                return {
                    error: Strings_1.Strings.empty,
                    ok: route.addConnection(station)
                };
            }
            else {
                return {
                    error: Strings_1.Strings.connectionExistsError(route.last.label.name.join(" "), route.last.id, station.label.name.join(" "), station.id),
                    ok: false
                };
            }
        }
        removeConnection(route, station) {
            route.removeConnection(station);
        }
        // Serialization API
        toJson(name) {
            // Station ids will be unified and gaps between them will be removed so that ids will be placed in order
            // we need to store the map between actual id and unified one
            let stationIdsMap = new Map();
            let stations = this.prepareStations(stationIdsMap);
            let routes = this.prepareRoutes(stationIdsMap);
            let mapSerialized = {
                name: name || this.name,
                settings: {
                    gridSize: this._sizeSettings.gridSize,
                    canvasSize: this._sizeSettings.canvasSize,
                    lineWidthFactor: this._sizeSettings.lineWidthFactor
                },
                stations: stations,
                routes: routes
            };
            return mapSerialized;
        }
        fromJson(object) {
            this.validateMap(object);
            this.clear();
            try {
                let stationsMap = this.addStations(object);
                this.addRoutes(object, stationsMap);
            }
            catch (e) {
                this.clear(); // do not keep object in partially valid state
                throw e;
            }
            this._sizeSettings.gridSize = object.settings.gridSize;
            this._sizeSettings.canvasSize = object.settings.canvasSize;
            this._sizeSettings.lineWidthFactor = object.settings.lineWidthFactor;
            this.name = object.name;
            this.notifyMapReloaded();
            return this;
        }
        notifyMapReloaded() {
            for (let i = 0; i < this.subscribers.length; i++) {
                this.subscribers[i]();
            }
        }
        // private methods
        validateMap(object) {
            if (object.stations == undefined || object.stations.length == undefined)
                throw new Error(Strings_1.Strings.missingPropertyOn("stations", "map"));
            if (object.routes == undefined || object.routes.length == undefined)
                throw new Error(Strings_1.Strings.missingPropertyOn("routes", "map"));
            if (object.name == undefined)
                throw new Error(Strings_1.Strings.missingPropertyOn("name", "map"));
            if (object.settings.gridSize == undefined)
                throw new Error(Strings_1.Strings.missingPropertyOn("gridSize", "map"));
            if (object.settings.canvasSize == undefined)
                throw new Error(Strings_1.Strings.missingPropertyOn("canvasSize", "map"));
            if (object.settings.lineWidthFactor == undefined)
                throw new Error(Strings_1.Strings.missingPropertyOn("lineWidthFactor", "map"));
        }
        addStations(object) {
            let stationsMap = new Map();
            for (let i = 0; i < object.stations.length; i++) {
                let stationObj = object.stations[i];
                this.validateStation(stationObj);
                let station = this.newStation(stationObj.id, stationObj.x, stationObj.y);
                station.label.setCoordinates(stationObj.label.x, stationObj.label.y);
                station.label.setName(stationObj.label.name);
                stationsMap.set(station.id, station);
            }
            return stationsMap;
        }
        validateStation(stationObj) {
            if (stationObj.id == undefined)
                throw new Error(Strings_1.Strings.missingPropertyOn("id", "station"));
            if (stationObj.x == undefined)
                throw new Error(Strings_1.Strings.missingPropertyOn("x", "station"));
            if (stationObj.y == undefined)
                throw new Error(Strings_1.Strings.missingPropertyOn("y", "station"));
            if (stationObj.label == undefined)
                throw new Error(Strings_1.Strings.missingPropertyOn("label", "station"));
            if (stationObj.label.x == undefined)
                throw new Error(Strings_1.Strings.missingPropertyOn("x", "label"));
            if (stationObj.label.y == undefined)
                throw new Error(Strings_1.Strings.missingPropertyOn("y", "label"));
            if (stationObj.label.name == undefined)
                throw new Error(Strings_1.Strings.missingPropertyOn("name", "label"));
        }
        addRoutes(object, stationsMap) {
            for (let i = 0; i < object.routes.length; i++) {
                let routeObj = object.routes[i];
                this.validateRoute(routeObj);
                let route = this.newRoute(routeObj.id);
                route.color = routeObj.color;
                for (let j = 0; j < routeObj.stations.length; j++) {
                    let stationId = routeObj.stations[j];
                    let station = stationsMap.get(stationId);
                    let result = this.newConnection(route, station);
                    if (!result.ok) {
                        throw new Error(result.error);
                    }
                }
            }
        }
        validateRoute(routeObj) {
            if (routeObj.id == undefined)
                throw new Error(Strings_1.Strings.missingPropertyOn("id", "route"));
            if (routeObj.color == undefined)
                throw new Error(Strings_1.Strings.missingPropertyOn("color", "route"));
            if (routeObj.stations == undefined)
                throw new Error(Strings_1.Strings.missingPropertyOn("stations", "route"));
        }
        prepareRoutes(stationIdsMap) {
            let routesInfo = [];
            for (let routeId = 0; routeId < this.routes.length; routeId++) {
                let route = this.routes[routeId];
                let stationsInfo = [];
                for (let station of route.getStations()) {
                    let newId = stationIdsMap.get(station.id);
                    stationsInfo.push(newId);
                }
                let serialized = { id: routeId, color: route.color, stations: stationsInfo };
                routesInfo.push(serialized);
            }
            return routesInfo;
        }
        prepareStations(stationIdsMap) {
            let stationsInfo = [];
            for (let newId = 0; newId < this.stations.length; newId++) {
                let station = this.stations[newId];
                stationIdsMap.set(station.id, newId);
                let serialized = {
                    id: newId, x: station.x, y: station.y,
                    label: {
                        x: station.label.x,
                        y: station.label.y,
                        name: station.label.name
                    }
                };
                stationsInfo.push(serialized);
            }
            return stationsInfo;
        }
        clear() {
            this._stations = [];
            this._routes = [];
            this.currentRoute = null;
            this.connectionsCache.clear();
        }
    }
    exports.SubwayMap = SubwayMap;
});
//# sourceMappingURL=SubwayMap.js.map