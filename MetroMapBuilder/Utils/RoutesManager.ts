import { Route } from "../Models/Route";
import { SVG } from "./SVG";
import { Geometry, Segment, Point } from "./Geometry";
import { Connection, Direction } from "../Models/ConnectionModel";

type RouteInfo = {
    route: Route,
    visited: boolean,
    reverse: boolean
}

export class RoutesManager {
    // map of cell keys (x-y) to station ids which uses these cells for connection
    private occupiedCells: Map<string, Set<number>> = new Map<string, Set<number>>();

    public constructor(private geometry: Geometry, private connetionCallback: (c: Connection) => void) {

    }

    public noRoutePassesThrough(cell: Point, exceptStationId?: number): boolean {
        let key = `${cell.x}-${cell.y}`;

        // absent in occupied cells list? - cool, return true
        if (!this.occupiedCells.has(key))
            return true;

        // present in list but may be we have to ignore this for particular station? (for drag'n'drop algo)
        // need to check if we were provided by exception, if not then cell is definitely occupied
        if (exceptStationId == undefined)
            return false;

        // if exceptStationId is provided check its presence in a list for the cell
        // if present - handle cell as free because it falls in exception now and return true
        // otherwise - handle cell as occupied one and return false
        let stations = this.occupiedCells.get(key);
        return stations.has(exceptStationId);
    }

    public clear(): void {
        this.occupiedCells.clear();
    }

    public * processAll(routes: Route[]): IterableIterator<SVGElement> {
        let routesInfo = new Map(routes.map(r => [r.id, { route: r, visited: false, reverse: false }]));

        for (let i = 0; i < routes.length; i++) {
            let route = routes[i];
            routesInfo.get(route.id).visited = true;

            let routeParent = SVG.createGroup({ id: `route-${route.id}`, "stroke-width": this.geometry.lineWidth });
            let colorGroups = [SVG.createGroup({ stroke: route.color[0] })];

            // case for 2-colored lines
            if (route.color.length == 2) {
                let group = SVG.createGroup({ stroke: route.color[1], "stroke-dasharray": `${this.geometry.cellSize / 2}` });
                colorGroups.push(group);
            }

            this.processOne(route, colorGroups, routesInfo);

            colorGroups.forEach(gr => routeParent.append(gr));
            yield routeParent;
        }
    }

    private processOne(route: Route, parents: SVGElement[], routeInfoMap: Map<number, RouteInfo>) {
        let reverseFlag = routeInfoMap.get(route.id).reverse;
        for (let connection of route.getConnections(reverseFlag)) {
            let from = this.geometry.centrify(connection.from);
            let to = this.geometry.centrify(connection.to);

            let offset = this.calculateOffset(connection, route);
            let segment = this.geometry.offsetConnection(from, to, offset);

            this.connetionCallback(connection);

            this.visitAdjacentRoutes(connection, routeInfoMap);

            //this.createSvgConnetion(segment, connInfo.data, connInfo.prev, connInfo.next);
            parents.forEach(p => p.appendChild(SVG.straightConnection(segment.from, segment.to)));

            this.storeCellsOccupiedByLine(segment, connection);
        }
    }

    private visitAdjacentRoutes(connection: Connection, routeInfo: Map<number, RouteInfo>): void {
        if (connection.passingRoutes.size == 1)
            return; // nothing todo as there are no adjacents

        for (let routeId of connection.passingRoutes) {
            if (routeInfo.get(routeId).visited)
                continue;

            routeInfo.get(routeId).reverse = routeInfo.get(routeId).route.isReversedRelativeTo(connection);
            routeInfo.get(routeId).visited = true;
        }
    }

    private calculateOffset(connection: Connection, route: Route) {
        let fullDistance = this.geometry.distanceOfParallelLines(connection.passingRoutes.size);
        let radius = fullDistance / 2; // we need the half of distance because we draw lines by offsetting them by BOTH sides of central point

        let offsetFactor = Array.from(connection.passingRoutes).sort((a, b) => a - b).indexOf(route.id);

        return (-radius + this.geometry.halfOfLineWidth) + (offsetFactor * (this.geometry.lineWidth + this.geometry.distanceBetweenLines));
    }

    //private createSvgConnetion(segment: Segment, current: Connection, prev: Direction, next: Direction): SVGGElement {
    //    let isStraight = this.shouldBeStraightLine(current.direction, prev, next);

    //    this.connetionCallback(current, isStraight);

    //    return isStraight ?
    //        SVG.straightConnection(segment.from, segment.to) :
    //        this.createCurveConnection(segment, prev, next);
    //}

    //private createCurveConnection(segment: Segment, prev: Direction, next: Direction): SVGGElement {
    //    let controlPoint = this.getControlPoint(segment, prev, next);
    //    return SVG.curveConnection(segment.from, segment.to, controlPoint);
    //}

    //private shouldBeStraightLine(current: Direction, prev: Direction, next: Direction): boolean {
    //    return this.isStraightLine(current) || // current is a straight line, nothing to do                 
    //        (prev != null && this.isDiagonal(prev)) || // if current is a continuation of an diagonal then draw it as diagonal
    //        (next != null && this.isDiagonal(next)) || // or maybe current is first segment of diagonal line which will be further continued
    //        (prev == null && next == null); // last chance: current can be just a segment without next and prev neighboring segments
    //}

    //public getControlPoint(segment: Segment, prev: Direction, next: Direction): Point {
    //    if (next == Direction.vertical) {
    //        return { x: segment.to.x, y: segment.from.y };
    //    }

    //    if (next == Direction.horizontal) {
    //        return { x: segment.from.x, y: segment.to.y };
    //    }

    //    if (next == null && prev == Direction.horizontal) {
    //        return { x: segment.to.x, y: segment.from.y };
    //    }

    //    if (next == null && prev == Direction.vertical) {
    //        return { x: segment.from.x, y: segment.to.y };
    //    }
    //}

    //private isStraightLine(direction: Direction): boolean {
    //    return direction == Direction.horizontal ||
    //        direction == Direction.vertical;
    //}

    //private isDiagonal(direction: Direction): boolean {
    //    return direction == Direction.leftDiagonal ||
    //        direction == Direction.rightDiagonal;
    //}

    private storeCellsOccupiedByLine(segment: Segment, connection: Connection): void {
        let fromId = connection.from.id;
        let toId = connection.to.id;

        for (let point of this.geometry.digitalDiffAnalyzer(segment, connection.direction)) {
            let key = `${point.x}-${point.y}`;
            let storage = this.getStorage(key);
            storage.add(fromId);
            storage.add(toId);
        }
    }

    private getStorage(key: string): Set<number> {
        if (!this.occupiedCells.has(key)) {
            this.occupiedCells.set(key, new Set());
        }
        return this.occupiedCells.get(key);
    }
}