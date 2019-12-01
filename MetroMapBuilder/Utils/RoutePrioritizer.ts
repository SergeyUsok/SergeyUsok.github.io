import { Connection, Direction } from "../Models/ConnectionModel";
import { SubwayMap } from "../Models/SubwayMap";

export class RoutePrioritizer {

    public calculatePriority(routeId: number, connection: Connection, subwayMap: SubwayMap): number {

        return connection.passingRoutes.sort((a, b) => {
            let first = subwayMap.getRoute(a).findConnection(connection);
            let second = subwayMap.getRoute(b).findConnection(connection);
            let result = this.sort(first, second);
            return result == 0 ? a - b : result; // if route priorities equal just compare routes' ids

        }).indexOf(routeId);
    }

    // TODO: may be take into account prev search in case of equal on nexts
    // or even calculate where from which side of connection (next or prev) remains most part of route and based on this info
    // compare both connections
    private sort(first: Connection, second: Connection): number {
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
            // The idea here is that the route ended earlier should be less or greater (depending on the sign)
            // than the route that still continues.
            // So the ended route should be is closer to the edge during rendering
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

    private compare(first: number, second: number): number  {
        if (first > second)
            return 1;
        else if (first < second)
            return -1;
        else
            return 0;
    }

    private walkThroughRoute(connection: Connection) {
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

    private getPriority(current: Direction, next: Direction): number {
        if (current == Direction.south) { // current moves from top to down
            switch (next) {
                // came from left side
                case Direction.northEast: return -3;
                case Direction.east: return -2;
                case Direction.southEast: return -1;
                // came from right                 
                case Direction.northWest: return 3;
                case Direction.west: return 2;
                case Direction.southWest: return 1;
            }
        }

        else if (current == Direction.north) { // current moves from down to top
            switch (next) {
                case Direction.northEast: return 1;
                case Direction.east: return 2;
                case Direction.southEast: return 3;
                case Direction.northWest: return -1;
                case Direction.west: return -2;
                case Direction.southWest: return -3;
            }
        }

        else if (current == Direction.west) {
            switch (next) {
                case Direction.southWest: return -1;
                case Direction.south: return -2;
                case Direction.southEast: return -3;
                case Direction.northWest: return 1;
                case Direction.north: return 2;
                case Direction.northEast: return 3;
            }
        }

        else if (current == Direction.east) {
            switch (next) {
                case Direction.southEast: return 1;
                case Direction.south: return 2;
                case Direction.southWest: return 3;                
                case Direction.northWest: return -3;
                case Direction.north: return -2;
                case Direction.northEast: return -1;
            }
        }

        else if (current == Direction.southEast) {
            switch (next) {
                case Direction.north: return -3;
                case Direction.northEast: return -2
                case Direction.east: return -1;
                // case Direction.northWest: return -4 or 4;
                case Direction.south: return 1;
                case Direction.southWest: return 2;
                case Direction.west: return 3;
            }
        }

        else if (current == Direction.northWest) {
            switch (next) {
                case Direction.north: return 1;
                case Direction.northEast: return 2;
                case Direction.east: return 3;
                case Direction.south: return -3;
                case Direction.southWest: return -2;
                case Direction.west: return -1;
            }
        }

        else if (current == Direction.northEast) {
            switch (next) {
                case Direction.south: return 3;
                case Direction.southEast: return 2;
                case Direction.east: return 1;
                case Direction.north: return -1;
                case Direction.northWest: return -2;
                case Direction.west: return -3;
            }
        }

        else if (current == Direction.southWest) {
            switch (next) {
                case Direction.south: return -1;
                case Direction.southEast: return -2;
                case Direction.east: return -3;
                case Direction.north: return 3;                
                case Direction.northWest: return 2;
                case Direction.west: return 1;
            }
        }

        return 0;
    }

    // Old code which should be reimplmented like getPriority but based on prev-current relationshio rather than current-next
    private getPriorityBasedOnPrev(current: Direction, prev: Direction, referencePriorityValue: number): number {
        if (current == Direction.south) { // current moves from top to down
            switch (prev) {
                case Direction.east: case Direction.northEast: case Direction.southEast: // came from left side
                    return ++referencePriorityValue; // increment because the highest value will be drawn on left
                case Direction.west: case Direction.northWest: case Direction.southWest: // came from right
                    return --referencePriorityValue; // decrement because the lowest value will be drawn on right
            }
        }

        if (current == Direction.north) { // current moves from down to top
            switch (prev) {
                case Direction.east: case Direction.northEast: case Direction.southEast:
                    return --referencePriorityValue;
                case Direction.west: case Direction.northWest: case Direction.southWest:
                    return ++referencePriorityValue;
            }
        }

        if (current == Direction.west) {
            switch (prev) {
                case Direction.south: case Direction.southWest: case Direction.southEast:
                    return ++referencePriorityValue;
                case Direction.north: case Direction.northWest: case Direction.northEast:
                    return --referencePriorityValue;
            }
        }

        if (current == Direction.east) {
            switch (prev) {
                case Direction.south: case Direction.southWest: case Direction.southEast:
                    return --referencePriorityValue;
                case Direction.north: case Direction.northWest: case Direction.northEast:
                    return ++referencePriorityValue;
            }
        }

        if (current == Direction.southEast) {
            switch (prev) {
                case Direction.north: case Direction.east: case Direction.northEast:
                    return ++referencePriorityValue;
                case Direction.south: case Direction.west: case Direction.southWest:
                    return --referencePriorityValue;
            }
        }

        if (current == Direction.northWest) {
            switch (prev) {
                case Direction.north: case Direction.east: case Direction.northEast:
                    return --referencePriorityValue;
                case Direction.south: case Direction.west: case Direction.southWest:
                    return ++referencePriorityValue;
            }
        }

        if (current == Direction.northEast) {
            switch (prev) {
                case Direction.south: case Direction.east: case Direction.southEast:
                    return --referencePriorityValue;
                case Direction.north: case Direction.west: case Direction.northWest:
                    return ++referencePriorityValue;
            }
        }

        if (current == Direction.southWest) {
            switch (prev) {
                case Direction.south: case Direction.east: case Direction.southEast:
                    return ++referencePriorityValue;
                case Direction.north: case Direction.west: case Direction.northWest:
                    return --referencePriorityValue;
            }
        }

        return referencePriorityValue;
    }
}

