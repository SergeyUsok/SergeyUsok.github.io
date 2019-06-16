import { SVG } from "../Utility/SVG";
import { GridConfig, Geometry } from "../Utility/Geometry";
import { StationsController } from "./StationsController";

export interface Controller {
    next(): Controller;
    dispose(): void;
}

export class GridController implements Controller {    
    private update = () => this.handleUpdate();
    private loadBackground = () => this.handleLoadBackground();
    private clearBackground = () => this.handleClearBackground();
    private urlTextChaged = e => this.handleUrlTextChaged(e);

    public constructor(private map: HTMLElement) {
        this.initialize(map);
    }

    public next(): Controller {
        return new StationsController(this.map);
    }

    public dispose(): void {
        document.getElementById("update").removeEventListener("click", this.update);
        document.getElementById("url").removeEventListener("input", this.urlTextChaged);
        document.getElementById("load").removeEventListener("click", this.loadBackground);
        document.getElementById("clear").removeEventListener("click", this.clearBackground);
    }

    private draw() {
        let canvas = <SVGSVGElement><any>this.map;

        // draw vertical lines
        let index = 0;
        for (let x = 0; x <= canvas.width.baseVal.value; x += Geometry.cellSize) {
            let line = SVG.gridLine(x, 0, x, canvas.height.baseVal.value);
            line.setAttribute("id", `x${index}`);
            canvas.appendChild(line);
            index++;
        }

        // draw horizontal lines
        index = 0;
        for (let y = 0; y <= canvas.height.baseVal.value; y += Geometry.cellSize) {
            let line = SVG.gridLine(0, y, canvas.width.baseVal.value, y);
            line.setAttribute("id", `y${index}`);
            canvas.appendChild(line);
            index++;
        }
    }

    private handleLoadBackground(): void {
        let url = (<any>document.getElementById("url")).value;
        let map = document.getElementById("map");
        map.classList.add("bgd");
        map.classList.remove("bgd-color");
        map.style.backgroundImage = `url(${url})`;
        document.getElementById("load").setAttribute("disabled", "disabled");
        document.getElementById("clear").removeAttribute("disabled");
    }

    private handleClearBackground(): void {
        let map = document.getElementById("map");
        map.classList.remove("bgd");
        map.classList.add("bgd-color");
        map.style.backgroundImage = '';
        (<any>document.getElementById("url")).value = '';
        document.getElementById("clear").setAttribute("disabled", "disabled");
    }

    private handleUrlTextChaged(e) {
        if (e.target.value != "") {
            document.getElementById("load").removeAttribute("disabled");
            document.getElementById("clear").removeAttribute("disabled");
        }
        else {
            document.getElementById("load").setAttribute("disabled", "disabled");
            document.getElementById("clear").setAttribute("disabled", "disabled");
        }
    }

    private handleUpdate(): void {
        var input = <HTMLInputElement>document.getElementById("gridSize");
        input.classList.remove("is-invalid");
        var text = input.value;
        var size = parseInt(text);

        if (Number.isNaN(size) || size <= 0 || size > 400) {
            input.classList.add("is-invalid");
        }
        else if (size === GridConfig.size) {
            return;
        }
        else {
            var map = document.getElementById("map");
            map.innerHTML = null;

            GridConfig.size = size;

            var label = document.getElementById("sizeLabel");
            label.textContent = `${GridConfig.size}X${GridConfig.size}`;

            this.draw();
        }
    }

    private initialize(map: HTMLElement): void {
        let canvas = <SVGSVGElement><any>map;

        GridConfig.pixelSize = canvas.width.baseVal.value;
        GridConfig.size = 40;

        var textInput = <HTMLInputElement>document.getElementById("gridSize");
        textInput.value = `${GridConfig.size}`;

        var label = document.getElementById("sizeLabel");
        label.textContent = `${GridConfig.size}X${GridConfig.size}`;

        document.getElementById("update")
            .addEventListener("click", this.update);

        document.getElementById("url")
            .addEventListener("input", this.urlTextChaged);

        document.getElementById("load")
            .addEventListener("click", this.loadBackground);

        document.getElementById("clear")
            .addEventListener("click", this.clearBackground);

        this.draw();
    }
}