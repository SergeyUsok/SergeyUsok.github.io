define(["require", "exports", "./SVG", "./Geometry"], function (require, exports, SVG_1, Geometry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MapDrawer {
        constructor(canvas) {
            this.canvas = canvas;
            this.occupiedCells = new Set();
        }
        getCanvas() {
            return this.canvas;
        }
        getGroupId(target) {
            return parseInt(target.parentElement.getAttribute("data-groupId")); // parent of all route elements is is g element
        }
        getId(target) {
            return parseInt(target.getAttribute("data-id"));
        }
        redrawGrid() {
            let oldGrid = document.getElementById("grid");
            if (oldGrid != null)
                oldGrid.remove();
            let gridContainer = SVG_1.SVG.groupGridLines("grid");
            // draw vertical lines
            let index = 0;
            for (let x = 0; x <= this.canvas.width.baseVal.value; x += Geometry_1.Geometry.cellSize) {
                let line = SVG_1.SVG.gridLine(x, 0, x, this.canvas.height.baseVal.value, `x${index}`);
                gridContainer.appendChild(line);
                index++;
            }
            // draw horizontal lines
            index = 0;
            for (let y = 0; y <= this.canvas.height.baseVal.value; y += Geometry_1.Geometry.cellSize) {
                let line = SVG_1.SVG.gridLine(0, y, this.canvas.width.baseVal.value, y, `y${index}`);
                gridContainer.appendChild(line);
                index++;
            }
            if (this.canvas.firstElementChild != null)
                this.canvas.firstElementChild.before(gridContainer);
            else
                this.canvas.appendChild(gridContainer);
        }
        redrawMap(metadata) {
            this.eraseMap();
            this.drawRoutes(metadata);
            this.drawStations(metadata);
            if (metadata.currentRoute != null)
                this.selectRoute(metadata.currentRoute);
        }
        selectRoute(route) {
            if (route.first == null)
                return;
            let stationElement = document.getElementById(`station-${route.first.id}`);
            if (!stationElement.classList.contains("selected"))
                stationElement.classList.add("selected");
            for (let conn of route.getConnections()) {
                let stationElement = document.getElementById(`station-${conn.to.id}`);
                if (!stationElement.classList.contains("selected"))
                    stationElement.classList.add("selected");
            }
        }
        deselectRoute(route) {
            if (route.first == null)
                return;
            let stationElement = document.getElementById(`station-${route.first.id}`);
            if (stationElement.classList.contains("selected"))
                stationElement.classList.remove("selected");
            for (let conn of route.getConnections()) {
                let stationElement = document.getElementById(`station-${conn.to.id}`);
                if (stationElement.classList.contains("selected"))
                    stationElement.classList.remove("selected");
            }
        }
        drawStation(station) {
            let center = Geometry_1.Geometry.getCenterOfCell(station);
            let circle = SVG_1.SVG.circleStation(center.x, center.y, Geometry_1.Geometry.radius, `station-${station.id}`, station.id);
            this.canvas.appendChild(circle);
        }
        changeRouteColor(routeId, color) {
            let route = document.getElementById(`route-${routeId}`);
            if (route == null) {
                console.error(`Cannot find route ${routeId} to change it color`);
                return;
            }
            route.setAttribute('stroke', color);
        }
        drawRoute(route, lineWidthFactor) {
            let lineWidth = Geometry_1.Geometry.cellSize * lineWidthFactor;
            let routeParent = SVG_1.SVG.routeGroup(`route-${route.id}`, lineWidth, route.color);
            for (let connection of route.getConnections()) {
                let from = Geometry_1.Geometry.getCenterOfCell(connection.from);
                let to = Geometry_1.Geometry.getCenterOfCell(connection.to);
                let offset = this.calculateOffset(connection, lineWidth, route);
                let segment = Geometry_1.Geometry.offsetConnection(from, to, offset);
                this.drawConnection(routeParent, segment);
                this.storeOccupiedCells(segment);
            }
            // insert routes after Grid BUT before stations
            this.canvas.firstChild.after(routeParent);
        }
        storeOccupiedCells(segment) {
            for (let point of Geometry_1.Geometry.digitalDiffAnalyzer(segment)) {
                let key = `${point.x}-${point.y}`;
                this.occupiedCells.add(key);
            }
        }
        drawConnection(routeParent, segment) {
            let svgLine = SVG_1.SVG.routeConnection(segment.from, segment.to);
            routeParent.appendChild(svgLine);
        }
        calculateOffset(connection, lineWidth, route) {
            let lineCenter = lineWidth / 2;
            let distancesBetweenLines = lineWidth / 2;
            // Imagine small circle with center in a station
            // diameter of this circle is equal to sum of all lines outgoing from the cirlce
            // plus distances between lines
            // get radius of small circle with center in outgoing station point
            let linesWidthsSum = connection.routesCount * lineWidth;
            let distancesBetweenLinesSum = (connection.routesCount - 1) * distancesBetweenLines;
            let radius = (linesWidthsSum + distancesBetweenLinesSum) / 2;
            let offsetFactor = connection.routeOrder(route);
            return (-radius + lineCenter) + (offsetFactor * (lineWidth + distancesBetweenLines));
        }
        eraseMap() {
            this.occupiedCells.clear();
            let node = this.canvas;
            while (node.lastElementChild.id != "grid") {
                node.lastElementChild.remove();
            }
        }
        drawRoutes(metadata) {
            for (let i = 0; i < metadata.routes.length; i++) {
                this.drawRoute(metadata.routes[i], metadata.lineWidthFactor);
            }
        }
        drawStations(metadata) {
            // TODO calculate size and shape of station
            for (let i = 0; i < metadata.stations.length; i++) {
                this.drawStation(metadata.stations[i]);
            }
        }
    }
    exports.MapDrawer = MapDrawer;
});
//# sourceMappingURL=MapDrawer.js.map