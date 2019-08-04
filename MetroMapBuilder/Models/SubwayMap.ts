import { Station } from "./StationModel";
import { Route } from "./Route";
import { ConnectionsManager } from "./ConnectionModel";
import { Strings } from "../Utils/Strings";

export class SizeSettings {
    constructor(public gridSize: number, public canvasSize: number, public lineWidthFactor: number) {

    }
}

export class SubwayMap {
    private _stations: Station[] = [];
    private _routes: Route[] = [];
    private connectionsCache: ConnectionsManager = new ConnectionsManager();
    private subscribers: (() => void)[] = [];

    public constructor(private _sizeSettings: SizeSettings) {
    }

    public mapReloaded(callback: () => void) {
        this.subscribers.push(callback);
    }

    // Getters API
    public currentRoute: Route = null;

    public name: string = ""; 

    public get sizeSettings(): SizeSettings {
        return this._sizeSettings;
    }

    public get stations(): Station[] {
        return this._stations;
    }

    public get routes(): Route[] {
        return this._routes;
    }

    // Route API
    public newRoute(id: number): Route {
        let newRoute = new Route(id, this.connectionsCache);
        this.routes.push(newRoute);
        return newRoute;
    }

    public getRoute(id: number): Route {
        for (let i = 0; i < this.routes.length; i++) {
            if (this.routes[i].id == id)
                return this.routes[i];
        }
    }

    public removeRoute(route: Route): void {
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
    public newStation(id: number, x: number, y: number): Station {
        let newStation = new Station(id, x, y);
        this.stations.push(newStation);
        return newStation;
    }

    public getStation(id: number): Station {
        for (let i = 0; i < this.stations.length; i++) {
            if (this.stations[i].id == id)
                return this.stations[i];
        }
    }

    public removeStation(station: Station): void {
        let index = this.stations.indexOf(station);

        // 1. remove from general stations array
        if (index > -1)
            this.stations.splice(index, 1);

        // 2. remove from any route referenced to this station and from connection cache under the hood
        this.routes.forEach(route => route.removeConnection(station));
    }

    // Connection API
    public newConnection(route: Route, station: Station): { error: string, ok: boolean } {
        if (station == null || station == undefined) {
            return {
                error: Strings.nullOrUndefinedStation(),
                ok: false
            };
        };

        if (route.last == null) {
            return {
                error: Strings.empty,
                ok: route.addConnection(station)
            };
        }

        if (route.last == station) {
            return {
                error: Strings.loopsAreNotAllowedError(station.id, station.label.name.join(" ")),
                ok: false
            };
        }

        let added = this.connectionsCache.add(route.last, station, route);

        if (added) {
            return {
                error: Strings.empty,
                ok: route.addConnection(station)
            }
        }
        else {
            return {
                error: Strings.connectionExistsError(route.last.label.name.join(" "), route.last.id,
                                                     station.label.name.join(" "), station.id),
                ok: false
            }
        }        
    }

    public removeConnection(route: Route, station: Station): void {
        route.removeConnection(station);
    }

    // Serialization API
    public toJson(name?: string): object {
        // Station ids will be unified and gaps between them will be removed so that ids will be placed in order
        // we need to store the map between actual id and unified one
        let stationIdsMap = new Map<number, number>();
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

    public fromJson(object: any): SubwayMap {
        this.validateMap(object);
        this.clear();

        try {
            let stationsMap = this.addStations(object);
            this.addRoutes(object, stationsMap);       
        } catch (e) {
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

    private notifyMapReloaded() {
        for (let i = 0; i < this.subscribers.length; i++) {
            this.subscribers[i]();
        }
    }

    // private methods
    private validateMap(object: any) {
        if (object.stations == undefined || object.stations.length == undefined)
            throw new Error(Strings.missingPropertyOn("stations", "map"));

        if (object.routes == undefined || object.routes.length == undefined)
            throw new Error(Strings.missingPropertyOn("routes", "map"));

        if (object.name == undefined)
            throw new Error(Strings.missingPropertyOn("name", "map"));

        if (object.settings.gridSize == undefined)
            throw new Error(Strings.missingPropertyOn("gridSize", "map"));

        if (object.settings.canvasSize == undefined)
            throw new Error(Strings.missingPropertyOn("canvasSize", "map"));

        if (object.settings.lineWidthFactor == undefined)
            throw new Error(Strings.missingPropertyOn("lineWidthFactor", "map"));
    }

    private addStations(object: any): Map<number, Station> {
        let stationsMap = new Map<number, Station>();
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

    private validateStation(stationObj: any): void {
        if (stationObj.id == undefined)
            throw new Error(Strings.missingPropertyOn("id", "station"));

        if (stationObj.x == undefined)
            throw new Error(Strings.missingPropertyOn("x", "station"));

        if (stationObj.y == undefined)
            throw new Error(Strings.missingPropertyOn("y", "station"));

        if (stationObj.label == undefined)
            throw new Error(Strings.missingPropertyOn("label", "station"));

        if (stationObj.label.x == undefined)
            throw new Error(Strings.missingPropertyOn("x", "label"));

        if (stationObj.label.y == undefined)
            throw new Error(Strings.missingPropertyOn("y", "label"));

        if (stationObj.label.name == undefined)
            throw new Error(Strings.missingPropertyOn("name", "label"));
    }

    private addRoutes(object: any, stationsMap: Map<number, Station>): void {
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

    private validateRoute(routeObj: any): void {
        if (routeObj.id == undefined)
            throw new Error(Strings.missingPropertyOn("id", "route"));

        if (routeObj.color == undefined)
            throw new Error(Strings.missingPropertyOn("color", "route"));

        if (routeObj.stations == undefined)
            throw new Error(Strings.missingPropertyOn("stations", "route"));
    }

    private prepareRoutes(stationIdsMap: Map<number, number>): any {
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

    private prepareStations(stationIdsMap: Map<number, number>) {
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
            }
            stationsInfo.push(serialized);
        }
        return stationsInfo;
    }

    private clear() {
        this._stations = [];
        this._routes = [];
        this.currentRoute = null;
        this.connectionsCache.clear();
    }
}