define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class StationsController {
        constructor(subwayMap, drawer, geometry) {
            this.subwayMap = subwayMap;
            this.drawer = drawer;
            this.geometry = geometry;
            this.stationsCounter = 0;
            this.initialize(drawer.getCanvas());
        }
        initialize(canvas) {
            canvas.addEventListener("click", event => this.addStation(event));
        }
        addStation(event) {
            if (event.target instanceof SVGCircleElement) {
                return;
            }
            let cell = null;
            if (event.target instanceof SVGLineElement) {
                // get coords relative to of svg canvas rather than just line ones
                let rect = (event.currentTarget).getBoundingClientRect();
                cell = this.geometry.normalizeToGridCell(event.clientX - rect.left, event.clientY - rect.top);
            }
            else {
                cell = this.geometry.normalizeToGridCell(event.offsetX, event.offsetY);
            }
            let id = this.stationsCounter++;
            let station = this.subwayMap.newStation(id, cell.x, cell.y);
            this.drawer.drawStation(station);
        }
    }
    exports.StationsController = StationsController;
});
//# sourceMappingURL=StationsController.js.map