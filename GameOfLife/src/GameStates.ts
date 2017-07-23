abstract class GameState implements State {
    abstract name;
    abstract apply(): void;
    abstract dispose(): void;
}

class NotStartedState extends GameState {

    public name = "NotStartedState";

    public apply(): void {

    }

    dispose(): void {

    }
}

class RunningState extends GameState {
    public name = "RunningState";

    public apply(): void {

    }

    dispose(): void {

    }
}

class PausedState extends GameState {
    public name = "PausedState";

    public apply(): void {

    }

    dispose(): void {

    }
}

class GameOverState extends GameState {
    public name = "GameOverState";

    public apply(): void {

    }

    dispose(): void {

    }
}