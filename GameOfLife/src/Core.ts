/// <reference path="Models.ts" />
/// <reference path="UnitStates.ts" />

namespace Core {

    export class Game {
        private _currentGeneration: Models.Generation
                
        private constructor(emptyGeneration: Models.Generation) {
            this._currentGeneration = emptyGeneration;
        }

        public static createNew(width: number, height: number): Game  {
            let emptyGeneration = new Models.Generation(width, height);

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    let unit = new Models.Unit(x, y, new UnitStates.DeadState());
                    emptyGeneration.add(unit);
                }
            }

            return new Game(emptyGeneration);
        }

        public get currentGeneration(): Models.Generation {
            return this._currentGeneration;
        }

        public static fromRandomGeneration(width: number, height: number) {

        }

        public nextGeneration(): Models.Generation {

            var newGeneration = new Models.Generation(this._currentGeneration.width, this._currentGeneration.height);

            for (let unit of this._currentGeneration) {
                let rule = unit.state.getRule();
                let newUnit = rule.execute(unit, this._currentGeneration);
                newGeneration.add(newUnit);
            }

            this._currentGeneration = newGeneration;
            return newGeneration;
        }
    }
}