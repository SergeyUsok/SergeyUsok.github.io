import { Metadata, RouteMetadata, StationMetadata } from "../Utils/Metadata";
import { Geometry } from "../Utils/Geometry";
import { MapDrawer } from "../Utils/MapDrawer";

export class RoutesController {
    private lineIdCounter: number = 0;

    public constructor(private metadata: Metadata, private drawer: MapDrawer) {
        this.initialize(drawer.getCanvas());
    }

    private removeRoute(toRemoveId: number): void {
        this.metadata.removeRoute(toRemoveId);

        if (this.metadata.currentRoute.id == toRemoveId)
            this.routeSelectionChanged(this.metadata.routes.length > 0 ? this.metadata.routes[0] : null);
    }

    private routeSelectionChanged(newSelection: RouteMetadata): void {
        if (this.metadata.currentRoute != null) {
            this.drawer.deselectRoute(this.metadata.currentRoute);
        }

        if (newSelection != null) {
            this.drawer.selectRoute(newSelection);
            this.highlightPanel(newSelection);
        }            

        this.metadata.currentRoute = newSelection;
    }    

    private initialize(canvas: SVGSVGElement) {
        document.getElementById("addRoute")
            .addEventListener("click", () => this.addRoute());

        document.getElementById("lineWidth")
            .addEventListener("change", e => {
                let factor = parseFloat((<HTMLInputElement>e.target).value);
                this.metadata.lineWidthFactor = factor;
                this.drawer.redrawMap(this.metadata);
            });

        canvas.addEventListener("click", event => this.addConnection(event));
    }

    private addRoute(): void {
        let id = this.lineIdCounter++;
        let route = this.metadata.newRoute(id);        
        this.createControlPanel(route);
        this.routeSelectionChanged(route);
    }

    private addConnection(event: MouseEvent): void {
        if (this.metadata.currentRoute == null) {
            // TODO show error about not selected route
            return;
        }

        if (!(event.target instanceof SVGCircleElement)) {
            return; // nothing to do
        }

        let station = this.metadata.getStation(this.drawer.getId(event.target));
        let result = this.metadata.newConnection(this.metadata.currentRoute, station);

        
        if (result.ok) {
            this.drawer.redrawMap(this.metadata);
        }
        else {
            // TODO show error from result object
        }     
    }

    private createControlPanel(route: RouteMetadata): HTMLDivElement {
        let clone = <HTMLDivElement>document.getElementById("linePanel").cloneNode(true);
        clone.setAttribute("id", `panel-${route.id}`); // save uniqueness of template element
        clone.classList.remove("d-none"); // make element visible
        
        let removeButton = clone.querySelector("button");
        removeButton.addEventListener("click", e => {            
            clone.remove();
            this.removeRoute(route.id);            
            this.drawer.redrawMap(this.metadata);
            e.stopPropagation();
        });

        let colorsControl = <HTMLInputElement>clone.querySelector("input[type=text]");
        colorsControl.value = route.color;
        colorsControl.addEventListener("input", () => {
            let color = colorsControl.value;
            route.color = color;
            this.drawer.changeRouteColor(route.id, color);
        });

        clone.addEventListener("click", () => {
            if (this.metadata.currentRoute == route)
                return;

            this.routeSelectionChanged(route);
        });

        document.getElementById("panels")
                .appendChild(clone);

        return clone;
    }

    private highlightPanel(route: RouteMetadata) {
        let panels = document.getElementById("panels").children;

        for (let i = 0; i < panels.length; i++) {
            panels[i].classList.remove("activated");
        }

        document.getElementById(`panel-${route.id}`).classList.add("activated");
    }
}