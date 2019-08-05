
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

    public static selectRouteMessage(): string {
        return "No route has been selected. Select route first on routes panel in order to draw them";
    }

    public static nullOrUndefinedStation(): string {
        return "Provded station object is null or undefined";
    }

    public static missingPropertyOn(property: string, obj: string): string {
        return `Invalid object structure. Missing '${property}' property on ${obj}`
    }

    public static errorOnFileRead(msg: string): string {
        return `Error occured while reading file: ${msg}`;
    }

    public static errorOnJsonParse(msg: string): string {
        return `Error occurred while trying to parse JSON: ${msg}`;
    }

    public static errorOnMapParse(msg: string): string {
        return `Error occurred while trying to load map from parsed JSON: ${msg}`;
    }

    public static isNullOrWhitespace(input) {
        if (typeof input === 'undefined' || input == null)
            return true;

        return input.replace(/\s/g, '').length < 1;
    }
}