class EventAggregator {
    private subscribers: Map<string, Array<any>> = new Map<string, Array<any>>();

    public subscribe<T extends IEvent>(event: T, action: (ev: T) => void): number {
        let key = event.name;

        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, []);
        }

        this.subscribers.get(key).push(action);

        return this.subscribers.get(key).length - 1;
    }

    public unsubscribe<T extends IEvent>(event: T, token: number): void {
        let key = event.name;

        if (!this.subscribers.has(key)) {
            return;
        }

        let array = this.subscribers.get(key);
        array[token] = null; // reset the corresponding action

        if (array.every(a => a == null))
            this.subscribers.delete(key); // since no subscribers left remove specified key
    }

    public publish<T extends IEvent>(event: T): void {
        let key = event.name;

        if (!this.subscribers.has(key)) {
            return;
        }

        for (let action of this.subscribers.get(key)) {
            if (action != null)
                action(event);
        }
    }
}

interface IEvent {
    name: string;
}

class GameOverEvent implements Trigger, IEvent {
    public name = "GameOverEvent";
}

class GameEvent implements Trigger, IEvent {
    public name = "GameEvent";
}

class NewGameEvent implements Trigger, IEvent {
    public name = "NewGameEvent";
}