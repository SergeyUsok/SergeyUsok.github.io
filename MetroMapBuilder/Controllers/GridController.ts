import { SubwayMap } from "../Models/SubwayMap";
import { MapDrawer } from "../Utils/MapDrawer";

export class GridController {    
    public constructor(subwayMap: SubwayMap, private drawer: MapDrawer) {
        this.initialize(subwayMap, drawer.getCanvas());
        drawer.redrawGrid();
    }  

    private initialize(subwayMap: SubwayMap, canvas: SVGSVGElement): void {
        let textInput = <HTMLInputElement>document.getElementById("gridSize");
        textInput.value = `${subwayMap.sizeSettings.gridSize}`;

        let label = document.getElementById("sizeLabel");
        label.textContent = `${subwayMap.sizeSettings.gridSize}X${subwayMap.sizeSettings.gridSize}`;

        document.getElementById("update")
            .addEventListener("click", () => this.updateGrid(subwayMap));

        document.getElementById("grid-switch")
            .addEventListener("click", () => this.toggleGrid());

        canvas.addEventListener("mousemove", event => this.highlightCell(event));
    }

    private highlightCell(event: MouseEvent): void {
        if (event.target instanceof SVGLineElement) {
            // get coords relative to svg canvas rather than just line ones
            let rect = (<any>(event.currentTarget)).getBoundingClientRect();
            this.drawer.highlightCell(event.clientX - rect.left, event.clientY - rect.top);
        }
        else if (event.target instanceof SVGCircleElement) {
            this.drawer.highlightCell(event.target.cx.baseVal.value, event.target.cy.baseVal.value);
        }
        else {
            this.drawer.highlightCell(event.offsetX, event.offsetY);
        }
    }

    private updateGrid(metadata: SubwayMap) {
        let input = <HTMLInputElement>document.getElementById("gridSize");
        input.classList.remove("is-invalid");
        let size = parseInt(input.value);

        if (Number.isNaN(size) || size <= 0 || size > 400) {
            input.classList.add("is-invalid");
        }
        else if (size === metadata.sizeSettings.gridSize) {
            return;
        }
        else {
            metadata.sizeSettings.gridSize = size;

            let label = document.getElementById("sizeLabel");
            label.textContent = `${metadata.sizeSettings.gridSize}X${metadata.sizeSettings.gridSize}`;

            this.drawer.redrawGrid();
            this.drawer.redrawMap(metadata);
        }
    }

    private toggleGrid() {
        let grid = document.getElementById("grid");

        grid.getAttribute("visibility") == "visible" ?
            grid.setAttribute("visibility", "hidden") :
            grid.setAttribute("visibility", "visible");
    }
}