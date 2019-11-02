define(["require", "exports", "../Utils/Strings"], function (require, exports, Strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Station {
        constructor(_id, _x, _y) {
            this._id = _id;
            this._x = _x;
            this._y = _y;
            this._label = null;
            this._label = new Label(_id, Strings_1.Strings.defaultLabel(_id));
        }
        get id() {
            return this._id;
        }
        get x() {
            return this._x;
        }
        get y() {
            return this._y;
        }
        get label() {
            return this._label;
        }
    }
    exports.Station = Station;
    class Label {
        constructor(_id, ...names) {
            this._id = _id;
            this.setName(...names);
        }
        get id() {
            return this._id;
        }
        get name() {
            return this._names;
        }
        get x() {
            return this._x;
        }
        get y() {
            return this._y;
        }
        get width() {
            return this._width;
        }
        get height() {
            return this._names.length;
        }
        setName(...names) {
            let max = 0;
            for (let i = 0; i < names.length; i++) {
                if (max < names[i].length)
                    max = names[i].length;
            }
            this._width = max;
            this._names = names;
        }
        setCoordinates(x, y) {
            this._x = x;
            this._y = y;
        }
    }
    exports.Label = Label;
});
//# sourceMappingURL=StationModel.js.map