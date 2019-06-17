define(["require", "exports", "../Types", "../Utility/SVG"], function (require, exports, Types_1, SVG_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SingleLineController {
        constructor(stations, lineSelectedCallback, colorChangedCallback, removeCallback, colors) {
            this.stations = stations;
            this.lineSelectedCallback = lineSelectedCallback;
            this.colorChangedCallback = colorChangedCallback;
            this.removeCallback = removeCallback;
            this.lineSelected = e => this.handleLineSelected();
            this.colorChanged = e => this.handleColorChanged();
            this.lineRemoved = e => this.handleLineRemoved();
            this.stationClick = e => this.handleSelection(e);
            this.lineStations = [];
            this.controlPanel = this.createControlPanel(colors);
        }
        deselect() {
            this.controlPanel.querySelector("input[type=radio]").checked = false;
            document.getElementById("map").removeEventListener("click", this.stationClick);
            this.hideConnections();
        }
        select() {
            document.getElementById("map").addEventListener("click", this.stationClick);
            this.showConnnections();
        }
        showConnnections() {
            if (this.myColor !== undefined) {
                let map = document.getElementById("map");
                // create and add line to map
                let line = SVG_1.SVG.polyline(this.lineStations, this.myColor);
                map.appendChild(line);
                // after that recreate circles in order to overlap line
                for (let i = 0; i < this.lineStations.length; i++) {
                    this.lineStations[i].circle.remove();
                    this.lineStations[i].circle.classList.add("selected");
                    map.appendChild(this.lineStations[i].circle);
                }
            }
        }
        hideConnections() {
            let lines = document.getElementsByTagName("polyline");
            for (let i = 0; i < lines.length; i++) {
                lines[i].remove();
            }
            for (let i = 0; i < this.lineStations.length; i++) {
                this.lineStations[i].circle.classList.remove("selected");
            }
        }
        removeStation(toRemove) {
            let newArr = [];
            for (let i = 0; i < this.lineStations.length; i++) {
                let station = this.lineStations[i];
                if (station != toRemove)
                    newArr.push(station);
            }
            this.lineStations = newArr;
        }
        redraw() {
            this.hideConnections();
            this.showConnnections();
        }
        handleSelection(event) {
            if (!(event.target instanceof SVGCircleElement))
                return;
            let clicked = this.stations.find(s => event.target == s.circle);
            if (clicked.circle.classList.contains("selected")) { // if already selected then should be deselected
                this.removeStation(clicked);
                clicked.circle.classList.remove("selected");
            }
            else {
                this.lineStations.push(clicked);
            }
            this.redraw();
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
            document.getElementById("map").removeEventListener("click", this.stationClick);
        }
        toLine(lineId) {
            let stationIds = [];
            for (var i = 0; i < this.lineStations.length; i++) {
                stationIds.push(this.lineStations[i].id);
            }
            return { id: lineId, stations: stationIds, label: { x: 0, y: 0, name: [] }, color: this.myColor };
        }
        createControlPanel(colors) {
            let clone = document.getElementById("linePanel").cloneNode(true);
            clone.removeAttribute("id"); // save uniqueness of template element
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
            this.dispose();
            this.controlPanel.remove();
        }
    }
    exports.SingleLineController = SingleLineController;
});
//# sourceMappingURL=SingleLineController.js.map