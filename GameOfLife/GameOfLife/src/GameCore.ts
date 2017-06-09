/// <reference path="Models.ts" />
/// <reference path="UnitStates.ts" />

namespace GameCore {

    export class Game {
        private currentGeneration: Models.Generation

        public new(width: number, height: number): Models.Generation {
            this.currentGeneration = new Models.Generation(width, height);
            for (let y = 0; y < height; y++)
            {
                for (let x = 0; x < width; x++)
                {
                    let unit = new Models.Unit(x, y, new UnitStates.DeadState());
                    this.currentGeneration.add(unit);
                }
            }
            return this.currentGeneration;
        }

        public randomGeneration() {

        }

        public start() {

        }

        public pause() {

        }

        public previous() {

        }

        public nextGeneration(): Models.Generation {

            var newGeneration = new Models.Generation(this.currentGeneration.width, this.currentGeneration.height);

            for (let unit of this.currentGeneration) {
                let rule = unit.state.getRule();
                let newUnit = rule.execute(unit, this.currentGeneration);
                newGeneration.add(newUnit);
            }

            this.currentGeneration = newGeneration;
            return newGeneration;
        }

        public next() {

        }
    }
}