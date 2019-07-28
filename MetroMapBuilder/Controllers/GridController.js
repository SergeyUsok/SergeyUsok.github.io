define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GridController {
        constructor(subwayMap, mapView) {
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
                .addEventListener("click", () => this.updateGrid(subwayMap));
            document.getElementById("grid-switch")
                .addEventListener("click", () => this.mapView.toggleGrid());
            canvas.addEventListener("mousemove", event => this.highlightCell(event));
        }
        highlightCell(event) {
            let rect = (event.currentTarget).getBoundingClientRect();
            this.mapView.highlightCell(event.clientX - rect.left, event.clientY - rect.top);
        }
        updateGrid(metadata) {
            let input = document.getElementById("gridSize");
            input.classList.remove("is-invalid");
            let size = parseInt(input.value);
            if (Number.isNaN(size) || size <= 0 || size > 400) {
                input.classList.add("is-invalid");
            }
            else if (size === metadata.sizeSettings.gridSize) {
                return;
            }
            else {
                metadata.sizeSettings.gridSize = size;
                let label = document.getElementById("sizeLabel");
                label.textContent = `${metadata.sizeSettings.gridSize}X${metadata.sizeSettings.gridSize}`;
                this.mapView.redrawGrid();
                this.mapView.redrawMap(metadata);
            }
        }
    }
    exports.GridController = GridController;
});
//# sourceMappingURL=GridController.js.map