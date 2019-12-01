import { Station } from "./StationModel";
import { Connection, ConnectionsManager } from "./ConnectionModel";
import { Strings } from "../Utils/Strings";

export class Route {
    private _stations: Station[] = [];
    private _connections: Connection[] = null;

    public constructor(private _id: number, private connectionCache: ConnectionsManager) {
    }

    public color: string[] = [Strings.defaultColor];

    public get id(): number {
        return this._id;
    }

    public get first(): Station {
        return this._stations.length > 0 ? this._stations[0] : null;
    }

    public get last(): Station {
        return this._stations.length > 0 ? this._stations[this._stations.length - 1] : null;
    }

    public get isInitialized(): boolean {
        return this._connections != null;
    }

    public get stations(): Station[] {
        return this._stations;
    }

    public reverse(): void {
        this._stations = this._stations.reverse();
    }

    public findConnection(connection: Connection): Connection {
        if (this._connections == null) {
            let reversed = this.isReversedRelativeTo(connection);
            this._connections = this.generateConnections(reversed);
        }

        return this._connections.find(c => c.from == connection.from && c.to == connection.to);
    }

    public getConnections(): Connection[] {
        if (this._connections == null)
            this._connections = this.generateConnections();
        return this._connections;
    }

    public passesThrough(station: Station): boolean {
        return this._stations.indexOf(station) > -1;
    }

    public addConnection(station: Station): boolean {
        this._stations.push(station);
        return true;
    }

    public removeConnection(station: Station): void {
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

    public reset(): void {
        this._connections = null;
    }

    private generateConnections(reverse?: boolean): Connection[] {
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
            let current = new Connection(from, to, Array.from(routes), prev);
            result.push(current);
            prev = current;
            start = getNext(start);
        }
        return result;
    }

    private reconnect(): void {
        if (this._stations.length <= 1)
            return;

        for (let i = 0; i < this._stations.length - 1; i++) {
            let from = this._stations[i];
            let to = this._stations[i + 1];
            this.connectionCache.add(from, to, this);
        }
    }

    // Since ringed lines are possible we have to check entire array because same station might be met several times
    private isReversedRelativeTo(connection: Connection): boolean {
        for (let i = 0; i < this._stations.length; i++) {
            if (this._stations[i] != connection.from)
                continue;

            if (i != 0 && this._stations[i - 1] == connection.to)
                return true; // to has lower index than from, reverse is required

            if (i != this._stations.length - 1 && this._stations[i + 1] == connection.to)
                return false; // to has greater index than from, reverse is not required
        }

        throw new Error(`Cannot find connection between ${connection.from.id} and ${connection.to.id} on route ${this.id}`);
    }
}
