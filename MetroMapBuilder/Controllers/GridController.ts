import { SubwayMap } from "../Models/SubwayMap";
import { MapView } from "../Utils/MapView";

export class GridController {    
    public constructor(private subwayMap: SubwayMap, private mapView: MapView) {
        this.initialize(subwayMap, mapView.getCanvas());
        mapView.redrawGrid();
    }  

    private initialize(subwayMap: SubwayMap, canvas: SVGSVGElement): void {
        let textInput = <HTMLInputElement>document.getElementById("gridSize");
        textInput.value = `${subwayMap.sizeSettings.gridSize}`;

        let label = document.getElementById("sizeLabel");
        label.textContent = `${subwayMap.sizeSettings.gridSize}X${subwayMap.sizeSettings.gridSize}`;

        document.getElementById("update")
            .addEventListener("click", () => this.updateGrid());

        document.getElementById("grid-switch")
            .addEventListener("click", () => this.mapView.toggleGrid());

        canvas.addEventListener("mousemove", event => this.highlightCell(event));

        subwayMap.mapReloaded(() => this.onMapReloaded());
    }

    private highlightCell(event: MouseEvent): void {
        let rect = (<any>(event.currentTarget)).getBoundingClientRect();
        this.mapView.highlightCell(event.clientX - rect.left, event.clientY - rect.top);
    }

    private onMapReloaded(): void {
        let input = <HTMLInputElement>document.getElementById("gridSize");
        input.value = `${this.subwayMap.sizeSettings.gridSize}`;

        let label = document.getElementById("sizeLabel");
        label.textContent = `${this.subwayMap.sizeSettings.gridSize}X${this.subwayMap.sizeSettings.gridSize}`;

        this.mapView.redrawGrid();
    }

    private updateGrid() {
        let input = <HTMLInputElement>document.getElementById("gridSize");
        input.classList.remove("is-invalid");
        let size = parseInt(input.value);

        if (Number.isNaN(size) || size <= 0 || size > 400) {
            input.classList.add("is-invalid");
        }
        else if (size === this.subwayMap.sizeSettings.gridSize) {
            return;
        }
        else {
            this.subwayMap.sizeSettings.gridSize = size;

            let label = document.getElementById("sizeLabel");
            label.textContent = `${this.subwayMap.sizeSettings.gridSize}X${this.subwayMap.sizeSettings.gridSize}`;

            this.mapView.redrawGrid();
            this.mapView.redrawMap(this.subwayMap);
        }
    }
}