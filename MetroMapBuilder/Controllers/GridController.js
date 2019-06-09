define(["require", "exports", "../Utility/SVG", "../Utility/Geometry", "./StationsController"], function (require, exports, SVG_1, Geometry_1, StationsController_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GridController {
        constructor(map) {
            this.map = map;
            this.update = () => this.handleUpdate();
            this.initialize(map);
        }
        next() {
            return new StationsController_1.StationsController(this.map);
        }
        dispose() {
            document.getElementById("update").removeEventListener("click", this.update);
        }
        draw() {
            let canvas = this.map;
            // draw vertical lines
            let index = 0;
            for (let x = 0; x <= canvas.width.baseVal.value; x += Geometry_1.Geometry.cellSize) {
                let line = SVG_1.SVG.gridLine(x, 0, x, canvas.height.baseVal.value);
                line.setAttribute("id", `x${index}`);
                canvas.appendChild(line);
                index++;
            }
            // draw horizontal lines
            index = 0;
            for (let y = 0; y <= canvas.height.baseVal.value; y += Geometry_1.Geometry.cellSize) {
                let line = SVG_1.SVG.gridLine(0, y, canvas.width.baseVal.value, y);
                line.setAttribute("id", `y${index}`);
                canvas.appendChild(line);
                index++;
            }
        }
        handleUpdate() {
            var input = document.getElementById("gridSize");
            input.classList.remove("is-invalid");
            var text = input.value;
            var size = parseInt(text);
            if (Number.isNaN(size) || size <= 0 || size > 400) {
                input.classList.add("is-invalid");
            }
            else if (size === Geometry_1.GridConfig.size) {
                return;
            }
            else {
                var map = document.getElementById("map");
                map.innerHTML = null;
                Geometry_1.GridConfig.size = size;
                var label = document.getElementById("sizeLabel");
                label.textContent = `${Geometry_1.GridConfig.size}X${Geometry_1.GridConfig.size}`;
                this.draw();
            }
        }
        initialize(map) {
            let canvas = map;
            Geometry_1.GridConfig.pixelSize = canvas.width.baseVal.value;
            Geometry_1.GridConfig.size = 40;
            var textInput = document.getElementById("gridSize");
            textInput.value = `${Geometry_1.GridConfig.size}`;
            var label = document.getElementById("sizeLabel");
            label.textContent = `${Geometry_1.GridConfig.size}X${Geometry_1.GridConfig.size}`;
            document.getElementById("update")
                .addEventListener("click", this.update);
            this.draw();
        }
    }
    exports.GridController = GridController;
});
//# sourceMappingURL=GridController.js.map