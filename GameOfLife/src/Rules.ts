﻿/// <reference path="Models.ts" />
/// <reference path="UnitStates.ts" />

namespace RulesCache {

    export abstract class Rule {

        public abstract execute(unit: Models.Unit, generation: Models.Generation): Models.Unit;
        
        protected countAliveNeighbors(unit: Models.Unit, generation: Models.Generation): number {
            let aliveNeighborsCount = 0;
            
            for (let neighbor of this.getNeighbors(unit, generation)) {
                if (neighbor.state instanceof states.AliveState)
                    aliveNeighborsCount++;
            }

            return aliveNeighborsCount;
        }

        protected * getNeighbors(unit: Models.Unit, generation: Models.Generation) {
            for (let i = -1; i < 2; i++) {
                for (let j = -1; j < 2; j++) {
                    // skip current
                    if (i == 0 && j == 0)
                        continue;

                    let neighborX = this.getCoordinate(unit.x + i, generation.width);
                    let neighborY = this.getCoordinate(unit.y + j, generation.height);

                    yield generation.getUnit(neighborX, neighborY);
                }
            }
        }

        private getCoordinate(maybeValidCoord: number, border: number) {

            if (maybeValidCoord < 0)
                return border - 1;

            if (maybeValidCoord >= border)
                return 0;

            return maybeValidCoord;
        }
    }

    class AliveRule extends Rule {

        public execute(unit: Models.Unit, generation: Models.Generation): Models.Unit {

            let aliveNeighborsCount = this.countAliveNeighbors(unit, generation);

            if (window && window.navigator && window.navigator.userAgent && /Edge\/1[0-4]\./.test(window.navigator.userAgent)) {
                // Fix for bug in Microsoft Edge: https://github.com/Microsoft/ChakraCore/issues/1415#issuecomment-246424339
                // Construct function from SO: https://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible
                return aliveNeighborsCount >= 2 && aliveNeighborsCount < 4 ?
                    unit :
                    construct(Models.Unit, unit.x, unit.y, construct(states.DeadState));
            }

            return aliveNeighborsCount >= 2 && aliveNeighborsCount < 4 ?
                unit :
                new Models.Unit(unit.x, unit.y, new states.DeadState());
        }
    }

    class DeadRule extends Rule {

        public execute(unit: Models.Unit, generation: Models.Generation): Models.Unit {

            let aliveNeighborsCount = this.countAliveNeighbors(unit, generation);

            if (window && window.navigator && window.navigator.userAgent && /Edge\/1[0-4]\./.test(window.navigator.userAgent)) {
                // Fix for bug in Microsoft Edge: https://github.com/Microsoft/ChakraCore/issues/1415#issuecomment-246424339
                // Construct function from SO: https://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible
                return aliveNeighborsCount == 3 ?
                    construct(Models.Unit, unit.x, unit.y, construct(states.AliveState)) :
                    unit;
            }

            return aliveNeighborsCount == 3 ?
                new Models.Unit(unit.x, unit.y, new states.AliveState()) :
                unit;
        }
    }

    let cache: Map<string, Rule> = getCache();

    export function getRule(rule: string): Rule {
        if (!cache.has(rule))
            throw new Error(`Provided ${rule} is not present in cache`);

        return cache.get(rule);
    }

    function getCache(): Map<string, Rule> {
        let cache = new Map<string, Rule>();
        cache.set("Dead", new DeadRule());
        cache.set("Alive", new AliveRule());
        return cache;
    }

    function construct(cls, ...args) {
       return new (Function.prototype.bind.apply(cls, arguments));
    }
}