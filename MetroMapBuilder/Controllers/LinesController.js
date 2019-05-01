define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LinesController {
        constructor(map, stations) {
            this.map = map;
            this.stations = stations;
            this.currentFrom = null;
            this.currentTo = null;
            this.selectStation = e => this.handleClick(e);
            this.deselectStation = e => this.handleRightClick(e);
            this.currentLine = -1;
            this.lineColors = [];
            this.connections = [];
            this.initialize(stations);
        }
        next() {
            throw new Error("Method not implemented.");
        }
        dispose() {
            throw new Error("Method not implemented.");
        }
        initialize(stations) {
            for (var i = 0; i < stations.length; i++) {
                stations[i].circle.addEventListener("click", this.selectStation);
                stations[i].circle.addEventListener("contextmenu", this.deselectStation);
            }
            document.getElementById("addLine").addEventListener("click", this.addLine);
            document.getElementById("removeLine").addEventListener("click", this.removeLine);
            document.getElementById("changeColor").addEventListener("click", this.changeColor);
            document.getElementById("chooseLine").addEventListener("click", this.chooseLine);
        }
        handleClick(event) {
            var selected = this.stations.find((s, index, st) => event.target == s.circle);
            if (this.currentFrom == null) {
                this.currentFrom = selected;
                return;
            }
            this.currentTo = selected;
            this.addConnection();
        }
        handleRightClick(event) {
        }
        addConnection() {
        }
        addLine() {
        }
        removeLine() {
        }
        changeColor() {
        }
        chooseLine() {
        }
    }
    exports.LinesController = LinesController;
});
//# sourceMappingURL=LinesController.js.map