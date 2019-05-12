define(["require", "exports", "./SingleLineController"], function (require, exports, SingleLineController_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LinesController {
        constructor(map, stations) {
            this.map = map;
            this.stations = stations;
            this.currentFrom = null;
            this.currentTo = null;
            this.selectStation = e => this.handleSelectStation(e);
            this.deselectStation = e => this.handleDeselectStation(e);
            this.colors = [Color.red, Color.yellow, Color.green, Color.blue, Color.brown, Color.orange, Color.black];
            this.lineControllers = [];
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
        }
        handleSelectStation(event) {
            var selected = this.stations.find((s, index, st) => event.target == s.circle);
            if (this.currentFrom == null) {
                this.currentFrom = selected;
                return;
            }
            this.currentTo = selected;
            this.addConnection();
        }
        handleDeselectStation(event) {
        }
        addConnection() {
        }
        addLine() {
            let lineController = new SingleLineController_1.SingleLineController(this.changeLine, this.changeColor, this.removeLine, this.colors);
            this.lineControllers.push(lineController);
        }
        removeLine(id) {
        }
        changeColor(id, color) {
        }
        changeLine(id) {
        }
    }
    exports.LinesController = LinesController;
});
//# sourceMappingURL=LinesController.js.map