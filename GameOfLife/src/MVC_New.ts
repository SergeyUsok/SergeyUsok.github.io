/// <reference path="Models.ts" />

/// <reference path="UnitStates.ts" />

namespace MVCNew {

    class Game {
        public next(generation: Models.Generation) {

        }
    }

    class ZeroGenerationProvider {
        //public empty(): Models.Generation {

        //}

        //public random(): Models.Generation {

        //}
    }

    export class GameController {
        private game: Game;
        private stateMachine: StateMachine<GameState, Trigger>;

        public constructor() {
            let aggregator = new EventAggregator();
            
            this.stateMachine =
                StateMachine.startsFrom(new NotStartedState())
                    .on(new GameEvent()).moveTo(new RunningState())
                    .on(new NewGameEvent()).moveTo(new NotStartedState())
                    .after(s => s.dispose())
                .and()
                .for(new RunningState())
                    .on(new GameEvent()).moveTo(new PausedState())
                    .on(new NewGameEvent()).moveTo(new NotStartedState())
                    .on(new GameOverEvent()).moveTo(new GameOverState())
                    .after(s => s.dispose())
                .and()
                .for(new PausedState())
                    .on(new GameEvent()).moveTo(new RunningState())
                    .on(new NewGameEvent()).moveTo(new NotStartedState())
                    .on(new GameOverEvent()).moveTo(new GameOverState())
                .and()
                .for(new GameOverState())
                    .on(new NewGameEvent()).moveTo(new NotStartedState())
                .done();
        }
    }

    export class View {
        public constructor() {

        }
    }

    class Button implements Control {
        public constructor(id: string) {

        }

        public disable() {

        }

        public enable() {

        }
    }

    interface Control {
        disable();
        enable();
    }
}