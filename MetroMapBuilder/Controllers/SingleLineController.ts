import { Color, Station } from "../Types";

export class SingleLineController {     
    private controlPanel: HTMLDivElement;
    private lineSelected = e => this.handleLineSelected();
    private colorChanged = e => this.handleColorChanged();
    private lineRemoved = e => this.handleLineRemoved();

    private myColor: Color;

    public constructor(private lineSelectedCallback: (me: SingleLineController) => void,
                        private colorChangedCallback: (me: SingleLineController, color: Color) => void,
                        private removeCallback: (me: SingleLineController) => void,
                       colors: Color[]) {
        this.controlPanel = this.createControlPanel(colors);
    }

    public connect(currentFrom: Station, currentTo: Station): void {
        
    }  

    public deselect(): void {
        (<HTMLInputElement>this.controlPanel.querySelector("input[type=radio]")).checked = false;
    }

    public showConnnections(): void {
    }

    public hideConnections(): void {
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

        this.controlPanel.remove();
    }

    private createControlPanel(colors: Color[]): HTMLDivElement {
        let clone = <HTMLDivElement>document.getElementById("linePanel").cloneNode(true);
        clone.removeAttribute("id"); // save uniqueness of basis element
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
        this.removeCallback(this);
    }
}