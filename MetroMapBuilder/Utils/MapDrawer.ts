import { SVG } from "./SVG";
import { RouteMetadata, Metadata, StationMetadata, Connection } from "./Metadata";
import { Geometry, Segment } from "./Geometry";

export class MapDrawer {
    private occupiedCells: Set<string> = new Set<string>();

    public constructor(private canvas: SVGSVGElement) {

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

        let gridContainer = SVG.groupGridLines("grid");
        // draw vertical lines
        let index = 0;
        for (let x = 0; x <= this.canvas.width.baseVal.value; x += Geometry.cellSize) {
            let line = SVG.gridLine(x, 0, x, this.canvas.height.baseVal.value, `x${index}`);
            gridContainer.appendChild(line);
            index++;
        }

        // draw horizontal lines
        index = 0;
        for (let y = 0; y <= this.canvas.height.baseVal.value; y += Geometry.cellSize) {
            let line = SVG.gridLine(0, y, this.canvas.width.baseVal.value, y, `y${index}`);
            gridContainer.appendChild(line);
            index++;
        }

        if (this.canvas.firstElementChild != null)
            this.canvas.firstElementChild.before(gridContainer);
        else
            this.canvas.appendChild(gridContainer);
    }

    public redrawMap(metadata: Metadata): void {
        this.eraseMap();
        this.drawRoutes(metadata);
        this.drawStations(metadata);
        if (metadata.currentRoute != null)
            this.selectRoute(metadata.currentRoute);
    }

    public selectRoute(route: RouteMetadata): void {
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

    public deselectRoute(route: RouteMetadata): void {
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

    public drawStation(station: StationMetadata): void {
        let center = Geometry.getCenterOfCell(station);
        let circle = SVG.circleStation(center.x, center.y, Geometry.radius, `station-${station.id}`, station.id);
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

    private drawRoute(route: RouteMetadata, lineWidthFactor: number) {
        let lineWidth = Geometry.cellSize * lineWidthFactor;
        let routeParent = SVG.routeGroup(`route-${route.id}`, lineWidth, route.color);

        for (let connection of route.getConnections()) {
            let from = Geometry.getCenterOfCell(connection.from);
            let to = Geometry.getCenterOfCell(connection.to);

            let offset = this.calculateOffset(connection, lineWidth, route);
            let segment = Geometry.offsetConnection(from, to, offset);
            this.drawConnection(routeParent, segment);
            this.storeOccupiedCells(segment);
        }

        // insert routes after Grid BUT before stations
        this.canvas.firstChild.after(routeParent);
    }
    
    private storeOccupiedCells(segment: Segment) {
        for (let point of Geometry.digitalDiffAnalyzer(segment)) {
            let key = `${point.x}-${point.y}`;
            this.occupiedCells.add(key);
        }
    }

    private drawConnection(routeParent: SVGGElement, segment: Segment) {
        let svgLine = SVG.routeConnection(segment.from, segment.to);
        routeParent.appendChild(svgLine);
    }

    private calculateOffset(connection: Connection, lineWidth: number, route: RouteMetadata) {
        let lineCenter = lineWidth / 2;
        let distancesBetweenLines = lineWidth / 2
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

    private eraseMap(): void {
        this.occupiedCells.clear();

        let node = this.canvas;
        while (node.lastElementChild.id != "grid") {
            node.lastElementChild.remove();
        }
    }

    private drawRoutes(metadata: Metadata): void {
        for (let i = 0; i < metadata.routes.length; i++) {
            this.drawRoute(metadata.routes[i], metadata.lineWidthFactor);
        }
    }

    private drawStations(metadata: Metadata): void {
        // TODO calculate size and shape of station
        for (let i = 0; i < metadata.stations.length; i++) {
            this.drawStation(metadata.stations[i]);
        }
    }
}