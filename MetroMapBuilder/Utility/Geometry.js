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