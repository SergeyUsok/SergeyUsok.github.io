/// <reference path="Rules.ts" />

namespace UnitStates {

    export interface State {
        getRule(): RulesCache.Rule;
        readonly name: string;
    }

    export class AliveState implements State {

        public readonly name: string = "Alive";

        public getRule(): RulesCache.Rule {
            return RulesCache.getRule(this.name);
        }
    }

    export class DeadState implements State {

        public readonly name: string = "Dead";

        public getRule(): RulesCache.Rule {
            return RulesCache.getRule(this.name);
        }
    }
}