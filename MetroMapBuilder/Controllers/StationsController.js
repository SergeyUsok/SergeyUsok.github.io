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
            var stations = [];
            for (var i = 0; i < this.circles.length; i++) {
                var circle = this.circles[i];
                var gridPoint = Geometry_1.Geometry.normalizeToGridCell(circle.cx.baseVal.value, circle.cy.baseVal.value);
                var station = { id: i, name: "", x: gridPoint.x, y: gridPoint.y, circle: circle };
                stations.push(station);
            }
            return new LinesController_1.LinesController(this.map, stations);
        }
        dispose() {
            this.map.removeEventListener("click", this.addStation);
        }
        handleLeftClick(event) {
            var center = Geometry_1.Geometry.centrify(event.offsetX, event.offsetY);
            var index = this.circles.findIndex(circle => circle.cx.baseVal.value == center.x &&
                circle.cy.baseVal.value == center.y);
            if (index === -1) {
                var circle = SVG_1.SVG.circle(center.x, center.y, Geometry_1.Geometry.radius);
                this.circles.push(circle); // add to internal array
                this.map.appendChild(circle); // add to visual presentation
                circle.addEventListener("contextmenu", this.removeStation, false);
            }
        }
        handleRightClick(event) {
            event.preventDefault();
            var target = event.target;
            var index = this.circles.findIndex(circle => circle.cx.baseVal.value == target.cx.baseVal.value &&
                circle.cy.baseVal.value == target.cy.baseVal.value);
            this.circles[index].remove(); // remove from visual presentation
            this.circles.splice(index, 1); // remove from array
        }
        initialize(map) {
            map.addEventListener("click", this.addStation);
        }
    }
    exports.StationsController = StationsController;
});
//# sourceMappingURL=StationsController.js.map