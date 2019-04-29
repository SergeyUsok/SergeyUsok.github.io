define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LinesController {
        constructor(map, stations) {
            this.map = map;
            this.stations = stations;
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
                stations[i].circle.addEventListener("click", this.handleClick);
            }
            document.getElementById("addLine").addEventListener("click", this.addLine);
            document.getElementById("removeLine").addEventListener("click", this.removeLine);
            document.getElementById("changeColor").addEventListener("click", this.changeColor);
            document.getElementById("chooseLine").addEventListener("click", this.chooseLine);
        }
        handleClick(event) {
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