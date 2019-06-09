import { SVG } from "../Utility/SVG";
import { GridConfig, Geometry } from "../Utility/Geometry";
import { StationsController } from "./StationsController";

export interface Controller {
    next(): Controller;
    dispose(): void;
}

export class GridController implements Controller {    
    private update = () => this.handleUpdate();

    public constructor(private map: HTMLElement) {
        this.initialize(map);
    }

    public next(): Controller {
        return new StationsController(this.map);
    }

    public dispose(): void {
        document.getElementById("update").removeEventListener("click", this.update);
    }

    private draw() {
        let canvas = <SVGSVGElement><any>this.map;

        // draw vertical lines
        for (let x = 0; x <= canvas.width.baseVal.value; x += Geometry.cellSize) {
            let line = SVG.gridLine(x, 0, x, canvas.height.baseVal.value);
            canvas.appendChild(line);
        }

        // draw horizontal lines
        for (let y = 0; y <= canvas.height.baseVal.value; y += Geometry.cellSize) {
            let line = SVG.gridLine(0, y, canvas.width.baseVal.value, y);
            canvas.appendChild(line);
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

        this.draw();
    }
}