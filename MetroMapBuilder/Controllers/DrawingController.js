define(["require", "exports", "../Types", "../Utility/SVG", "../Utility/Geometry"], function (require, exports, Types_1, SVG_1, Geometry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class DrawingController {
        constructor(stations, lines, connections) {
            this.stations = stations;
            this.lines = lines;
            this.connections = connections;
            this.exportJson = () => this.handleExportJson();
            this.toggleGrid = () => this.handleToggleGrid();
            this.initialize();
            this.emptyMap();
            this.draw(stations, lines, connections);
        }
        next() {
            throw new Error("No controller exists");
        }
        dispose() {
            document.getElementById("json").removeEventListener("click", this.exportJson);
            document.getElementById("grid-switch").removeEventListener("click", this.toggleGrid);
        }
        handleExportJson() {
            let map = {
                city: "",
                gridSize: Geometry_1.GridConfig.size,
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
        handleToggleGrid() {
            let grid = document.getElementById("grid");
            grid.getAttribute("visibility") == "visible" ?
                grid.setAttribute("visibility", "hidden") :
                grid.setAttribute("visibility", "visible");
        }
        emptyMap() {
            let map = document.getElementById("map");
            while (map.lastElementChild.id != "grid") {
                map.removeChild(map.lastElementChild);
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
                // diameter of this circle is equal to sum of all lines outgoing from of the cirlce
                // plus distances between lines
                // get radius of small circle with center in stationA point
                let linesWidthsSum = connection.lines.length * Geometry_1.Geometry.lineWidth;
                let distancesBetweenLinesSum = (connection.lines.length - 1) * Geometry_1.Geometry.distanceBetweenLines;
                let smallRadius = (linesWidthsSum + distancesBetweenLinesSum) / 2;
                let getNextPoint = this.pointCalculator(stationA, stationB);
                let offset = -smallRadius + Geometry_1.Geometry.lineCenter;
                let prevPoint = Geometry_1.Geometry.getCenterOfCell(stationA);
                for (let lineIndex = 0; lineIndex < connection.lines.length; lineIndex++) {
                    let startingPoint = getNextPoint(prevPoint, offset);
                    let finishingPoint = Geometry_1.Geometry.parametricCircleEquation(startingPoint, radiusToDestination, angle);
                    let lineId = connection.lines[lineIndex];
                    this.drawConnection(startingPoint, finishingPoint, lines[lineId]);
                    // next starting point should take into account line width plus distance between lines equal to lineWidth/2
                    offset = Geometry_1.Geometry.lineWidth + Geometry_1.Geometry.distanceBetweenLines;
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
            // got this coefficient expirementally. Without it distance between lines is too large
            const diagonalFactor = 0.7;
            return function (point, offset) {
                if (direction == Types_1.Direction.horizontal)
                    return { x: point.x, y: point.y + offset };
                if (direction == Types_1.Direction.vertical)
                    return { x: point.x + offset, y: point.y };
                if (direction == Types_1.Direction.rightDiagonal)
                    return { x: point.x + offset * diagonalFactor, y: point.y + offset * diagonalFactor };
                if (direction == Types_1.Direction.leftDiagonal)
                    return { x: point.x - offset * diagonalFactor, y: point.y + offset * diagonalFactor };
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
        initialize() {
            document.getElementById("json").addEventListener("click", this.exportJson);
            let gridSwitch = document.getElementById("grid-switch");
            gridSwitch.addEventListener("click", this.toggleGrid);
            gridSwitch.removeAttribute("disabled");
            gridSwitch.checked = true;
            document.getElementById("next").setAttribute("disabled", "disabled");
        }
    }
    exports.DrawingController = DrawingController;
});
//# sourceMappingURL=DrawingController.js.map