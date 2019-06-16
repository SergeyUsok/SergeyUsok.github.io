define(["require", "exports", "../Types", "../Utility/SVG", "../Utility/Geometry"], function (require, exports, Types_1, SVG_1, Geometry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class DrawingController {
        constructor(stations, lines, connections) {
            this.stations = stations;
            this.lines = lines;
            this.connections = connections;
            this.exportJson = () => this.handleExportJson();
            this.initialize();
            this.emptyMap();
            this.draw(stations, lines, connections);
        }
        next() {
            throw new Error("No controller exists");
        }
        dispose() {
            document.getElementById("json").removeEventListener("click", this.exportJson);
            // handle stations drag'n'drop
            // handle adding station names
            // checkbox for grid lines
        }
        handleExportJson() {
            // handle JSON button
        }
        emptyMap() {
            let map = document.getElementById("map");
            while (map.firstChild) {
                map.removeChild(map.firstChild);
            }
        }
        draw(stations, lines, connections) {
            this.drawLines(stations, lines, connections);
            this.drawStations(stations);
        }
        drawStations(stations) {
            for (let i = 0; i < stations.length; i++) {
                let center = Geometry_1.Geometry.getCenterOfCell(stations[i]);
                let circle = SVG_1.SVG.circle(center.x, center.y, Geometry_1.Geometry.radius);
                document.getElementById("map").appendChild(circle);
            }
        }
        drawLines(stations, lines, connections) {
            for (let i = 0; i < connections.length; i++) {
                let connection = connections[i];
                let stationA = stations[connection.a];
                let stationB = stations[connection.b];
                // Imagine circle with center in station A and passing through the station B
                // radius of this circle is distance between A and B
                let radiusToDestination = Geometry_1.Geometry.radiusAsDistance(stationA, stationB);
                // get angle between X axis and connection line
                let angle = Geometry_1.Geometry.calculateAngle(stationA, stationB);
                // Imagine small circle with center in a station
                // diamter of this circle is equal to sum of all lines outgoing from of the cirlce
                // get radius of small circle with center in stationA point
                let smallRadius = (connection.lines.length * Geometry_1.Geometry.lineWidth) / 2;
                let getNextPoint = this.pointCalculator(stationA, stationB);
                let offset = smallRadius + Geometry_1.Geometry.lineWidth / 2;
                let prevPoint = getNextPoint(Geometry_1.Geometry.getCenterOfCell(stationA), -offset);
                for (let lineIndex = 0; lineIndex < connection.lines.length; lineIndex++) {
                    //let delta = (lineWidth/2)*lineIndex;
                    let startingPoint = getNextPoint(prevPoint, Geometry_1.Geometry.lineWidth);
                    let finishingPoint = Geometry_1.Geometry.parametricCircleEquation(startingPoint, radiusToDestination, angle);
                    let lineId = connection.lines[lineIndex];
                    this.drawConnection(startingPoint, finishingPoint, lines[lineId]);
                    prevPoint = startingPoint;
                }
            }
        }
        drawConnection(from, to, line) {
            let svgLine = SVG_1.SVG.line(from, to, line.color, Geometry_1.Geometry.lineWidth);
            document.getElementById("map").appendChild(svgLine);
        }
        pointCalculator(stationA, stationB) {
            let direction = this.determineDirection(stationA, stationB);
            return function (point, offset) {
                if (direction == Types_1.Direction.horizontal)
                    return { x: point.x, y: point.y + offset };
                if (direction == Types_1.Direction.vertical)
                    return { x: point.x + offset, y: point.y };
                if (direction == Types_1.Direction.rightDiagonal)
                    return { x: point.x + offset, y: point.y + offset };
                if (direction == Types_1.Direction.leftDiagonal)
                    return { x: point.x - offset, y: point.y + offset };
            };
        }
        determineDirection(stationA, stationB) {
            if (stationA.x == stationB.x && stationA.y != stationB.y)
                return Types_1.Direction.vertical;
            if (stationA.x != stationB.x && stationA.y == stationB.y)
                return Types_1.Direction.horizontal;
            // first check if diagonal drawing direction (moves from top to bottom or from bottom to top)
            // from top to Bottom case
            if (stationA.y < stationB.y) {
                if (stationA.x > stationB.x)
                    return Types_1.Direction.rightDiagonal;
                if (stationA.x < stationB.x)
                    return Types_1.Direction.leftDiagonal;
            }
            // from Bottom to top case
            else if (stationA.y > stationB.y) {
                if (stationA.x > stationB.x)
                    return Types_1.Direction.leftDiagonal;
                if (stationA.x < stationB.x)
                    return Types_1.Direction.rightDiagonal;
            }
            return Types_1.Direction.horizontal;
        }
        initialize() {
            document.getElementById("json").addEventListener("click", this.exportJson);
            document.getElementById("next").setAttribute("disabled", "disabled");
        }
    }
    exports.DrawingController = DrawingController;
});
//# sourceMappingURL=DrawingController.js.map