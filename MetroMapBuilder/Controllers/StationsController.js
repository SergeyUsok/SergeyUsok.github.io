define(["require", "exports", "../Utility/Geometry", "../Utility/SVG", "./LinesController"], function (require, exports, Geometry_1, SVG_1, LinesController_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class StationsController {
        constructor(map) {
            this.map = map;
            this.circles = [];
            this.addStation = (e) => this.handleLeftClick(e);
            this.removeStation = (e) => this.handleRightClick(e);
            this.initialize(map);
        }
        next() {
            let stations = [];
            for (let i = 0; i < this.circles.length; i++) {
                let circle = this.circles[i];
                let gridPoint = Geometry_1.Geometry.normalizeToGridCell(circle.cx.baseVal.value, circle.cy.baseVal.value);
                let station = { id: i, name: "", x: gridPoint.x, y: gridPoint.y, circle: circle };
                stations.push(station);
            }
            return new LinesController_1.LinesController(this.map, stations);
        }
        dispose() {
            this.map.removeEventListener("click", this.addStation);
            this.map.removeEventListener("contextmenu", this.removeStation, false);
        }
        handleLeftClick(event) {
            if (event.target instanceof SVGCircleElement) // nothing to process if existing circle was clicked
                return;
            let center = Geometry_1.Geometry.centrify(event.offsetX, event.offsetY);
            let circle = SVG_1.SVG.circle(center.x, center.y, Geometry_1.Geometry.radius);
            this.circles.push(circle); // add to internal array
            this.map.appendChild(circle); // add to visual presentation
        }
        handleRightClick(event) {
            event.preventDefault();
            let target = event.target;
            if (target == null) // nothing to remove if empty cell was clicked
                return;
            let index = this.circles.findIndex(circle => circle.cx.baseVal.value == target.cx.baseVal.value &&
                circle.cy.baseVal.value == target.cy.baseVal.value);
            this.circles[index].remove(); // remove from visual presentation
            this.circles.splice(index, 1); // remove from array
        }
        initialize(map) {
            map.addEventListener("click", this.addStation);
            map.addEventListener("contextmenu", this.removeStation, false);
        }
    }
    exports.StationsController = StationsController;
});
//# sourceMappingURL=StationsController.js.map