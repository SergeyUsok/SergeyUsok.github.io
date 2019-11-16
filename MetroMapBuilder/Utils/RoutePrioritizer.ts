import { Route } from "../Models/Route";

enum Direction {
    south = 0,
    north = 1,

    east = 3,
    west = 4,

    southEast = 6,
    northWest = 7,

    southWest = 9,
    northEast = 10
}

export class RoutePrioritizer {

    public prioritize(routes: Route[]): void {

    }

}

let map = [
    [1,2,1,1,1,2]
];

