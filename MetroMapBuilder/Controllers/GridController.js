define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GridController {
        constructor(subwayMap, mapView) {
            this.subwayMap = subwayMap;
            this.mapView = mapView;
            this.initialize(subwayMap, mapView.getCanvas());
            mapView.redrawGrid();
        }
        initialize(subwayMap, canvas) {
            let textInput = document.getElementById("gridSize");
            textInput.value = `${subwayMap.sizeSettings.gridSize}`;
            let label = document.getElementById("sizeLabel");
            label.textContent = `${subwayMap.sizeSettings.gridSize}X${subwayMap.sizeSettings.gridSize}`;
            document.getElementById("update")
                .addEventListener("click", () => this.updateGrid());
            document.getElementById("grid-switch")
                .addEventListener("click", () => this.mapView.toggleGrid());
            canvas.addEventListener("mousemove", event => this.highlightCell(event));
            subwayMap.mapReloaded(() => this.onMapReloaded());
        }
        highlightCell(event) {
            let rect = (event.currentTarget).getBoundingClientRect();
            this.mapView.highlightCell(event.clientX - rect.left, event.clientY - rect.top);
        }
        onMapReloaded() {
            let input = document.getElementById("gridSize");
            input.value = `${this.subwayMap.sizeSettings.gridSize}`;
            let label = document.getElementById("sizeLabel");
            label.textContent = `${this.subwayMap.sizeSettings.gridSize}X${this.subwayMap.sizeSettings.gridSize}`;
            this.mapView.redrawGrid();
        }
        updateGrid() {
            let input = document.getElementById("gridSize");
            input.classList.remove("is-invalid");
            let size = parseInt(input.value);
            if (Number.isNaN(size) || size <= 0 || size > 400) {
                input.classList.add("is-invalid");
            }
            else if (size === this.subwayMap.sizeSettings.gridSize) {
                return;
            }
            else {
                this.subwayMap.sizeSettings.gridSize = size;
                let label = document.getElementById("sizeLabel");
                label.textContent = `${this.subwayMap.sizeSettings.gridSize}X${this.subwayMap.sizeSettings.gridSize}`;
                this.mapView.redrawGrid();
                this.mapView.redrawMap(this.subwayMap);
            }
        }
    }
    exports.GridController = GridController;
});
//# sourceMappingURL=GridController.js.map