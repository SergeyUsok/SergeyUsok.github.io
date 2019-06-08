export type Station = {
    id: number;
    name: string;
    x: number;
    y: number;
    //connections: Connection[];
    circle: SVGCircleElement;
}

export type Point = { x: number; y: number; }

export enum Color {
    none = "none",
    green = "green",
    red = "red",
    yellow = "yellow",
    blue = "blue",
    orange = "orange",
    black = "black",
    brown = "brown"
}

type Connection = {
    from: Station;
    to: Station;
}

type ConnectionDescription = {
    from: Station;
    to: Station;
    colors: string[];
}

type Connection2 = {
    start: Point;
    end: Point;
    lines: LineDescription[];
    direction: Direction2;
}

type LineDescription = {
    name: string;
    color: string;
}

type Line = {
    stations: Station[];
    name: string;
    id: number;
}

enum Direction2 {
    horizontal,
    vertical,
    rightDiagonal,
    leftDiagonal
}

enum Direction {
    south,
    north,
    west,
    east,
    southWest,
    southEast,
    northWest,
    northEast
}