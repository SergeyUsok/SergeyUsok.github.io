/// <reference path="Models.ts" />
/// <reference path="UnitStates.ts" />

type IterationResult = {
    generation: Models.Generation;
    isGameOver: boolean;
    reason: string;
}

type Pair = { x: number; y: number; }

namespace Core {

    export class Game {
        private _currentGeneration: Models.Generation

        private constructor(emptyGeneration: Models.Generation) {
            this._currentGeneration = emptyGeneration;
        }

        public static createNew(width: number, height: number): Game  {
            let emptyGeneration = new Models.Generation(width, height);
            return new Game(emptyGeneration);
        }

        public get currentGeneration(): Models.Generation {
            return this._currentGeneration;
        }

        public static withRandomGeneration(width: number, height: number) {
            let emptyGeneration = new Models.Generation(width, height);
            let flattened = this.flattenBoard(width, height);
            let target = this.getTargetCount(width, height);

            for (let i = 1; i <= target; i++) {
                let index = this.getRandom(1, flattened.length) - 1; // since index zero based subtract 1
                let pair = flattened[index];
                flattened.splice(index, 1); // remove already used item
                let unit = new Models.Unit(pair.x, pair.y, new states.AliveState());
                emptyGeneration.add(unit);
            }

            return new Game(emptyGeneration);
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
        // 2. Game came to a stable state and no changes in generations expected
        private isGameOver(oldGen: Models.Generation, newGen: Models.Generation) {
            if (newGen.population == 0) {
                return {
                    reason: "The game came to zero population",
                    marker: true
                };
            }
            
            for (let oldUnit of oldGen) {
                let newUnit = newGen.getUnit(oldUnit.x, oldUnit.y);
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

        // board like:
        // | 1 | 2 | 3 |
        // | 4 | 5 | 6 |
        // will become like
        // 1 2 3 4 5 6
        private static flattenBoard(width: number, height: number): Pair[]{
            let flattened = [];

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    flattened.push({ x, y });
                }
            }

            return flattened;
        }

        private static getTargetCount(width: number, height: number): number {
            const lowerBound = 10; // lower percent of alive units
            const upperBound = 70; // upper percent of alive units

            let totalSize = width * height;

            // get number of percent (from 10 to 70) of board that should be filled by alive units
            let actualPercent = this.getRandom(lowerBound, upperBound);

            // calculate actual number of alive units
            let target = actualPercent / 100 * totalSize;

            return Math.round(target);
        }

        private static getRandom(min: number, max: number): number {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    }
}