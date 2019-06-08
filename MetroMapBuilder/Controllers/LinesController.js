define(["require", "exports", "./SingleLineController", "../Types"], function (require, exports, SingleLineController_1, Types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LinesController {
        constructor(map, stations) {
            this.map = map;
            this.stations = stations;
            this.from = null;
            this.to = null;
            this.selectStation = e => this.handleSelectStation(e);
            this.deselectStation = e => this.handleDeselectStation(e);
            this.addLine = e => this.handleLineAddition();
            this.changeLine = ctrl => this.handleLineChange(ctrl);
            this.changeColor = (ctrl, c) => this.handleColorChange(ctrl, c);
            this.removeLine = ctrl => this.handleLineRemoval(ctrl);
            this.colors = [Types_1.Color.green, Types_1.Color.red, Types_1.Color.yellow, Types_1.Color.blue, Types_1.Color.orange, Types_1.Color.black, Types_1.Color.brown];
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
            if (this.from == null) {
                this.from = selected;
                // this.from.circle - highlight
                return;
            }
            this.to = selected;
            // this.to.circle - highlight
            this.currentController.connect(this.from, this.to);
        }
        handleDeselectStation(event) {
            this.from == null;
            // this.from.circle - remove highlight
        }
        handleLineAddition() {
            let lineController = new SingleLineController_1.SingleLineController(this.changeLine, this.changeColor, this.removeLine, this.colors);
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
            toRemove.dispose();
            this.lineControllers = newArr;
        }
        handleColorChange(lineCtrl, color) {
            // may be add complex logic to handle occupied colors
            // and notify about them other single line controllers
        }
        handleLineChange(selectedController) {
            if (this.currentController != null) {
                this.currentController.deselect();
                this.currentController.hideConnections();
            }
            if (selectedController != null)
                selectedController.showConnnections();
            this.currentController = selectedController;
        }
    }
    exports.LinesController = LinesController;
});
//# sourceMappingURL=LinesController.js.map