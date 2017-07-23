class StateMachine<TState extends State, TTrigger extends Trigger> {
    private currentState: TState;
    private transishionsMap: Map<string, TState> = new Map<string, TState>();
    private preActionsMap: Map<string, (s: TState) => void> = new Map<string, (s: TState) => void>();
    private postActionsMap: Map<string, (s: TState) => void> = new Map<string, (s: TState) => void>();

    public constructor(private initialState: TState) {
        this.currentState = initialState;
    }

    public static startsFrom<TState extends State, TTrigger extends Trigger>(state: TState): TriggerConfigurator<TState, TTrigger> {
        let stateMachine = new StateMachine(state);
        return new TriggerConfigurator<TState, TTrigger>(stateMachine, state);
    }

    public addTransition(from: TState, trigger: TTrigger, to: TState): void {
        let key = `${from.name}_${trigger.name}`;
        this.transishionsMap.set(key, to);
    }

    public preAction(state: TState, action: (s: TState) => void): void {
        this.preActionsMap.set(state.name, action);
    }

    public postAction(state: TState, action: (s: TState) => void): void {
        this.postActionsMap.set(state.name, action);
    }

    public nextState(trigger: TTrigger): TState {
        let key = `${this.currentState.name}_${trigger.name}`;

        if (this.transishionsMap.has(key)) {

            if (this.postActionsMap.has(this.currentState.name)) {
                let postAction = this.postActionsMap.get(this.currentState.name);
                postAction(this.currentState);
            }

            this.currentState = this.transishionsMap.get(key);

            if (this.preActionsMap.has(this.currentState.name)) {
                let preAction = this.preActionsMap.get(this.currentState.name);
                preAction(this.currentState);
            }
        }

        return this.currentState;
    }

    public toStart(): TState {
        return this.initialState;
    }
}

interface State {
    name: string;
}

interface Trigger {
    name: string;
}

class StateConfigurator<TState extends State, TTrigger extends Trigger> {
    public constructor(private machine: StateMachine<TState, TTrigger>) {

    }

    public for(state: TState) {
        return new TriggerConfigurator(this.machine, state);
    }
}

class TriggerConfigurator<TState extends State, TTrigger extends Trigger> {
    public constructor(private machine: StateMachine<TState, TTrigger>, private state: TState) {

    }

    public on(trigger: TTrigger) {
        return new TransitionConfigurator(this.machine, this.state, trigger);
    }

    public and(): StateConfigurator<TState, TTrigger> {
        return new StateConfigurator(this.machine);
    }

    public before(action: (s: TState) => void): TriggerConfigurator<TState, TTrigger> {
        this.machine.preAction(this.state, action);
        return this;
    }

    public after(action: (s: TState) => void): TriggerConfigurator<TState, TTrigger> {
        this.machine.postAction(this.state, action);
        return this;
    }

    public done(): StateMachine<TState, TTrigger> {
        return this.machine;
    }
}

class TransitionConfigurator<TState extends State, TTrigger extends Trigger> {

    public constructor(private machine: StateMachine<TState, TTrigger>, private state: TState, private trigger: TTrigger) {

    }

    public moveTo(destination: TState): TriggerConfigurator<TState, TTrigger> {
        this.machine.addTransition(this.state, this.trigger, destination);
        return new TriggerConfigurator(this.machine, this.state);
    }
} 