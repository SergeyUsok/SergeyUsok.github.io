import { Station } from "./StationModel";
import { Connection, ConnectionsManager } from "./ConnectionModel";

export class Route {
    private _stations: Station[] = [];

    public constructor(private _id: number, private connectionCache: ConnectionsManager) {
    }

    public color: string = "red"; // default color

    public get id(): number {
        return this._id;
    }

    public get first(): Station {
        return this._stations.length > 0 ? this._stations[0] : null;
    }

    public get last(): Station {
        return this._stations.length > 0 ? this._stations[this._stations.length - 1] : null;
    }

    public *getConnections(): IterableIterator<Connection> {
        for (let i = 0; i < this._stations.length - 1; i++) {
            let from = this._stations[i];
            let to = this._stations[i + 1];
            yield this.connectionCache.get(from, to);
        }
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
        this.removeConnection(station); // recurcive removal for ring lines
    }

    private reconnect() {
        if (this._stations.length <= 1)
            return;

        for (let i = 0; i < this._stations.length - 1; i++) {
            let from = this._stations[i];
            let to = this._stations[i + 1];
            this.connectionCache.add(from, to, this);
        }
    }
}
