
export class Metadata {
    public stations: StationMetadata[] = [];
    public routes: RouteMetadata[] = [];
    public labels: LabelMetadata[] = [];
    public lineWidthFactor: number = 0.2;
    public gridConfig: GridSettings;

    public currentRoute: RouteMetadata = null;

    private connectionsCache: ConnectionCache = new ConnectionCache();

    public constructor(gridConfig: GridSettings) {
        this.gridConfig = gridConfig;
    }

    // Route API
    public newRoute(id: number): RouteMetadata {
        let newRoute = new RouteMetadata(id, this.connectionsCache);
        this.routes.push(newRoute);
        return newRoute;
    }

    public getRoute(id: number): RouteMetadata {
        for (let i = 0; i < this.routes.length; i++) {
            if (this.routes[i].id == id)
                return this.routes[i];
        }
    }

    public removeRoute(id: number): void {
        let newArr = [];

        for (let i = 0; i < this.routes.length; i++) {
            let route = this.routes[i];

            if (route.id != id)
                newArr.push(route);
        }

        this.routes = newArr;
    }

    // Station API
    public newStation(id: number, x: number, y: number): StationMetadata {
        let newStation = new StationMetadata(id, x, y);
        this.stations.push(newStation);
        return newStation;
    }

    public getStation(id: number): StationMetadata {
        for (let i = 0; i < this.stations.length; i++) {
            if (this.stations[i].id == id)
                return this.stations[i];
        }
    }

    public removeStation(station: StationMetadata): void {
        let index = this.stations.indexOf(station);

        // 1. remove from general stations array
        if (index > -1)
            this.stations.splice(index, 1);

        // 2. remove from any route referenced to this station and from connection cache under the hood
        this.routes.forEach(route => route.removeConnection(station));
    }

    // Connection API
    public newConnection(route: RouteMetadata, station: StationMetadata) {
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

    public removeConnection(route: RouteMetadata, station: StationMetadata): void {
        route.removeConnection(station);
    }
}

export class StationMetadata {
    public label: LabelMetadata = null;

    public constructor(private _id: number, private _x: number, private _y: number) {
        this.label = new LabelMetadata(`Station ${_id}`);
    }

    public get id(): number {
        return this._id;
    }

    public get x(): number {
        return this._x;
    }

    public get y(): number {
        return this._y;
    }   

    public updateLabel(): void {

    }
}

export class RouteMetadata {
    private _stations: StationMetadata[] = [];

    public constructor(private _id: number, private connectionCache: ConnectionCache) {
    }

    public color: string = "red"; // default color

    public get id(): number {
        return this._id;
    }

    public get first(): StationMetadata {
        return this._stations.length > 0 ? this._stations[0] : null;
    }

    public get last(): StationMetadata {
        return this._stations.length > 0 ? this._stations[this._stations.length - 1] : null;
    }

    public * getConnections(): IterableIterator<Connection> {
        for (let i = 0; i < this._stations.length - 1; i++) {
            let from = this._stations[i];
            let to = this._stations[i + 1];
            yield this.connectionCache.get(from, to);
        }
    }

    public passesThrough(station: StationMetadata): boolean {
        return this._stations.indexOf(station) > -1;
    }

    public addConnection(station: StationMetadata): boolean {
        this._stations.push(station);
        return true;
    }

    public removeConnection(station: StationMetadata): void {
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

export class LabelMetadata {
    public name: string[];

    public constructor(...name: string[]) {
        this.name = name;
    }
}

export class Connection {
    private passingRoutes: RouteMetadata[] = [];

    public constructor(private _from: StationMetadata, private _to: StationMetadata) {
    }

    public get from(): StationMetadata {
        return this._from;
    }

    public get to(): StationMetadata {
        return this._to;
    }

    public get routesCount(): number {
        return this.passingRoutes.length;
    }

    public addPassingRoute(route: RouteMetadata): boolean {
        if (this.passingRoutes.indexOf(route) <= -1) {
            this.passingRoutes.push(route);
            return true;
        }

        return false;
    }

    public removePassingRoute(route: RouteMetadata): void {
        let index = this.passingRoutes.indexOf(route);
        if (index > -1) {
            this.passingRoutes.splice(index, 1);
        }
    }

    public routeOrder(route: RouteMetadata): number {
        return this.passingRoutes.sort(function (a, b) { return a.id - b.id })
                                .indexOf(route);
    }
}

export class GridSettings {
    constructor(public gridSize: number, public canvasSize: number) {

    }
}


class ConnectionCache {
    private connections: Map<string, Connection> = new Map<string, Connection>();

    public get(from: StationMetadata, to: StationMetadata): Connection {
        let key = this.getKey(from, to);

        if (!this.connections.has(key)) {
            console.error(`No connection found between ${from.id} and ${to.id} stations`);
            throw new Error(`No connection found between ${from.id} and ${to.id} stations`);
        }

        return this.connections.get(key);
    }

    public add(from: StationMetadata, to: StationMetadata, route: RouteMetadata): boolean {
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

    public remove(from: StationMetadata, to: StationMetadata, route: RouteMetadata): void {
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

    private getKey(from: StationMetadata, to: StationMetadata): string {
        if (from.id > to.id) {
            return `${to.id}-${from.id}`
        }

        return `${from.id}-${to.id}`;
    }
}