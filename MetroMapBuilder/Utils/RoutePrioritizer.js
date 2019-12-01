define(["require", "exports", "../Models/ConnectionModel"], function (require, exports, ConnectionModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RoutePrioritizer {
        constructor() {
            this.comparisonMap = new Map();
        }
        calculatePriority(routeId, connection, subwayMap) {
            return connection.passingRoutes.sort((a, b) => {
                let key = `${a}-${b}`;
                if (this.comparisonMap.has(key))
                    return this.comparisonMap.get(key);
                let first = subwayMap.getRoute(a).findConnection(connection);
                let second = subwayMap.getRoute(b).findConnection(connection);
                let sorted = this.sort(first, second);
                let result = sorted == 0 ? a - b : sorted; // if route priorities equal just compare routes' ids
                this.comparisonMap.set(key, result);
                return result;
            }).indexOf(routeId);
        }
        reset() {
            this.comparisonMap.clear();
        }
        // TODO: may be take into account prev search in case of equal on nexts
        // or even calculate where from which side of connection (next or prev) remains most part of route and based on this info
        // compare both connections
        sort(first, second) {
            // 1. Find point of divergence of 2 routes
            let firstCurrent = first.next;
            let secondCurrent = second.next;
            while (firstCurrent != null && secondCurrent != null && firstCurrent.direction == secondCurrent.direction) {
                firstCurrent = firstCurrent.next;
                secondCurrent = secondCurrent.next;
            }
            // 2. Compare routes
            // 2.1 Point of divergence has been found
            if (firstCurrent != null && secondCurrent != null) {
                let priority1 = this.getPriority(firstCurrent.prev.direction, firstCurrent.direction);
                let priority2 = this.getPriority(secondCurrent.prev.direction, secondCurrent.direction);
                return this.compare(priority1, priority2);
            }
            // 2.2 Routes do not have point of divergence and they both finished in the same point
            if (firstCurrent == null && secondCurrent == null) {
                return 0;
            }
            // 2.3 Routes do not have point of divergence and but first one finished earlier than second one
            if (secondCurrent != null) {
                let priority = this.walkThroughRoute(second);
                // The idea here is that the route that ended earlier should be less or greater (depending on the sign)
                // than the route that still continues.
                // Why the ended route is less or greater? Because it should be placed closer to the edge during rendering
                return Math.sign(priority);
            }
            // 2.4 Routes do not have point of divergence and but second one finished earlier than first one
            if (firstCurrent != null) {
                let priority = this.walkThroughRoute(first);
                // The idea here same as above BUT we have to take into account that now second route is less or greater
                // than the first one, so sign should be reverted in order to avoid descending sorting
                return Math.sign(priority) * -1;
            }
            return 0;
        }
        compare(first, second) {
            if (first > second)
                return 1;
            else if (first < second)
                return -1;
            else
                return 0;
        }
        walkThroughRoute(connection) {
            let prev = connection.direction;
            let current = connection.next;
            while (current != null && prev == current.direction) {
                prev = current.direction;
                current = current.next;
            }
            if (current != null) {
                return this.getPriority(current.prev.direction, current.direction);
            }
            else {
                return 0;
            }
        }
        getPriority(current, next) {
            if (current == ConnectionModel_1.Direction.south) { // current moves from top to down
                switch (next) {
                    // came from left side
                    case ConnectionModel_1.Direction.northEast: return -3;
                    case ConnectionModel_1.Direction.east: return -2;
                    case ConnectionModel_1.Direction.southEast: return -1;
                    // came from right                 
                    case ConnectionModel_1.Direction.northWest: return 3;
                    case ConnectionModel_1.Direction.west: return 2;
                    case ConnectionModel_1.Direction.southWest: return 1;
                }
            }
            else if (current == ConnectionModel_1.Direction.north) { // current moves from down to top
                switch (next) {
                    case ConnectionModel_1.Direction.northEast: return 1;
                    case ConnectionModel_1.Direction.east: return 2;
                    case ConnectionModel_1.Direction.southEast: return 3;
                    case ConnectionModel_1.Direction.northWest: return -1;
                    case ConnectionModel_1.Direction.west: return -2;
                    case ConnectionModel_1.Direction.southWest: return -3;
                }
            }
            else if (current == ConnectionModel_1.Direction.west) {
                switch (next) {
                    case ConnectionModel_1.Direction.southWest: return -1;
                    case ConnectionModel_1.Direction.south: return -2;
                    case ConnectionModel_1.Direction.southEast: return -3;
                    case ConnectionModel_1.Direction.northWest: return 1;
                    case ConnectionModel_1.Direction.north: return 2;
                    case ConnectionModel_1.Direction.northEast: return 3;
                }
            }
            else if (current == ConnectionModel_1.Direction.east) {
                switch (next) {
                    case ConnectionModel_1.Direction.southEast: return 1;
                    case ConnectionModel_1.Direction.south: return 2;
                    case ConnectionModel_1.Direction.southWest: return 3;
                    case ConnectionModel_1.Direction.northWest: return -3;
                    case ConnectionModel_1.Direction.north: return -2;
                    case ConnectionModel_1.Direction.northEast: return -1;
                }
            }
            else if (current == ConnectionModel_1.Direction.southEast) {
                switch (next) {
                    case ConnectionModel_1.Direction.north: return -3;
                    case ConnectionModel_1.Direction.northEast: return -2;
                    case ConnectionModel_1.Direction.east: return -1;
                    // case Direction.northWest: return -4 or 4;
                    case ConnectionModel_1.Direction.south: return 1;
                    case ConnectionModel_1.Direction.southWest: return 2;
                    case ConnectionModel_1.Direction.west: return 3;
                }
            }
            else if (current == ConnectionModel_1.Direction.northWest) {
                switch (next) {
                    case ConnectionModel_1.Direction.north: return 1;
                    case ConnectionModel_1.Direction.northEast: return 2;
                    case ConnectionModel_1.Direction.east: return 3;
                    case ConnectionModel_1.Direction.south: return -3;
                    case ConnectionModel_1.Direction.southWest: return -2;
                    case ConnectionModel_1.Direction.west: return -1;
                }
            }
            else if (current == ConnectionModel_1.Direction.northEast) {
                switch (next) {
                    case ConnectionModel_1.Direction.south: return 3;
                    case ConnectionModel_1.Direction.southEast: return 2;
                    case ConnectionModel_1.Direction.east: return 1;
                    case ConnectionModel_1.Direction.north: return -1;
                    case ConnectionModel_1.Direction.northWest: return -2;
                    case ConnectionModel_1.Direction.west: return -3;
                }
            }
            else if (current == ConnectionModel_1.Direction.southWest) {
                switch (next) {
                    case ConnectionModel_1.Direction.south: return -1;
                    case ConnectionModel_1.Direction.southEast: return -2;
                    case ConnectionModel_1.Direction.east: return -3;
                    case ConnectionModel_1.Direction.north: return 3;
                    case ConnectionModel_1.Direction.northWest: return 2;
                    case ConnectionModel_1.Direction.west: return 1;
                }
            }
            return 0;
        }
        // Old code which should be reimplmented like getPriority but based on prev-current relationshio rather than current-next
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
    }
    exports.RoutePrioritizer = RoutePrioritizer;
});
//# sourceMappingURL=RoutePrioritizer.js.map