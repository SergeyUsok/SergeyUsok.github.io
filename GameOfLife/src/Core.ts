/// <reference path="Models.ts" />
/// <reference path="UnitStates.ts" />

namespace Core {

    type IterationResult = {
        generation: Models.Generation;
        isGameOver: boolean;
        reason: string;
    }

    type Pair = { x: number; y: number; }

    export class Game {
        public history: Models.Generation[] = [];

        public constructor(zeroGeneration: Models.Generation) {
            this.history.push(zeroGeneration);
        }

        public nextGeneration(): IterationResult {
            let last = this.history[this.history.length - 1];
            var newGeneration = new Models.Generation(last.width, last.height);
            
            for (let unit of last) {
                
                let rule = unit.state.getRule();
                let newUnit = rule.execute(unit, last);
                newGeneration.add(newUnit);
            }

            let gameOverResult = this.isGameOver(last, newGeneration);
            this.history.push(newGeneration);

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

        
    }

    export class ZeroGenerationProvider {

        public getEmptyGeneration(width: number, height: number): Models.Generation {
            return new Models.Generation(width, height);
        }

        public getRandomGeneration(width: number, height: number): Models.Generation {
            let zeroGeneration = new Models.Generation(width, height);
            let flattened = this.flattenBoard(width, height);
            let target = this.getTargetCount(width, height);

            for (let i = 1; i <= target; i++) {
                let index = this.getRandom(1, flattened.length) - 1; // since index zero based subtract 1
                let pair = flattened[index];
                flattened.splice(index, 1); // remove already used item
                let unit = new Models.Unit(pair.x, pair.y, new states.AliveState());
                zeroGeneration.add(unit);
            }

            return zeroGeneration;
        }

        // board like:
        // | 1 | 2 | 3 |
        // | 4 | 5 | 6 |
        // will become like
        // 1 2 3 4 5 6
        private flattenBoard(width: number, height: number): Pair[] {
            let flattened = [];

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    flattened.push({ x, y });
                }
            }

            return flattened;
        }

        private getTargetCount(width: number, height: number): number {
            const lowerBound = 10; // lower percent of alive units
            const upperBound = 70; // upper percent of alive units

            let totalSize = width * height;

            // get number of percent (from 10 to 70) of board that should be filled by alive units
            let actualPercent = this.getRandom(lowerBound, upperBound);

            // calculate actual number of alive units
            let target = actualPercent / 100 * totalSize;

            return Math.round(target);
        }

        private getRandom(min: number, max: number): number {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    }
}