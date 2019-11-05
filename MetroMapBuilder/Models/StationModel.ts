import { Strings } from "../Utils/Strings";
import { Direction } from "./ConnectionModel";

export class Station {
    private _label: Label = null;
    private subscribers: Map<string, () => void> = new Map<string, () => void>();
    
    public constructor(private _id: number, private _x: number, private _y: number) {
        this._label = new Label(_id, Strings.defaultLabel(_id));
    }
    public get id(): number {
        return this._id;
    }
    public get label(): Label {
        return this._label;
    }
    public get x(): number {
        return this._x;
    }
    public set x(value: number) {
        this._x = value;
        this.notifyAll();
    }
    public get y(): number {
        return this._y;
    }
    public set y(value: number) {
        this._y = value;
        this.notifyAll();
    }
    public onPositionChanged(connectionId: string, callback: () => void) {
        this.subscribers.set(connectionId, callback);
    }
    public unsubscribe(connectionId: string): void {
        this.subscribers.delete(connectionId);
    }
    private notifyAll(): void {
        for (let callback of this.subscribers.values()) {
            callback();
        }
    }
}

export class Label {
    private _names: string[];
    private _x: number;
    private _y: number;
    private _width: number;

    public constructor(private _id: number, ...names: string[]) {
        this.setName(...names);
    }

    public get id(): number {
        return this._id;
    }

    public get name(): string[] {
        return this._names;
    }

    public get x(): number {
        return this._x;
    }

    public get y(): number {
        return this._y;
    }

    public get width(): number {
        return this._width;
    }

    public get height(): number {
        return this._names.length;
    }

    public setName(...names: string[]): void {
        let max = 0;
        for (let i = 0; i < names.length; i++) {
            if (max < names[i].length)
                max = names[i].length;
        }
        this._width = max;
        this._names = names;
    }

    public setCoordinates(x: number, y: number): void {
        this._x = x;
        this._y = y;
    }
}
