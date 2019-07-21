import { Station } from "./StationModel";
import { Route } from "./Route";
import { ConnectionsManager } from "./ConnectionModel";

export class SizeSettings {
    constructor(public gridSize: number, public canvasSize: number, public lineWidthFactor: number) {

    }
}

export class SubwayMap {
    private _stations: Station[] = [];
    private _routes: Route[] = [];
    private connectionsCache: ConnectionsManager = new ConnectionsManager();

    public constructor(private _sizeSettings: SizeSettings) {
    }

    // Getters API
    public currentRoute: Route = null;

    public get sizeSettings() {
        return this._sizeSettings;
    }

    public get stations() {
        return this._stations;
    }

    public get routes() {
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
    public newConnection(route: Route, station: Station) {
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
            }
        }
        else {
            return {
                error: `Connection between ${route.last.label.name.join(" ")} (id: ${route.last.id}) and ` +
                       `${station.label.name.join(" ")} (id: ${station.id}) already exist for selected route`,
                ok: false
            }
        }        
    }

    public removeConnection(route: Route, station: Station): void {
        route.removeConnection(station);
    }
}