/// <reference path="Models.ts" />
/// <reference path="UnitStates.ts" />

type IterationResult = {
    generation: Models.Generation;
    isGameOver: boolean;
    reason: string;
}

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

        public nextGeneration(): IterationResult {

            var newGeneration = new Models.Generation(this._currentGeneration.width, this._currentGeneration.height);

            for (let unit of this._currentGeneration) {
                let rule = unit.state.getRule();
                let newUnit = rule.execute(unit, this._currentGeneration);
                newGeneration.add(newUnit);
            }

            let gameOverResult = this.isGameOver(this._currentGeneration, newGeneration);
            this._currentGeneration = newGeneration;

            return {
                generation: newGeneration,
                isGameOver: gameOverResult.marker,
                reason: gameOverResult.reason
            };
        }

        // there are 2 possible ways to end game:
        // 1. New generation has zero population
        // 2. Game came to a stable  state and no changes in generations expected
        private isGameOver(oldGen: Models.Generation, newGen: Models.Generation) {
            if (newGen.population == 0) {
                return {
                    reason: "The game came to zero population",
                    marker: true
                };
            }
                

            for (var oldUnit of oldGen) {
                var newUnit = newGen.getUnit(oldUnit.x, oldUnit.y);
                if (newUnit.state.name !== oldUnit.state.name) {
                    return {
                        reason: "",
                        marker: false
                    };
                }
            }

            return {
                reason: "The game came to a stable state",
                marker: true
            };
        }
    }
}