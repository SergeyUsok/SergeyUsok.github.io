define(["require", "exports", "./SingleLineController", "../Types", "./DrawingController"], function (require, exports, SingleLineController_1, Types_1, DrawingController_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LinesController {
        constructor(stations, backgroundUrl) {
            this.stations = stations;
            this.backgroundUrl = backgroundUrl;
            this.addLine = e => this.handleLineAddition();
            this.changeLine = ctrl => this.handleLineChange(ctrl);
            this.changeColor = (ctrl, c) => this.handleColorChange(ctrl, c);
            this.removeLine = ctrl => this.handleLineRemoval(ctrl);
            this.background = (e) => this.handleBackground(e);
            this.colors = [Types_1.Color.green, Types_1.Color.red, Types_1.Color.yellow, Types_1.Color.blue, Types_1.Color.orange, Types_1.Color.black, Types_1.Color.brown];
            this.lineControllers = [];
            this.initialize(this.backgroundUrl);
        }
        next() {
            // prepare stations
            for (let stId = 0; stId < this.stations.length; stId++) {
                this.stations[stId].id = stId;
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
                        this.stations[a].connections.push(connectionId);
                        this.stations[b].connections.push(connectionId);
                        ++connectionId;
                    }
                    else {
                        connection.lines.push(lineId);
                    }
                    a = b;
                }
            }
            return new DrawingController_1.DrawingController(this.stations, lines, connections);
        }
        dispose() {
            document.getElementById("addLine").removeEventListener("click", this.addLine);
            document.getElementById("background-switch2").removeEventListener("click", this.background);
            document.getElementById("background-switch2").setAttribute("disabled", "disabled");
            document.getElementById("map").style.backgroundImage = "";
            document.getElementById("map").classList.remove("bgd");
            document.getElementById("map").classList.add("bgd-color");
            for (let i = 0; i < this.lineControllers.length; i++) {
                this.lineControllers[i].dispose();
            }
        }
        handleBackground(e) {
            let checkbox = e.target;
            let map = document.getElementById("map");
            if (checkbox.checked) {
                map.classList.remove("bgd-color");
                map.classList.add("bgd");
                map.style.backgroundImage = this.backgroundUrl;
            }
            else {
                map.classList.remove("bgd");
                map.classList.add("bgd-color");
                map.style.backgroundImage = "";
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
        initialize(background) {
            document.getElementById("addLine").addEventListener("click", this.addLine);
            let backgroundCheckbox = document.getElementById("background-switch2");
            let map = document.getElementById("map");
            if (background != null) {
                backgroundCheckbox.addEventListener("click", this.background);
            }
            else {
                backgroundCheckbox.setAttribute("disabled", "disabled");
            }
            if (map.style.backgroundImage == background) {
                backgroundCheckbox.checked = true;
            }
            else {
                backgroundCheckbox.checked = false;
            }
        }
    }
    exports.LinesController = LinesController;
});
//# sourceMappingURL=LinesController.js.map