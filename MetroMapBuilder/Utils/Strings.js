define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Strings {
        static get defaultColor() {
            return "red";
        }
        static get empty() {
            return "";
        }
        static defaultLabel(id) {
            return `Station ${id}`;
        }
        static noConnectionFound(fromId, toId) {
            return `No connection found between ${fromId} and ${toId} stations`;
        }
        static loopsAreNotAllowedError(stationId, label) {
            return `Loop connections between same station are not allowed. Station Id: ${stationId}, Label: ${label}`;
        }
        static connectionExistsError(label1, id1, label2, id2) {
            return `Connection between ${label1} (id: ${id1}) and ${label2} (id: ${id2}) already exist for selected route`;
        }
        static selectRouteMessage() {
            return "No route has been selected. Select route first on routes panel in order to draw them";
        }
        static nullOrUndefinedStation() {
            return "Provded station object is null or undefined";
        }
        static missingPropertyOn(property, obj) {
            return `Invalid object structure. Missing '${property}' property on ${obj}`;
        }
        static errorOnFileRead(msg) {
            return `Error occured while reading file: ${msg}`;
        }
        static errorOnJsonParse(msg) {
            return `Error occurred while trying to parse JSON: ${msg}`;
        }
        static errorOnMapParse(msg) {
            return `Error occurred while trying to load map from parsed JSON: ${msg}`;
        }
    }
    exports.Strings = Strings;
});
//# sourceMappingURL=Strings.js.map