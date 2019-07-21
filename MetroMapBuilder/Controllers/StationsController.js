define(["require", "exports", "../Utils/Geometry"], function (require, exports, Geometry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class StationsController {
        constructor(metadata, drawer) {
            this.metadata = metadata;
            this.drawer = drawer;
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
                cell = Geometry_1.Geometry.normalizeToGridCell(event.clientX - rect.left, event.clientY - rect.top);
            }
            else {
                cell = Geometry_1.Geometry.normalizeToGridCell(event.offsetX, event.offsetY);
            }
            let id = this.stationsCounter++;
            let station = this.metadata.newStation(id, cell.x, cell.y);
            this.drawer.drawStation(station);
        }
    }
    exports.StationsController = StationsController;
});
//# sourceMappingURL=StationsController.js.map