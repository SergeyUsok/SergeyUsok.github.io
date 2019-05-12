
export class SingleLineController {
    private controlPanel: HTMLDivElement;

    public constructor(private onLineChange: (id: number) => void,
                       private onColorChange: (id: number, color: string) => void,
                       private onRemove: (id: number) => void,
                       colors: Color[]) {
        this.controlPanel = this.createControlPanel(colors);
    }

    private createControlPanel(colors: Color[]): HTMLDivElement {
        let clone = <HTMLDivElement>document.getElementById("linePanel").cloneNode(true);
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

    private lineChanged(): void {

    }

    private colorChanged(): void {

    }

    private lineRemoved(): void {

    }
}