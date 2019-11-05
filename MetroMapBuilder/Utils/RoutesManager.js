define(["require", "exports", "./SVG"], function (require, exports, SVG_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RoutesManager {
        constructor(geometry, connetionCallback) {
            this.geometry = geometry;
            this.connetionCallback = connetionCallback;
            // map of cell keys (x-y) to station ids which uses these cell for connection
            this.occupiedCells = new Map();
        }
        process(route) {
            let routeParent = SVG_1.SVG.createGroup({ id: `route-${route.id}`, "stroke-width": this.geometry.lineWidth });
            let colorGroupes = [SVG_1.SVG.createGroup({ stroke: route.color[0] })];
            // case for 2-colored lines
            if (route.color.length == 2) {
                let group = SVG_1.SVG.createGroup({ stroke: route.color[1], "stroke-dasharray": `${this.geometry.cellSize / 2}` });
                colorGroupes.push(group);
            }
            for (let connInfo of route.getConnectionsInfo()) {
                let from = this.geometry.centrify(connInfo.data.from);
                let to = this.geometry.centrify(connInfo.data.to);
                let offset = this.calculateOffset(connInfo.data, route);
                let segment = this.geometry.offsetConnection(from, to, offset);
                this.connetionCallback(connInfo.data);
                for (let i = 0; i < colorGroupes.length; i++) {
                    let parent = colorGroupes[i];
                    let svgPath = SVG_1.SVG.straightConnection(segment.from, segment.to); //this.createSvgConnetion(segment, connInfo.data, connInfo.prev, connInfo.next);
                    parent.appendChild(svgPath);
                }
                this.storeCellsOccupiedByLine(segment, connInfo.data);
            }
            for (let i = 0; i < colorGroupes.length; i++) {
                let colorGroup = colorGroupes[i];
                routeParent.appendChild(colorGroup);
            }
            return routeParent;
        }
        noRoutePassesThrough(cell, exceptStationId) {
            let key = `${cell.x}-${cell.y}`;
            // absent in occupied cells list? - cool, return true
            if (!this.occupiedCells.has(key))
                return true;
            // present in list but may be we have to ignore this for particular station? (for drag'n'drop algo)
            // need to check if we were provided by exception, if not then cell is definitely occupied
            if (exceptStationId == undefined)
                return false;
            // if exceptStationId is provided check it presence in a list for the cell
            // if present - handle cell as free because it falls in exception now and return true
            // otherwise - handle cell as occupied and return false
            let stations = this.occupiedCells.get(key);
            return stations.has(exceptStationId);
        }
        clear() {
            this.occupiedCells.clear();
        }
        calculateOffset(connection, route) {
            let fullDistance = this.geometry.distanceOfParallelLines(connection.routesCount);
            let radius = fullDistance / 2; // we need the half of distance because we draw lines by offsetting them by BOTH sides of central point
            let offsetFactor = connection.routeOrder(route);
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
        storeCellsOccupiedByLine(segment, connection) {
            let fromId = connection.from.id;
            let toId = connection.to.id;
            for (let point of this.geometry.digitalDiffAnalyzer(segment, connection.direction)) {
                let key = `${point.x}-${point.y}`;
                let storage = this.getStorage(key);
                storage.add(fromId);
                storage.add(toId);
            }
        }
        getStorage(key) {
            if (!this.occupiedCells.has(key)) {
                this.occupiedCells.set(key, new Set());
            }
            return this.occupiedCells.get(key);
        }
    }
    exports.RoutesManager = RoutesManager;
});
//# sourceMappingURL=RoutesManager.js.map