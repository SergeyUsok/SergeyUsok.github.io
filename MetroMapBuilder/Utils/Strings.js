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
        static get selectRouteMessage() {
            return "In order to draw connection select the route you want to plot";
        }
    }
    exports.Strings = Strings;
});
//# sourceMappingURL=Strings.js.map