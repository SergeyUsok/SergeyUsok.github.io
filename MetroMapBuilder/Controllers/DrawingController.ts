import { Controller } from "./GridController";
import { Station, Line, Connection, Point, Direction } from "../Types";
import { SVG } from "../Utility/SVG";
import { Geometry } from "../Utility/Geometry";

export class DrawingController implements Controller {

    private exportJson = () => this.handleExportJson();

    public constructor(private stations: Station[], private lines: Line[], private connections: Connection[]) {
        this.initialize();
        this.emptyMap();
        this.draw(stations, lines, connections);
    }

    public next(): Controller {
        throw new Error("No controller exists");
    }

    public dispose(): void {
        document.getElementById("json").removeEventListener("click", this.exportJson);

        // handle stations drag'n'drop
        // handle adding station names
        // checkbox for grid lines
    }

    private handleExportJson(): void {
        // handle JSON button
    }

    private emptyMap(): void {
        let map = document.getElementById("map");
        while (map.firstChild) {
            map.removeChild(map.firstChild);
        }
    }

    private draw(stations: Station[], lines: Line[], connections: Connection[]): void {
        this.drawLines(stations, lines, connections);
        this.drawStations(stations);
    }

    private drawStations(stations: Station[]) {
        for (let i = 0; i < stations.length; i++) {
            let center = Geometry.getCenterOfCell(stations[i]);
            let circle = SVG.circle(center.x, center.y, Geometry.radius);
            document.getElementById("map").appendChild(circle);
        }
    }

    private drawLines(stations: Station[], lines: Line[], connections: Connection[]) {
        for (let i = 0; i < connections.length; i++) {
            let connection = connections[i];
            let stationA = stations[connection.a];
            let stationB = stations[connection.b];

            // Imagine circle with center in station A and passing through the station B
            // radius of this circle is distance between A and B
            let radiusToDestination = Geometry.radiusAsDistance(stationA, stationB);

            // get angle between X axis and connection line
            let angle = Geometry.calculateAngle(stationA, stationB);

            // Imagine small circle with center in a station
            // diamter of this circle is equal to sum of all lines outgoing from of the cirlce
            // get radius of small circle with center in stationA point
            let smallRadius = (connection.lines.length * Geometry.lineWidth) / 2;

            let getNextPoint = this.pointCalculator(stationA, stationB);

            let offset = smallRadius + Geometry.lineWidth / 2;
            let prevPoint = getNextPoint(Geometry.getCenterOfCell(stationA), -offset);

            for (let lineIndex = 0; lineIndex < connection.lines.length; lineIndex++) {
                //let delta = (lineWidth/2)*lineIndex;
                let startingPoint = getNextPoint(prevPoint, Geometry.lineWidth);
                let finishingPoint = Geometry.parametricCircleEquation(startingPoint, radiusToDestination, angle);
                let lineId = connection.lines[lineIndex];

                this.drawConnection(startingPoint, finishingPoint, lines[lineId]);

                prevPoint = startingPoint;
            }
        }
    }

    private drawConnection(from: Point, to: Point, line: Line): void {
        let svgLine = SVG.line(from, to, line.color, Geometry.lineWidth);
        document.getElementById("map").appendChild(svgLine);
    }

    private pointCalculator(stationA: Station, stationB: Station) {
        let direction = this.determineDirection(stationA, stationB);

        return function (point: Point, offset: number) {
            if (direction == Direction.horizontal)
                return { x: point.x, y: point.y + offset };
            if (direction == Direction.vertical)
                return { x: point.x + offset, y: point.y };
            if (direction == Direction.rightDiagonal)
                return { x: point.x + offset, y: point.y + offset };
            if (direction == Direction.leftDiagonal)
                return { x: point.x - offset, y: point.y + offset };
        };
    }

    private determineDirection(stationA: Station, stationB: Station): Direction {
        if (stationA.x == stationB.x && stationA.y != stationB.y)
            return Direction.vertical;

        if (stationA.x != stationB.x && stationA.y == stationB.y)
            return Direction.horizontal;

        // first check if diagonal drawing direction (moves from top to bottom or from bottom to top)
        // from top to Bottom case
        if (stationA.y < stationB.y) {
            if (stationA.x > stationB.x)
                return Direction.rightDiagonal;

            if (stationA.x < stationB.x)
                return Direction.leftDiagonal;
        }
        // from Bottom to top case
        else if (stationA.y > stationB.y) {
            if (stationA.x > stationB.x)
                return Direction.leftDiagonal;

            if (stationA.x < stationB.x)
                return Direction.rightDiagonal;
        }

        return Direction.horizontal;
    }

    private initialize(): void {
        document.getElementById("json").addEventListener("click", this.exportJson);
        document.getElementById("next").setAttribute("disabled", "disabled");
    }
}