import { Metadata } from "../Utils/Metadata";
import { MapDrawer } from "../Utils/MapDrawer";
import { Geometry } from "../Utils/Geometry";

export class GridController {    
    private highlightedLines: any[] = [];

    public constructor(private metadata: Metadata, private drawer: MapDrawer) {
        this.initialize(metadata, drawer.getCanvas());
        drawer.redrawGrid();
    }  

    private initialize(metadata: Metadata, map: SVGSVGElement): void {
        let textInput = <HTMLInputElement>document.getElementById("gridSize");
        textInput.value = `${metadata.gridConfig.gridSize}`;

        let label = document.getElementById("sizeLabel");
        label.textContent = `${metadata.gridConfig.gridSize}X${metadata.gridConfig.gridSize}`;

        document.getElementById("update")
            .addEventListener("click", () => this.redrawGrid(metadata));

        document.getElementById("grid-switch")
            .addEventListener("click", () => this.toggleGrid());

        map.addEventListener("mousemove", event => this.highlightCell(event));
    }

    private highlightCell(event: MouseEvent): void {
        let cell = null;

        if (event.target instanceof SVGLineElement) {
            // get coords relative to of svg canvas rather than just line ones
            let rect = (<any>(event.currentTarget)).getBoundingClientRect();
            cell = Geometry.normalizeToGridCell(event.clientX - rect.left, event.clientY - rect.top);
        }
        else if (event.target instanceof SVGCircleElement) {
            cell = Geometry.normalizeToGridCell(event.target.cx.baseVal.value, event.target.cy.baseVal.value);
        }
        else {
            cell = Geometry.normalizeToGridCell(event.offsetX, event.offsetY);
        }

        for (let i = 0; i < this.highlightedLines.length; i++) {
            this.highlightedLines[i].classList.remove("highlightCell");
        }

        this.highlightedLines = [];

        // lines which surrounds this cell by x axis
        let lineX1 = document.getElementById(`x${cell.x}`);
        lineX1.classList.add("highlightCell");
        this.highlightedLines.push(lineX1);

        let lineX2 = document.getElementById(`x${cell.x + 1}`);
        lineX2.classList.add("highlightCell");
        this.highlightedLines.push(lineX2);

        // lines which surrounds this cell by y axis
        let lineY1 = document.getElementById(`y${cell.y}`);
        lineY1.classList.add("highlightCell");
        this.highlightedLines.push(lineY1);

        let lineY2 = document.getElementById(`y${cell.y + 1}`);
        lineY2.classList.add("highlightCell");
        this.highlightedLines.push(lineY2);
    }

    private redrawGrid(metadata: Metadata) {
        let input = <HTMLInputElement>document.getElementById("gridSize");
        input.classList.remove("is-invalid");
        let size = parseInt(input.value);

        if (Number.isNaN(size) || size <= 0 || size > 400) {
            input.classList.add("is-invalid");
        }
        else if (size === metadata.gridConfig.gridSize) {
            return;
        }
        else {
            metadata.gridConfig.gridSize = size;

            let label = document.getElementById("sizeLabel");
            label.textContent = `${metadata.gridConfig.gridSize}X${metadata.gridConfig.gridSize}`;

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