/// <reference path="Core.ts" />
/// <reference path="Models.ts" />
/// <reference path="UnitStates.ts" />

abstract class GameState implements IState {
    abstract name;
    abstract apply(game: Core.Game): void;
    abstract dispose(): void;
}

class NotStartedState extends GameState {

    public name = "NotStartedState";
    private game: Core.Game;
    private token: number;

    public apply(game: Core.Game): void {
        this.game = game;
        this.token = EventAggregator.subscribe(new TileClickedEvent(), (ev) => this.handleClickedTile(ev));
        EventAggregator.publish(new InitializeGameEvent(game.history[0]));
    }

    public dispose(): void {
        EventAggregator.unsubscribe(new TileClickedEvent(), this.token);
        EventAggregator.publish(new LeavingNotStartedStateEvent());
    }

    private handleClickedTile(ev: TileClickedEvent): void {
        let generationZero = this.game.history[0];
        let unit = generationZero.getUnit(ev.x, ev.y);
        let newUnit = null;

        if (unit.state instanceof UnitStates.DeadState)
            newUnit = new Models.Unit(ev.x, ev.y, new UnitStates.AliveState());
        else
            newUnit = new Models.Unit(ev.x, ev.y, new UnitStates.DeadState());

        generationZero.add(newUnit);
        EventAggregator.publish(new UnitUpdatedEvent(newUnit, generationZero.population));
    }
}

class RunningState extends GameState {
    public name = "RunningState";
    private game: Core.Game;
    private pauseRequested: boolean = false;

    public apply(game: Core.Game): void {
        this.game = game;
        this.pauseRequested = false;
        this.runGame();
    }

    private runGame() {
        if (this.pauseRequested)
            return;

        let genResult = this.game.nextGeneration();

        if (genResult.isGameOver) {
            EventAggregator.publish(new GameOverEvent(genResult.reason));
        }
        else {
            let generationNumber = this.game.history.length - 1;
            EventAggregator.publish(new NewGenerationEvent(genResult.generation, generationNumber));
        }

        setTimeout(() => this.runGame(), 1000);
    }

    dispose(): void {
        this.pauseRequested = true;
    }
}

class PausedState extends GameState {
    public name = "PausedState";
    private game: Core.Game;
    private nextToken: number;
    private prevToken: number;
    private current: number;

    public apply(game: Core.Game): void {
        this.game = game;
        this.current = game.history.length - 1;
        this.nextToken = EventAggregator.subscribe(new NextGenerationEvent(), (ev) => this.getNext());
        this.prevToken = EventAggregator.subscribe(new PrevGenerationEvent(), (ev) => this.getPrevious());
    }

    private getNext(): void {
        if (this.current >= (this.game.history.length - 1)) {
            this.generateNew();
        }
        else {
            this.current++;
            let generation = this.game.history[this.current];
            EventAggregator.publish(new HistoricalGenerationEvent(generation, this.current));
        }
    }

    private generateNew(): void {
        let genResult = this.game.nextGeneration();
        this.current = this.game.history.length - 1;

        if (genResult.isGameOver) {
            EventAggregator.publish(new GameOverEvent(genResult.reason));
        }
        else {
            EventAggregator.publish(new NewGenerationEvent(genResult.generation, this.current));
        }
    }

    private getPrevious(): void {
        if (this.current <= 0)
            return;

        this.current--;
        let generation = this.game.history[this.current];
        EventAggregator.publish(new HistoricalGenerationEvent(generation, this.current));
    }

    dispose(): void {
        EventAggregator.unsubscribe(new NextGenerationEvent(), this.nextToken);
        EventAggregator.unsubscribe(new PrevGenerationEvent(), this.prevToken);
    }
}