﻿import { SVG } from "./SVG";
import { SubwayMap } from "../Models/SubwayMap";
import { Connection, Direction } from "../Models/ConnectionModel";
import { Route } from "../Models/Route";
import { Station } from "../Models/StationModel";
import { Geometry, Segment, Point } from "./Geometry";
import { StationsManager } from "./StationsManager";
import { LabelsManager } from "./LabelsManager";

export class MapView {
    private occupiedCells: Set<string> = new Set<string>();
    private stationsManager: StationsManager;
    private labelsManager: LabelsManager;
    private gridElementId: string = "grid";

    public constructor(private canvas: SVGSVGElement, private geometry: Geometry) {
        this.stationsManager = new StationsManager(geometry);
        this.labelsManager = new LabelsManager(geometry, p => this.isCellAvailable(p));
    }

    public getCanvas(): SVGSVGElement {
        return this.canvas;
    }

    public getId(target: Element): number {
        return parseInt(target.getAttribute("data-id"));
    }

    public isCellAvailable(cell: Point): boolean {
        return this.withinBounds(cell.x, cell.y) && !this.occupiedCells.has(`${cell.x}-${cell.y}`);
    }

    public redrawGrid() {
        let oldGrid = document.getElementById(this.gridElementId);
        if (oldGrid != null)
            oldGrid.remove();

        let gridContainer = SVG.gridGroup(this.gridElementId);
        // draw vertical lines
        let index = 0;
        for (let x = 0; x <= this.canvas.width.baseVal.value; x += this.geometry.cellSize) {
            let line = SVG.gridLine(x, 0, x, this.canvas.height.baseVal.value, `x${index}`);
            gridContainer.appendChild(line);
            index++;
        }

        // draw horizontal lines
        index = 0;
        for (let y = 0; y <= this.canvas.height.baseVal.value; y += this.geometry.cellSize) {
            let line = SVG.gridLine(0, y, this.canvas.width.baseVal.value, y, `y${index}`);
            gridContainer.appendChild(line);
            index++;
        }

        if (this.canvas.firstElementChild != null)
            this.canvas.firstElementChild.before(gridContainer);
        else
            this.canvas.appendChild(gridContainer);
    }

    public toggleGrid(): void {
        let grid = document.getElementById(this.gridElementId);

        grid.getAttribute("visibility") == "visible" ?
            grid.setAttribute("visibility", "hidden") :
            grid.setAttribute("visibility", "visible");
    }

    public highlightCell(x: number, y: number) {
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

    public redrawMap(subwayMap: SubwayMap): void {
        this.eraseMap();
        this.drawRoutes(subwayMap);
        this.drawStations(subwayMap);
        this.drawLabels(subwayMap);
        this.storeOccupiedCells(this.stationsManager.getOccupiedCellsIncludingSurrounding());
        if (subwayMap.currentRoute != null)
            this.selectRoute(subwayMap.currentRoute);
    }

    public selectRoute(route: Route): void {
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

    public deselectRoute(route: Route): void {
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

    public trySetColor(routeId: number, color: string[]): void {
        let route = document.getElementById(`route-${routeId}`);

        if (route == null)
            return;

        let groups = [...route.querySelectorAll("g")];

        if (groups.length > color.length) {
            groups[1].remove();
        }
        else if (groups.length < color.length) {
            let newGroup = <any>groups[0].cloneNode(true);
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

    private drawRoute(route: Route) {
        let routeParent = SVG.createGroup({ id: `route-${route.id}`, "stroke-width": this.geometry.lineWidth });
        let colorGroupes = [SVG.createGroup({ stroke: route.color[0] })];

        // case for 2-colored lines
        if (route.color.length == 2) {
            let group = SVG.createGroup({ stroke: route.color[1], "stroke-dasharray": `${this.geometry.cellSize/2}` });
            colorGroupes.push(group);
        }

        for (let connection of route.getConnections()) {
            let from = this.geometry.centrify(connection.from);
            let to = this.geometry.centrify(connection.to);
            this.stationsManager.addMetadata(connection);

            let offset = this.calculateOffset(connection, route);
            let segment = this.geometry.offsetConnection(from, to, offset);

            for (let i = 0; i < colorGroupes.length; i++) {
                let parent = colorGroupes[i];
                this.drawConnection(parent, segment);
            }

            this.storeCellsOccupiedByLine(segment, connection.direction);
        }

        for (let i = 0; i < colorGroupes.length; i++) {
            let colorGroup = colorGroupes[i];
            routeParent.appendChild(colorGroup);
        }

        // insert routes after Grid BUT before stations
        this.canvas.firstChild.after(routeParent);
    }
    
    private storeCellsOccupiedByLine(segment: Segment, direction: Direction) {
        for (let point of this.geometry.digitalDiffAnalyzer(segment, direction)) {
            let key = `${point.x}-${point.y}`;
            this.occupiedCells.add(key);
        }
    }

    private drawConnection(routeParent: SVGGElement, segment: Segment) {
        let svgLine = SVG.routeConnection(segment.from, segment.to);
        routeParent.appendChild(svgLine);
    }

    private calculateOffset(connection: Connection, route: Route) {
        let fullDistance = this.geometry.distanceOfParallelLines(connection.routesCount);
        let radius = fullDistance / 2; // we need the half of distance because we draw lines by offsetting them by BOTH sides of central point

        let offsetFactor = connection.routeOrder(route);

        return (-radius + this.geometry.halfOfLineWidth) + (offsetFactor * (this.geometry.lineWidth + this.geometry.distanceBetweenLines));
    }

    private eraseMap(): void {
        this.occupiedCells.clear();
        this.stationsManager.clear();

        let node = this.canvas;
        while (node.lastElementChild.id != this.gridElementId) {
            node.lastElementChild.remove();
        }
    }

    private drawRoutes(subwayMap: SubwayMap): void {
        for (let i = 0; i < subwayMap.routes.length; i++) {
            this.drawRoute(subwayMap.routes[i]);
        }
    }

    private drawStations(subwayMap: SubwayMap): void {
        for (let i = 0; i < subwayMap.stations.length; i++) {
            this.drawStation(subwayMap.stations[i]);
        }
    }

    private drawLabels(subwayMap: SubwayMap): void {
        for (let i = 0; i < subwayMap.stations.length; i++) {
            this.drawLabel(subwayMap.stations[i]);
        }
    }

    private drawStation(station: Station): void {
        let shapeInfo = this.stationsManager.process(station);
        this.storeOccupiedCells(shapeInfo.cells.values())
        this.canvas.appendChild(shapeInfo.shape);
    }

    private drawLabel(station: Station): void {
        let stationBounds = this.stationsManager.getBounds(station.id);
        let labelInfo = this.labelsManager.process(station.label, stationBounds);

        this.storeOccupiedCells(labelInfo.cells.values());
        this.canvas.appendChild(labelInfo.labelText);
    }

    private storeOccupiedCells(cells: IterableIterator<string>): void {
        for (let cell of cells) {
            this.occupiedCells.add(cell);
        }
    }

    private withinBounds(x: number, y: number): boolean {
        return x >= 0 && x < this.geometry.gridSize &&
               y >= 0 && y < this.geometry.gridSize;
    }
}