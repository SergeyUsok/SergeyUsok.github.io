import { SubwayMap } from "../Models/SubwayMap";
import { MapView } from "../Utils/MapView";

export class GridController {    
    public constructor(subwayMap: SubwayMap, private mapView: MapView) {
        this.initialize(subwayMap, mapView.getCanvas());
        mapView.redrawGrid();
    }  

    private initialize(subwayMap: SubwayMap, canvas: SVGSVGElement): void {
        let textInput = <HTMLInputElement>document.getElementById("gridSize");
        textInput.value = `${subwayMap.sizeSettings.gridSize}`;

        let label = document.getElementById("sizeLabel");
        label.textContent = `${subwayMap.sizeSettings.gridSize}X${subwayMap.sizeSettings.gridSize}`;

        document.getElementById("update")
            .addEventListener("click", () => this.updateGrid(subwayMap));

        document.getElementById("grid-switch")
            .addEventListener("click", () => this.mapView.toggleGrid());

        canvas.addEventListener("mousemove", event => this.highlightCell(event));
    }

    private highlightCell(event: MouseEvent): void {
        let rect = (<any>(event.currentTarget)).getBoundingClientRect();
        this.mapView.highlightCell(event.clientX - rect.left, event.clientY - rect.top);
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

            this.mapView.redrawGrid();
            this.mapView.redrawMap(metadata);
        }
    }
}