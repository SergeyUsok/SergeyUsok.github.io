import { Point, Station } from "../Types";

export class GridConfig {
    public static size: number = 40;
    public static pixelSize: number = 800;
}

export class Geometry {
    public static get cellSize(): number {
        return GridConfig.pixelSize / GridConfig.size;
    }
    public static get radius(): number {
        return Geometry.cellSize / 2;
    }
    public static get lineWidth(): number {
        return Geometry.cellSize / 5;
    }

    public static centrify(x: number, y: number): Point {
        var gridCell = Geometry.normalizeToGridCell(x, y);
        return Geometry.getCenterOfCell(gridCell);
    }

    public static normalizeToGridCell(x: number, y: number): Point {
        return {
            x: Math.floor(x / Geometry.cellSize),
            y: Math.floor(y / Geometry.cellSize)
        };
    }

    public static radiusAsDistance(stationA: Station, stationB: Station): number {
        let point1 = Geometry.getCenterOfCell(stationA);
        let point2 = Geometry.getCenterOfCell(stationB);

        return Math.sqrt(Math.pow(point1.x - point2.x, 2) +
            Math.pow(point1.y - point2.y, 2));
    }

    // get angle between X axis and a line
    public static calculateAngle(stationA: Station, stationB: Station): number {
        let point1 = Geometry.getCenterOfCell(stationA);
        let point2 = Geometry.getCenterOfCell(stationB);

        return Math.atan2(point2.y - point1.y, point2.x - point1.x);
    }

    public static parametricCircleEquation(center: Point, radius: number, angle: number): Point {
        return {
            x: center.x + (radius * Math.cos(angle)),
            y: center.y + (radius * Math.sin(angle))
        };
    }

    public static getCenterOfCell(point: Point): Point {
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