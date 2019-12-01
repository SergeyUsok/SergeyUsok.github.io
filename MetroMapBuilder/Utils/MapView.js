define(["require", "exports", "./SVG", "./StationsManager", "./LabelsManager", "./RoutesManager"], function (require, exports, SVG_1, StationsManager_1, LabelsManager_1, RoutesManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MapView {
        constructor(canvas, geometry) {
            this.canvas = canvas;
            this.geometry = geometry;
            this.gridElementId = "grid";
            this.dragMode = false;
            this.stationsManager = new StationsManager_1.StationsManager(geometry);
            this.routesManager = new RoutesManager_1.RoutesManager(geometry, (c) => this.stationsManager.processConnection(c));
            this.labelsManager = new LabelsManager_1.LabelsManager(geometry, p => this.isCellFullyAvailable(p));
        }
        getCanvas() {
            return this.canvas;
        }
        getId(target) {
            return parseInt(target.getAttribute("data-id"));
        }
        isCellFullyAvailable(cell) {
            return this.withinBounds(cell.x, cell.y) &&
                this.routesManager.noRoutePassesThrough(cell) &&
                this.stationsManager.noStationSet(cell) &&
                this.labelsManager.noLabelSet(cell);
        }
        isCellFreeForDrop(cell, exceptStationId) {
            return this.withinBounds(cell.x, cell.y) &&
                this.routesManager.noRoutePassesThrough(cell, exceptStationId) &&
                this.stationsManager.noStationSet(cell, exceptStationId);
        }
        redrawGrid() {
            let oldGrid = document.getElementById(this.gridElementId);
            if (oldGrid != null)
                oldGrid.remove();
            let attrs = {
                'id': this.gridElementId,
                'stroke': '#4e4e4e',
                'stroke-width': '0.5',
                'visibility': 'visible'
            };
            let gridContainer = SVG_1.SVG.createGroup(attrs);
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
            if (!this.dragMode) {
                if (this.isCellFullyAvailable(cell)) {
                    this.canvas.style.cursor = "cell";
                }
                else {
                    this.canvas.style.cursor = "not-allowed";
                }
            }
        }
        redrawMap(subwayMap) {
            this.eraseMap();
            this.drawRoutes(subwayMap);
            this.drawStations(subwayMap);
            this.drawLabels(subwayMap);
            this.stationsManager.completeProcessing();
            if (subwayMap.currentRoute != null)
                this.selectRoute(subwayMap.currentRoute);
        }
        selectRoute(route) {
            for (let station of route.stations) {
                let stationElement = document.getElementById(`station-${station.id}`);
                if (station != route.last)
                    stationElement.classList.add("selected");
                else
                    stationElement.classList.add("last-selected");
            }
        }
        deselectRoute(route) {
            for (let station of route.stations) {
                let stationElement = document.getElementById(`station-${station.id}`);
                stationElement.classList.remove("selected", "last-selected");
            }
        }
        trySetColor(routeId, color) {
            let route = document.getElementById(`route-${routeId}`);
            if (route == null)
                return;
            let groups = [...route.querySelectorAll("g")];
            if (groups.length > color.length) {
                groups[1].remove();
            }
            else if (groups.length < color.length) {
                let newGroup = groups[0].cloneNode(true);
                groups.push(newGroup);
                route.appendChild(newGroup);
            }
            groups[0].setAttribute("stroke", color[0]);
            // case for 2-colored lines
            if (color.length == 2) {
                groups[1].setAttribute("stroke", color[1]);
                groups[1].setAttribute("stroke-dasharray", `${this.geometry.cellSize / 2}`);
            }
        }
        eraseMap() {
            this.routesManager.clear();
            this.stationsManager.clear();
            this.labelsManager.clear();
            let node = this.canvas;
            while (node.lastElementChild.id != this.gridElementId) {
                node.lastElementChild.remove();
            }
        }
        drawRoutes(subwayMap) {
            for (let routeParent of this.routesManager.processAll(subwayMap)) {
                // insert routes after Grid BUT before stations
                this.canvas.firstChild.after(routeParent);
            }
        }
        drawStations(subwayMap) {
            for (let station of subwayMap.stations) {
                let shape = this.stationsManager.process(station);
                this.canvas.appendChild(shape);
            }
        }
        drawLabels(subwayMap) {
            for (let station of subwayMap.stations) {
                let stationBounds = this.stationsManager.getBounds(station.id);
                let label = this.labelsManager.process(station.label, stationBounds);
                this.canvas.appendChild(label);
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