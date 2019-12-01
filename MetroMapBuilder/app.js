define("Utils/Strings", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Strings {
        static get defaultColor() {
            return "red";
        }
        static get empty() {
            return "";
        }
        static defaultLabel(id) {
            return `Station ${id}`;
        }
        static noConnectionFound(fromId, toId) {
            return `No connection found between ${fromId} and ${toId} stations`;
        }
        static loopsAreNotAllowedError(stationId, label) {
            return `Loop connections between same station are not allowed. Station Id: ${stationId}, Label: ${label}`;
        }
        static connectionExistsError(label1, id1, label2, id2) {
            return `Connection between ${label1} (id: ${id1}) and ${label2} (id: ${id2}) already exist for selected route`;
        }
        static selectRouteMessage() {
            return "No route has been selected. Select route first on routes panel in order to draw them";
        }
        static nullOrUndefinedStation() {
            return "Provded station object is null or undefined";
        }
        static missingPropertyOn(property, obj) {
            return `Invalid object structure. Missing '${property}' property on ${obj}`;
        }
        static errorOnFileRead(msg) {
            return `Error occured while reading file: ${msg}`;
        }
        static errorOnJsonParse(msg) {
            return `Error occurred while trying to parse JSON: ${msg}`;
        }
        static errorOnMapParse(msg) {
            return `Error occurred while trying to load map from parsed JSON: ${msg}`;
        }
        static occupiedCellError() {
            return "Clicked cell is not available for station set up because it is occupied by line, label or it is placed too close to another station";
        }
        static isNullOrWhitespace(input) {
            if (typeof input === 'undefined' || input == null)
                return true;
            return input.replace(/\s/g, '').length < 1;
        }
    }
    exports.Strings = Strings;
});
define("Models/Route", ["require", "exports", "Models/ConnectionModel", "Utils/Strings"], function (require, exports, ConnectionModel_1, Strings_1) {
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
        // todo check ringed lines
        isReversedRelativeTo(connection) {
            return this._stations.indexOf(connection.from) > this._stations.indexOf(connection.to);
        }
    }
    exports.Route = Route;
});
define("Models/ConnectionModel", ["require", "exports", "Utils/Strings"], function (require, exports, Strings_2) {
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
                throw new Error(Strings_2.Strings.noConnectionFound(from.id, to.id));
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
define("Models/StationModel", ["require", "exports", "Utils/Strings"], function (require, exports, Strings_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Station {
        constructor(_id, _x, _y) {
            this._id = _id;
            this._x = _x;
            this._y = _y;
            this._label = null;
            this.subscribers = new Map();
            this._label = new Label(_id);
        }
        get id() {
            return this._id;
        }
        get label() {
            return this._label;
        }
        get x() {
            return this._x;
        }
        set x(value) {
            this._x = value;
            this.notifyAll();
        }
        get y() {
            return this._y;
        }
        set y(value) {
            this._y = value;
            this.notifyAll();
        }
        onPositionChanged(connectionId, callback) {
            this.subscribers.set(connectionId, callback);
        }
        unsubscribe(connectionId) {
            this.subscribers.delete(connectionId);
        }
        notifyAll() {
            for (let callback of this.subscribers.values()) {
                callback();
            }
        }
    }
    exports.Station = Station;
    class Label {
        constructor(_id) {
            this._id = _id;
            this.setName([Strings_3.Strings.defaultLabel(_id)]);
        }
        get id() {
            return this._id;
        }
        get name() {
            return this._names;
        }
        get x() {
            return this._x;
        }
        get y() {
            return this._y;
        }
        get width() {
            return this._width;
        }
        get height() {
            return this._names.length;
        }
        setName(names) {
            let max = 0;
            for (let i = 0; i < names.length; i++) {
                if (max < names[i].length)
                    max = names[i].length;
            }
            this._width = max;
            this._names = names;
        }
        setCoordinates(x, y) {
            this._x = x;
            this._y = y;
        }
    }
    exports.Label = Label;
});
define("Models/SubwayMap", ["require", "exports", "Models/StationModel", "Models/Route", "Models/ConnectionModel", "Utils/Strings"], function (require, exports, StationModel_1, Route_1, ConnectionModel_2, Strings_4) {
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
            this._stations = new Map();
            this._routes = new Map();
            this.connectionsManager = new ConnectionModel_2.ConnectionsManager();
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
        get routesCount() {
            return this._routes.size;
        }
        get stationsCount() {
            return this._stations.size;
        }
        get stations() {
            return this._stations.values();
        }
        get routes() {
            return this._routes.values();
        }
        // Route API
        newRoute(id) {
            let newRoute = new Route_1.Route(id, this.connectionsManager);
            this._routes.set(id, newRoute);
            return newRoute;
        }
        getRoute(id) {
            return this._routes.get(id);
        }
        removeRoute(route) {
            this.connectionsManager.removeEntireRoute(route);
            this._routes.delete(route.id);
            if (this.currentRoute == route)
                this.currentRoute = null;
        }
        *consumeRoutes() {
            let consumable = Array.from(this._routes.values());
            consumable.forEach(r => r.reset());
            while (consumable.length > 0) {
                let index = consumable.findIndex(r => r.isInitialized);
                if (index < 0) {
                    yield consumable.shift();
                }
                else {
                    yield consumable.splice(index, 1)[0];
                }
            }
        }
        // Station API
        newStation(id, x, y) {
            let newStation = new StationModel_1.Station(id, x, y);
            this._stations.set(id, newStation);
            return newStation;
        }
        getStation(id) {
            return this._stations.get(id);
        }
        removeStation(station) {
            // 1. remove from general stations array
            this._stations.delete(station.id);
            // 2. remove from any route passing through this station and from connection cache under the hood
            this._routes.forEach(route => route.removeConnection(station));
        }
        updateStationPosition(id, x, y) {
            let station = this.getStation(id);
            station.x = x;
            station.y = y;
        }
        // Connection API
        newConnection(route, station) {
            if (station == null || station == undefined) {
                return {
                    error: Strings_4.Strings.nullOrUndefinedStation(),
                    ok: false
                };
            }
            ;
            if (route.last == null) {
                return {
                    error: Strings_4.Strings.empty,
                    ok: route.addConnection(station)
                };
            }
            if (route.last == station) {
                return {
                    error: Strings_4.Strings.loopsAreNotAllowedError(station.id, station.label.name.join(" ")),
                    ok: false
                };
            }
            let added = this.connectionsManager.add(route.last, station, route);
            if (added) {
                return {
                    error: Strings_4.Strings.empty,
                    ok: route.addConnection(station)
                };
            }
            else {
                return {
                    error: Strings_4.Strings.connectionExistsError(route.last.label.name.join(" "), route.last.id, station.label.name.join(" "), station.id),
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
        // Clear all
        clear(notify) {
            this._stations.clear();
            this._routes.clear();
            this.currentRoute = null;
            this.connectionsManager.clear();
            if (notify)
                this.notifyMapReloaded();
        }
        notifyMapReloaded() {
            for (let i = 0; i < this.subscribers.length; i++) {
                this.subscribers[i]();
            }
        }
        // private methods
        validateMap(object) {
            if (object.stations == undefined || object.stations.length == undefined)
                throw new Error(Strings_4.Strings.missingPropertyOn("stations", "map"));
            if (object.routes == undefined || object.routes.length == undefined)
                throw new Error(Strings_4.Strings.missingPropertyOn("routes", "map"));
            if (object.name == undefined)
                throw new Error(Strings_4.Strings.missingPropertyOn("name", "map"));
            if (object.settings.gridSize == undefined)
                throw new Error(Strings_4.Strings.missingPropertyOn("gridSize", "map"));
            if (object.settings.canvasSize == undefined)
                throw new Error(Strings_4.Strings.missingPropertyOn("canvasSize", "map"));
            if (object.settings.lineWidthFactor == undefined)
                throw new Error(Strings_4.Strings.missingPropertyOn("lineWidthFactor", "map"));
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
                throw new Error(Strings_4.Strings.missingPropertyOn("id", "station"));
            if (stationObj.x == undefined)
                throw new Error(Strings_4.Strings.missingPropertyOn("x", "station"));
            if (stationObj.y == undefined)
                throw new Error(Strings_4.Strings.missingPropertyOn("y", "station"));
            if (stationObj.label == undefined)
                throw new Error(Strings_4.Strings.missingPropertyOn("label", "station"));
            if (stationObj.label.x == undefined)
                throw new Error(Strings_4.Strings.missingPropertyOn("x", "label"));
            if (stationObj.label.y == undefined)
                throw new Error(Strings_4.Strings.missingPropertyOn("y", "label"));
            if (stationObj.label.name == undefined)
                throw new Error(Strings_4.Strings.missingPropertyOn("name", "label"));
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
                throw new Error(Strings_4.Strings.missingPropertyOn("id", "route"));
            if (routeObj.color == undefined)
                throw new Error(Strings_4.Strings.missingPropertyOn("color", "route"));
            if (routeObj.stations == undefined)
                throw new Error(Strings_4.Strings.missingPropertyOn("stations", "route"));
        }
        prepareRoutes(stationIdsMap) {
            let routesInfo = [];
            let routeId = 0;
            for (let route of this._routes.values()) {
                let stationsInfo = [];
                for (let station of route.stations) {
                    let newId = stationIdsMap.get(station.id);
                    stationsInfo.push(newId);
                }
                let serialized = { id: routeId, color: route.color, stations: stationsInfo };
                routesInfo.push(serialized);
                routeId++;
            }
            return routesInfo;
        }
        prepareStations(stationIdsMap) {
            let stationsInfo = [];
            let newId = 0;
            for (let station of this.stations) {
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
                newId++;
            }
            return stationsInfo;
        }
    }
    exports.SubwayMap = SubwayMap;
});
define("Utils/Geometry", ["require", "exports", "Models/ConnectionModel"], function (require, exports, ConnectionModel_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Geometry {
        constructor(sizeSettings) {
            this.sizeSettings = sizeSettings;
        }
        get cellSize() {
            return this.sizeSettings.canvasSize / this.sizeSettings.gridSize;
        }
        get radius() {
            return this.cellSize / 2;
        }
        get cornerRadius() {
            return this.cellSize / 5;
        }
        get lineWidth() {
            return this.cellSize * this.sizeSettings.lineWidthFactor;
        }
        // SVG draws thin line and then calculates its width by making it wider proportionally from both sides from the center
        get halfOfLineWidth() {
            return this.lineWidth / 2;
        }
        get fontSize() {
            const svgDefaultFontSize = 16;
            return this.cellSize * 100 / svgDefaultFontSize; // font size in percents
        }
        // let distance be half of line width
        get distanceBetweenLines() {
            return this.halfOfLineWidth;
        }
        get gridSize() {
            return this.sizeSettings.gridSize;
        }
        labelWidthInCells(labelWidthInSymbols) {
            return Math.ceil(labelWidthInSymbols / 2); // 1 cell can be occupied by 2 symbols
        }
        normalizeToGridCell(x, y) {
            // check if x or y is located on border between cells
            // if yes then we always take the smaller coordinate by subtracting 1
            let isBorderX = x % this.cellSize == 0;
            let isBorderY = y % this.cellSize == 0;
            return {
                x: isBorderX ? (x / this.cellSize) - 1 : Math.floor(x / this.cellSize),
                y: isBorderY ? (y / this.cellSize) - 1 : Math.floor(y / this.cellSize)
            };
        }
        baselinePoint(point) {
            let center = this.centrify(point);
            return {
                x: center.x,
                y: center.y + this.cellSize / 3
            };
        }
        distanceOfParallelLines(linesCount) {
            let linesWidthsSum = linesCount * this.lineWidth;
            let distancesBetweenLinesSum = (linesCount - 1) * this.distanceBetweenLines;
            return linesWidthsSum + distancesBetweenLinesSum;
        }
        rectTopLeftCorner(center, width, height) {
            const cellBorder = 0.5;
            return {
                x: center.x - width / 2 + cellBorder,
                y: center.y - height / 2 + cellBorder
            };
        }
        rectCorners(center, width, height) {
            const cellBorder = 0.5;
            return [
                {
                    x: center.x - width / 2 + cellBorder,
                    y: center.y - height / 2 + cellBorder
                },
                {
                    x: center.x - width / 2 + cellBorder,
                    y: center.y + height / 2 - cellBorder
                },
                {
                    x: center.x + width / 2 - cellBorder,
                    y: center.y - height / 2 + cellBorder
                },
                {
                    x: center.x + width / 2 - cellBorder,
                    y: center.y + height / 2 - cellBorder
                }
            ];
        }
        // https://gamedev.stackexchange.com/questions/86755/how-to-calculate-corner-positions-marks-of-a-rotated-tilted-rectangle
        rotate(points, fulcrum, angle) {
            let result = [];
            let theta = angle * Math.PI / 180;
            for (let i = 0; i < points.length; i++) {
                let origin = points[i];
                let rotated = {
                    x: ((origin.x - fulcrum.x) * Math.cos(theta) - (origin.y - fulcrum.y) * Math.sin(theta)) + fulcrum.x,
                    y: ((origin.x - fulcrum.x) * Math.sin(theta) + (origin.y - fulcrum.y) * Math.cos(theta)) + fulcrum.y
                };
                result.push(rotated);
            }
            return result;
        }
        angle(a, b) {
            let dy = b.y - a.y;
            let dx = b.x - a.x;
            //let theta = Math.atan(dy / dx);
            //theta *= 180 / Math.PI;
            //return theta;        
            let theta = Math.atan2(dy, dx); // range (-PI, PI]
            theta *= 180 / Math.PI; // rads to degs, range (-180, 180]        
            return theta < 0 ? 360 + theta : theta;
        }
        centrify(point) {
            // left border of a cell
            //  + right border of a cell
            // divided by 2 (half of a cell) to get center of the cell by x axis
            let x = point.x * this.cellSize + this.cellSize / 2;
            // top border of a cell
            //  + bottom border of a cell
            // divided by 2 (half of a cell) to get center of the cell by y axis
            let y = point.y * this.cellSize + this.cellSize / 2;
            return { x, y };
        }
        // Algorithm taken from:
        // https://seant23.wordpress.com/2010/11/12/offset-bezier-curves/
        // http://forums.codeguru.com/showthread.php?524278-Algoritme-for-doubling-a-line&p=2070354#post2070354
        offsetConnection(from, to, offset) {
            if (offset == 0)
                return {
                    from: from,
                    to: to
                };
            let dx = to.x - from.x;
            let dy = to.y - from.y;
            let length = Math.sqrt(dx * dx + dy * dy);
            let perp_x = (dy / length) * offset;
            let perp_y = (-dx / length) * offset;
            return {
                from: {
                    x: from.x - perp_x,
                    y: from.y - perp_y
                },
                to: {
                    x: to.x - perp_x,
                    y: to.y - perp_y
                }
            };
        }
        // https://studfiles.net/preview/2145984/page:9/
        // http://math.hashcode.ru/questions/41305/как-узнать-координаты-через-которые-проходит-вектор
        // https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
        //private bresenhamsLine(segment: Segment) {
        //    let point1 = Geometry.normalizeToGridCell(segment.from.x, segment.from.y);
        //    let point2 = Geometry.normalizeToGridCell(segment.to.x, segment.to.y);
        //    let dx = Math.abs(point1.x - point2.x) - 1;
        //    let dy = Math.abs(point1.y - point2.y) - 1;
        //    if (dx > dy) {
        //        if (point1.x < point2.x) {
        //            let slope = (point2.y - point1.y) / (point2.x - point1.x)
        //            for (let x = point1.x; x <= point2.x; x++) {
        //                let y = point1.y + (x - point1.x) * slope;
        //                y = Math.round(Math.abs(y));
        //                this.occupiedCells.add(`${x}-${y}`);
        //                this.canvas.appendChild(SVG.addTempCircle(x, y));
        //            }
        //        }
        //        else {
        //            let slope = (point2.y - point1.y) / (point2.x - point1.x);
        //            for (let x = point2.x; x < point1.x; x++) {
        //                let y = point2.y + (x - point2.x) * slope;
        //                y = Math.round(Math.abs(y));
        //                this.occupiedCells.add(`${x}-${y}`);
        //                this.canvas.appendChild(SVG.addTempCircle(x, y));
        //            }
        //        }
        //    }
        //    else {
        //        if (point1.y < point2.y) {
        //            let slope = (point2.x - point1.x) / (point2.y - point1.y);
        //            for (let y = point1.y; y <= point2.y; y++) {
        //                let x = point1.x + (y - point1.y) * slope;
        //                x = Math.round(Math.abs(x));
        //                this.occupiedCells.add(`${x}-${y}`);
        //                this.canvas.appendChild(SVG.addTempCircle(x, y));
        //            }
        //        }
        //        else {
        //            let slope = (point2.x - point1.x) / (point2.y - point1.y);
        //            for (let y = point2.y; y <= point1.y; y++) {
        //                let x = point2.x + (y - point2.y) * slope;
        //                x = Math.round(Math.abs(x));
        //                this.occupiedCells.add(`${x}-${y}`);
        //                this.canvas.appendChild(SVG.addTempCircle(x, y));
        //            }
        //        }
        //    }
        //}
        // https://en.wikipedia.org/wiki/Digital_differential_analyzer_(graphics_algorithm)
        // algorithm it returns grid cells' coordinates that are being crossed by segment
        // taking into account line width. Here we have main (center) segment as argument and then
        // we calculate 2 boundaries of this segment knowing its direction and line width
        // Visualization:
        // ----------  first boundary calculated segment
        // ----------  center segment which comes as argument
        // ----------  second boundary calculated segment
        *digitalDiffAnalyzer(segment, direction) {
            for (let pair of this.getNormalizedPointPairs(segment, direction)) {
                let dx = pair.from.x - pair.to.x;
                let dy = pair.from.y - pair.to.y;
                let bound = Math.abs(dx) >= Math.abs(dy) ? Math.abs(dx) : Math.abs(dy);
                dx = dx / bound;
                dy = dy / bound;
                let x = pair.from.x;
                let y = pair.from.y;
                for (let step = 1; step <= bound; step++) {
                    yield { x: Math.round(x), y: Math.round(y) };
                    x = x - dx;
                    y = y - dy;
                }
            }
        }
        // Allows to take into account Line width
        *getNormalizedPointPairs(center, direction) {
            let first = firstBoundary(this.lineWidth);
            let second = secondBoundary(this.lineWidth);
            let first1 = this.normalizeToGridCell(first.from.x, first.from.y);
            let first2 = this.normalizeToGridCell(first.to.x, first.to.y);
            let center1 = this.normalizeToGridCell(center.from.x, center.from.y);
            let center2 = this.normalizeToGridCell(center.to.x, center.to.y);
            let second1 = this.normalizeToGridCell(second.from.x, second.from.y);
            let second2 = this.normalizeToGridCell(second.to.x, second.to.y);
            if (center1.x != first1.x || center1.y != first1.y ||
                center2.x != first2.x || center2.y != first2.y) {
                yield { from: first1, to: first2 };
            }
            yield { from: center1, to: center2 };
            if (center1.x != second1.x || center1.y != second1.y ||
                center2.x != second2.x || center2.y != second2.y) {
                yield { from: second1, to: second2 };
            }
            // local helper functions
            function firstBoundary(lineWidth) {
                let halfOfLineWidth = lineWidth / 2;
                switch (direction) {
                    //case Direction.horizontal:
                    case ConnectionModel_3.Direction.west:
                    case ConnectionModel_3.Direction.east:
                        return {
                            from: { x: center.from.x, y: center.from.y - halfOfLineWidth },
                            to: { x: center.to.x, y: center.to.y - halfOfLineWidth }
                        };
                    //case Direction.vertical:
                    case ConnectionModel_3.Direction.south:
                    case ConnectionModel_3.Direction.north:
                        return {
                            from: { x: center.from.x - halfOfLineWidth, y: center.from.y },
                            to: { x: center.to.x - halfOfLineWidth, y: center.to.y }
                        };
                    //case Direction.leftDiagonal:
                    case ConnectionModel_3.Direction.northWest:
                    case ConnectionModel_3.Direction.southEast:
                        return {
                            from: { x: center.from.x + halfOfLineWidth, y: center.from.y - halfOfLineWidth },
                            to: { x: center.from.x + halfOfLineWidth, y: center.from.y - halfOfLineWidth }
                        };
                    //case Direction.rightDiagonal:
                    case ConnectionModel_3.Direction.northEast:
                    case ConnectionModel_3.Direction.southWest:
                        return {
                            from: { x: center.from.x - halfOfLineWidth, y: center.from.y - halfOfLineWidth },
                            to: { x: center.from.x - halfOfLineWidth, y: center.from.y - halfOfLineWidth }
                        };
                }
            }
            function secondBoundary(lineWidth) {
                let halfOfLineWidth = lineWidth / 2;
                switch (direction) {
                    //case Direction.horizontal:
                    case ConnectionModel_3.Direction.west:
                    case ConnectionModel_3.Direction.east:
                        return {
                            from: { x: center.from.x, y: center.from.y + halfOfLineWidth },
                            to: { x: center.to.x, y: center.to.y + halfOfLineWidth }
                        };
                    //case Direction.vertical:
                    case ConnectionModel_3.Direction.south:
                    case ConnectionModel_3.Direction.north:
                        return {
                            from: { x: center.from.x + halfOfLineWidth, y: center.from.y },
                            to: { x: center.to.x + halfOfLineWidth, y: center.to.y }
                        };
                    //case Direction.leftDiagonal:
                    case ConnectionModel_3.Direction.northWest:
                    case ConnectionModel_3.Direction.southEast:
                        return {
                            from: { x: center.from.x - halfOfLineWidth, y: center.from.y + halfOfLineWidth },
                            to: { x: center.from.x - halfOfLineWidth, y: center.from.y + halfOfLineWidth }
                        };
                    //case Direction.rightDiagonal:
                    case ConnectionModel_3.Direction.northEast:
                    case ConnectionModel_3.Direction.southWest:
                        return {
                            from: { x: center.from.x + halfOfLineWidth, y: center.from.y + halfOfLineWidth },
                            to: { x: center.from.x + halfOfLineWidth, y: center.from.y + halfOfLineWidth }
                        };
                }
            }
        }
    }
    exports.Geometry = Geometry;
});
define("Utils/SVG", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SVG {
        static labelText(start, fontSizeInPercents, cellSize, names, id) {
            let text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
            text.setAttribute('font-size', `${fontSizeInPercents}%`);
            text.setAttribute('font-weight', 'bold');
            text.setAttribute('font-family', 'Times New Roman');
            text.setAttribute('data-id', `${id}`);
            let y = start.y;
            for (let i = 0; i < names.length; i++) {
                let textPart = document.createElementNS("http://www.w3.org/2000/svg", 'tspan');
                textPart.textContent = names[i];
                textPart.setAttribute('x', start.x);
                textPart.setAttribute('y', y);
                text.appendChild(textPart);
                y += cellSize;
            }
            return text;
        }
        static circleStation(center, radius, id, dataId) {
            let circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
            circle.setAttribute('cx', `${center.x}`);
            circle.setAttribute('cy', `${center.y}`);
            circle.setAttribute('r', `${radius}`);
            circle.setAttribute('id', id);
            circle.setAttribute('data-id', `${dataId}`);
            return circle;
        }
        static gridLine(x1, y1, x2, y2, id) {
            let line = document.createElementNS("http://www.w3.org/2000/svg", 'line');
            line.setAttribute('x1', x1.toString());
            line.setAttribute('y1', y1.toString());
            line.setAttribute('x2', x2.toString());
            line.setAttribute('y2', y2.toString());
            line.setAttribute("id", id);
            return line;
        }
        static straightConnection(start, finish) {
            let line = document.createElementNS("http://www.w3.org/2000/svg", 'line');
            line.setAttribute('x1', start.x.toString());
            line.setAttribute('y1', start.y.toString());
            line.setAttribute('x2', finish.x.toString());
            line.setAttribute('y2', finish.y.toString());
            return line;
        }
        static curveConnection(start, finish, controlPoint) {
            let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
            let d = `M${start.x},${start.y} Q${controlPoint.x},${controlPoint.y} ${finish.x},${finish.y}`;
            path.setAttribute('d', d);
            path.setAttribute('fill', 'none');
            return path;
        }
        static createGroup(attrs) {
            let group = document.createElementNS("http://www.w3.org/2000/svg", 'g');
            Object.keys(attrs).forEach(prop => group.setAttribute(`${prop}`, `${attrs[prop]}`));
            return group;
        }
        static rectStation(topLeft, width, height, angle, cornerRadius, fulcrum, id, dataId) {
            let rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
            rect.setAttribute('x', `${topLeft.x}`);
            rect.setAttribute('y', `${topLeft.y}`);
            rect.setAttribute('rx', `${cornerRadius}`);
            rect.setAttribute('ry', `${cornerRadius}`);
            rect.setAttribute('width', `${width}`);
            rect.setAttribute('height', `${height}`);
            rect.setAttribute('transform', `rotate(${angle} ${fulcrum.x} ${fulcrum.y})`);
            rect.setAttribute('id', id);
            rect.setAttribute('data-id', `${dataId}`);
            return rect;
        }
    }
    exports.SVG = SVG;
});
define("Utils/StationsManager", ["require", "exports", "Utils/SVG"], function (require, exports, SVG_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class StationBounds {
        constructor(initalMax, initialMin) {
            this.maxBorderX = initalMax;
            this.maxBorderY = initalMax;
            this.minBorderX = initialMin;
            this.minBorderY = initialMin;
            this.isInclined = false;
        }
    }
    exports.StationBounds = StationBounds;
    class StationsManager {
        constructor(geometry) {
            this.geometry = geometry;
            this.stationInfoMap = new Map();
            this.shapeMap = new Map();
            this.occupiedCells = new Map();
        }
        clear() {
            this.stationInfoMap.clear();
            this.shapeMap.clear();
            this.occupiedCells.clear();
        }
        getBounds(id) {
            return this.shapeMap.get(id);
        }
        processConnection(connection) {
            let newData = this.extractStationInfo(connection);
            // process 'from' station
            let storedData = this.getStoredDataForStation(connection.from.id);
            this.saveIfMissing(storedData, newData);
            // process 'to' station
            storedData = this.getStoredDataForStation(connection.to.id);
            this.saveIfMissing(storedData, newData);
        }
        process(station) {
            let metadata = this.stationInfoMap.get(station.id);
            let center = this.geometry.centrify(station);
            // draw station without lines as cicrle
            if (metadata == undefined) {
                let circle = SVG_1.SVG.circleStation(center, this.geometry.radius, `station-${station.id}`, station.id);
                this.saveCellsOccupiedByCircle(station.id, station);
                return circle;
            }
            // order by lines count descending
            metadata.sort((a, b) => {
                if (b.count > a.count)
                    return 1;
                if (b.count < a.count)
                    return -1;
                // if both count equal then check angle and prefer 0 or 90 over other
                if (b.angle == 0 || Math.abs(b.angle) == 90)
                    return 1;
                if (a.angle == 0 || Math.abs(a.angle) == 90)
                    return -1;
                return 0;
            });
            // draw station with single passing line as cicrle as well
            if (metadata[0].count == 1) {
                let circle = SVG_1.SVG.circleStation(center, this.geometry.radius, `station-${station.id}`, station.id);
                this.saveCellsOccupiedByCircle(station.id, station);
                return circle;
            }
            // otherwise draw station as rectangle
            // let maximum lines count passing through station be width of rect
            let metadataWithMaxCount = metadata[0];
            let width = this.calculateWidth(metadataWithMaxCount);
            let secondAfterMaxMetadata = metadata[1];
            let height = this.calculateHeight(secondAfterMaxMetadata);
            // station rect should be ortogonal to the angle of passing connection
            let rotation = 360 + metadataWithMaxCount.angle - 90;
            let corners = this.geometry.rectCorners(center, width, height);
            let rect = SVG_1.SVG.rectStation(corners[0], width, height, rotation, this.geometry.cornerRadius, center, `station-${station.id}`, station.id);
            this.saveCellsOccupiedByRect(station.id, corners, center, rotation);
            return rect;
        }
        // walking through current and neighboring cells and mark them as unavailable for 
        // further station set up - stations must not be placed in neighboring cells
        completeProcessing() {
            for (let id_bounds of this.shapeMap) {
                let id = id_bounds[0];
                let bounds = id_bounds[1];
                if (bounds.isInclined)
                    continue; // do not process surrounding cells for inclined stations
                for (let x = bounds.surroundingMinX; x <= bounds.surroundingMaxX; x++) {
                    for (let y = bounds.surroundingMinY; y <= bounds.surroundingMaxY; y++) {
                        this.occupiedCells.get(id).add(`${x}-${y}`);
                    }
                }
            }
        }
        noStationSet(cell, exceptId) {
            let key = `${cell.x}-${cell.y}`;
            for (let keyValue of this.occupiedCells) {
                let id = keyValue[0];
                let cells = keyValue[1];
                // skip check current if id is equal to provided exceptId
                if (id == exceptId)
                    continue;
                if (cells.has(key))
                    return false;
            }
            return true;
        }
        extractStationInfo(connection) {
            return {
                count: connection.passingRoutes.length,
                direction: connection.direction,
                angle: this.geometry.angle(connection.from, connection.to)
            };
        }
        calculateWidth(info) {
            let calculatedWidth = this.geometry.distanceOfParallelLines(info.count) +
                (this.geometry.distanceBetweenLines * 2); // add additional space equal to distanceBetweenLines from both sides of rect
            return calculatedWidth > this.geometry.cellSize ?
                calculatedWidth : this.geometry.cellSize; // minimum rect width shouldn't be less than cell size
        }
        calculateHeight(info) {
            if (info == undefined)
                return this.geometry.cellSize;
            let calculatedHeight = this.geometry.distanceOfParallelLines(info.count) +
                (this.geometry.distanceBetweenLines * 2); // add additional space equal to distanceBetweenLines from both sides of rect
            return calculatedHeight > this.geometry.cellSize ? calculatedHeight : this.geometry.cellSize;
        }
        getStoredDataForStation(id) {
            if (!this.stationInfoMap.has(id)) {
                this.stationInfoMap.set(id, []);
            }
            return this.stationInfoMap.get(id);
        }
        saveIfMissing(stored, newData) {
            for (let i = 0; i < stored.length; i++) {
                //stored[i].direction == newData.direction
                let isOnSameLine = Math.abs(stored[i].direction - newData.direction) <= 1; // check comment in ConnectionModel file for details
                if (isOnSameLine && Math.abs(stored[i].angle - newData.angle) <= 45) {
                    if (stored[i].count < newData.count) {
                        stored[i] = newData;
                    }
                    return;
                }
            }
            stored.push(newData);
        }
        saveCellsOccupiedByCircle(id, center) {
            let bounds = new StationBounds();
            bounds.maxBorderX = center.x;
            bounds.minBorderX = center.x;
            bounds.maxBorderY = center.y;
            bounds.minBorderY = center.y;
            bounds.surroundingMaxX = center.x + 1;
            bounds.surroundingMinX = center.x - 1;
            bounds.surroundingMaxY = center.y + 1;
            bounds.surroundingMinY = center.y - 1;
            this.shapeMap.set(id, bounds);
            this.occupiedCells.set(id, new Set([`${center.x}-${center.y}`]));
        }
        saveCellsOccupiedByRect(id, corners, center, rotationAngle) {
            let bounds = new StationBounds(0, this.geometry.gridSize);
            let rotated = this.geometry.rotate(corners, center, rotationAngle);
            for (let i = 0; i < rotated.length; i++) {
                let gridCell = this.geometry.normalizeToGridCell(Math.abs(rotated[i].x), Math.abs(rotated[i].y));
                // if station occupy cell only PARTIALLY (more than 10% and less than 80%) we treat free space 
                // between station border and next cell as enough to not mark next cell as occupied
                // otherwise we mark one more neighboring cell as occupied
                if (gridCell.x > bounds.maxBorderX) {
                    bounds.maxBorderX = gridCell.x;
                    let fraction = (rotated[i].x % this.geometry.cellSize) / this.geometry.cellSize;
                    bounds.surroundingMaxX = fraction <= 0.1 || fraction >= 0.8 ? (gridCell.x + 1) : gridCell.x;
                }
                if (gridCell.x < bounds.minBorderX) {
                    bounds.minBorderX = gridCell.x;
                    let fraction = (rotated[i].x % this.geometry.cellSize) / this.geometry.cellSize;
                    bounds.surroundingMinX = fraction <= 0.1 || fraction >= 0.8 ? (gridCell.x - 1) : gridCell.x;
                }
                if (gridCell.y > bounds.maxBorderY) {
                    bounds.maxBorderY = gridCell.y;
                    let fraction = (rotated[i].y % this.geometry.cellSize) / this.geometry.cellSize;
                    bounds.surroundingMaxY = fraction <= 0.1 || fraction >= 0.8 ? (gridCell.y + 1) : gridCell.y;
                }
                if (gridCell.y < bounds.minBorderY) {
                    bounds.minBorderY = gridCell.y;
                    let fraction = (rotated[i].y % this.geometry.cellSize) / this.geometry.cellSize;
                    bounds.surroundingMinY = fraction <= 0.1 || fraction >= 0.8 ? (gridCell.y - 1) : gridCell.y;
                }
            }
            bounds.isInclined = rotationAngle % 90 != 0;
            this.shapeMap.set(id, bounds);
            let result = new Set();
            for (let x = bounds.minBorderX; x <= bounds.maxBorderX; x++) {
                for (let y = bounds.minBorderY; y <= bounds.maxBorderY; y++) {
                    result.add(`${x}-${y}`);
                }
            }
            this.occupiedCells.set(id, result);
        }
    }
    exports.StationsManager = StationsManager;
});
define("Utils/LabelsManager", ["require", "exports", "Utils/SVG"], function (require, exports, SVG_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LabelsManager {
        constructor(geometry, isCellAvailable) {
            this.geometry = geometry;
            this.isCellAvailable = isCellAvailable;
            this.occupiedCells = new Set();
        }
        clear() {
            this.occupiedCells.clear();
        }
        process(label, station) {
            let position = this.calculateLabelPosition(label, station);
            label.setCoordinates(position.x, position.y);
            let labelStart = this.geometry.baselinePoint(position);
            let labelText = SVG_2.SVG.labelText(labelStart, this.geometry.fontSize, this.geometry.cellSize, label.name, label.id);
            this.saveCellsOccupiedByLabel(label);
            return labelText;
        }
        noLabelSet(cell) {
            let key = `${cell.x}-${cell.y}`;
            return !this.occupiedCells.has(key);
        }
        calculateLabelPosition(label, station) {
            return this.tryPutOnRight(label, station) ||
                this.tryPutOnBottom(label, station) ||
                this.tryPutOnLeft(label, station) ||
                this.tryPutOnTop(label, station) ||
                this.tryPutOnRightOffset(label, station) ||
                this.tryPutOnBottomOffset(label, station) ||
                this.tryPutOnLeftOffset(label, station) ||
                this.tryPutOnTopOffset(label, station) ||
                // default: put on right or left if grid does not allow
                {
                    x: station.maxBorderX < this.geometry.gridSize - this.geometry.labelWidthInCells(label.width)
                        ? station.maxBorderX + 1 : station.minBorderX - this.geometry.labelWidthInCells(label.width),
                    y: Math.floor((station.minBorderY + station.maxBorderY) / 2) // midpoint y
                };
        }
        tryPutOnRight(label, station) {
            let startX = station.maxBorderX + 1; // always the same for right side
            let labelWidth = this.geometry.labelWidthInCells(label.width);
            // first try set up label symmetrically by height relative to station
            let labelRowOppositeToStation = Math.floor(label.height / 2);
            let midPointY = Math.floor((station.minBorderY + station.maxBorderY) / 2);
            let startY = midPointY - labelRowOppositeToStation;
            return this.hasFreeSpaceForLabel(startX, startY, labelWidth, label.height) ?
                { x: startX, y: startY } : null;
        }
        tryPutOnRightOffset(label, station) {
            let startX = station.maxBorderX + 1; // always the same for right side
            let labelWidth = this.geometry.labelWidthInCells(label.width);
            // first try set up label symmetrically by height relative to station
            let labelRowOppositeToStation = Math.floor(label.height / 2);
            let midPointY = Math.floor((station.minBorderY + station.maxBorderY) / 2);
            let startY = midPointY - labelRowOppositeToStation;
            // move label down along right side of station until its first row occupy bottom-right neighboring cell 
            let temp = label.height - labelRowOppositeToStation;
            let offsetByYtimes = label.height % 2 == 0 ? temp - 1 : temp;
            for (let i = 1; i <= offsetByYtimes; i++) {
                let offsetY = startY + i;
                if (this.hasFreeSpaceForLabel(startX, offsetY, labelWidth, label.height))
                    return { x: startX, y: offsetY };
            }
            // move label up along right side of station until its last row occupy top-right neighboring cell
            offsetByYtimes = label.height - labelRowOppositeToStation;
            for (let i = 1; i <= offsetByYtimes; i++) {
                let offsetY = startY - i;
                if (this.hasFreeSpaceForLabel(startX, offsetY, labelWidth, label.height))
                    return { x: startX, y: offsetY };
            }
            return null;
        }
        tryPutOnLeft(label, station) {
            let labelWidth = this.geometry.labelWidthInCells(label.width);
            let startX = station.minBorderX - labelWidth; // always the same for left side
            // first try set up label symmetrically by height relative to station
            let labelRowOppositeToStation = Math.floor(label.height / 2);
            let midPointY = Math.floor((station.minBorderY + station.maxBorderY) / 2);
            let startY = midPointY - labelRowOppositeToStation;
            return this.hasFreeSpaceForLabel(startX, startY, labelWidth, label.height) ?
                { x: startX, y: startY } : null;
        }
        tryPutOnLeftOffset(label, station) {
            let labelWidth = this.geometry.labelWidthInCells(label.width);
            let startX = station.minBorderX - labelWidth; // always the same for left side
            let labelRowOppositeToStation = Math.floor(label.height / 2);
            let midPointY = Math.floor((station.minBorderY + station.maxBorderY) / 2);
            let startY = midPointY - labelRowOppositeToStation;
            // move label up along left side of station until its last row occupy top-left neighboring cell
            let offsetByYtimes = label.height - labelRowOppositeToStation;
            for (let i = 1; i <= offsetByYtimes; i++) {
                let offsetY = startY - i;
                if (this.hasFreeSpaceForLabel(startX, offsetY, labelWidth, label.height))
                    return { x: startX, y: offsetY };
            }
            // move label down along left side of station until its first row occupy bottom-left neighboring cell 
            let temp = label.height - labelRowOppositeToStation;
            offsetByYtimes = label.height % 2 == 0 ? temp - 1 : temp;
            for (let i = 1; i <= offsetByYtimes; i++) {
                let offsetY = startY + i;
                if (this.hasFreeSpaceForLabel(startX, offsetY, labelWidth, label.height))
                    return { x: startX, y: offsetY };
            }
            return null;
        }
        tryPutOnBottom(label, station) {
            let startY = station.maxBorderY + 1; // always the same for bottom side
            let labelWidth = this.geometry.labelWidthInCells(label.width);
            // first try set up label symmetrically by width relative to station
            let labelColumnOppositeToStation = Math.floor(labelWidth / 2);
            let midPointX = Math.floor((station.minBorderX + station.maxBorderX) / 2);
            let startX = midPointX - labelColumnOppositeToStation;
            return this.hasFreeSpaceForLabel(startX, startY, labelWidth, label.height) ?
                { x: startX, y: startY } : null;
        }
        tryPutOnBottomOffset(label, station) {
            let startY = station.maxBorderY + 1; // always the same for bottom side
            let labelWidth = this.geometry.labelWidthInCells(label.width);
            let labelColumnOppositeToStation = Math.floor(labelWidth / 2);
            let midPointX = Math.floor((station.minBorderX + station.maxBorderX) / 2);
            let startX = midPointX - labelColumnOppositeToStation;
            // move label right along bottom side of station until its first column occupy bottom-right neighboring cell 
            let temp = labelWidth - labelColumnOppositeToStation;
            let offsetByXtimes = labelWidth % 2 == 0 ? temp - 1 : temp;
            for (let i = 1; i <= offsetByXtimes; i++) {
                let offsetX = startX + i;
                if (this.hasFreeSpaceForLabel(offsetX, startY, labelWidth, label.height))
                    return { x: offsetX, y: startY };
            }
            // move label left along bottom side of station until its last column occupy bottom-left neighboring cell
            offsetByXtimes = labelWidth - labelColumnOppositeToStation;
            for (let i = 1; i <= offsetByXtimes; i++) {
                let offsetX = startX - i;
                if (this.hasFreeSpaceForLabel(offsetX, startY, labelWidth, label.height))
                    return { x: offsetX, y: startY };
            }
            return null;
        }
        tryPutOnTop(label, station) {
            let startY = station.minBorderY - label.height; // always the same for top side
            let labelWidth = this.geometry.labelWidthInCells(label.width);
            // first try set up label symmetrically by width relative to station
            let labelColumnOppositeToStation = Math.floor(labelWidth / 2);
            let midPointX = Math.floor((station.minBorderX + station.maxBorderX) / 2);
            let startX = midPointX - labelColumnOppositeToStation;
            return this.hasFreeSpaceForLabel(startX, startY, labelWidth, label.height) ?
                { x: startX, y: startY } : null;
        }
        tryPutOnTopOffset(label, station) {
            let startY = station.minBorderY - label.height; // always the same for top side
            let labelWidth = this.geometry.labelWidthInCells(label.width);
            let labelColumnOppositeToStation = Math.floor(labelWidth / 2);
            let midPointX = Math.floor((station.minBorderX + station.maxBorderX) / 2);
            let startX = midPointX - labelColumnOppositeToStation;
            // move label left along top side of station until its last column occupy top-left neighboring cell
            let offsetByXtimes = labelWidth - labelColumnOppositeToStation;
            for (let i = 1; i <= offsetByXtimes; i++) {
                let offsetX = startX - i;
                if (this.hasFreeSpaceForLabel(offsetX, startY, labelWidth, label.height))
                    return { x: offsetX, y: startY };
            }
            // move label right along top side of station until its first column occupy top-right neighboring cell 
            let temp = labelWidth - labelColumnOppositeToStation;
            offsetByXtimes = labelWidth % 2 == 0 ? temp - 1 : temp;
            for (let i = 1; i <= offsetByXtimes; i++) {
                let offsetX = startX + i;
                if (this.hasFreeSpaceForLabel(offsetX, startY, labelWidth, label.height))
                    return { x: offsetX, y: startY };
            }
            return null;
        }
        hasFreeSpaceForLabel(startX, startY, labelWidth, labelHeight) {
            for (let dx = 0; dx < labelWidth; dx++) {
                let x = startX + dx;
                for (let dy = 0; dy < labelHeight; dy++) {
                    let y = startY + dy;
                    if (!this.isCellAvailable({ x, y }))
                        return false;
                }
            }
            return true;
        }
        saveCellsOccupiedByLabel(label) {
            let labelWidth = this.geometry.labelWidthInCells(label.width);
            for (let dx = 0; dx < labelWidth; dx++) {
                for (let dy = 0; dy < label.height; dy++) {
                    let x = label.x + dx;
                    let y = label.y + dy;
                    this.occupiedCells.add(`${x}-${y}`);
                }
            }
        }
    }
    exports.LabelsManager = LabelsManager;
});
define("Utils/RoutePrioritizer", ["require", "exports", "Models/ConnectionModel"], function (require, exports, ConnectionModel_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RoutePrioritizer {
        calculatePriority(routeId, connection, subwayMap) {
            return connection.passingRoutes.sort((a, b) => {
                let first = subwayMap.getRoute(a).findConnection(connection);
                let second = subwayMap.getRoute(b).findConnection(connection);
                let result = this.sort(first, second);
                return result == 0 ? a - b : result; // if route priorities equal just compare routes' ids
            }).indexOf(routeId);
        }
        // TODO: may be take into account prev search in case of equal on nexts
        // or even calculate where from which side of connection (next or prev) remains most part of route and based on this info
        // compare both connections
        sort(first, second) {
            // 1. Find point of divergence of 2 routes
            let firstCurrent = first.next;
            let secondCurrent = second.next;
            while (firstCurrent != null && secondCurrent != null && firstCurrent.direction == secondCurrent.direction) {
                firstCurrent = firstCurrent.next;
                secondCurrent = secondCurrent.next;
            }
            // 2. Compare routes
            // 2.1 Point of divergence has been found
            if (firstCurrent != null && secondCurrent != null) {
                let priority1 = this.getPriority(firstCurrent.prev.direction, firstCurrent.direction);
                let priority2 = this.getPriority(secondCurrent.prev.direction, secondCurrent.direction);
                return this.compare(priority1, priority2);
            }
            // 2.2 Routes do not have point of divergence and they both finished in the same point
            if (firstCurrent == null && secondCurrent == null) {
                return 0;
            }
            // 2.3 Routes do not have point of divergence and but first one finished earlier than second one
            if (secondCurrent != null) {
                let priority = this.walkThroughRoute(second);
                // The idea here is that the route ended earlier should be less or greater (depending on the sign)
                // than the route that still continues.
                // So the ended route should be is closer to the edge during rendering
                return Math.sign(priority);
            }
            // 2.4 Routes do not have point of divergence and but second one finished earlier than first one
            if (firstCurrent != null) {
                let priority = this.walkThroughRoute(first);
                // The idea here same as above BUT we have to take into account that now second route is less or greater
                // than the first one, so sign should be reverted in order to avoid descending sorting
                return Math.sign(priority) * -1;
            }
            return 0;
        }
        compare(first, second) {
            if (first > second)
                return 1;
            else if (first < second)
                return -1;
            else
                return 0;
        }
        walkThroughRoute(connection) {
            let prev = connection.direction;
            let current = connection.next;
            while (current != null && prev == current.direction) {
                prev = current.direction;
                current = current.next;
            }
            if (current != null) {
                return this.getPriority(current.prev.direction, current.direction);
            }
            else {
                return 0;
            }
        }
        getPriority(current, next) {
            if (current == ConnectionModel_4.Direction.south) { // current moves from top to down
                switch (next) {
                    // came from left side
                    case ConnectionModel_4.Direction.northEast: return -3;
                    case ConnectionModel_4.Direction.east: return -2;
                    case ConnectionModel_4.Direction.southEast: return -1;
                    // came from right                 
                    case ConnectionModel_4.Direction.northWest: return 3;
                    case ConnectionModel_4.Direction.west: return 2;
                    case ConnectionModel_4.Direction.southWest: return 1;
                }
            }
            else if (current == ConnectionModel_4.Direction.north) { // current moves from down to top
                switch (next) {
                    case ConnectionModel_4.Direction.northEast: return 1;
                    case ConnectionModel_4.Direction.east: return 2;
                    case ConnectionModel_4.Direction.southEast: return 3;
                    case ConnectionModel_4.Direction.northWest: return -1;
                    case ConnectionModel_4.Direction.west: return -2;
                    case ConnectionModel_4.Direction.southWest: return -3;
                }
            }
            else if (current == ConnectionModel_4.Direction.west) {
                switch (next) {
                    case ConnectionModel_4.Direction.southWest: return -1;
                    case ConnectionModel_4.Direction.south: return -2;
                    case ConnectionModel_4.Direction.southEast: return -3;
                    case ConnectionModel_4.Direction.northWest: return 1;
                    case ConnectionModel_4.Direction.north: return 2;
                    case ConnectionModel_4.Direction.northEast: return 3;
                }
            }
            else if (current == ConnectionModel_4.Direction.east) {
                switch (next) {
                    case ConnectionModel_4.Direction.southEast: return 1;
                    case ConnectionModel_4.Direction.south: return 2;
                    case ConnectionModel_4.Direction.southWest: return 3;
                    case ConnectionModel_4.Direction.northWest: return -3;
                    case ConnectionModel_4.Direction.north: return -2;
                    case ConnectionModel_4.Direction.northEast: return -1;
                }
            }
            else if (current == ConnectionModel_4.Direction.southEast) {
                switch (next) {
                    case ConnectionModel_4.Direction.north: return -3;
                    case ConnectionModel_4.Direction.northEast: return -2;
                    case ConnectionModel_4.Direction.east: return -1;
                    // case Direction.northWest: return -4 or 4;
                    case ConnectionModel_4.Direction.south: return 1;
                    case ConnectionModel_4.Direction.southWest: return 2;
                    case ConnectionModel_4.Direction.west: return 3;
                }
            }
            else if (current == ConnectionModel_4.Direction.northWest) {
                switch (next) {
                    case ConnectionModel_4.Direction.north: return 1;
                    case ConnectionModel_4.Direction.northEast: return 2;
                    case ConnectionModel_4.Direction.east: return 3;
                    case ConnectionModel_4.Direction.south: return -3;
                    case ConnectionModel_4.Direction.southWest: return -2;
                    case ConnectionModel_4.Direction.west: return -1;
                }
            }
            else if (current == ConnectionModel_4.Direction.northEast) {
                switch (next) {
                    case ConnectionModel_4.Direction.south: return 3;
                    case ConnectionModel_4.Direction.southEast: return 2;
                    case ConnectionModel_4.Direction.east: return 1;
                    case ConnectionModel_4.Direction.north: return -1;
                    case ConnectionModel_4.Direction.northWest: return -2;
                    case ConnectionModel_4.Direction.west: return -3;
                }
            }
            else if (current == ConnectionModel_4.Direction.southWest) {
                switch (next) {
                    case ConnectionModel_4.Direction.south: return -1;
                    case ConnectionModel_4.Direction.southEast: return -2;
                    case ConnectionModel_4.Direction.east: return -3;
                    case ConnectionModel_4.Direction.north: return 3;
                    case ConnectionModel_4.Direction.northWest: return 2;
                    case ConnectionModel_4.Direction.west: return 1;
                }
            }
            return 0;
        }
        // Old code which should be reimplmented like getPriority but based on prev-current relationshio rather than current-next
        getPriorityBasedOnPrev(current, prev, referencePriorityValue) {
            if (current == ConnectionModel_4.Direction.south) { // current moves from top to down
                switch (prev) {
                    case ConnectionModel_4.Direction.east:
                    case ConnectionModel_4.Direction.northEast:
                    case ConnectionModel_4.Direction.southEast: // came from left side
                        return ++referencePriorityValue; // increment because the highest value will be drawn on left
                    case ConnectionModel_4.Direction.west:
                    case ConnectionModel_4.Direction.northWest:
                    case ConnectionModel_4.Direction.southWest: // came from right
                        return --referencePriorityValue; // decrement because the lowest value will be drawn on right
                }
            }
            if (current == ConnectionModel_4.Direction.north) { // current moves from down to top
                switch (prev) {
                    case ConnectionModel_4.Direction.east:
                    case ConnectionModel_4.Direction.northEast:
                    case ConnectionModel_4.Direction.southEast:
                        return --referencePriorityValue;
                    case ConnectionModel_4.Direction.west:
                    case ConnectionModel_4.Direction.northWest:
                    case ConnectionModel_4.Direction.southWest:
                        return ++referencePriorityValue;
                }
            }
            if (current == ConnectionModel_4.Direction.west) {
                switch (prev) {
                    case ConnectionModel_4.Direction.south:
                    case ConnectionModel_4.Direction.southWest:
                    case ConnectionModel_4.Direction.southEast:
                        return ++referencePriorityValue;
                    case ConnectionModel_4.Direction.north:
                    case ConnectionModel_4.Direction.northWest:
                    case ConnectionModel_4.Direction.northEast:
                        return --referencePriorityValue;
                }
            }
            if (current == ConnectionModel_4.Direction.east) {
                switch (prev) {
                    case ConnectionModel_4.Direction.south:
                    case ConnectionModel_4.Direction.southWest:
                    case ConnectionModel_4.Direction.southEast:
                        return --referencePriorityValue;
                    case ConnectionModel_4.Direction.north:
                    case ConnectionModel_4.Direction.northWest:
                    case ConnectionModel_4.Direction.northEast:
                        return ++referencePriorityValue;
                }
            }
            if (current == ConnectionModel_4.Direction.southEast) {
                switch (prev) {
                    case ConnectionModel_4.Direction.north:
                    case ConnectionModel_4.Direction.east:
                    case ConnectionModel_4.Direction.northEast:
                        return ++referencePriorityValue;
                    case ConnectionModel_4.Direction.south:
                    case ConnectionModel_4.Direction.west:
                    case ConnectionModel_4.Direction.southWest:
                        return --referencePriorityValue;
                }
            }
            if (current == ConnectionModel_4.Direction.northWest) {
                switch (prev) {
                    case ConnectionModel_4.Direction.north:
                    case ConnectionModel_4.Direction.east:
                    case ConnectionModel_4.Direction.northEast:
                        return --referencePriorityValue;
                    case ConnectionModel_4.Direction.south:
                    case ConnectionModel_4.Direction.west:
                    case ConnectionModel_4.Direction.southWest:
                        return ++referencePriorityValue;
                }
            }
            if (current == ConnectionModel_4.Direction.northEast) {
                switch (prev) {
                    case ConnectionModel_4.Direction.south:
                    case ConnectionModel_4.Direction.east:
                    case ConnectionModel_4.Direction.southEast:
                        return --referencePriorityValue;
                    case ConnectionModel_4.Direction.north:
                    case ConnectionModel_4.Direction.west:
                    case ConnectionModel_4.Direction.northWest:
                        return ++referencePriorityValue;
                }
            }
            if (current == ConnectionModel_4.Direction.southWest) {
                switch (prev) {
                    case ConnectionModel_4.Direction.south:
                    case ConnectionModel_4.Direction.east:
                    case ConnectionModel_4.Direction.southEast:
                        return ++referencePriorityValue;
                    case ConnectionModel_4.Direction.north:
                    case ConnectionModel_4.Direction.west:
                    case ConnectionModel_4.Direction.northWest:
                        return --referencePriorityValue;
                }
            }
            return referencePriorityValue;
        }
    }
    exports.RoutePrioritizer = RoutePrioritizer;
});
define("Utils/RoutesManager", ["require", "exports", "Utils/SVG", "Utils/RoutePrioritizer"], function (require, exports, SVG_3, RoutePrioritizer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RoutesManager {
        constructor(geometry, connetionCallback) {
            this.geometry = geometry;
            this.connetionCallback = connetionCallback;
            // map of cell keys (x-y) to station ids which uses these cells for connection
            this.occupiedCells = new Map();
            this.prioritizer = new RoutePrioritizer_1.RoutePrioritizer();
        }
        ;
        noRoutePassesThrough(cell, exceptStationId) {
            let key = `${cell.x}-${cell.y}`;
            // absent in occupied cells list? - cool, return true
            if (!this.occupiedCells.has(key))
                return true;
            // present in list but may be we have to ignore this for particular station? (for drag'n'drop algo)
            // need to check if we were provided by exception, if not then cell is definitely occupied
            if (exceptStationId == undefined)
                return false;
            // if exceptStationId is provided check its presence in a list for the cell
            // if present - handle cell as free because it falls in exception now and return true
            // otherwise - handle cell as occupied one and return false
            let stations = this.occupiedCells.get(key);
            return stations.has(exceptStationId);
        }
        clear() {
            this.occupiedCells.clear();
        }
        *processAll(subwayMap) {
            for (let route of subwayMap.consumeRoutes()) {
                let routeParent = SVG_3.SVG.createGroup({ id: `route-${route.id}`, "stroke-width": this.geometry.lineWidth });
                let colorGroups = [SVG_3.SVG.createGroup({ stroke: route.color[0] })];
                // case for 2-colored lines
                if (route.color.length == 2) {
                    let group = SVG_3.SVG.createGroup({ stroke: route.color[1], "stroke-dasharray": `${this.geometry.cellSize / 2}` });
                    colorGroups.push(group);
                }
                this.processOne(route, colorGroups, subwayMap);
                colorGroups.forEach(gr => routeParent.append(gr));
                yield routeParent;
            }
        }
        processOne(route, parents, subwayMap) {
            for (let connection of route.getConnections().values()) {
                let from = this.geometry.centrify(connection.from);
                let to = this.geometry.centrify(connection.to);
                let offset = this.calculateOffset(connection, route, subwayMap);
                let segment = this.geometry.offsetConnection(from, to, offset);
                this.connetionCallback(connection);
                //this.createSvgConnetion(segment, connInfo.data, connInfo.prev, connInfo.next);
                parents.forEach(p => p.appendChild(SVG_3.SVG.straightConnection(segment.from, segment.to)));
                this.storeCellsOccupiedByLine(segment, connection);
            }
        }
        calculateOffset(connection, route, subwayMap) {
            let fullDistance = this.geometry.distanceOfParallelLines(connection.passingRoutes.length);
            let radius = fullDistance / 2; // we need the half of distance because we draw lines by offsetting them by BOTH sides of central point
            let offsetFactor = this.prioritizer.calculatePriority(route.id, connection, subwayMap);
            return (-radius + this.geometry.halfOfLineWidth) + (offsetFactor * (this.geometry.lineWidth + this.geometry.distanceBetweenLines));
        }
        //private createSvgConnetion(segment: Segment, current: Connection, prev: Direction, next: Direction): SVGGElement {
        //    let isStraight = this.shouldBeStraightLine(current.direction, prev, next);
        //    this.connetionCallback(current, isStraight);
        //    return isStraight ?
        //        SVG.straightConnection(segment.from, segment.to) :
        //        this.createCurveConnection(segment, prev, next);
        //}
        //private createCurveConnection(segment: Segment, prev: Direction, next: Direction): SVGGElement {
        //    let controlPoint = this.getControlPoint(segment, prev, next);
        //    return SVG.curveConnection(segment.from, segment.to, controlPoint);
        //}
        //private shouldBeStraightLine(current: Direction, prev: Direction, next: Direction): boolean {
        //    return this.isStraightLine(current) || // current is a straight line, nothing to do                 
        //        (prev != null && this.isDiagonal(prev)) || // if current is a continuation of an diagonal then draw it as diagonal
        //        (next != null && this.isDiagonal(next)) || // or maybe current is first segment of diagonal line which will be further continued
        //        (prev == null && next == null); // last chance: current can be just a segment without next and prev neighboring segments
        //}
        //public getControlPoint(segment: Segment, prev: Direction, next: Direction): Point {
        //    if (next == Direction.vertical) {
        //        return { x: segment.to.x, y: segment.from.y };
        //    }
        //    if (next == Direction.horizontal) {
        //        return { x: segment.from.x, y: segment.to.y };
        //    }
        //    if (next == null && prev == Direction.horizontal) {
        //        return { x: segment.to.x, y: segment.from.y };
        //    }
        //    if (next == null && prev == Direction.vertical) {
        //        return { x: segment.from.x, y: segment.to.y };
        //    }
        //}
        //private isStraightLine(direction: Direction): boolean {
        //    return direction == Direction.horizontal ||
        //        direction == Direction.vertical;
        //}
        //private isDiagonal(direction: Direction): boolean {
        //    return direction == Direction.leftDiagonal ||
        //        direction == Direction.rightDiagonal;
        //}
        storeCellsOccupiedByLine(segment, connection) {
            let fromId = connection.from.id;
            let toId = connection.to.id;
            for (let point of this.geometry.digitalDiffAnalyzer(segment, connection.direction)) {
                let key = `${point.x}-${point.y}`;
                let storage = this.getStorage(key);
                storage.add(fromId);
                storage.add(toId);
            }
        }
        getStorage(key) {
            if (!this.occupiedCells.has(key)) {
                this.occupiedCells.set(key, new Set());
            }
            return this.occupiedCells.get(key);
        }
    }
    exports.RoutesManager = RoutesManager;
});
define("Utils/MapView", ["require", "exports", "Utils/SVG", "Utils/StationsManager", "Utils/LabelsManager", "Utils/RoutesManager"], function (require, exports, SVG_4, StationsManager_1, LabelsManager_1, RoutesManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MapView {
        constructor(canvas, geometry) {
            this.canvas = canvas;
            this.geometry = geometry;
            this.gridElementId = "grid";
            this.dragMode = false;
            this.stationsManager = new StationsManager_1.StationsManager(geometry);
            this.routesManager = new RoutesManager_1.RoutesManager(geometry, (c) => this.stationsManager.processConnection(c));
            this.labelsManager = new LabelsManager_1.LabelsManager(geometry, p => this.isCellFullyAvailable(p));
        }
        getCanvas() {
            return this.canvas;
        }
        getId(target) {
            return parseInt(target.getAttribute("data-id"));
        }
        isCellFullyAvailable(cell) {
            return this.withinBounds(cell.x, cell.y) &&
                this.routesManager.noRoutePassesThrough(cell) &&
                this.stationsManager.noStationSet(cell) &&
                this.labelsManager.noLabelSet(cell);
        }
        isCellFreeForDrop(cell, exceptStationId) {
            return this.withinBounds(cell.x, cell.y) &&
                this.routesManager.noRoutePassesThrough(cell, exceptStationId) &&
                this.stationsManager.noStationSet(cell, exceptStationId);
        }
        redrawGrid() {
            let oldGrid = document.getElementById(this.gridElementId);
            if (oldGrid != null)
                oldGrid.remove();
            let attrs = {
                'id': this.gridElementId,
                'stroke': '#4e4e4e',
                'stroke-width': '0.5',
                'visibility': 'visible'
            };
            let gridContainer = SVG_4.SVG.createGroup(attrs);
            // draw vertical lines
            let index = 0;
            for (let x = 0; x <= this.canvas.width.baseVal.value; x += this.geometry.cellSize) {
                let line = SVG_4.SVG.gridLine(x, 0, x, this.canvas.height.baseVal.value, `x${index}`);
                gridContainer.appendChild(line);
                index++;
            }
            // draw horizontal lines
            index = 0;
            for (let y = 0; y <= this.canvas.height.baseVal.value; y += this.geometry.cellSize) {
                let line = SVG_4.SVG.gridLine(0, y, this.canvas.width.baseVal.value, y, `y${index}`);
                gridContainer.appendChild(line);
                index++;
            }
            if (this.canvas.firstElementChild != null)
                this.canvas.firstElementChild.before(gridContainer);
            else
                this.canvas.appendChild(gridContainer);
        }
        toggleGrid() {
            let grid = document.getElementById(this.gridElementId);
            grid.getAttribute("visibility") == "visible" ?
                grid.setAttribute("visibility", "hidden") :
                grid.setAttribute("visibility", "visible");
        }
        highlightCell(x, y) {
            let cell = this.geometry.normalizeToGridCell(x, y);
            document.querySelectorAll("svg line.highlightCell")
                .forEach(l => l.classList.remove("highlightCell"));
            // lines which surrounds this cell by x axis
            let lineX1 = document.getElementById(`x${cell.x}`);
            if (lineX1 != null) {
                lineX1.classList.add("highlightCell");
            }
            let lineX2 = document.getElementById(`x${cell.x + 1}`);
            if (lineX2 != null) {
                lineX2.classList.add("highlightCell");
            }
            // lines which surrounds this cell by y axis
            let lineY1 = document.getElementById(`y${cell.y}`);
            if (lineY1 != null) {
                lineY1.classList.add("highlightCell");
            }
            let lineY2 = document.getElementById(`y${cell.y + 1}`);
            if (lineX2 != null) {
                lineY2.classList.add("highlightCell");
            }
            // let user know if he can put station to the current cell
            if (!this.dragMode) {
                if (this.isCellFullyAvailable(cell)) {
                    this.canvas.style.cursor = "cell";
                }
                else {
                    this.canvas.style.cursor = "not-allowed";
                }
            }
        }
        redrawMap(subwayMap) {
            this.eraseMap();
            this.drawRoutes(subwayMap);
            this.drawStations(subwayMap);
            this.drawLabels(subwayMap);
            this.stationsManager.completeProcessing();
            if (subwayMap.currentRoute != null)
                this.selectRoute(subwayMap.currentRoute);
        }
        selectRoute(route) {
            for (let station of route.stations) {
                let stationElement = document.getElementById(`station-${station.id}`);
                if (station != route.last)
                    stationElement.classList.add("selected");
                else
                    stationElement.classList.add("last-selected");
            }
        }
        deselectRoute(route) {
            for (let station of route.stations) {
                let stationElement = document.getElementById(`station-${station.id}`);
                stationElement.classList.remove("selected", "last-selected");
            }
        }
        trySetColor(routeId, color) {
            let route = document.getElementById(`route-${routeId}`);
            if (route == null)
                return;
            let groups = [...route.querySelectorAll("g")];
            if (groups.length > color.length) {
                groups[1].remove();
            }
            else if (groups.length < color.length) {
                let newGroup = groups[0].cloneNode(true);
                groups.push(newGroup);
                route.appendChild(newGroup);
            }
            groups[0].setAttribute("stroke", color[0]);
            // case for 2-colored lines
            if (color.length == 2) {
                groups[1].setAttribute("stroke", color[1]);
                groups[1].setAttribute("stroke-dasharray", `${this.geometry.cellSize / 2}`);
            }
        }
        eraseMap() {
            this.routesManager.clear();
            this.stationsManager.clear();
            this.labelsManager.clear();
            let node = this.canvas;
            while (node.lastElementChild.id != this.gridElementId) {
                node.lastElementChild.remove();
            }
        }
        drawRoutes(subwayMap) {
            for (let routeParent of this.routesManager.processAll(subwayMap)) {
                // insert routes after Grid BUT before stations
                this.canvas.firstChild.after(routeParent);
            }
        }
        drawStations(subwayMap) {
            for (let station of subwayMap.stations) {
                let shape = this.stationsManager.process(station);
                this.canvas.appendChild(shape);
            }
        }
        drawLabels(subwayMap) {
            for (let station of subwayMap.stations) {
                let stationBounds = this.stationsManager.getBounds(station.id);
                let label = this.labelsManager.process(station.label, stationBounds);
                this.canvas.appendChild(label);
            }
        }
        withinBounds(x, y) {
            return x >= 0 && x < this.geometry.gridSize &&
                y >= 0 && y < this.geometry.gridSize;
        }
    }
    exports.MapView = MapView;
});
define("Controllers/BackgroundController", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class BackgroundController {
        constructor(mapView) {
            this.initialize(mapView.getCanvas());
        }
        initialize(canvas) {
            let backgroundUrl = '';
            let backgroundCheckbox = document.getElementById("background-switch");
            backgroundCheckbox.addEventListener("click", () => {
                if (backgroundCheckbox.checked) {
                    canvas.classList.remove("bgd-color");
                    canvas.classList.add("bgd");
                    canvas.style.backgroundImage = backgroundUrl;
                }
                else {
                    canvas.classList.remove("bgd");
                    canvas.classList.add("bgd-color");
                    canvas.style.backgroundImage = '';
                }
            });
            document.getElementById("url").addEventListener("input", e => {
                if (e.target.value != "") {
                    document.getElementById("load").removeAttribute("disabled");
                    document.getElementById("clear").removeAttribute("disabled");
                }
                else {
                    document.getElementById("load").setAttribute("disabled", "disabled");
                    document.getElementById("clear").setAttribute("disabled", "disabled");
                }
            });
            document.getElementById("load").addEventListener("click", () => {
                let url = document.getElementById("url").value;
                canvas.classList.add("bgd");
                canvas.classList.remove("bgd-color");
                backgroundUrl = `url(${url})`;
                canvas.style.backgroundImage = backgroundUrl;
                canvas.style.backgroundSize = `${canvas.width.baseVal.value}px ${canvas.height.baseVal.value}px`;
                document.getElementById("load").setAttribute("disabled", "disabled");
                document.getElementById("clear").removeAttribute("disabled");
                backgroundCheckbox.removeAttribute("disabled");
                backgroundCheckbox.checked = true;
            });
            document.getElementById("clear").addEventListener("click", () => {
                canvas.classList.remove("bgd");
                canvas.classList.add("bgd-color");
                canvas.style.backgroundImage = '';
                document.getElementById("url").value = '';
                backgroundUrl = '';
                document.getElementById("clear").setAttribute("disabled", "disabled");
                backgroundCheckbox.setAttribute("disabled", "disabled");
                backgroundCheckbox.checked = false;
            });
        }
    }
    exports.BackgroundController = BackgroundController;
});
define("Controllers/ErrorController", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ErrorController {
        constructor() {
            this.timerId = -1;
            document.getElementById("close-alert").addEventListener("click", () => {
                document.getElementById("error").classList.remove("visible");
                document.getElementById("error").classList.add("invisible");
                clearTimeout(this.timerId);
            });
        }
        showError(errorMsg) {
            let alert = document.getElementById("error");
            document.getElementById("error").classList.remove("invisible");
            document.getElementById("error").classList.add("visible");
            alert.firstElementChild.textContent = errorMsg;
            this.timerId = setTimeout(() => {
                document.getElementById("error").classList.remove("visible");
                document.getElementById("error").classList.add("invisible");
            }, 5000);
        }
    }
    exports.ErrorController = ErrorController;
});
define("Controllers/IOController", ["require", "exports", "Controllers/ErrorController", "Utils/Strings"], function (require, exports, ErrorController_1, Strings_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class IOController extends ErrorController_1.ErrorController {
        constructor(subwayMap, mapView) {
            super();
            this.subwayMap = subwayMap;
            this.mapView = mapView;
            this.key = "saved_maps";
            let serializedMaps = window.localStorage.getItem(this.key);
            this.savedMaps = serializedMaps != null ? JSON.parse(serializedMaps) : [];
            this.initialize();
        }
        initialize() {
            // save map dialog handlers
            let mapNameTextBox = document.getElementById("map-name");
            mapNameTextBox.addEventListener("input", () => this.validate(mapNameTextBox));
            document.getElementById("openSave").addEventListener("click", () => this.openSaveDialog(mapNameTextBox));
            document.getElementById("save").addEventListener("click", e => this.handleSave(e, mapNameTextBox));
            document.getElementById("yes").addEventListener("click", () => this.confirm(mapNameTextBox));
            document.getElementById("no").addEventListener("click", () => this.hideConfirmation());
            // load map dialog handlers
            document.getElementById("openLoad").addEventListener("click", () => this.openLoadDialog());
            // export map
            document.getElementById("export").addEventListener("click", () => this.exportMap());
            // import map
            let fileInput = document.getElementById("importedMap");
            document.getElementById("import").addEventListener("click", () => fileInput.click());
            document.getElementById("importedMap").addEventListener("change", () => this.importMap(fileInput.files));
        }
        importMap(files) {
            if (files.length == 0)
                return;
            let file = files[0]; // import only first file from list
            var reader = new FileReader();
            reader.onload = e => {
                try {
                    let map = JSON.parse(e.target.result);
                    this.loadMap(map);
                }
                catch (e) {
                    this.showError(Strings_5.Strings.errorOnJsonParse(e.message));
                    console.error(e.message);
                }
            };
            reader.onerror = () => {
                reader.abort();
                this.showError(Strings_5.Strings.errorOnFileRead(reader.error.message));
            };
            reader.readAsText(file);
        }
        exportMap() {
            let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.subwayMap.toJson()));
            let downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "metro_map.json");
            document.body.appendChild(downloadAnchorNode); // required for firefox
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        }
        openLoadDialog() {
            let msgEl = document.getElementById("maps-msg");
            msgEl.innerText = this.savedMaps.length > 0 ? "Saved maps" : "No saved maps found";
            this.createList("maps-list-load", map => this.loadMap(map));
        }
        loadMap(map) {
            try {
                this.subwayMap = this.subwayMap.fromJson(map);
            }
            catch (e) {
                this.showError(Strings_5.Strings.errorOnMapParse(e.message));
                console.error(e.message);
            }
            this.mapView.redrawMap(this.subwayMap);
        }
        createList(parentId, clickHandler) {
            let parentUl = document.getElementById(parentId);
            this.clearNode(parentUl);
            for (let i = this.savedMaps.length - 1; i >= 0; i--) {
                let map = this.savedMaps[i];
                let li = document.createElement("li");
                let remove = document.createElement("button");
                remove.classList.add("btn", "btn-link", "remove-map");
                remove.addEventListener("click", e => {
                    e.stopPropagation();
                    li.remove();
                    this.savedMaps.splice(i, 1);
                    window.localStorage.setItem(this.key, JSON.stringify(this.savedMaps));
                });
                remove.innerText = "Remove";
                li.addEventListener("click", () => clickHandler(map));
                li.textContent = map.name;
                li.appendChild(remove);
                parentUl.appendChild(li);
            }
        }
        handleSave(event, mapNameTextBox) {
            if (mapNameTextBox.value == "" || mapNameTextBox.value == null) {
                mapNameTextBox.classList.add("is-invalid");
                event.stopPropagation();
                return;
            }
            let name = mapNameTextBox.value;
            let index = this.savedMaps.findIndex(a => a.name == name);
            // if map with provided name already exists then ask user for confirmation for overwritting
            if (index > -1) {
                event.stopPropagation();
                this.showConfirmation(name);
            }
            else {
                this.updateLocalStorage(name, index);
            }
        }
        confirm(mapNameTextBox) {
            this.hideConfirmation();
            let name = mapNameTextBox.value;
            let index = this.savedMaps.findIndex(a => a.name == name);
            this.updateLocalStorage(name, index);
        }
        hideConfirmation() {
            document.getElementById("confirmation").classList.add("d-none");
            document.getElementById("save").classList.remove("disabled");
            document.getElementById("map-name").removeAttribute("disabled");
        }
        showConfirmation(name) {
            document.querySelector("#confirmation p strong").innerHTML = name;
            document.getElementById("save").classList.add("disabled");
            document.getElementById("map-name").setAttribute("disabled", "disabled");
            document.getElementById("confirmation").classList.remove("d-none");
        }
        validate(mapNameTextBox) {
            if (mapNameTextBox.value == "" || mapNameTextBox.value == null) {
                mapNameTextBox.classList.add("is-invalid");
            }
            else {
                mapNameTextBox.classList.remove("is-invalid");
            }
        }
        openSaveDialog(mapNameTextBox) {
            // reset to defaults
            mapNameTextBox.value = "";
            mapNameTextBox.classList.remove("is-invalid");
            this.hideConfirmation();
            // build and view list of saved maps
            this.createList("maps-list", map => mapNameTextBox.value = map.name);
        }
        updateLocalStorage(name, index) {
            let jsonObject = this.subwayMap.toJson(name);
            if (index <= -1) {
                this.savedMaps.push(jsonObject);
            }
            else {
                this.savedMaps[index] = jsonObject;
            }
            window.localStorage.setItem(this.key, JSON.stringify(this.savedMaps));
        }
        clearNode(node) {
            while (node.hasChildNodes()) {
                node.lastChild.remove();
            }
        }
    }
    exports.IOController = IOController;
});
define("Controllers/RemovalController", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RemovalController {
        constructor(subwayMap, mapView) {
            this.subwayMap = subwayMap;
            this.mapView = mapView;
            this.initialize(mapView.getCanvas());
        }
        initialize(canvas) {
            document.addEventListener("click", () => this.hideMenu(), false);
            canvas.addEventListener("contextmenu", event => this.showMenu(event), false);
            document.getElementById("clearAll").addEventListener("click", () => {
                this.subwayMap.clear(true);
                this.mapView.redrawMap(this.subwayMap);
            });
        }
        hideMenu() {
            let menu = document.getElementById("stationMenu");
            if (menu != null) {
                menu.remove();
            }
        }
        showMenu(event) {
            this.hideMenu();
            // context menu should appear only at circle or rect click
            if (!(event.target instanceof SVGCircleElement) && !(event.target instanceof SVGRectElement)) {
                return;
            }
            event.preventDefault();
            let menu = this.buildMenu(event.target);
            menu.style.display = "block";
            menu.style.top = `${event.pageY}px`;
            menu.style.left = `${event.pageX}px`;
            document.body.appendChild(menu);
            return false;
        }
        getStation(element) {
            let id = this.mapView.getId(element);
            return this.subwayMap.getStation(id);
        }
        buildMenu(target) {
            let station = this.getStation(target);
            let menuTemplate = `<div class='dropdown-menu show' id='stationMenu'>` +
                `<button class='dropdown-item' type='button'>Remove station</button>` +
                `<div class='dropdown-divider'></div>`;
            for (let route of Array.from(this.subwayMap.routes).filter(r => r.passesThrough(station))) {
                menuTemplate += `<button class='dropdown-item' type='button' data-id='${route.id}' ` +
                    `style='color: ${route.color[0]}'>Remove from route ${route.id}</button>`;
            }
            menuTemplate += "</div>";
            let temp = document.createElement('div');
            temp.innerHTML = menuTemplate;
            let menu = temp.firstElementChild;
            return this.addEventHandlers(menu, station);
        }
        addEventHandlers(menu, targetStation) {
            // remove station menu item
            menu.children[0].addEventListener("click", () => {
                this.subwayMap.removeStation(targetStation);
                this.mapView.redrawMap(this.subwayMap);
            });
            // menu.children[1] -- is divider line
            if (menu.children.length > 2) {
                for (let i = 2; i < menu.children.length; i++) {
                    menu.children[i].addEventListener("click", e => {
                        let route = this.subwayMap.getRoute(this.mapView.getId(e.target));
                        this.subwayMap.removeConnection(route, targetStation);
                        this.mapView.redrawMap(this.subwayMap);
                    });
                }
            }
            return menu;
        }
    }
    exports.RemovalController = RemovalController;
});
define("Controllers/GridController", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GridController {
        constructor(subwayMap, mapView) {
            this.subwayMap = subwayMap;
            this.mapView = mapView;
            this.initialize(subwayMap, mapView.getCanvas());
            mapView.redrawGrid();
        }
        initialize(subwayMap, canvas) {
            let textInput = document.getElementById("gridSize");
            textInput.value = `${subwayMap.sizeSettings.gridSize}`;
            document.getElementById("update")
                .addEventListener("click", () => this.updateGrid());
            document.getElementById("grid-switch")
                .addEventListener("click", () => this.mapView.toggleGrid());
            canvas.addEventListener("mousemove", event => this.highlightCell(event));
            subwayMap.mapReloaded(() => this.onMapReloaded());
        }
        highlightCell(event) {
            let rect = (event.currentTarget).getBoundingClientRect();
            this.mapView.highlightCell(event.clientX - rect.left, event.clientY - rect.top);
        }
        onMapReloaded() {
            let input = document.getElementById("gridSize");
            input.value = `${this.subwayMap.sizeSettings.gridSize}`;
            this.mapView.redrawGrid();
        }
        updateGrid() {
            let input = document.getElementById("gridSize");
            input.classList.remove("is-invalid");
            let size = parseInt(input.value);
            if (Number.isNaN(size) || size <= 0 || size > 400) {
                input.classList.add("is-invalid");
            }
            else if (size === this.subwayMap.sizeSettings.gridSize) {
                return;
            }
            else {
                this.subwayMap.sizeSettings.gridSize = size;
                this.mapView.redrawGrid();
                this.mapView.redrawMap(this.subwayMap);
            }
        }
    }
    exports.GridController = GridController;
});
define("Controllers/RoutesController", ["require", "exports", "Controllers/ErrorController", "Utils/Strings"], function (require, exports, ErrorController_2, Strings_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RoutesController extends ErrorController_2.ErrorController {
        constructor(subwayMap, mapView) {
            super();
            this.subwayMap = subwayMap;
            this.mapView = mapView;
            this.routeIdCounter = 0;
            this.initialize(mapView.getCanvas());
        }
        removeRoute(route) {
            this.subwayMap.removeRoute(route);
            // if current/selected route was removed
            if (this.subwayMap.currentRoute == null) {
                let iterationResult = this.subwayMap.routes.next();
                this.routeSelectionChanged(iterationResult.done ? null : iterationResult.value);
            }
            this.mapView.redrawMap(this.subwayMap);
        }
        routeSelectionChanged(newSelection) {
            if (this.subwayMap.currentRoute != null) {
                this.mapView.deselectRoute(this.subwayMap.currentRoute);
            }
            if (newSelection != null) {
                this.mapView.selectRoute(newSelection);
                this.highlightPanel(newSelection);
            }
            this.subwayMap.currentRoute = newSelection;
        }
        initialize(canvas) {
            document.getElementById("addRoute")
                .addEventListener("click", () => this.addRoute());
            document.getElementById("lineWidth")
                .addEventListener("change", e => {
                let factor = parseFloat(e.target.value);
                this.subwayMap.sizeSettings.lineWidthFactor = factor;
                this.mapView.redrawMap(this.subwayMap);
            });
            canvas.addEventListener("click", event => this.addConnection(event));
            this.subwayMap.mapReloaded(() => this.onMapReloaded());
        }
        onMapReloaded() {
            this.routeIdCounter = this.subwayMap.routesCount;
            let panels = document.getElementById("panels");
            this.removeChildren(panels);
            for (let route of this.subwayMap.routes) {
                this.addControlPanel(route);
            }
            let lineWidths = document.getElementById("lineWidth");
            lineWidths.value = `${this.subwayMap.sizeSettings.lineWidthFactor}`;
        }
        removeChildren(element) {
            // remove all except basis element
            while (element.lastElementChild.id != "linePanel") {
                element.lastElementChild.remove();
            }
        }
        addRoute() {
            let id = this.routeIdCounter++;
            let route = this.subwayMap.newRoute(id);
            this.addControlPanel(route);
            this.routeSelectionChanged(route);
        }
        addConnection(event) {
            if (event.target instanceof SVGSVGElement ||
                event.target instanceof SVGLineElement ||
                event.target instanceof SVGPathElement ||
                event.target instanceof SVGTextPositioningElement) {
                return; // nothing to do if canvas, any line (grid or route) or text label was clicked
            }
            if (this.subwayMap.currentRoute == null) {
                this.showError(Strings_6.Strings.selectRouteMessage());
                return;
            }
            let station = this.subwayMap.getStation(this.mapView.getId(event.target));
            let result = this.subwayMap.newConnection(this.subwayMap.currentRoute, station);
            if (result.ok) {
                this.mapView.redrawMap(this.subwayMap);
            }
            else {
                this.showError(result.error);
            }
        }
        addControlPanel(route) {
            let clone = document.getElementById("linePanel").cloneNode(true);
            clone.setAttribute("id", `panel-${route.id}`); // save uniqueness of template element
            clone.classList.remove("d-none"); // make element visible
            let reverseButton = clone.querySelector("button[title='reverse route']");
            reverseButton.addEventListener("click", e => {
                route.reverse();
                this.routeSelectionChanged(route);
                e.stopPropagation();
            });
            let removeButton = clone.querySelector("button[title='delete route']");
            removeButton.addEventListener("click", e => {
                clone.remove();
                this.removeRoute(route);
                e.stopPropagation();
            });
            let colorsControl = clone.querySelector("input[type=text]");
            colorsControl.value = route.color.join("/");
            colorsControl.addEventListener("input", () => {
                let enteredColor = colorsControl.value.toLowerCase();
                let colors = (enteredColor || "").split("/");
                if (this.isValidColors(colors)) {
                    route.color = colors;
                    this.mapView.trySetColor(route.id, colors);
                    colorsControl.classList.remove("is-invalid");
                }
                else {
                    colorsControl.classList.add("is-invalid");
                }
            });
            clone.addEventListener("click", () => {
                if (this.subwayMap.currentRoute == route)
                    return;
                this.routeSelectionChanged(route);
            });
            document.getElementById("panels").appendChild(clone);
        }
        isValidColors(maybeColors) {
            if (maybeColors.length > 2)
                return false;
            for (let i = 0; i < maybeColors.length; i++) {
                if (Strings_6.Strings.isNullOrWhitespace(maybeColors[i]))
                    return false;
                let temp = new Option().style;
                temp.color = maybeColors[i];
                // valid color will be set otherwise it remains empty
                if (temp.color == "")
                    return false;
            }
            return true;
        }
        highlightPanel(route) {
            let panels = document.getElementById("panels").children;
            for (let i = 0; i < panels.length; i++) {
                panels[i].classList.remove("activated");
            }
            document.getElementById(`panel-${route.id}`).classList.add("activated");
        }
    }
    exports.RoutesController = RoutesController;
});
define("Controllers/StationsController", ["require", "exports", "Controllers/ErrorController", "Utils/Strings"], function (require, exports, ErrorController_3, Strings_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class StationsController extends ErrorController_3.ErrorController {
        constructor(subwayMap, mapView, geometry) {
            super();
            this.subwayMap = subwayMap;
            this.mapView = mapView;
            this.geometry = geometry;
            this.stationsCounter = 0;
            this.initialize(mapView, subwayMap);
        }
        initialize(mapView, subwayMap) {
            this.setupDrugNDrop(mapView, subwayMap);
            mapView.getCanvas()
                .addEventListener("click", event => this.handleClick(event));
            subwayMap.mapReloaded(() => this.onMapReloaded());
        }
        setupDrugNDrop(mapView, subwayMap) {
            let previous = null;
            let stationId = -1;
            mapView.getCanvas().addEventListener("mousedown", ev => {
                if (ev.target instanceof SVGCircleElement ||
                    ev.target instanceof SVGRectElement) {
                    stationId = mapView.getId(ev.target);
                    previous = this.getCell(ev);
                    mapView.dragMode = true;
                    mapView.getCanvas().style.cursor = "move";
                }
            });
            mapView.getCanvas().addEventListener("mousemove", ev => {
                if (stationId == -1)
                    return;
                let cell = this.getCell(ev);
                if (previous.x == cell.x && previous.y == cell.y)
                    return;
                if (mapView.isCellFreeForDrop(cell, stationId)) {
                    mapView.getCanvas().style.cursor = "move";
                    subwayMap.updateStationPosition(stationId, cell.x, cell.y);
                    mapView.redrawMap(subwayMap);
                }
                else {
                    mapView.getCanvas().style.cursor = "not-allowed";
                }
            });
            mapView.getCanvas().addEventListener("mouseup", ev => {
                stationId = -1;
                previous = null;
                mapView.dragMode = false;
            });
            // cancel browser's native Drag'n'Drop behavior
            mapView.getCanvas().ondragstart = () => false;
        }
        onMapReloaded() {
            this.stationsCounter = this.subwayMap.stationsCount;
        }
        handleClick(event) {
            this.hideEditPopup();
            if (event.target instanceof SVGTextPositioningElement) {
                this.renameStation(event);
            }
            else {
                this.tryAddStation(event);
            }
        }
        hideEditPopup() {
            let edit = document.getElementById("edit-label");
            if (edit != null) {
                edit.remove();
            }
        }
        renameStation(event) {
            let target = event.target instanceof SVGTextElement ? event.target : event.target.parentElement;
            let label = this.subwayMap.getStation(this.mapView.getId(target)).label;
            let center = this.geometry.centrify(label);
            let topLeft = this.geometry.rectTopLeftCorner(center, this.geometry.cellSize, this.geometry.cellSize);
            let editForm = this.prepareEditPopup(label);
            editForm.style.display = "block";
            editForm.style.left = `${topLeft.x}px`;
            editForm.style.top = `${topLeft.y}px`;
            document.body.appendChild(editForm);
        }
        prepareEditPopup(label) {
            let labelName = label.name.join("\n");
            let width = this.geometry.labelWidthInCells(label.width) * this.geometry.cellSize;
            let template = `<div id="edit-label" style="width: ${width}px;" class='dropdown-menu show'>` +
                `<textarea class="form-control" rows="${label.height}">${labelName}</textarea>` +
                `<button class='btn btn-outline-danger btn-sm' type='button'>&#10006;</button>` +
                `<button class='btn btn-outline-success btn-sm' type='button'>&#10004;</button>` +
                "</div>";
            let temp = document.createElement('div');
            temp.innerHTML = template;
            return this.addEventHandlers(temp.firstElementChild, label);
        }
        addEventHandlers(editForm, label) {
            // textarea
            let text = editForm.children[0];
            text.addEventListener("input", () => {
                if (Strings_7.Strings.isNullOrWhitespace(text.value)) {
                    editForm.children[2].classList.add('disabled'); // do not allow save empty value
                    return;
                }
                else {
                    editForm.children[2].classList.remove('disabled');
                    let linesCount = text.value.split(/\r\n|\r|\n/).length;
                    text.rows = linesCount;
                }
            });
            // cancel button
            editForm.children[1].addEventListener("click", () => {
                editForm.remove();
            });
            // save button
            editForm.children[2].addEventListener("click", () => {
                if (!Strings_7.Strings.isNullOrWhitespace(text.value)) {
                    label.setName(text.value.split(/\r\n|\r|\n/).map(s => s.trim()));
                    editForm.remove();
                    this.mapView.redrawMap(this.subwayMap);
                }
            });
            return editForm;
        }
        tryAddStation(event) {
            let cell = this.getCell(event);
            if (this.mapView.isCellFullyAvailable(cell)) {
                let id = this.stationsCounter++;
                this.subwayMap.newStation(id, cell.x, cell.y);
                this.mapView.redrawMap(this.subwayMap);
            }
            // if the cell does not contain another station but still occupied by something else show an error
            else if (event.target instanceof SVGSVGElement ||
                event.target instanceof SVGLineElement ||
                event.target instanceof SVGPathElement ||
                event.target instanceof SVGTextPositioningElement) {
                this.showError(Strings_7.Strings.occupiedCellError());
            }
        }
        getCell(event) {
            let rect = (event.currentTarget).getBoundingClientRect();
            return this.geometry.normalizeToGridCell(event.clientX - rect.left, event.clientY - rect.top);
        }
    }
    exports.StationsController = StationsController;
});
define("main", ["require", "exports", "Controllers/GridController", "Models/SubwayMap", "Controllers/BackgroundController", "Controllers/RoutesController", "Controllers/StationsController", "Utils/MapView", "Utils/Geometry", "Controllers/RemovalController", "Controllers/IOController"], function (require, exports, GridController_1, SubwayMap_1, BackgroundController_1, RoutesController_1, StationsController_1, MapView_1, Geometry_1, RemovalController_1, IOController_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    if (document.readyState !== 'loading') {
        initApp();
    }
    else {
        document.addEventListener("DOMContentLoaded", initApp);
    }
    function initApp() {
        let sizeSettings = getSizeSettings();
        let mapModel = new SubwayMap_1.SubwayMap(sizeSettings);
        let geometry = new Geometry_1.Geometry(sizeSettings);
        let map = createMapCanvas(mapModel.sizeSettings.canvasSize);
        let view = new MapView_1.MapView(map, geometry);
        let gridController = new GridController_1.GridController(mapModel, view);
        let backgroundController = new BackgroundController_1.BackgroundController(view);
        let routesController = new RoutesController_1.RoutesController(mapModel, view);
        let stationsController = new StationsController_1.StationsController(mapModel, view, geometry);
        let removalController = new RemovalController_1.RemovalController(mapModel, view);
        let ioController = new IOController_1.IOController(mapModel, view);
        function getSizeSettings() {
            let width = document.getElementById("canvas").clientWidth;
            let gridSize = 100;
            let canvasSize = width;
            let lineWidthFactor = 0.2;
            return new SubwayMap_1.SizeSettings(gridSize, canvasSize, lineWidthFactor);
        }
        function createMapCanvas(size) {
            let parent = document.getElementById("canvas");
            let map = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            map.setAttribute("width", size);
            map.setAttribute("height", size);
            map.setAttribute("class", "bgd-color");
            map.setAttribute("id", "map");
            parent.appendChild(map);
            return map;
        }
    }
});
//# sourceMappingURL=app.js.map