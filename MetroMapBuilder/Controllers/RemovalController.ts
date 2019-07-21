import { StationMetadata, RouteMetadata, Metadata } from "../Utils/Metadata";
import { MapDrawer } from "../Utils/MapDrawer";

export class RemovalController {
    public constructor(private metadata: Metadata, private drawer: MapDrawer) {
        this.initialize(drawer.getCanvas());
    }

    private initialize(canvas: SVGSVGElement) {
        document.addEventListener("click", () => this.hideMenu(), false);
        canvas.addEventListener("contextmenu", event => this.showMenu(event), false);
    }

    private hideMenu(): void {
        let menu = document.getElementById("stationMenu");

        if (menu != null) {
            menu.remove();
        }
    }

    private showMenu(event: MouseEvent): boolean {
        this.hideMenu();

        if (!(event.target instanceof SVGCircleElement)) { // context menu should appear only at circle click
            return;
        }

        event.preventDefault();

        let menu = this.buildMenu(event.target);
        menu.style.display = "block";
        menu.style.top = `${event.pageY}px`;
        menu.style.left = `${event.pageX}px`;
        document.body.appendChild(menu);

        return false;
    }

    private getStation(element: Element) {
        let id = this.drawer.getId(element);
        return this.metadata.getStation(id);
    }

    private buildMenu(target: Element): HTMLElement {
        let station = this.getStation(target);
        let route = this.metadata.currentRoute;

        let hasConnections = route != null && route.passesThrough(station);
        let disabled = hasConnections ? "" : " disabled";
        let color = hasConnections ? ` style='color: ${route.color}'` : "";

        let menuTemplate = `<div class='dropdown-menu show' id='stationMenu'>` +
            `<button class='dropdown-item' type='button'>Remove station</button>` +
            `<div class='dropdown-divider'></div>` +
            `<button class='dropdown-item${disabled}' type='button'${color}>Remove from current route</button>` +
            "</ul>";

        let temp = document.createElement('div');
        temp.innerHTML = menuTemplate;
        let menu = temp.firstElementChild;

        return this.addEventHandlers(menu, station, route);
    }

    private addEventHandlers(menu: Element, targetStation: StationMetadata, route: RouteMetadata): HTMLElement {

        // remove station menu item
        menu.children[0].addEventListener("click", () => {
            this.metadata.removeStation(targetStation);
            this.drawer.redrawMap(this.metadata);
        });

        // menu.children[1] -- is divider line

        // remove connection - item
        menu.children[2].addEventListener("click", () => {
            if (route != null) {
                this.metadata.removeConnection(route, targetStation);
                this.drawer.redrawMap(this.metadata);
            }
        });

        return <HTMLElement>menu;
    }
}