//class LineBuilder {
    

//    public build(line: Line) {
//        let stations = line.stations;
//        let startPoint = this.getStartPoint(stations, line.id);
//        let path = Path.begin(startPoint.x, startPoint.y);

//        // 4 ways to draw line
//        // 1. Direct line
//        // 2. Diagonal line
//        // 3. Turn to continuation of direct line
//        // 3.1. Turn to line end

//        // Algorithm to choose way:
//        // 1. From and to points has equal x or y
//        // 2. Find difference (разность) between x's of from and to, then y's of from and to,
//        // then x's of to and nextAfterTo, then y's of of to and nextAfterto and check if differences are equal
//        // i.e. from {1,1}, to {2,2}, nextAfterTo {3,3} then
//        // x: 2 - 1 == 3 - 2 and y: 2 - 1 == 3 - 2
//        // 3. Condition 1 not satisfied for from and to, but satisfied for to and nextAfterTo
//        // 3.1 Like condition 3, but there is no nextAfterTo, to - is end of line

//        // Take into account:
//        // - line width and line offset relative to other lines from the same point
//        // - distance between lines if several

//        for (let index = 0; index < stations.length - 1; index++) {
//            let from = stations[index];
//            let to = stations[index + 1];
//            // check if "to" is actual end of line. If not then get next station after "to"
//            let next = index + 1 == stations.length - 1 ? null : stations[index + 2];

//            if (this.isDirectLine(from, to)) {
//                // make direct line
//            }
//            else if (this.isDiagonal(from, to, next)) {
//                // draw diagonal
//            }
//            else if (this.isTurn(from, to, next)) {
//                // make turn and take into account turn to end
//            }
//            else {
//                // draw as direct
//            }
//        }
//    }

//    private isDirectLine(from: Station, to: Station): boolean {
//        return from.x == to.x || from.y == from.y;
//    }

//    private isDiagonal(from: Station, to: Station, nextAfterTo: Station): boolean {
//        if (nextAfterTo == null)
//            return false;

//        let firstDiffX = Math.abs(from.x - to.x);
//        let firstDiffY = Math.abs(from.y - to.y);

//        let secondDiffX = Math.abs(to.x - nextAfterTo.x);
//        let secondDiffY = Math.abs(to.y - nextAfterTo.y);

//        // check regularity for coordinate differences to figure out if connection is diagonal
//        return firstDiffX == secondDiffX && firstDiffY == secondDiffY;
//    }

//    private isTurn(from: Station, to: Station, nextAfterTo: Station): boolean {
//        return false;
//    }

//    private getStartPoint(stations: Station[], lineId: number): Point {
//        let first = stations[0];
//        //return this.coordResolver.getPoint(first, lineId);
//        return {x:0,y:0};
//    }
//}