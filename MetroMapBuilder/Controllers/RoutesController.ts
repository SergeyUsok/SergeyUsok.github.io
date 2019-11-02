import { SubwayMap } from "../Models/SubwayMap";
import { Route } from "../Models/Route";
import { MapView } from "../Utils/MapView";
import { ErrorController } from "./ErrorController";
import { Strings } from "../Utils/Strings";

export class RoutesController extends ErrorController {
    private routeIdCounter: number = 0;

    public constructor(private subwayMap: SubwayMap, private mapView: MapView) {
        super();
        this.initialize(mapView.getCanvas());
    }

    private removeRoute(route: Route): void {
        this.subwayMap.removeRoute(route);

        // if current/selected route was removed
        if (this.subwayMap.currentRoute == null)
            this.routeSelectionChanged(this.subwayMap.routes.length > 0 ? this.subwayMap.routes[0] : null);

        this.mapView.redrawMap(this.subwayMap);
    }

    private routeSelectionChanged(newSelection: Route): void {
        if (this.subwayMap.currentRoute != null) {
            this.mapView.deselectRoute(this.subwayMap.currentRoute);
        }

        if (newSelection != null) {
            this.mapView.selectRoute(newSelection);
            this.highlightPanel(newSelection);
        }            

        this.subwayMap.currentRoute = newSelection;
    }    

    private initialize(canvas: SVGSVGElement) {
        document.getElementById("addRoute")
            .addEventListener("click", () => this.addRoute());

        document.getElementById("lineWidth")
            .addEventListener("change", e => {
                let factor = parseFloat((<HTMLInputElement>e.target).value);
                this.subwayMap.sizeSettings.lineWidthFactor = factor;
                this.mapView.redrawMap(this.subwayMap);
            });

        canvas.addEventListener("click", event => this.addConnection(event));

        this.subwayMap.mapReloaded(() => this.onMapReloaded());
    }

    private onMapReloaded(): void {
        this.routeIdCounter = this.subwayMap.routes.length;
        let panels = document.getElementById("panels");
        this.removeChildren(panels);
        for (let i = 0; i < this.subwayMap.routes.length; i++) {
            this.addControlPanel(this.subwayMap.routes[i]);
        }
        let lineWidths = <HTMLSelectElement>document.getElementById("lineWidth");
        lineWidths.value = `${this.subwayMap.sizeSettings.lineWidthFactor}`;
    }

    private removeChildren(element: Element) {
        // remove all except basis element
        while (element.lastElementChild.id != "linePanel") {
            element.lastElementChild.remove();
        }
    }

    private addRoute(): void {
        let id = this.routeIdCounter++;
        let route = this.subwayMap.newRoute(id);        
        this.addControlPanel(route);
        this.routeSelectionChanged(route);
    }

    private addConnection(event: MouseEvent): void {
        if (event.target instanceof SVGSVGElement ||
            event.target instanceof SVGLineElement ||
            event.target instanceof SVGTextPositioningElement) {
            return; // nothing to do if canvas, any line (grid or route) or text label was clicked
        }

        if (this.subwayMap.currentRoute == null) {
            this.showError(Strings.selectRouteMessage());
            return;
        }

        let station = this.subwayMap.getStation(this.mapView.getId(event.target as Element));
        let result = this.subwayMap.newConnection(this.subwayMap.currentRoute, station);
        
        if (result.ok) {
            this.mapView.redrawMap(this.subwayMap);
        }
        else {
            this.showError(result.error);
        }     
    }

    private addControlPanel(route: Route): void {
        let clone = <HTMLDivElement>document.getElementById("linePanel").cloneNode(true);
        clone.setAttribute("id", `panel-${route.id}`); // save uniqueness of template element
        clone.classList.remove("d-none"); // make element visible
        
        let removeButton = clone.querySelector("button");
        removeButton.addEventListener("click", e => {            
            clone.remove();
            this.removeRoute(route);
            e.stopPropagation();
        });

        let colorsControl = <HTMLInputElement>clone.querySelector("input[type=text]");
        colorsControl.value = route.color[0];
        colorsControl.addEventListener("input", () => {
            let enteredColor = colorsControl.value.toLowerCase();
            let colors = (enteredColor || "").split("/");
            if (this.isValidColors(colors)) {
                route.color = colors;
                this.mapView.trySetColor(route.id, colors);
                colorsControl.classList.remove("is-invalid");
            }
            else {
                colorsControl.classList.add("is-invalid");
            }
        });

        clone.addEventListener("click", () => {
            if (this.subwayMap.currentRoute == route)
                return;

            this.routeSelectionChanged(route);
        });

        document.getElementById("panels").appendChild(clone);
    }

    private isValidColors(maybeColors: string[]): boolean {
        if (maybeColors.length > 2)
            return false;

        for (let i = 0; i < maybeColors.length; i++) {
            if (Strings.isNullOrWhitespace(maybeColors[i]))
                return false;

            let temp = new Option().style;
            temp.color = maybeColors[i];

            // valid color will be set otherwise it remains empty
            if (temp.color == "")
                return false;
        }
        return true;
    }

    private highlightPanel(route: Route) {
        let panels = document.getElementById("panels").children;

        for (let i = 0; i < panels.length; i++) {
            panels[i].classList.remove("activated");
        }

        document.getElementById(`panel-${route.id}`).classList.add("activated");
    }
}