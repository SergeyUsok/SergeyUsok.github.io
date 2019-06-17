import { Controller } from "./GridController";
import { Line, Connection, Point, Direction, Station } from "../Types";
import { SVG } from "../Utility/SVG";
import { Geometry, GridConfig } from "../Utility/Geometry";

export class DrawingController implements Controller {

    private exportJson = () => this.handleExportJson();
    private toggleGrid = () => this.handleToggleGrid();

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
        document.getElementById("grid-switch").removeEventListener("click", this.toggleGrid);
    }

    private handleExportJson(): void {
        let map = {
            city: "",
            gridSize: GridConfig.size,
            stations: this.stations,
            lines: this.lines,
            connections: this.connections
        };
        let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(map));
        let downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "metro_map.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    private handleToggleGrid(): void {
        let grid = document.getElementById("grid");

        grid.getAttribute("visibility") == "visible" ?
            grid.setAttribute("visibility", "hidden") :
            grid.setAttribute("visibility", "visible");
    }

    private emptyMap(): void {
        let map = document.getElementById("map");
        while (map.lastElementChild.id != "grid") {
            map.removeChild(map.lastElementChild);
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
            // diameter of this circle is equal to sum of all lines outgoing from of the cirlce
            // plus distances between lines
            // get radius of small circle with center in stationA point
            let linesWidthsSum = connection.lines.length * Geometry.lineWidth;
            let distancesBetweenLinesSum = (connection.lines.length - 1) * Geometry.distanceBetweenLines;
            let smallRadius = (linesWidthsSum + distancesBetweenLinesSum) / 2;

            let getNextPoint = this.pointCalculator(stationA, stationB);

            let offset = -smallRadius + Geometry.lineCenter;
            let prevPoint = Geometry.getCenterOfCell(stationA);

            for (let lineIndex = 0; lineIndex < connection.lines.length; lineIndex++) {                
                let startingPoint = getNextPoint(prevPoint, offset);
                let finishingPoint = Geometry.parametricCircleEquation(startingPoint, radiusToDestination, angle);
                let lineId = connection.lines[lineIndex];

                this.drawConnection(startingPoint, finishingPoint, lines[lineId]);

                // next starting point should take into account line width plus distance between lines equal to lineWidth/2
                offset = Geometry.lineWidth + Geometry.distanceBetweenLines;
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
        // got this coefficient expirementally. Without it distance between lines is too large
        const diagonalFactor = 0.7;
        return function (point: Point, offset: number) {
            if (direction == Direction.horizontal)
                return { x: point.x, y: point.y + offset };
            if (direction == Direction.vertical)
                return { x: point.x + offset, y: point.y };
            if (direction == Direction.rightDiagonal)
                return { x: point.x + offset * diagonalFactor, y: point.y + offset * diagonalFactor };
            if (direction == Direction.leftDiagonal)
                return { x: point.x - offset * diagonalFactor, y: point.y + offset * diagonalFactor };
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

    //private determineDirection(stationA: Station, stationB: Station): Direction {
    //    if (stationA.x == stationB.x && stationA.y < stationB.y)
    //        return Direction.south;

    //    if (stationA.x == stationB.x && stationA.y > stationB.y)
    //        return Direction.north;

    //    if (stationA.x < stationB.x && stationA.y == stationB.y)
    //        return Direction.east;

    //    if (stationA.x > stationB.x && stationA.y == stationB.y)
    //        return Direction.west;

    //    // first check if diagonal drawing direction (moves from top to bottom or from bottom to top)
    //    // from top to Bottom case
    //    if (stationA.y < stationB.y) {
    //        if (stationA.x > stationB.x)
    //            return Direction.southEast;

    //        if (stationA.x < stationB.x)
    //            return Direction.southWest;
    //    }
    //    // from Bottom to top case
    //    else if (stationA.y > stationB.y) {
    //        if (stationA.x > stationB.x)
    //            return Direction.northWest;

    //        if (stationA.x < stationB.x)
    //            return Direction.northEast;
    //    }
    //}

    private initialize(): void {
        document.getElementById("json").addEventListener("click", this.exportJson);
        let gridSwitch = <HTMLInputElement>document.getElementById("grid-switch");
        gridSwitch.addEventListener("click", this.toggleGrid);
        gridSwitch.removeAttribute("disabled");
        gridSwitch.checked = true;
        document.getElementById("next").setAttribute("disabled", "disabled");
    }
}