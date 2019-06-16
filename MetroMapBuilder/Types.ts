export type Station = {
    id: number;
    name: string;
    x: number;
    y: number;
    connections: number[];
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
    stations: number[];
    name: string;
    id: number;
    color: Color;
}

export enum Direction {
    horizontal,
    vertical,
    rightDiagonal,
    leftDiagonal
}

enum Direction2 {
    south,
    north,
    west,
    east,
    southWest,
    southEast,
    northWest,
    northEast
}