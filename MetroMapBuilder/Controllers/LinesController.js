define(["require", "exports", "./SingleLineController", "../Types", "./DrawingController"], function (require, exports, SingleLineController_1, Types_1, DrawingController_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LinesController {
        constructor(stations) {
            this.stations = stations;
            this.addLine = e => this.handleLineAddition();
            this.changeLine = (ctrl) => this.handleLineChange(ctrl);
            this.changeColor = (ctrl, c) => this.handleColorChange(ctrl, c);
            this.removeLine = (ctrl) => this.handleLineRemoval(ctrl);
            this.colors = [Types_1.Color.green, Types_1.Color.red, Types_1.Color.yellow, Types_1.Color.blue, Types_1.Color.orange, Types_1.Color.black, Types_1.Color.brown];
            this.lineControllers = [];
            this.initialize();
        }
        next() {
            // prepare stations
            let stations = [];
            for (let stId = 0; stId < this.stations.length; stId++) {
                this.stations[stId].id = stId;
                let station = {
                    id: stId, label: { x: 0, y: 0, name: [] },
                    x: this.stations[stId].x,
                    y: this.stations[stId].y,
                    connections: []
                };
                stations.push(station);
            }
            // prepare lines
            let lines = [];
            for (let lineId = 0; lineId < this.lineControllers.length; lineId++) {
                let line = this.lineControllers[lineId].toLine(lineId);
                lines.push(line);
            }
            // prepare connections
            let connections = [];
            let connectionId = 0;
            for (let lineId = 0; lineId < lines.length; lineId++) {
                let a = lines[lineId].stations[0];
                for (let stId = 1; stId < lines[lineId].stations.length; stId++) {
                    let b = lines[lineId].stations[stId];
                    let connection = connections.find(c => (c.a == a && c.b == b) || (c.a == b && c.b == a));
                    if (connection == undefined) {
                        connection = { id: connectionId, a: a, b: b, lines: [] };
                        connection.lines.push(lineId);
                        connections.push(connection);
                        // add connection info to stations
                        stations[a].connections.push(connectionId);
                        stations[b].connections.push(connectionId);
                        ++connectionId;
                    }
                    else {
                        connection.lines.push(lineId);
                    }
                    a = b;
                }
            }
            return new DrawingController_1.DrawingController(stations, lines, connections);
        }
        dispose() {
            document.getElementById("addLine").removeEventListener("click", this.addLine);
            for (let i = 0; i < this.lineControllers.length; i++) {
                this.lineControllers[i].dispose();
            }
        }
        handleLineAddition() {
            let lineController = new SingleLineController_1.SingleLineController(this.stations, this.changeLine, this.changeColor, this.removeLine, this.colors);
            this.lineControllers.push(lineController);
            this.handleLineChange(lineController);
        }
        handleLineRemoval(toRemove) {
            let newArr = [];
            for (let i = 0; i < this.lineControllers.length; i++) {
                let ctrl = this.lineControllers[i];
                if (ctrl != toRemove)
                    newArr.push(ctrl);
            }
            if (this.currentController == toRemove)
                this.handleLineChange(newArr.length > 0 ? newArr[0] : null);
            this.lineControllers = newArr;
        }
        handleColorChange(lineCtrl, color) {
            if (this.currentController == lineCtrl)
                this.currentController.redraw(); // redraw lines since color changed
            // may be add complex logic to handle occupied colors
            // and notify about them other single line controllers
        }
        handleLineChange(selectedController) {
            if (this.currentController != null) {
                this.currentController.deselect();
            }
            if (selectedController != null)
                selectedController.select();
            this.currentController = selectedController;
        }
        initialize() {
            document.getElementById("addLine").addEventListener("click", this.addLine);
        }
    }
    exports.LinesController = LinesController;
});
//# sourceMappingURL=LinesController.js.map