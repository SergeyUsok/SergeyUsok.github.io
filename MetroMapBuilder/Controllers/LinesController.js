define(["require", "exports", "./SingleLineController", "../Types"], function (require, exports, SingleLineController_1, Types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LinesController {
        constructor(map, stations) {
            this.map = map;
            this.stations = stations;
            this.addLine = e => this.handleLineAddition();
            this.changeLine = ctrl => this.handleLineChange(ctrl);
            this.changeColor = (ctrl, c) => this.handleColorChange(ctrl, c);
            this.removeLine = ctrl => this.handleLineRemoval(ctrl);
            this.colors = [Types_1.Color.green, Types_1.Color.red, Types_1.Color.yellow, Types_1.Color.blue, Types_1.Color.orange, Types_1.Color.black, Types_1.Color.brown];
            this.lineControllers = [];
            document.getElementById("addLine").addEventListener("click", this.addLine);
        }
        next() {
            throw new Error("Method not implemented.");
        }
        dispose() {
            document.getElementById("addLine").removeEventListener("click", this.addLine);
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
            toRemove.dispose();
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
    }
    exports.LinesController = LinesController;
});
//# sourceMappingURL=LinesController.js.map