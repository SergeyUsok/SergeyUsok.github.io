define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GridConfig {
    }
    GridConfig.size = 40;
    GridConfig.pixelSize = 800;
    exports.GridConfig = GridConfig;
    class Geometry {
        static get cellSize() {
            return GridConfig.pixelSize / GridConfig.size;
        }
        static get radius() {
            return Geometry.cellSize / 2;
        }
        static get lineWidth() {
            return Geometry.cellSize / 5;
        }
        // SVG draws thin line and then calculates its width by making it wider proportionally from both sides from center
        static get lineCenter() {
            return Geometry.lineWidth / 2;
        }
        // let distance be half of line width
        static get distanceBetweenLines() {
            return Geometry.lineWidth / 2;
        }
        static centrify(x, y) {
            var gridCell = Geometry.normalizeToGridCell(x, y);
            return Geometry.getCenterOfCell(gridCell);
        }
        static normalizeToGridCell(x, y) {
            return {
                x: Math.floor(x / Geometry.cellSize),
                y: Math.floor(y / Geometry.cellSize)
            };
        }
        static radiusAsDistance(stationA, stationB) {
            let point1 = Geometry.getCenterOfCell(stationA);
            let point2 = Geometry.getCenterOfCell(stationB);
            return Math.sqrt(Math.pow(point1.x - point2.x, 2) +
                Math.pow(point1.y - point2.y, 2));
        }
        // get angle between X axis and a line
        static calculateAngle(stationA, stationB) {
            let point1 = Geometry.getCenterOfCell(stationA);
            let point2 = Geometry.getCenterOfCell(stationB);
            return Math.atan2(point2.y - point1.y, point2.x - point1.x);
        }
        static parametricCircleEquation(center, radius, angle) {
            return {
                x: center.x + (radius * Math.cos(angle)),
                y: center.y + (radius * Math.sin(angle))
            };
        }
        static getCenterOfCell(point) {
            // left border of a cell
            //  + right border of a cell
            // divided by 2 (half of a cell) to get center of the cell by x axis
            let x = point.x * Geometry.cellSize + Geometry.cellSize / 2;
            // top border of a cell
            //  + bottom border of a cell
            // divided by 2 (half of a cell) to get center of the cell by y axis
            let y = point.y * Geometry.cellSize + Geometry.cellSize / 2;
            return { x, y };
        }
    }
    exports.Geometry = Geometry;
});
//# sourceMappingURL=Geometry.js.map