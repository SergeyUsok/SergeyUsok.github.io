define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Station {
        constructor(_id, _x, _y) {
            this._id = _id;
            this._x = _x;
            this._y = _y;
            this.label = null;
            this.label = new Label(`Station ${_id}`);
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
        updateLabel() {
        }
    }
    exports.Station = Station;
    class Label {
        constructor(...name) {
            this.name = name;
        }
    }
    exports.Label = Label;
});
//# sourceMappingURL=Station.js.map