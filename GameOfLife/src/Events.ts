/// <reference path="Models.ts" />
/// <reference path="UnitStates.ts" />

// event aggregator is singleton
namespace EventAggregator {

    let subscribers: Map<string, Array<any>> = new Map<string, Array<any>>();

    export function subscribe<T extends IEvent>(event: T, action: (ev: T) => void): number {
        let key = event.name;

        if (!subscribers.has(key)) {
            subscribers.set(key, []);
        }

        subscribers.get(key).push(action);

        return subscribers.get(key).length - 1;
    }

    export function unsubscribe<T extends IEvent>(event: T, token: number): void {
        let key = event.name;

        if (!subscribers.has(key)) {
            return;
        }

        let array = subscribers.get(key);
        array[token] = null; // reset the corresponding action

        if (array.every(a => a == null))
            subscribers.delete(key); // since no subscribers left remove specified key
    }

    export function publish<T extends IEvent>(event: T): void {
        let key = event.name;

        if (!subscribers.has(key)) {
            return;
        }

        for (let action of subscribers.get(key)) {
            if (action != null)
                action(event);
        }
    }
}

interface IEvent {
    name: string;
}

class GameOverEvent implements IEvent {
    public name = "GameOverEvent";

    public constructor(public readonly reason?: string) {
    }
}

class GameStartingEvent implements IEvent {
    public name = "GameStartingEvent";
}

class HistoricalGenerationEvent implements IEvent {
    public name = "HistoricalGenerationEvent";

    public constructor(private readonly gen?: Models.Generation, private genNumber?: number) {

    }

    public get generation() {
        return this.gen;
    }

    public get generationNumber() {
        return this.genNumber;
    }
}

class GameStateChangedEvent implements Trigger, IEvent {
    public name = "GameEvent";
}

class NewGameEvent implements Trigger, IEvent {
    public name = "NewGameEvent";

    public constructor(private _width?: number, private _height?: number) {

    }

    public get width(): number {
        return this._width;
    }

    public get height(): number {
        return this._height;
    }
}

class RandomGameEvent implements Trigger, IEvent {
    public name = "RandomGameEvent";

    public constructor(private _width?: number, private _height?: number) {

    }

    public get width(): number {
        return this._width;
    }

    public get height(): number {
        return this._height;
    }
}

class NextGenerationEvent implements IEvent {
    public name = "NextGenerationEvent";
}

class PrevGenerationEvent implements IEvent {
    public name = "PrevGenerationEvent";
}

class InitializeGameEvent implements IEvent {
    public name = "InitializeGameEvent";

    public constructor(private readonly gen?: Models.Generation) {

    }

    public get generation() {
        return this.gen;
    }
}

class NewGenerationEvent implements IEvent {
    public name = "NewGenerationEvent";

    public constructor(private readonly gen?: Models.Generation, private genNumber?: number) {

    }

    public get generation() {
        return this.gen;
    }

    public get generationNumber() {
        return this.genNumber;
    }
}

class TileClickedEvent implements IEvent {
    public name = "TileClickedEvent";

    public constructor(public x?: number, public y?: number) {

    }
}

class UnitUpdatedEvent implements IEvent {
    public name = "UnitUpdatedEvent";

    public constructor(public readonly unit?: Models.Unit, public readonly population?: number) {

    }
}

class LeavingNotStartedStateEvent implements IEvent {
    public name = "LeavingNotStartedStateEvent";
}

class GamePausingEvent implements IEvent {
    public name = "GamePausingEvent";
}