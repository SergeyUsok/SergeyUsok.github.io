define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SingleLineController {
        constructor(onLineChange, onColorChange, onRemove, colors) {
            this.onLineChange = onLineChange;
            this.onColorChange = onColorChange;
            this.onRemove = onRemove;
            this.controlPanel = this.createControlPanel(colors);
        }
        createControlPanel(colors) {
            let clone = document.getElementById("linePanel").cloneNode(true);
            clone.removeAttribute("id"); // save uniqueness of basis element
            let radioButton = clone.querySelector("input[type=radio]");
            radioButton.addEventListener("change", this.lineChanged);
            let removeButton = clone.querySelector("input[type=button]");
            removeButton.addEventListener("click", this.lineRemoved);
            let colorsControl = clone.querySelector("select");
            colorsControl.addEventListener("change", this.colorChanged);
            for (var i = 0; i < colors.length; i++) {
                var option = document.createElement('option');
                option.appendChild(document.createTextNode(colors[i].toString()));
                option.value = colors[i].toString();
                colorsControl.appendChild(option);
            }
            document.getElementById("lines-setup").appendChild(clone);
            return clone;
        }
        lineChanged() {
        }
        colorChanged() {
        }
        lineRemoved() {
        }
    }
    exports.SingleLineController = SingleLineController;
});
//# sourceMappingURL=SingleLineController.js.map