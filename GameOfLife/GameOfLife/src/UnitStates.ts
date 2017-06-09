/// <reference path="Rules.ts" />

namespace UnitStates {

    export interface State {
        getRule(): Rules.Rule;
    }

    export class AliveState implements State {

        public getRule(): Rules.Rule {
            return new Rules.AliveRule();
        }
    }

    export class DeadState implements State {

        public getRule(): Rules.Rule {
            return new Rules.DeadRule();
        }
    }
}