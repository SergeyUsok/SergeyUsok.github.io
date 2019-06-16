import { Color, Station, Line } from "../Types";
import { SVG } from "../Utility/SVG";

export class SingleLineController {   
    private controlPanel: HTMLDivElement;
    private lineSelected = e => this.handleLineSelected();
    private colorChanged = e => this.handleColorChanged();
    private lineRemoved = e => this.handleLineRemoved();
    private stationClick = e => this.handleSelection(e);

    private myColor: Color;
    private lineStations: Station[] = [];

    public constructor(private stations: Station[],
                       private lineSelectedCallback: (me: SingleLineController) => void,
                       private colorChangedCallback: (me: SingleLineController, color: Color) => void,
                       private removeCallback: (me: SingleLineController) => void,
                       colors: Color[]) {
        this.controlPanel = this.createControlPanel(colors);
    }

    public deselect(): void {
        (<HTMLInputElement>this.controlPanel.querySelector("input[type=radio]")).checked = false;
        document.getElementById("map").removeEventListener("click", this.stationClick);
        this.hideConnections();
    }

    public select(): void {
        document.getElementById("map").addEventListener("click", this.stationClick);
        this.showConnnections();
    }

    private showConnnections(): void {
        if (this.myColor !== undefined) {
            let map  = document.getElementById("map");
            // create and add line to map
            let line = SVG.polyline(this.lineStations, this.myColor);
            map.appendChild(line);
            // after that recreate circles in order to overlap line
            for (let i = 0; i < this.lineStations.length; i++) {
                this.lineStations[i].circle.remove();
                this.lineStations[i].circle.classList.add("selected");
                map.appendChild(this.lineStations[i].circle);
            }
        }
    }

    private hideConnections(): void {
        let lines = document.getElementsByTagName("polyline");
        for (let i = 0; i < lines.length; i++) {
            lines[i].remove();
        }
        for (let i = 0; i < this.lineStations.length; i++) {
            this.lineStations[i].circle.classList.remove("selected");
        }
    }

    private removeStation(toRemove: Station): void {        
        let newArr = [];

        for (let i = 0; i < this.lineStations.length; i++) {
            let station = this.lineStations[i];

            if (station != toRemove)
                newArr.push(station);
        }

        this.lineStations = newArr;
    }

    public redraw(): void {
        this.hideConnections();
        this.showConnnections();
    }

    private handleSelection(event: MouseEvent): void {
        if (!(event.target instanceof SVGCircleElement))
            return;

        let clicked = this.stations.find(s => event.target == s.circle);

        if (clicked.circle.classList.contains("selected")) { // if already selected then should be deselected
            this.removeStation(clicked);
        }
        else {
            this.lineStations.push(clicked);
        }

        this.redraw();
    }  

    public dispose(): void {
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

    public toLine(lineId: number): Line {
        let stationIds = [];
        for (var i = 0; i < this.lineStations.length; i++) {
            stationIds.push(this.lineStations[i].id);
        }

        return { id: lineId, stations: stationIds, name: "", color: this.myColor };
    }

    private createControlPanel(colors: Color[]): HTMLDivElement {
        let clone = <HTMLDivElement>document.getElementById("linePanel").cloneNode(true);
        clone.removeAttribute("id"); // save uniqueness of template element
        clone.classList.remove("d-none"); // make element visible

        let radioButton = clone.querySelector("input[type=radio]");        
        radioButton.addEventListener("click", this.lineSelected);
        (<HTMLInputElement>radioButton).checked = true;

        let removeButton = clone.querySelector("input[type=button]");
        removeButton.addEventListener("click", this.lineRemoved);

        let colorsControl = clone.querySelector("select");
        colorsControl.addEventListener("change", this.colorChanged);

        for (var i = 0; i < colors.length; i++) {
            var option = document.createElement('option');
            option.appendChild(document.createTextNode(colors[i]));
            option.value = colors[i];
            option.setAttribute("style", `color: ${colors[i]}`)
            colorsControl.appendChild(option);
        }

        document.getElementById("lines-setup").appendChild(clone);

        return clone;
    }

    private handleLineSelected(): void {
        this.lineSelectedCallback(this);
    }

    private handleColorChanged(): void {
        let colors = this.controlPanel.querySelector("select");
        let selectedOption = colors[colors.selectedIndex];

        if (selectedOption.label == "none" && !colors.classList.contains("is-invalid")) {
            colors.classList.add("is-invalid");
        }
        else if (selectedOption.label != "none" && colors.classList.contains("is-invalid")) {
            colors.classList.remove("is-invalid");
        }

        this.myColor = Color[selectedOption.label];
        this.colorChangedCallback(this, this.myColor);
    }

    private handleLineRemoved(): void {
        this.dispose();
        this.controlPanel.remove();
        this.removeCallback(this);
    }
}