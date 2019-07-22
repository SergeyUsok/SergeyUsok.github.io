define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GridController {
        constructor(subwayMap, drawer) {
            this.drawer = drawer;
            this.initialize(subwayMap, drawer.getCanvas());
            drawer.redrawGrid();
        }
        initialize(subwayMap, canvas) {
            let textInput = document.getElementById("gridSize");
            textInput.value = `${subwayMap.sizeSettings.gridSize}`;
            let label = document.getElementById("sizeLabel");
            label.textContent = `${subwayMap.sizeSettings.gridSize}X${subwayMap.sizeSettings.gridSize}`;
            document.getElementById("update")
                .addEventListener("click", () => this.updateGrid(subwayMap));
            document.getElementById("grid-switch")
                .addEventListener("click", () => this.toggleGrid());
            canvas.addEventListener("mousemove", event => this.highlightCell(event));
        }
        highlightCell(event) {
            if (event.target instanceof SVGLineElement) {
                // get coords relative to svg canvas rather than just line ones
                let rect = (event.currentTarget).getBoundingClientRect();
                this.drawer.highlightCell(event.clientX - rect.left, event.clientY - rect.top);
            }
            else if (event.target instanceof SVGCircleElement) {
                this.drawer.highlightCell(event.target.cx.baseVal.value, event.target.cy.baseVal.value);
            }
            else {
                this.drawer.highlightCell(event.offsetX, event.offsetY);
            }
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
                this.drawer.redrawGrid();
                this.drawer.redrawMap(metadata);
            }
        }
        toggleGrid() {
            let grid = document.getElementById("grid");
            grid.getAttribute("visibility") == "visible" ?
                grid.setAttribute("visibility", "hidden") :
                grid.setAttribute("visibility", "visible");
        }
    }
    exports.GridController = GridController;
});
//# sourceMappingURL=GridController.js.map