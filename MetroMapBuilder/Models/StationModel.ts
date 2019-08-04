import { Strings } from "../Utils/Strings";

export class Station {
    private _label: Label = null;

    public constructor(private _id: number, private _x: number, private _y: number) {
        this._label = new Label(Strings.defaultLabel(_id));
    }
    public get id(): number {
        return this._id;
    }
    public get x(): number {
        return this._x;
    }
    public get y(): number {
        return this._y;
    }
    public get label(): Label {
        return this._label;
    }    
}

export class Label {
    private _names: string[];
    private _x: number;
    private _y: number;
    private _width: number;

    public constructor(...names: string[]) {
        this.setName(...names);
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
