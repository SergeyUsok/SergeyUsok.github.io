/// <reference path="Rules.ts" />

namespace UnitStates {

    export interface State {
        getRule(): Rules.Rule;
        readonly name: string;
    }

    export class AliveState implements State {

        public readonly name: string = "Alive";

        public getRule(): Rules.Rule {
            return new Rules.AliveRule();
        }
    }

    export class DeadState implements State {

        public readonly name: string = "Dead";

        public getRule(): Rules.Rule {
            return new Rules.DeadRule();
        }        
    }
}