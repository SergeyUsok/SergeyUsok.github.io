define(["require", "exports", "../Types"], function (require, exports, Types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SingleLineController {
        constructor(lineSelectedCallback, colorChangedCallback, removeCallback, colors) {
            this.lineSelectedCallback = lineSelectedCallback;
            this.colorChangedCallback = colorChangedCallback;
            this.removeCallback = removeCallback;
            this.lineSelected = e => this.handleLineSelected();
            this.colorChanged = e => this.handleColorChanged();
            this.lineRemoved = e => this.handleLineRemoved();
            this.controlPanel = this.createControlPanel(colors);
        }
        connect(currentFrom, currentTo) {
        }
        deselect() {
            this.controlPanel.querySelector("input[type=radio]").checked = false;
        }
        showConnnections() {
        }
        hideConnections() {
        }
        dispose() {
            this.lineSelectedCallback = null;
            this.colorChangedCallback = null;
            this.removeCallback = null;
            let radioButton = this.controlPanel.querySelector("input[type=radio]");
            radioButton.removeEventListener("click", this.lineSelected);
            let removeButton = this.controlPanel.querySelector("input[type=button]");
            removeButton.removeEventListener("click", this.lineRemoved);
            let colorsControl = this.controlPanel.querySelector("select");
            colorsControl.removeEventListener("change", this.colorChanged);
            this.controlPanel.remove();
        }
        createControlPanel(colors) {
            let clone = document.getElementById("linePanel").cloneNode(true);
            clone.removeAttribute("id"); // save uniqueness of basis element
            clone.classList.remove("d-none"); // make element visible
            let radioButton = clone.querySelector("input[type=radio]");
            radioButton.addEventListener("click", this.lineSelected);
            radioButton.checked = true;
            let removeButton = clone.querySelector("input[type=button]");
            removeButton.addEventListener("click", this.lineRemoved);
            let colorsControl = clone.querySelector("select");
            colorsControl.addEventListener("change", this.colorChanged);
            for (var i = 0; i < colors.length; i++) {
                var option = document.createElement('option');
                option.appendChild(document.createTextNode(colors[i]));
                option.value = colors[i];
                option.setAttribute("style", `color: ${colors[i]}`);
                colorsControl.appendChild(option);
            }
            document.getElementById("lines-setup").appendChild(clone);
            return clone;
        }
        handleLineSelected() {
            this.lineSelectedCallback(this);
        }
        handleColorChanged() {
            let colors = this.controlPanel.querySelector("select");
            let selectedOption = colors[colors.selectedIndex];
            if (selectedOption.label == "none" && !colors.classList.contains("is-invalid")) {
                colors.classList.add("is-invalid");
            }
            else if (selectedOption.label != "none" && colors.classList.contains("is-invalid")) {
                colors.classList.remove("is-invalid");
            }
            this.myColor = Types_1.Color[selectedOption.label];
            this.colorChangedCallback(this, this.myColor);
        }
        handleLineRemoved() {
            this.removeCallback(this);
        }
    }
    exports.SingleLineController = SingleLineController;
});
//# sourceMappingURL=SingleLineController.js.map