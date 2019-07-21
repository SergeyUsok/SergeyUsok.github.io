define(["require", "exports", "./SVG"], function (require, exports, SVG_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MapDrawer {
        constructor(canvas, geometry) {
            this.canvas = canvas;
            this.geometry = geometry;
            this.occupiedCells = new Set();
            this.highlightedLines = [];
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
            for (let x = 0; x <= this.canvas.width.baseVal.value; x += this.geometry.cellSize) {
                let line = SVG_1.SVG.gridLine(x, 0, x, this.canvas.height.baseVal.value, `x${index}`);
                gridContainer.appendChild(line);
                index++;
            }
            // draw horizontal lines
            index = 0;
            for (let y = 0; y <= this.canvas.height.baseVal.value; y += this.geometry.cellSize) {
                let line = SVG_1.SVG.gridLine(0, y, this.canvas.width.baseVal.value, y, `y${index}`);
                gridContainer.appendChild(line);
                index++;
            }
            if (this.canvas.firstElementChild != null)
                this.canvas.firstElementChild.before(gridContainer);
            else
                this.canvas.appendChild(gridContainer);
        }
        highlightCell(x, y) {
            let cell = this.geometry.normalizeToGridCell(x, y);
            for (let i = 0; i < this.highlightedLines.length; i++) {
                this.highlightedLines[i].classList.remove("highlightCell");
            }
            this.highlightedLines = [];
            // lines which surrounds this cell by x axis
            let lineX1 = document.getElementById(`x${cell.x}`);
            if (lineX1 != null) {
                lineX1.classList.add("highlightCell");
                this.highlightedLines.push(lineX1);
            }
            let lineX2 = document.getElementById(`x${cell.x + 1}`);
            if (lineX2 != null) {
                lineX2.classList.add("highlightCell");
                this.highlightedLines.push(lineX2);
            }
            // lines which surrounds this cell by y axis
            let lineY1 = document.getElementById(`y${cell.y}`);
            if (lineY1 != null) {
                lineY1.classList.add("highlightCell");
                this.highlightedLines.push(lineY1);
            }
            let lineY2 = document.getElementById(`y${cell.y + 1}`);
            if (lineX2 != null) {
                lineY2.classList.add("highlightCell");
                this.highlightedLines.push(lineY2);
            }
        }
        redrawMap(subwayMap) {
            this.eraseMap();
            this.drawRoutes(subwayMap);
            this.drawStations(subwayMap);
            if (subwayMap.currentRoute != null)
                this.selectRoute(subwayMap.currentRoute);
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
            let center = this.geometry.centrify(station);
            let circle = SVG_1.SVG.circleStation(center.x, center.y, this.geometry.radius, `station-${station.id}`, station.id);
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
        drawRoute(route) {
            let routeParent = SVG_1.SVG.routeGroup(`route-${route.id}`, this.geometry.lineWidth, route.color);
            for (let connection of route.getConnections()) {
                let from = this.geometry.centrify(connection.from);
                let to = this.geometry.centrify(connection.to);
                let offset = this.calculateOffset(connection, route);
                let segment = this.geometry.offsetConnection(from, to, offset);
                this.drawConnection(routeParent, segment);
                this.storeOccupiedCells(segment);
            }
            // insert routes after Grid BUT before stations
            this.canvas.firstChild.after(routeParent);
        }
        storeOccupiedCells(segment) {
            for (let point of this.geometry.digitalDiffAnalyzer(segment)) {
                let key = `${point.x}-${point.y}`;
                this.occupiedCells.add(key);
            }
        }
        drawConnection(routeParent, segment) {
            let svgLine = SVG_1.SVG.routeConnection(segment.from, segment.to);
            routeParent.appendChild(svgLine);
        }
        calculateOffset(connection, route) {
            // Imagine small circle with center in a station
            // diameter of this circle is equal to sum of all lines outgoing from the cirlce
            // plus distances between lines
            // get radius of small circle with center in outgoing station point
            let linesWidthsSum = connection.routesCount * this.geometry.lineWidth;
            let distancesBetweenLinesSum = (connection.routesCount - 1) * this.geometry.distanceBetweenLines;
            let radius = (linesWidthsSum + distancesBetweenLinesSum) / 2;
            let offsetFactor = connection.routeOrder(route);
            return (-radius + this.geometry.lineCenter) + (offsetFactor * (this.geometry.lineWidth + this.geometry.distanceBetweenLines));
        }
        eraseMap() {
            this.occupiedCells.clear();
            let node = this.canvas;
            while (node.lastElementChild.id != "grid") {
                node.lastElementChild.remove();
            }
        }
        drawRoutes(subwayMap) {
            for (let i = 0; i < subwayMap.routes.length; i++) {
                this.drawRoute(subwayMap.routes[i]);
            }
        }
        drawStations(subwayMap) {
            // TODO calculate size and shape of station
            for (let i = 0; i < subwayMap.stations.length; i++) {
                this.drawStation(subwayMap.stations[i]);
            }
        }
    }
    exports.MapDrawer = MapDrawer;
});
//# sourceMappingURL=MapDrawer.js.map