/// <reference path="UnitStates.ts" />
import states = UnitStates;

namespace Models {

    export class Generation implements Iterable<Unit> {

        private board: Unit[][];

        public constructor(width: number, height: number) {
            this.width = width;
            this.height = height;
            this.board = this.initializeBoard(width, height);
        }

        public readonly width: number;
        public readonly height: number;

        public add(unit: Unit) {
            this.board[unit.y][unit.x] = unit;
        }

        public getUnit(x: number, y: number): Unit {
            return this.board[y][x];
        }

        public *[Symbol.iterator](): Iterator<Unit> {
            for (let row of this.board) {
                for (let unit of row) {
                    yield unit;
                }
            }
        }

        private initializeBoard(width: number, height: number): Unit[][] {

            let result = [];

            for (let y = 0; y < height; y++) {
                result[y] = [];
                for (let x = 0; x < width; x++) {
                    result[y][x] = null;
                }
            }

            return result;
        }
    }

    export class Unit {
        state: states.State;
        readonly x: number;
        readonly y: number;

        public constructor(x: number, y: number, state: states.State) {
            this.state = state;
            this.x = x;
            this.y = y;
        }
    }
}