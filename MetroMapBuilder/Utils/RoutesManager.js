define(["require", "exports", "./SVG", "../Models/ConnectionModel"], function (require, exports, SVG_1, ConnectionModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RoutesManager {
        constructor(geometry, connetionCallback) {
            this.geometry = geometry;
            this.connetionCallback = connetionCallback;
            // map of cell keys (x-y) to station ids which uses these cells for connection
            this.occupiedCells = new Map();
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
            // if exceptStationId is provided check its presence in a list for the cell
            // if present - handle cell as free because it falls in exception now and return true
            // otherwise - handle cell as occupied one and return false
            let stations = this.occupiedCells.get(key);
            return stations.has(exceptStationId);
        }
        clear() {
            this.occupiedCells.clear();
        }
        *processAll(subwayMap) {
            let routesInfo = new Map(subwayMap.routes.map(r => [r.id, {
                    route: r,
                    visited: false,
                    reverse: false,
                    priority: 10 // some default magic number which will be used as reference value for caclulating priorities of adjacent lines
                }]));
            for (let route of subwayMap.getOrderedRoutes()) {
                routesInfo.get(route.id).visited = true;
                let routeParent = SVG_1.SVG.createGroup({ id: `route-${route.id}`, "stroke-width": this.geometry.lineWidth });
                let colorGroups = [SVG_1.SVG.createGroup({ stroke: route.color[0] })];
                // case for 2-colored lines
                if (route.color.length == 2) {
                    let group = SVG_1.SVG.createGroup({ stroke: route.color[1], "stroke-dasharray": `${this.geometry.cellSize / 2}` });
                    colorGroups.push(group);
                }
                this.processOne(route, colorGroups, routesInfo);
                colorGroups.forEach(gr => routeParent.append(gr));
                yield routeParent;
            }
        }
        processOne(route, parents, routeInfoMap) {
            let routeInfo = routeInfoMap.get(route.id);
            for (let connection of route.getConnections(routeInfo.reverse).values()) {
                let from = this.geometry.centrify(connection.from);
                let to = this.geometry.centrify(connection.to);
                this.visitAdjacentRoutes(connection, routeInfoMap, routeInfo.priority);
                let offset = this.calculateOffset(connection, route, routeInfoMap);
                let segment = this.geometry.offsetConnection(from, to, offset);
                this.connetionCallback(connection);
                //this.createSvgConnetion(segment, connInfo.data, connInfo.prev, connInfo.next);
                parents.forEach(p => p.appendChild(SVG_1.SVG.straightConnection(segment.from, segment.to)));
                this.storeCellsOccupiedByLine(segment, connection);
            }
        }
        // TODO:
        // implement get getConnection on route properly
        // check issue with equal priorities
        // why current route is not more important than adjacents in terms of turns calculation 
        // check case of 2 lines comes from left with equal and different priorities
        visitAdjacentRoutes(connection, routeInfo, priority) {
            if (connection.passingRoutes.length == 1)
                return; // nothing to do as there are no adjacent lines
            for (let routeId of connection.passingRoutes) {
                let adjacent = routeInfo.get(routeId);
                if (adjacent.visited) {
                    continue;
                }
                adjacent.reverse = adjacent.route.isReversedRelativeTo(connection);
                adjacent.priority = this.prioritize(connection, adjacent, priority);
                adjacent.visited = true;
            }
        }
        // 1. first check where adjacent line comes from (taking into account the reverse)
        // and based on this info calculate priority.
        // 2. if no previous, then check where both adjacent and current lines go to, but lookahead till the lines divergence
        // 3. calculate the priority for the pair of lines
        // E.g. line comes from left and becomes adjacent of current line going to south (from top to down)
        // Then the line should be drawn as the most left adjacent of current line
        prioritize(connection, adjacent, referencePriority) {
            let adjConnection = adjacent.route.findConnection(connection, adjacent.reverse);
            if (adjConnection.prev != null) {
                let priority = this.getPriorityBasedOnPrev(connection.direction, adjConnection.prev.direction, referencePriority);
                if (priority != referencePriority) {
                    // in case of equal priorities (both connections share same direction) try find differences
                    // in next connection directions, otherwise return calculated priority
                    return priority;
                }
            }
            let currNext = connection.next;
            let adjNext = adjConnection.next;
            while (currNext != null && adjNext != null && currNext.direction == adjNext.direction) {
                currNext = currNext.next;
                adjNext = adjNext.next;
            }
            if (adjNext != null) {
                return this.getPriorityBasedOnNext(adjNext.prev.direction, adjNext.direction, referencePriority);
            }
            return referencePriority;
        }
        getPriorityBasedOnNext(current, next, referencePriorityValue) {
            if (current == ConnectionModel_1.Direction.south) { // current moves from top to down
                switch (next) {
                    case ConnectionModel_1.Direction.east:
                    case ConnectionModel_1.Direction.northEast:
                    case ConnectionModel_1.Direction.southEast: // came from left side
                        return --referencePriorityValue; // increment because the highest value will be drawn on left
                    case ConnectionModel_1.Direction.west:
                    case ConnectionModel_1.Direction.northWest:
                    case ConnectionModel_1.Direction.southWest: // came from right
                        return ++referencePriorityValue; // decrement because the lowest value will be drawn on right
                }
            }
            if (current == ConnectionModel_1.Direction.north) { // current moves from down to top
                switch (next) {
                    case ConnectionModel_1.Direction.east:
                    case ConnectionModel_1.Direction.northEast:
                    case ConnectionModel_1.Direction.southEast:
                        return ++referencePriorityValue;
                    case ConnectionModel_1.Direction.west:
                    case ConnectionModel_1.Direction.northWest:
                    case ConnectionModel_1.Direction.southWest:
                        return --referencePriorityValue;
                }
            }
            if (current == ConnectionModel_1.Direction.west) {
                switch (next) {
                    case ConnectionModel_1.Direction.south:
                    case ConnectionModel_1.Direction.southWest:
                    case ConnectionModel_1.Direction.southEast:
                        return --referencePriorityValue;
                    case ConnectionModel_1.Direction.north:
                    case ConnectionModel_1.Direction.northWest:
                    case ConnectionModel_1.Direction.northEast:
                        return ++referencePriorityValue;
                }
            }
            if (current == ConnectionModel_1.Direction.east) {
                switch (next) {
                    case ConnectionModel_1.Direction.south:
                    case ConnectionModel_1.Direction.southWest:
                    case ConnectionModel_1.Direction.southEast:
                        return ++referencePriorityValue;
                    case ConnectionModel_1.Direction.north:
                    case ConnectionModel_1.Direction.northWest:
                    case ConnectionModel_1.Direction.northEast:
                        return --referencePriorityValue;
                }
            }
            if (current == ConnectionModel_1.Direction.southEast) {
                switch (next) {
                    case ConnectionModel_1.Direction.north:
                    case ConnectionModel_1.Direction.east:
                    case ConnectionModel_1.Direction.northEast:
                        return --referencePriorityValue;
                    case ConnectionModel_1.Direction.south:
                    case ConnectionModel_1.Direction.west:
                    case ConnectionModel_1.Direction.southWest:
                        return ++referencePriorityValue;
                }
            }
            if (current == ConnectionModel_1.Direction.northWest) {
                switch (next) {
                    case ConnectionModel_1.Direction.north:
                    case ConnectionModel_1.Direction.east:
                    case ConnectionModel_1.Direction.northEast:
                        return ++referencePriorityValue;
                    case ConnectionModel_1.Direction.south:
                    case ConnectionModel_1.Direction.west:
                    case ConnectionModel_1.Direction.southWest:
                        return --referencePriorityValue;
                }
            }
            if (current == ConnectionModel_1.Direction.northEast) {
                switch (next) {
                    case ConnectionModel_1.Direction.south:
                    case ConnectionModel_1.Direction.east:
                    case ConnectionModel_1.Direction.southEast:
                        return ++referencePriorityValue;
                    case ConnectionModel_1.Direction.north:
                    case ConnectionModel_1.Direction.west:
                    case ConnectionModel_1.Direction.northWest:
                        return --referencePriorityValue;
                }
            }
            if (current == ConnectionModel_1.Direction.southWest) {
                switch (next) {
                    case ConnectionModel_1.Direction.south:
                    case ConnectionModel_1.Direction.east:
                    case ConnectionModel_1.Direction.southEast:
                        return --referencePriorityValue;
                    case ConnectionModel_1.Direction.north:
                    case ConnectionModel_1.Direction.west:
                    case ConnectionModel_1.Direction.northWest:
                        return ++referencePriorityValue;
                }
            }
            return referencePriorityValue;
        }
        getPriorityBasedOnPrev(current, prev, referencePriorityValue) {
            if (current == ConnectionModel_1.Direction.south) { // current moves from top to down
                switch (prev) {
                    case ConnectionModel_1.Direction.east:
                    case ConnectionModel_1.Direction.northEast:
                    case ConnectionModel_1.Direction.southEast: // came from left side
                        return ++referencePriorityValue; // increment because the highest value will be drawn on left
                    case ConnectionModel_1.Direction.west:
                    case ConnectionModel_1.Direction.northWest:
                    case ConnectionModel_1.Direction.southWest: // came from right
                        return --referencePriorityValue; // decrement because the lowest value will be drawn on right
                }
            }
            if (current == ConnectionModel_1.Direction.north) { // current moves from down to top
                switch (prev) {
                    case ConnectionModel_1.Direction.east:
                    case ConnectionModel_1.Direction.northEast:
                    case ConnectionModel_1.Direction.southEast:
                        return --referencePriorityValue;
                    case ConnectionModel_1.Direction.west:
                    case ConnectionModel_1.Direction.northWest:
                    case ConnectionModel_1.Direction.southWest:
                        return ++referencePriorityValue;
                }
            }
            if (current == ConnectionModel_1.Direction.west) {
                switch (prev) {
                    case ConnectionModel_1.Direction.south:
                    case ConnectionModel_1.Direction.southWest:
                    case ConnectionModel_1.Direction.southEast:
                        return ++referencePriorityValue;
                    case ConnectionModel_1.Direction.north:
                    case ConnectionModel_1.Direction.northWest:
                    case ConnectionModel_1.Direction.northEast:
                        return --referencePriorityValue;
                }
            }
            if (current == ConnectionModel_1.Direction.east) {
                switch (prev) {
                    case ConnectionModel_1.Direction.south:
                    case ConnectionModel_1.Direction.southWest:
                    case ConnectionModel_1.Direction.southEast:
                        return --referencePriorityValue;
                    case ConnectionModel_1.Direction.north:
                    case ConnectionModel_1.Direction.northWest:
                    case ConnectionModel_1.Direction.northEast:
                        return ++referencePriorityValue;
                }
            }
            if (current == ConnectionModel_1.Direction.southEast) {
                switch (prev) {
                    case ConnectionModel_1.Direction.north:
                    case ConnectionModel_1.Direction.east:
                    case ConnectionModel_1.Direction.northEast:
                        return ++referencePriorityValue;
                    case ConnectionModel_1.Direction.south:
                    case ConnectionModel_1.Direction.west:
                    case ConnectionModel_1.Direction.southWest:
                        return --referencePriorityValue;
                }
            }
            if (current == ConnectionModel_1.Direction.northWest) {
                switch (prev) {
                    case ConnectionModel_1.Direction.north:
                    case ConnectionModel_1.Direction.east:
                    case ConnectionModel_1.Direction.northEast:
                        return --referencePriorityValue;
                    case ConnectionModel_1.Direction.south:
                    case ConnectionModel_1.Direction.west:
                    case ConnectionModel_1.Direction.southWest:
                        return ++referencePriorityValue;
                }
            }
            if (current == ConnectionModel_1.Direction.northEast) {
                switch (prev) {
                    case ConnectionModel_1.Direction.south:
                    case ConnectionModel_1.Direction.east:
                    case ConnectionModel_1.Direction.southEast:
                        return --referencePriorityValue;
                    case ConnectionModel_1.Direction.north:
                    case ConnectionModel_1.Direction.west:
                    case ConnectionModel_1.Direction.northWest:
                        return ++referencePriorityValue;
                }
            }
            if (current == ConnectionModel_1.Direction.southWest) {
                switch (prev) {
                    case ConnectionModel_1.Direction.south:
                    case ConnectionModel_1.Direction.east:
                    case ConnectionModel_1.Direction.southEast:
                        return ++referencePriorityValue;
                    case ConnectionModel_1.Direction.north:
                    case ConnectionModel_1.Direction.west:
                    case ConnectionModel_1.Direction.northWest:
                        return --referencePriorityValue;
                }
            }
            return referencePriorityValue;
        }
        calculateOffset(connection, route, routeInfos) {
            let fullDistance = this.geometry.distanceOfParallelLines(connection.passingRoutes.length);
            let radius = fullDistance / 2; // we need the half of distance because we draw lines by offsetting them by BOTH sides of central point
            let offsetFactor = connection.passingRoutes
                .sort((id1, id2) => routeInfos.get(id1).priority - routeInfos.get(id2).priority)
                .indexOf(route.id);
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