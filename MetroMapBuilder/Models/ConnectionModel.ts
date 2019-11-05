import { Station } from "./StationModel";
import { Route } from "./Route";
import { Strings } from "../Utils/Strings";

export class ConnectionsManager {
    
    private connections: Map<string, Connection> = new Map<string, Connection>();

    public get(from: Station, to: Station): Connection {
        let key = this.getKey(from, to);

        if (!this.connections.has(key)) {
            throw new Error(Strings.noConnectionFound(from.id, to.id));
        }

        return this.connections.get(key);
    }

    public add(from: Station, to: Station, route: Route): boolean {
        let key = this.getKey(from, to);

        if (this.connections.has(key)) {
            let connection = this.connections.get(key);
            return connection.addPassingRoute(route);
        }
        else {
            let connection = new Connection(from, to);
            this.connections.set(key, connection);
            from.onPositionChanged(key, () => connection.refresh());
            to.onPositionChanged(key, () => connection.refresh());
            return connection.addPassingRoute(route);
        }
    }

    public remove(from: Station, to: Station, route: Route): void {
        let key = this.getKey(from, to);

        if (!this.connections.has(key)) {
            return;
        }

        let connection = this.connections.get(key);
        connection.removePassingRoute(route);

        if (connection.routesCount == 0) {
            from.unsubscribe(key);
            to.unsubscribe(key);
            this.connections.delete(key);
        }
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
    private passingRoutes: Route[] = [];
    private _direction: Direction;

    public constructor(private _from: Station, private _to: Station) {
        this._direction = this.determineDirection(_from, _to);
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

    public get routesCount(): number {
        return this.passingRoutes.length;
    }

    public addPassingRoute(route: Route): boolean {
        if (this.passingRoutes.indexOf(route) <= -1) {
            this.passingRoutes.push(route);
            return true;
        }
        return false;
    }

    public removePassingRoute(route: Route): void {
        let index = this.passingRoutes.indexOf(route);
        if (index > -1) {
            this.passingRoutes.splice(index, 1);
        }
    }

    public routeOrder(route: Route): number {
        return this.passingRoutes.sort(function(a, b) { return a.id - b.id; })
                   .indexOf(route);
    }

    public refresh(): void {
        this._direction = this.determineDirection(this.from, this.to);
    }

    //private determineDirection(stationA: Station, stationB: Station): Direction {
    //    if (stationA.x == stationB.x && stationA.y < stationB.y)
    //        return Direction.south;

    //    if (stationA.x == stationB.x && stationA.y > stationB.y)
    //        return Direction.north;

    //    if (stationA.x < stationB.x && stationA.y == stationB.y)
    //        return Direction.east;

    //    if (stationA.x > stationB.x && stationA.y == stationB.y)
    //        return Direction.west;

    //    // first check diagonal drawing direction (moves from top to bottom or from bottom to top)
    //    // from top to Bottom case
    //    if (stationA.y < stationB.y) {
    //        if (stationA.x > stationB.x)
    //            return Direction.southWest;

    //        if (stationA.x < stationB.x)
    //            return Direction.southEast;
    //    }
    //    // from Bottom to top case
    //    else if (stationA.y > stationB.y) {
    //        if (stationA.x > stationB.x)
    //            return Direction.northWest;

    //        if (stationA.x < stationB.x)
    //            return Direction.northEast;
    //    }
    //}

    private determineDirection(stationA: Station, stationB: Station): Direction {
        if (stationA.x == stationB.x && stationA.y != stationB.y)
            return Direction.vertical;

        if (stationA.x != stationB.x && stationA.y == stationB.y)
            return Direction.horizontal;

        // first check if diagonal drawing direction (moves from top to bottom or from bottom to top)
        // from top to Bottom case
        if (stationA.y < stationB.y) {
            if (stationA.x > stationB.x)
                return Direction.rightDiagonal;

            if (stationA.x < stationB.x)
                return Direction.leftDiagonal;
        }
        // from Bottom to top case
        else if (stationA.y > stationB.y) {
            if (stationA.x > stationB.x)
                return Direction.leftDiagonal;

            if (stationA.x < stationB.x)
                return Direction.rightDiagonal;
        }

        return Direction.horizontal;
    }
}

export enum Direction {
    horizontal,
    vertical,
    leftDiagonal,
    rightDiagonal
}

// the idea here is that directions laying on the same line
// have absolute difference equal to 1, i.e. south and north both lay on vertical line
// and have diffrence Math.abs(0-1)=1 or Math.abs(1-0)=1 
//export enum Direction {
//    south = 0,
//    north = 1,

//    east = 3,
//    west = 4,

//    southEast = 6,
//    northWest = 7,

//    southWest = 9,
//    northEast = 10
//}
