import { SVG } from "./SVG";
import { SubwayMap } from "../Models/SubwayMap";
import { Connection } from "../Models/ConnectionModel";
import { Route } from "../Models/Route";
import { Station, Label } from "../Models/StationModel";
import { Geometry, Segment, Point } from "./Geometry";

export class MapView {
    private occupiedCells: Set<string> = new Set<string>();
    private userDefinedLabels: Set<number> = new Set<number>();
    private highlightedLines: HTMLElement[] = [];
    private gridElementId: string = "grid";

    public constructor(private canvas: SVGSVGElement, private geometry: Geometry) {
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
        this.drawLabels(subwayMap); // we have to draw labels first in order to allow stations be over labels in case of their overlapping
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
    
    public changeRouteColor(routeId: number, color: string): void {
        let route = document.getElementById(`route-${routeId}`);

        if (route == null) {
            console.error(`Cannot find route ${routeId} to change its color`);
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
            this.storeCellsOccupiedByLine(segment);
        }

        // insert routes after Grid BUT before stations
        this.canvas.firstChild.after(routeParent);
    }
    
    private storeCellsOccupiedByLine(segment: Segment) {
        // TODO take into account line width (lineWidthFactor)
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
        // TODO calculate size and shape of station
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
        let center = this.geometry.centrify(station);
        let circle = SVG.circleStation(center.x, center.y, this.geometry.radius, `station-${station.id}`, station.id);
        this.storeCellsOccupiedByStation(station);
        this.canvas.appendChild(circle);
    }

    private drawLabel(station: Station): void {
        // if user has already defined position manually do not override them
        if (!this.userDefinedLabels.has(station.id)) {
            let position = this.calculateLabelPosition(station);
            station.label.setCoordinates(position.x, position.y);
        }

        this.storeCellsOccupiedByLabel(station.label);
        let labelStart = this.geometry.baselinePoint(station.label);
        let label = SVG.labelText(labelStart, this.geometry.fontSize, this.geometry.cellSize, station.label.name, station.id);
        this.canvas.appendChild(label);
    }

    private storeCellsOccupiedByLabel(label: Label) {
        let labelWidth = this.geometry.labelWidthInCells(label.width);
        for (let dx = 0; dx < labelWidth; dx++) {
            for (let dy = 0; dy < label.height; dy++) {
                let x = label.x + dx;
                let y = label.y + dy;
                this.occupiedCells.add(`${x}-${y}`);
            }
        }
    }

    // walking through current and neighboring cells and mark them as unavailable for 
    // further station set up - stations must not be placed in neighboring cells
    private storeCellsOccupiedByStation(station: Station): void {
        for (let dx = -1; dx < 2; dx++) {
            for (let dy = -1; dy < 2; dy++) {
                let x = station.x + dx;
                let y = station.y + dy;
                this.occupiedCells.add(`${x}-${y}`);
            }
        }
    }

    private calculateLabelPosition(station: Station): Point {
        return this.tryPutOnRight(station) ||
            this.tryPutOnBottom(station) ||
            this.tryPutOnLeft(station) ||
            this.tryPutOnTop(station) ||
            this.tryPutOnRightOffset(station) ||
            this.tryPutOnBottomOffset(station) ||
            this.tryPutOnLeftOffset(station) ||
            this.tryPutOnTopOffset(station) ||
            // default: put on right or left if grid does not allow
            {
                x: station.x < this.geometry.gridSize - 1 ? station.x + 1 : station.x - 1,
                y: station.y
            }; 
    }

    private tryPutOnRight(station: Station): Point {
        let startX = station.x + 1; // always the same for right side
        let labelWidth = this.geometry.labelWidthInCells(station.label.width);

        // first try set up label symmetrically by height relative to station
        let labelRowOppositeToStation = Math.floor(station.label.height / 2);
        let startY = station.y - labelRowOppositeToStation;        

        return this.hasFreeSpaceForLabel(startX, startY, labelWidth, station.label.height) ?
            { x: startX, y: startY } : null;
    }

    private tryPutOnRightOffset(station: Station): Point {
        let startX = station.x + 1; // always the same for right side
        let labelWidth = this.geometry.labelWidthInCells(station.label.width);

        // first try set up label symmetrically by height relative to station
        let labelRowOppositeToStation = Math.floor(station.label.height / 2);
        let startY = station.y - labelRowOppositeToStation;    

        // move label down along right side of station until its first row occupy bottom-right neighboring cell 
        let temp = station.label.height - labelRowOppositeToStation;
        let offsetByYtimes = station.label.height % 2 == 0 ? temp - 1 : temp;
        for (let i = 1; i <= offsetByYtimes; i++) {
            let offsetY = startY + i;
            if (this.hasFreeSpaceForLabel(startX, offsetY, labelWidth, station.label.height))
                return { x: startX, y: offsetY };
        }

        // move label up along right side of station until its last row occupy top-right neighboring cell
        offsetByYtimes = station.label.height - labelRowOppositeToStation;
        for (let i = 1; i <= offsetByYtimes; i++) {
            let offsetY = startY - i;
            if (this.hasFreeSpaceForLabel(startX, offsetY, labelWidth, station.label.height))
                return { x: startX, y: offsetY };
        }

        return null;
    }

    private tryPutOnLeft(station: Station): Point {        
        let labelWidth = this.geometry.labelWidthInCells(station.label.width);
        let startX = station.x - labelWidth; // always the same for left side

        // first try set up label symmetrically by height relative to station
        let labelRowOppositeToStation = Math.floor(station.label.height / 2);
        let startY = station.y - labelRowOppositeToStation;

        return this.hasFreeSpaceForLabel(startX, startY, labelWidth, station.label.height) ?
            { x: startX, y: startY } : null;
    }

    private tryPutOnLeftOffset(station: Station): Point {
        let labelWidth = this.geometry.labelWidthInCells(station.label.width);
        let startX = station.x - labelWidth; // always the same for left side
        let labelRowOppositeToStation = Math.floor(station.label.height / 2);
        let startY = station.y - labelRowOppositeToStation;

        // move label up along left side of station until its last row occupy top-left neighboring cell
        let offsetByYtimes = station.label.height - labelRowOppositeToStation;
        for (let i = 1; i <= offsetByYtimes; i++) {
            let offsetY = startY - i;
            if (this.hasFreeSpaceForLabel(startX, offsetY, labelWidth, station.label.height))
                return { x: startX, y: offsetY };
        }

        // move label down along left side of station until its first row occupy bottom-left neighboring cell 
        let temp = station.label.height - labelRowOppositeToStation;
        offsetByYtimes = station.label.height % 2 == 0 ? temp - 1 : temp;
        for (let i = 1; i <= offsetByYtimes; i++) {
            let offsetY = startY + i;
            if (this.hasFreeSpaceForLabel(startX, offsetY, labelWidth, station.label.height))
                return { x: startX, y: offsetY };
        }

        return null;
    }

    private tryPutOnBottom(station: Station): Point {
        let startY = station.y + 1; // always the same for bottom side
        let labelWidth = this.geometry.labelWidthInCells(station.label.width);

        // first try set up label symmetrically by width relative to station
        let labelColumnOppositeToStation = Math.floor(labelWidth / 2);
        let startX = station.x - labelColumnOppositeToStation;

        return this.hasFreeSpaceForLabel(startX, startY, labelWidth, station.label.height) ?
            { x: startX, y: startY } : null;
    }

    private tryPutOnBottomOffset(station: Station): Point {
        let startY = station.y + 1; // always the same for bottom side
        let labelWidth = this.geometry.labelWidthInCells(station.label.width);
        let labelColumnOppositeToStation = Math.floor(labelWidth / 2);
        let startX = station.x - labelColumnOppositeToStation;

        // move label right along bottom side of station until its first column occupy bottom-right neighboring cell 
        let temp = labelWidth - labelColumnOppositeToStation;
        let offsetByXtimes = labelWidth % 2 == 0 ? temp - 1 : temp;
        for (let i = 1; i <= offsetByXtimes; i++) {
            let offsetX = startX + i;
            if (this.hasFreeSpaceForLabel(offsetX, startY, labelWidth, station.label.height))
                return { x: offsetX, y: startY };
        }

        // move label left along bottom side of station until its last column occupy bottom-left neighboring cell
        offsetByXtimes = labelWidth - labelColumnOppositeToStation;
        for (let i = 1; i <= offsetByXtimes; i++) {
            let offsetX = startX - i;
            if (this.hasFreeSpaceForLabel(offsetX, startY, labelWidth, station.label.height))
                return { x: offsetX, y: startY };
        }

        return null;
    }

    private tryPutOnTop(station: Station): Point {
        let startY = station.y - station.label.height; // always the same for top side
        let labelWidth = this.geometry.labelWidthInCells(station.label.width);

        // first try set up label symmetrically by width relative to station
        let labelColumnOppositeToStation = Math.floor(labelWidth / 2);
        let startX = station.x - labelColumnOppositeToStation;

        return this.hasFreeSpaceForLabel(startX, startY, labelWidth, station.label.height) ?
            { x: startX, y: startY } : null;
    }

    private tryPutOnTopOffset(station: Station): Point {
        let startY = station.y - station.label.height; // always the same for top side
        let labelWidth = this.geometry.labelWidthInCells(station.label.width);
        let labelColumnOppositeToStation = Math.floor(labelWidth / 2);
        let startX = station.x - labelColumnOppositeToStation;

        // move label left along top side of station until its last column occupy top-left neighboring cell
        let offsetByXtimes = labelWidth - labelColumnOppositeToStation;
        for (let i = 1; i <= offsetByXtimes; i++) {
            let offsetX = startX - i;
            if (this.hasFreeSpaceForLabel(offsetX, startY, labelWidth, station.label.height))
                return { x: offsetX, y: startY };
        }

        // move label right along top side of station until its first column occupy top-right neighboring cell 
        let temp = labelWidth - labelColumnOppositeToStation;
        offsetByXtimes = labelWidth % 2 == 0 ? temp - 1 : temp;
        for (let i = 1; i <= offsetByXtimes; i++) {
            let offsetX = startX + i;
            if (this.hasFreeSpaceForLabel(offsetX, startY, labelWidth, station.label.height))
                return { x: offsetX, y: startY };
        }

        return null;
    }

    private hasFreeSpaceForLabel(startX: number, startY: number, labelWidth: number, labelHeight: number) {
        for (let dx = 0; dx < labelWidth; dx++) {
            let x = startX + dx;
            for (let dy = 0; dy < labelHeight; dy++) {
                let y = startY + dy;
                if (!this.isCellAvailable({x, y}))
                    return false;
            }
        }
        return true;
    }

    private withinBounds(x: number, y: number): boolean {
        return x >= 0 && x < this.geometry.gridSize &&
               y >= 0 && y < this.geometry.gridSize;
    }
}