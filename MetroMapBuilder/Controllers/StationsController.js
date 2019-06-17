define(["require", "exports", "../Utility/Geometry", "../Utility/SVG", "./LinesController"], function (require, exports, Geometry_1, SVG_1, LinesController_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class StationsController {
        constructor(map) {
            this.map = map;
            this.circles = [];
            this.addStation = (e) => this.handleLeftClick(e);
            this.removeStation = (e) => this.handleRightClick(e);
            this.highlightCell = (e) => this.handleHighlightCell(e);
            this.highlightedLines = [];
            this.initialize(map);
        }
        next() {
            let stations = [];
            for (let i = 0; i < this.circles.length; i++) {
                let circle = this.circles[i];
                let gridPoint = Geometry_1.Geometry.normalizeToGridCell(circle.cx.baseVal.value, circle.cy.baseVal.value);
                let station = { id: i, name: "", x: gridPoint.x, y: gridPoint.y, circle: circle, connections: [] };
                stations.push(station);
            }
            return new LinesController_1.LinesController(stations);
        }
        dispose() {
            this.map.removeEventListener("click", this.addStation);
            this.map.removeEventListener("contextmenu", this.removeStation, false);
            this.map.removeEventListener("mousemove", this.highlightCell);
            for (let i = 0; i < this.highlightedLines.length; i++) {
                this.highlightedLines[i].classList.remove("highlightCell");
            }
            this.tooltipSpan.remove();
        }
        handleHighlightCell(event) {
            let cell = null;
            if (event.target instanceof SVGLineElement) {
                // get coords relative to of svg canvas rather than just line ones
                let rect = (event.currentTarget).getBoundingClientRect();
                cell = Geometry_1.Geometry.normalizeToGridCell(event.clientX - rect.left, event.clientY - rect.top);
            }
            else if (event.target instanceof SVGCircleElement) {
                cell = Geometry_1.Geometry.normalizeToGridCell(event.target.cx.baseVal.value, event.target.cy.baseVal.value);
            }
            else {
                cell = Geometry_1.Geometry.normalizeToGridCell(event.offsetX, event.offsetY);
            }
            for (let i = 0; i < this.highlightedLines.length; i++) {
                this.highlightedLines[i].classList.remove("highlightCell");
            }
            this.updateTooltip(cell, event);
            this.highlightedLines = [];
            // lines which surrounds this cell by x axis
            let lineX1 = document.getElementById(`x${cell.x}`);
            lineX1.classList.add("highlightCell");
            this.highlightedLines.push(lineX1);
            let lineX2 = document.getElementById(`x${cell.x + 1}`);
            lineX2.classList.add("highlightCell");
            this.highlightedLines.push(lineX2);
            // lines which surrounds this cell by y axis
            let lineY1 = document.getElementById(`y${cell.y}`);
            lineY1.classList.add("highlightCell");
            this.highlightedLines.push(lineY1);
            let lineY2 = document.getElementById(`y${cell.y + 1}`);
            lineY2.classList.add("highlightCell");
            this.highlightedLines.push(lineY2);
        }
        updateTooltip(cell, event) {
            // positioning tooltip over cursor (get initial coords relative to window)
            // factors 1.2 and 0.1 were selected empirically
            this.tooltipSpan.style.top = (event.clientY - this.tooltipSpan.clientHeight * 1.2) + 'px';
            this.tooltipSpan.style.left = (event.clientX + this.tooltipSpan.clientWidth * 0.1) + 'px';
            this.tooltipSpan.innerText = `${cell.x} ${cell.y}`;
        }
        handleLeftClick(event) {
            // nothing to process if existing circle or line was clicked
            if (event.target instanceof SVGCircleElement || event.target instanceof SVGLineElement)
                return;
            let center = Geometry_1.Geometry.centrify(event.offsetX, event.offsetY);
            let circle = SVG_1.SVG.circle(center.x, center.y, Geometry_1.Geometry.radius);
            this.circles.push(circle); // add to internal array
            this.map.appendChild(circle); // add to visual presentation
        }
        handleRightClick(event) {
            if (!(event.target instanceof SVGCircleElement)) { // nothing to remove if empty cell was clicked
                return;
            }
            event.preventDefault();
            let target = event.target;
            let index = this.circles.findIndex(circle => circle.cx.baseVal.value == target.cx.baseVal.value &&
                circle.cy.baseVal.value == target.cy.baseVal.value);
            this.circles[index].remove(); // remove from visual presentation
            this.circles.splice(index, 1); // remove from array
        }
        initialize(map) {
            map.addEventListener("click", this.addStation);
            map.addEventListener("contextmenu", this.removeStation, false);
            map.addEventListener("mousemove", this.highlightCell);
            let span = document.createElement("span");
            span.id = 'tooltip';
            map.parentElement.appendChild(span);
            this.tooltipSpan = span;
        }
    }
    exports.StationsController = StationsController;
});
//# sourceMappingURL=StationsController.js.map