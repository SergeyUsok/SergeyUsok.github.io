
export class Strings {

    public static get defaultColor(): string {
        return "red";
    }

    public static get empty(): string {
        return "";
    }

    public static defaultLabel(id: number): string {
        return `Station ${id}`;
    }

    public static noConnectionFound(fromId: number, toId: number): string {
        return `No connection found between ${fromId} and ${toId} stations`;
    }

    public static loopsAreNotAllowedError(stationId: number, label: string): string {
        return `Loop connections between same station are not allowed. Station Id: ${stationId}, Label: ${label}`;
    }

    public static connectionExistsError(label1: string, id1: number, label2: string, id2: number): string {
        return `Connection between ${label1} (id: ${id1}) and ${label2} (id: ${id2}) already exist for selected route`;
    }

    public static get selectRouteMessage() {
        return "In order to draw connection select the route you want to plot";
    }
}