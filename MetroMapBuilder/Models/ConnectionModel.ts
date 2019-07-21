import { Station } from "./StationModel";
import { Route } from "./Route";

export class ConnectionsManager {
    private connections: Map<string, Connection> = new Map<string, Connection>();

    public get(from: Station, to: Station): Connection {
        let key = this.getKey(from, to);

        if (!this.connections.has(key)) {
            throw new Error(`No connection found between ${from.id} and ${to.id} stations`);
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
            this.connections.delete(key);
        }
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
    public constructor(private _from: Station, private _to: Station) {
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
}
