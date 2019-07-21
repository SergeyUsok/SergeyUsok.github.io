
export class Station {
    public label: Label = null;

    public constructor(private _id: number, private _x: number, private _y: number) {
        this.label = new Label(`Station ${_id}`);
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

    public updateLabel(): void {
    }
}

export class Label {
    public name: string[];

    public constructor(...name: string[]) {
        this.name = name;
    }
}
