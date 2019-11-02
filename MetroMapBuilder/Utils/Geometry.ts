import { SizeSettings } from "../Models/SubwayMap";
import { Direction } from "../Models/ConnectionModel";

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
    public get radius(): number {
        return this.cellSize / 2;
    }
    public get cornerRadius(): number {
        return this.cellSize / 5;
    }
    public get lineWidth(): number {
        return this.cellSize * this.sizeSettings.lineWidthFactor;
    }
    // SVG draws thin line and then calculates its width by making it wider proportionally from both sides from the center
    public get halfOfLineWidth(): number {
        return this.lineWidth / 2;
    }
    public get fontSize(): number {
        const svgDefaultFontSize = 16;
        return this.cellSize * 100 / svgDefaultFontSize; // font size in percents
    }
    // let distance be half of line width
    public get distanceBetweenLines(): number {
        return this.halfOfLineWidth;
    }

    public get gridSize(): number {
        return this.sizeSettings.gridSize;
    }

    public labelWidthInCells(labelWidthInSymbols: number): number {
        return Math.ceil(labelWidthInSymbols / 2); // 1 cell can be occupied by 2 symbols
    }

    public normalizeToGridCell(x: number, y: number): Point {
        // check if x or y is located on border between cells
        // if yes then we always take the smaller coordinate by subtracting 1
        let isBorderX = x % this.cellSize == 0; 
        let isBorderY = y % this.cellSize == 0;

        return {
            x: isBorderX ? (x / this.cellSize) - 1 : Math.floor(x / this.cellSize),
            y: isBorderY ? (y / this.cellSize) - 1 : Math.floor(y / this.cellSize)
        };
    }

    public baselinePoint(point: Point): Point {
        let center = this.centrify(point);
        return {
            x: center.x,
            y: center.y + this.cellSize / 3
        };
    }

    public distanceOfParallelLines(linesCount: number) {
        let linesWidthsSum = linesCount * this.lineWidth;
        let distancesBetweenLinesSum = (linesCount - 1) * this.distanceBetweenLines;
        return linesWidthsSum + distancesBetweenLinesSum;
    }

    public rectTopLeftCorner(center: Point, width: number, height: number) {
        const cellBorder = 0.5;
        return { // top left
            x: center.x - width / 2 + cellBorder,
            y: center.y - height / 2 + cellBorder
        };
    }

    public rectCorners(center: Point, width: number, height: number): Point[] {        
        const cellBorder = 0.5;
        return [
            { // top left
                x: center.x - width / 2 + cellBorder,
                y: center.y - height / 2 + cellBorder
            },
            { // bottom left
                x: center.x - width / 2 + cellBorder,
                y: center.y + height / 2 - cellBorder
            },
            { // top right
                x: center.x + width / 2 - cellBorder,
                y: center.y - height / 2 + cellBorder
            },
            { // bottom right
                x: center.x + width / 2 - cellBorder,
                y: center.y + height / 2 - cellBorder
            }
        ];
    }

    // https://gamedev.stackexchange.com/questions/86755/how-to-calculate-corner-positions-marks-of-a-rotated-tilted-rectangle
    public rotate(points: Point[], fulcrum: Point, angle: number): Point[] {
        let result = [];
        let theta = angle * Math.PI / 180;

        for (let i = 0; i < points.length; i++) {
            let origin = points[i];
            let rotated = {
                x: ((origin.x - fulcrum.x) * Math.cos(theta) - (origin.y - fulcrum.y) * Math.sin(theta)) + fulcrum.x,
                y: ((origin.x - fulcrum.x) * Math.sin(theta) + (origin.y - fulcrum.y) * Math.cos(theta)) + fulcrum.y
            };
            result.push(rotated);
        }

        return result;
    }

    public angle(a: Point, b: Point): number {
        let dy = b.y - a.y;
        let dx = b.x - a.x;
        let theta = Math.atan(dy / dx);
        theta *= 180 / Math.PI; // range [-90, 90]
        return theta;        
        //let theta = Math.atan2(dy, dx); // range (-PI, PI]
        //theta *= 180 / Math.PI; // rads to degs, range (-180, 180]        
        //return theta < 0 ? 360 + theta : theta;
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
    // algorithm it returns grid cells' coordinates that are being crossed by segment
    // taking into account line width. Here we have main (center) segment as argument and then
    // we calculate 2 boundaries of this segment knowing its direction and line width
    // Visualization:
    // ----------  first boundary calculated segment
    // ----------  center segment which comes as argument
    // ----------  second boundary calculated segment
    public * digitalDiffAnalyzer(segment: Segment, direction: Direction): IterableIterator<Point> {        
        for (let pair of this.getNormalizedPointPairs(segment, direction)) {
            let dx = pair.from.x - pair.to.x;
            let dy = pair.from.y - pair.to.y;

            let bound = Math.abs(dx) >= Math.abs(dy) ? Math.abs(dx) : Math.abs(dy);
            dx = dx / bound;
            dy = dy / bound;

            let x = pair.from.x;
            let y = pair.from.y;
            for (let step = 1; step <= bound; step++) {
                yield { x: Math.round(x), y: Math.round(y) };
                x = x - dx;
                y = y - dy;
            }
        }
    }

    private * getNormalizedPointPairs(center: Segment, direction: Direction): IterableIterator<Segment> {
        let first = firstBoundary(this.lineWidth);
        let second = secondBoundary(this.lineWidth);

        let first1 = this.normalizeToGridCell(first.from.x, first.from.y);
        let first2 = this.normalizeToGridCell(first.to.x, first.to.y);

        let center1 = this.normalizeToGridCell(center.from.x, center.from.y);
        let center2 = this.normalizeToGridCell(center.to.x, center.to.y);

        let second1 = this.normalizeToGridCell(second.from.x, second.from.y);
        let second2 = this.normalizeToGridCell(second.to.x, second.to.y);

        if (center1.x != first1.x || center1.y != first1.y ||
            center2.x != first2.x || center2.y != first2.y) {
            yield { from: first1, to: first2 };
        }

        yield { from: center1, to: center2 };

        if (center1.x != second1.x || center1.y != second1.y ||
            center2.x != second2.x || center2.y != second2.y) {
            yield { from: second1, to: second2 };
        }

        // local helper functions
        function firstBoundary(lineWidth: number): Segment {
            let halfOfLineWidth = lineWidth / 2;
            switch (direction) {
                case Direction.horizontal:
                    return {
                        from: { x: center.from.x, y: center.from.y - halfOfLineWidth },
                        to: { x: center.to.x, y: center.to.y - halfOfLineWidth }
                    };
                case Direction.vertical:
                    return {
                        from: { x: center.from.x - halfOfLineWidth, y: center.from.y },
                        to: { x: center.to.x - halfOfLineWidth, y: center.to.y }
                    };
                case Direction.leftDiagonal:
                    return {
                        from: { x: center.from.x + halfOfLineWidth, y: center.from.y - halfOfLineWidth },
                        to: { x: center.from.x + halfOfLineWidth, y: center.from.y - halfOfLineWidth }
                    };
                case Direction.rightDiagonal:
                    return {
                        from: { x: center.from.x - halfOfLineWidth, y: center.from.y - halfOfLineWidth },
                        to: { x: center.from.x - halfOfLineWidth, y: center.from.y - halfOfLineWidth }
                    };
            }
        }
        function secondBoundary(lineWidth: number): Segment {
            let halfOfLineWidth = lineWidth / 2;
            switch (direction) {
                case Direction.horizontal:
                    return {
                        from: { x: center.from.x, y: center.from.y + halfOfLineWidth },
                        to: { x: center.to.x, y: center.to.y + halfOfLineWidth }
                    };
                case Direction.vertical:
                    return {
                        from: { x: center.from.x + halfOfLineWidth, y: center.from.y },
                        to: { x: center.to.x + halfOfLineWidth, y: center.to.y }
                    };
                case Direction.leftDiagonal:
                    return {
                        from: { x: center.from.x - halfOfLineWidth, y: center.from.y + halfOfLineWidth },
                        to: { x: center.from.x - halfOfLineWidth, y: center.from.y + halfOfLineWidth }
                    };
                case Direction.rightDiagonal:
                    return {
                        from: { x: center.from.x + halfOfLineWidth, y: center.from.y + halfOfLineWidth },
                        to: { x: center.from.x + halfOfLineWidth, y: center.from.y + halfOfLineWidth }
                    };
            }
        }
    }
}