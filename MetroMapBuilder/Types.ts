export type Station = {
    id: number;
    label: {
        x: number;
        y: number;
        name: string[];
    };
    x: number;
    y: number;
    connections: number[];
}

export type StationKeeper = {
    id: number;
    x: number;
    y: number;
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

export type Connection = {
    id: number;
    a: number;
    b: number;
    lines: number[];
}

export type Line = {
    id: number;
    stations: number[];
    label: {
        x: number;
        y: number;
        name: string[];
    };
    color: Color;
}

export enum Direction {
    horizontal,
    vertical,
    rightDiagonal,
    leftDiagonal
}

export enum Direction2 {
    south,
    north,
    west,
    east,
    southWest,
    southEast,
    northWest,
    northEast
}