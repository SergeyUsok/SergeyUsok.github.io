import { SizeSettings } from "../Models/SubwayMap";

export type Segment = {
    from: {
        x: number,
        y: number
    },
    to: {
        x: number,
        y: number
    },
}

export type Point = {
    x: number;
    y: number;
}

export class Geometry {

    public constructor(private sizeSettings: SizeSettings) {
    }

    public get cellSize(): number {
        return this.sizeSettings.canvasSize / this.sizeSettings.gridSize;
    }
    // TODO make radius dependent on lineWidthFactor
    public get radius(): number {
        return this.cellSize / 2;
    }
    public get lineWidth(): number {
        return this.cellSize * this.sizeSettings.lineWidthFactor;
    }
    // SVG draws thin line and then calculates its width by making it wider proportionally from both sides from the center
    public get lineCenter(): number {
        return this.lineWidth / 2;
    }
    public get fontSize(): number {
        const svgDefaultFontSize = 16;
        return this.cellSize * 100 / svgDefaultFontSize; // font size in percents
    }
    // let distance be half of line width
    public get distanceBetweenLines(): number {
        return this.lineWidth / 2;
    }

    public get gridSize(): number {
        return this.sizeSettings.gridSize;
    }

    public labelWidthInCells(labelWidthInSymbols: number): number {
        return Math.ceil(labelWidthInSymbols / 2); // 1 cell can be occupied by 2 symbols
    }

    public normalizeToGridCell(x: number, y: number): Point {
        return {
            x: Math.floor(x / this.cellSize),
            y: Math.floor(y / this.cellSize)
        };
    }

    public baselinePoint(point: Point): Point {
        let center = this.centrify(point);
        return {
            x: center.x,
            y: center.y + this.cellSize / 3
        };
    }

    public topLeftCorner(point: Point): Point {
        let center = this.centrify(point);
        return {
            x: center.x - this.cellSize / 2,
            y: center.y - this.cellSize / 2
        }
    }

    public centrify(point: Point): Point {
        // left border of a cell
        //  + right border of a cell
        // divided by 2 (half of a cell) to get center of the cell by x axis
        let x = point.x * this.cellSize + this.cellSize / 2;

        // top border of a cell
        //  + bottom border of a cell
        // divided by 2 (half of a cell) to get center of the cell by y axis
        let y = point.y * this.cellSize + this.cellSize / 2;

        return { x, y };
    }

    // Algorithm taken from:
    // https://seant23.wordpress.com/2010/11/12/offset-bezier-curves/
    // http://forums.codeguru.com/showthread.php?524278-Algoritme-for-doubling-a-line&p=2070354#post2070354
    public offsetConnection(from: Point, to: Point, offset: number): Segment {
        if (offset == 0)
            return {
                from: from,
                to: to
            };

        let dx = to.x - from.x;
        let dy = to.y - from.y;

        let length = Math.sqrt(dx * dx + dy * dy);

        let perp_x = (dy / length) * offset;
        let perp_y = (-dx / length) * offset;

        return {
            from: {
                x: from.x - perp_x,
                y: from.y - perp_y
            },
            to: {
                x: to.x - perp_x,
                y: to.y - perp_y
            }
        };
    }

    // https://studfiles.net/preview/2145984/page:9/
    // http://math.hashcode.ru/questions/41305/как-узнать-координаты-через-которые-проходит-вектор
    // https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
    //private bresenhamsLine(segment: Segment) {
    //    let point1 = Geometry.normalizeToGridCell(segment.from.x, segment.from.y);
    //    let point2 = Geometry.normalizeToGridCell(segment.to.x, segment.to.y);

    //    let dx = Math.abs(point1.x - point2.x) - 1;
    //    let dy = Math.abs(point1.y - point2.y) - 1;

    //    if (dx > dy) {
    //        if (point1.x < point2.x) {
    //            let slope = (point2.y - point1.y) / (point2.x - point1.x)
    //            for (let x = point1.x; x <= point2.x; x++) {
    //                let y = point1.y + (x - point1.x) * slope;
    //                y = Math.round(Math.abs(y));
    //                this.occupiedCells.add(`${x}-${y}`);
    //                this.canvas.appendChild(SVG.addTempCircle(x, y));
    //            }
    //        }
    //        else {
    //            let slope = (point2.y - point1.y) / (point2.x - point1.x);
    //            for (let x = point2.x; x < point1.x; x++) {
    //                let y = point2.y + (x - point2.x) * slope;
    //                y = Math.round(Math.abs(y));
    //                this.occupiedCells.add(`${x}-${y}`);
    //                this.canvas.appendChild(SVG.addTempCircle(x, y));
    //            }
    //        }
    //    }
    //    else {
    //        if (point1.y < point2.y) {
    //            let slope = (point2.x - point1.x) / (point2.y - point1.y);
    //            for (let y = point1.y; y <= point2.y; y++) {
    //                let x = point1.x + (y - point1.y) * slope;
    //                x = Math.round(Math.abs(x));
    //                this.occupiedCells.add(`${x}-${y}`);
    //                this.canvas.appendChild(SVG.addTempCircle(x, y));
    //            }
    //        }
    //        else {
    //            let slope = (point2.x - point1.x) / (point2.y - point1.y);
    //            for (let y = point2.y; y <= point1.y; y++) {
    //                let x = point2.x + (y - point2.y) * slope;
    //                x = Math.round(Math.abs(x));
    //                this.occupiedCells.add(`${x}-${y}`);
    //                this.canvas.appendChild(SVG.addTempCircle(x, y));
    //            }
    //        }
    //    }
    //}

    // https://en.wikipedia.org/wiki/Digital_differential_analyzer_(graphics_algorithm)

    public * digitalDiffAnalyzer(segment: Segment): IterableIterator<Point> {
        let point1 = this.normalizeToGridCell(segment.from.x, segment.from.y);
        let point2 = this.normalizeToGridCell(segment.to.x, segment.to.y);

        let dx = point1.x - point2.x;
        let dy = point1.y - point2.y;

        let bound = 0;
        if (Math.abs(dx) >= Math.abs(dy))
            bound = Math.abs(dx);
        else
            bound = Math.abs(dy);

        dx = dx / bound;
        dy = dy / bound;

        let x = point1.x;
        let y = point1.y;
        for (var step = 1; step <= bound; step++) {
            yield { x: Math.round(x), y: Math.round(y) };
            x = x - dx;
            y = y - dy;
        }
    }
}