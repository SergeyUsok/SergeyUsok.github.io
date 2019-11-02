define(["require", "exports", "./SVG", "./StationsManager", "./LabelsManager"], function (require, exports, SVG_1, StationsManager_1, LabelsManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MapView {
        constructor(canvas, geometry) {
            this.canvas = canvas;
            this.geometry = geometry;
            this.occupiedCells = new Set();
            this.gridElementId = "grid";
            this.stationsManager = new StationsManager_1.StationsManager(geometry);
            this.labelsManager = new LabelsManager_1.LabelsManager(geometry, p => this.isCellAvailable(p));
        }
        getCanvas() {
            return this.canvas;
        }
        getId(target) {
            return parseInt(target.getAttribute("data-id"));
        }
        isCellAvailable(cell) {
            return this.withinBounds(cell.x, cell.y) && !this.occupiedCells.has(`${cell.x}-${cell.y}`);
        }
        redrawGrid() {
            let oldGrid = document.getElementById(this.gridElementId);
            if (oldGrid != null)
                oldGrid.remove();
            let gridContainer = SVG_1.SVG.gridGroup(this.gridElementId);
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
        toggleGrid() {
            let grid = document.getElementById(this.gridElementId);
            grid.getAttribute("visibility") == "visible" ?
                grid.setAttribute("visibility", "hidden") :
                grid.setAttribute("visibility", "visible");
        }
        highlightCell(x, y) {
            let cell = this.geometry.normalizeToGridCell(x, y);
            document.querySelectorAll("svg line.highlightCell")
                .forEach(l => l.classList.remove("highlightCell"));
            // lines which surrounds this cell by x axis
            let lineX1 = document.getElementById(`x${cell.x}`);
            if (lineX1 != null) {
                lineX1.classList.add("highlightCell");
            }
            let lineX2 = document.getElementById(`x${cell.x + 1}`);
            if (lineX2 != null) {
                lineX2.classList.add("highlightCell");
            }
            // lines which surrounds this cell by y axis
            let lineY1 = document.getElementById(`y${cell.y}`);
            if (lineY1 != null) {
                lineY1.classList.add("highlightCell");
            }
            let lineY2 = document.getElementById(`y${cell.y + 1}`);
            if (lineX2 != null) {
                lineY2.classList.add("highlightCell");
            }
            // let user know if he can put station to the current cell
            if (this.isCellAvailable(cell)) {
                this.canvas.style.cursor = "cell";
            }
            else {
                this.canvas.style.cursor = "not-allowed";
            }
        }
        redrawMap(subwayMap) {
            this.eraseMap();
            this.drawRoutes(subwayMap);
            this.drawStations(subwayMap);
            this.drawLabels(subwayMap);
            this.storeOccupiedCells(this.stationsManager.getOccupiedCellsIncludingSurrounding());
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
        trySetColor(routeId, color) {
            let route = document.getElementById(`route-${routeId}`);
            if (route != null) {
                route.setAttribute('stroke', color);
            }
        }
        drawRoute(route) {
            let routeParent = SVG_1.SVG.routeGroup(`route-${route.id}`, this.geometry.lineWidth, route.color);
            for (let connection of route.getConnections()) {
                let from = this.geometry.centrify(connection.from);
                let to = this.geometry.centrify(connection.to);
                this.stationsManager.addMetadata(connection);
                let offset = this.calculateOffset(connection, route);
                let segment = this.geometry.offsetConnection(from, to, offset);
                this.drawConnection(routeParent, segment);
                this.storeCellsOccupiedByLine(segment, connection.direction);
            }
            // insert routes after Grid BUT before stations
            this.canvas.firstChild.after(routeParent);
        }
        storeCellsOccupiedByLine(segment, direction) {
            // TODO take into account line width (lineWidthFactor)
            for (let point of this.geometry.digitalDiffAnalyzer(segment, direction)) {
                let key = `${point.x}-${point.y}`;
                this.occupiedCells.add(key);
            }
        }
        drawConnection(routeParent, segment) {
            let svgLine = SVG_1.SVG.routeConnection(segment.from, segment.to);
            routeParent.appendChild(svgLine);
        }
        calculateOffset(connection, route) {
            let fullDistance = this.geometry.distanceOfParallelLines(connection.routesCount);
            let radius = fullDistance / 2; // we need the half of distance because we draw lines by offsetting them by BOTH sides of central point
            let offsetFactor = connection.routeOrder(route);
            return (-radius + this.geometry.halfOfLineWidth) + (offsetFactor * (this.geometry.lineWidth + this.geometry.distanceBetweenLines));
        }
        eraseMap() {
            this.occupiedCells.clear();
            this.stationsManager.clear();
            let node = this.canvas;
            while (node.lastElementChild.id != this.gridElementId) {
                node.lastElementChild.remove();
            }
        }
        drawRoutes(subwayMap) {
            for (let i = 0; i < subwayMap.routes.length; i++) {
                this.drawRoute(subwayMap.routes[i]);
            }
        }
        drawStations(subwayMap) {
            for (let i = 0; i < subwayMap.stations.length; i++) {
                this.drawStation(subwayMap.stations[i]);
            }
        }
        drawLabels(subwayMap) {
            for (let i = 0; i < subwayMap.stations.length; i++) {
                this.drawLabel(subwayMap.stations[i]);
            }
        }
        drawStation(station) {
            let shapeInfo = this.stationsManager.process(station);
            this.storeOccupiedCells(shapeInfo.cells.values());
            this.canvas.appendChild(shapeInfo.shape);
        }
        drawLabel(station) {
            let stationBounds = this.stationsManager.getBounds(station.id);
            let labelInfo = this.labelsManager.process(station.label, stationBounds);
            this.storeOccupiedCells(labelInfo.cells.values());
            this.canvas.appendChild(labelInfo.labelText);
        }
        storeOccupiedCells(cells) {
            for (let cell of cells) {
                this.occupiedCells.add(cell);
            }
        }
        withinBounds(x, y) {
            return x >= 0 && x < this.geometry.gridSize &&
                y >= 0 && y < this.geometry.gridSize;
        }
    }
    exports.MapView = MapView;
});
//# sourceMappingURL=MapView.js.map