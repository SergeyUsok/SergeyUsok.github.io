import { Station } from "./StationModel";
import { Route } from "./Route";
import { Strings } from "../Utils/Strings";

export class ConnectionsManager {
    // map of connection between 2 stations. i.e "1-2" to number of Route Ids passing through this connection
    private connections: Map<string, Set<number>> = new Map<string, Set<number>>();

    public get(from: Station, to: Station): Set<number> {
        let key = this.getKey(from, to);

        if (!this.connections.has(key)) {
            throw new Error(Strings.noConnectionFound(from.id, to.id));
        }

        return this.connections.get(key);
    }

    public add(from: Station, to: Station, route: Route): boolean {
        let key = this.getKey(from, to);

        if (this.connections.has(key)) {
            let connectionInfo = this.connections.get(key);
            if (connectionInfo.has(route.id)) // connection already exists
                return false;
            connectionInfo.add(route.id);
        }
        else {
            let connectionInfo = new Set<number>();
            connectionInfo.add(route.id);
            this.connections.set(key, connectionInfo);
        }
        return true;
    }

    public remove(from: Station, to: Station, route: Route): void {
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

    public removeEntireRoute(route: Route): void {
        for (let key of this.connections.keys()) {
            let routes = this.connections.get(key);
            if (routes.delete(route.id) && routes.size == 0)
                this.connections.delete(key);
        }
    }

    public getRouteAdjacentsMap(): Map<number, number> {
        let routeAdjacents = new Map<number, Set<number>>();
        for (let ids of this.connections.values()) {
            for (let id of ids) {
                if (!routeAdjacents.has(id)) {
                    routeAdjacents.set(id, new Set<number>());
                }
                ids.forEach(i => routeAdjacents.get(id).add(i));
            }
        }
        let result = new Map<number, number>();
        for (let keyValue of routeAdjacents) {
            result.set(keyValue[0], keyValue[1].size);
        }
        return result;
    }

    public clear(): void {
        this.connections.clear();
    }

    private getKey(from: Station, to: Station): string {
        if (from.id > to.id) {
            return `${to.id}-${from.id}`
        }

        return `${from.id}-${to.id}`;
    }
}

export class Connection {
    private _direction: Direction;
    private _next: Connection = null;
    private _prev: Connection = null;

    public constructor(private _from: Station, private _to: Station, private _passingRoutes: number[], prev: Connection) {
        this._direction = this.determineDirection(_from, _to);
        if (prev != null) {
            this._prev = prev;
            this._prev.addNext(this);
        }
    }

    public get direction(): Direction {
        return this._direction;
    }

    public get from(): Station {
        return this._from;
    }

    public get to(): Station {
        return this._to;
    }

    public get prev() {
        return this._prev;
    }

    public get next() {
        return this._next;
    }

    public get passingRoutes(): number[] {
        return this._passingRoutes;
    }
    
    private determineDirection(stationA: Station, stationB: Station): Direction {
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

    private addNext(next: Connection): void {
        this._next = next;
    }
}

 // the idea here is that directions laying on the same line
 // have absolute difference equal to 1, i.e. south and north both lay on vertical line
 // and have diffrence Math.abs(0-1)=1 or Math.abs(1-0)=1
export enum Direction {
    south = 0,
    north = 1,

    east = 3,
    west = 4,

    southEast = 6,
    northWest = 7,

    southWest = 9,
    northEast = 10
}
