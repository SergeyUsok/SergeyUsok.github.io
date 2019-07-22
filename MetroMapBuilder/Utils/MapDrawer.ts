import { SVG } from "./SVG";
import { SubwayMap } from "../Models/SubwayMap";
import { Connection } from "../Models/ConnectionModel";
import { Route } from "../Models/Route";
import { Station } from "../Models/StationModel";
import { Geometry, Segment } from "./Geometry";

export class MapDrawer {
    private occupiedCells: Set<string> = new Set<string>();
    private highlightedLines: HTMLElement[] = [];

    public constructor(private canvas: SVGSVGElement, private geometry: Geometry) {

    }

    public getCanvas(): SVGSVGElement {
        return this.canvas;
    }

    public getGroupId(target: Element): number {
        return parseInt(target.parentElement.getAttribute("data-groupId")); // parent of all route elements is is g element
    }

    public getId(target: Element): number {
        return parseInt(target.getAttribute("data-id"));
    }

    public redrawGrid() {
        let oldGrid = document.getElementById("grid");
        if (oldGrid != null)
            oldGrid.remove();

        let gridContainer = SVG.gridGroup("grid");
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

    public highlightCell(x: number, y: number) {
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

    public redrawMap(subwayMap: SubwayMap): void {
        this.eraseMap();
        this.drawRoutes(subwayMap);
        this.drawStations(subwayMap);
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

    public drawStation(station: Station): void {
        let center = this.geometry.centrify(station);
        let circle = SVG.circleStation(center.x, center.y, this.geometry.radius, `station-${station.id}`, station.id);
        this.canvas.appendChild(circle);
    }

    public changeRouteColor(routeId: number, color: string): void {
        let route = document.getElementById(`route-${routeId}`);

        if (route == null) {
            console.error(`Cannot find route ${routeId} to change it color`);
            return;
        }

        route.setAttribute('stroke', color);
    }

    private drawRoute(route: Route) {
        let routeParent = SVG.routeGroup(`route-${route.id}`, this.geometry.lineWidth, route.color);

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
    
    private storeOccupiedCells(segment: Segment) {
        for (let point of this.geometry.digitalDiffAnalyzer(segment)) {
            let key = `${point.x}-${point.y}`;
            this.occupiedCells.add(key);
        }
    }

    private drawConnection(routeParent: SVGGElement, segment: Segment) {
        let svgLine = SVG.routeConnection(segment.from, segment.to);
        routeParent.appendChild(svgLine);
    }

    private calculateOffset(connection: Connection, route: Route) {
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

    private eraseMap(): void {
        this.occupiedCells.clear();

        let node = this.canvas;
        while (node.lastElementChild.id != "grid") {
            node.lastElementChild.remove();
        }
    }

    private drawRoutes(subwayMap: SubwayMap): void {
        for (let i = 0; i < subwayMap.routes.length; i++) {
            this.drawRoute(subwayMap.routes[i]);
        }
    }

    private drawStations(subwayMap: SubwayMap): void {
        // TODO calculate size and shape of station
        for (let i = 0; i < subwayMap.stations.length; i++) {
            this.drawStation(subwayMap.stations[i]);
        }
    }
}