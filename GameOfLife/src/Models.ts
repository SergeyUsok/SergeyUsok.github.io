/// <reference path="UnitStates.ts" />
import states = UnitStates; // just to try use import keyword

namespace Models {

    export class Generation implements Iterable<Unit> {

        private board: Unit[][];
        private _population: number = 0;

        public constructor(width: number, height: number) {
            this.width = width;
            this.height = height;
            this.board = this.initializeBoard(width, height);
        }

        public readonly width: number;
        public readonly height: number;

        public get population(): number {
            return this._population;
        }

        public add(unit: Unit) {
            if (this.board[unit.y][unit.x].state instanceof states.AliveState &&
                unit.state instanceof states.DeadState)
            {
                this._population--;
            }
            else if (this.board[unit.y][unit.x].state instanceof states.DeadState &&
                unit.state instanceof states.AliveState)
            {
                this._population++;
            }

            this.board[unit.y][unit.x] = unit;
        }

        public getUnit(x: number, y: number): Unit {
            let unit = this.board[y][x];
            return unit;
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
                    result[y][x] = new Unit(x, y, new states.DeadState());
                }
            }

            return result;
        }
    }

    export class Unit {
        readonly state: states.State;
        readonly x: number;
        readonly y: number;

        public constructor(x: number, y: number, state: states.State) {
            this.state = state;
            this.x = x;
            this.y = y;
        }
    }
}