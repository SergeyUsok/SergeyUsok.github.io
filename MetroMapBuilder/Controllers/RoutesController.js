define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RoutesController {
        constructor(subwayMap, mapView) {
            this.subwayMap = subwayMap;
            this.mapView = mapView;
            this.lineIdCounter = 0;
            this.initialize(mapView.getCanvas());
        }
        removeRoute(route) {
            this.subwayMap.removeRoute(route);
            // if current/selected route was removed
            if (this.subwayMap.currentRoute == null)
                this.routeSelectionChanged(this.subwayMap.routes.length > 0 ? this.subwayMap.routes[0] : null);
            this.mapView.redrawMap(this.subwayMap);
        }
        routeSelectionChanged(newSelection) {
            if (this.subwayMap.currentRoute != null) {
                this.mapView.deselectRoute(this.subwayMap.currentRoute);
            }
            if (newSelection != null) {
                this.mapView.selectRoute(newSelection);
                this.highlightPanel(newSelection);
            }
            this.subwayMap.currentRoute = newSelection;
        }
        initialize(canvas) {
            document.getElementById("addRoute")
                .addEventListener("click", () => this.addRoute());
            document.getElementById("lineWidth")
                .addEventListener("change", e => {
                let factor = parseFloat(e.target.value);
                this.subwayMap.sizeSettings.lineWidthFactor = factor;
                this.mapView.redrawMap(this.subwayMap);
            });
            canvas.addEventListener("click", event => this.addConnection(event));
        }
        addRoute() {
            let id = this.lineIdCounter++;
            let route = this.subwayMap.newRoute(id);
            this.createControlPanel(route);
            this.routeSelectionChanged(route);
        }
        addConnection(event) {
            if (this.subwayMap.currentRoute == null) {
                // TODO show error about not selected route
                return;
            }
            if (event.target instanceof SVGSVGElement ||
                event.target instanceof SVGLineElement ||
                event.target instanceof SVGTextPositioningElement) {
                return; // nothing to do if canvas, any line (grid or route) or text label was clicked
            }
            let station = this.subwayMap.getStation(this.mapView.getId(event.target));
            let result = this.subwayMap.newConnection(this.subwayMap.currentRoute, station);
            if (result.ok) {
                this.mapView.redrawMap(this.subwayMap);
            }
            else {
                // TODO show error from result object
            }
        }
        createControlPanel(route) {
            let clone = document.getElementById("linePanel").cloneNode(true);
            clone.setAttribute("id", `panel-${route.id}`); // save uniqueness of template element
            clone.classList.remove("d-none"); // make element visible
            let removeButton = clone.querySelector("button");
            removeButton.addEventListener("click", e => {
                clone.remove();
                this.removeRoute(route);
                e.stopPropagation();
            });
            let colorsControl = clone.querySelector("input[type=text]");
            colorsControl.value = route.color;
            colorsControl.addEventListener("input", () => {
                let color = colorsControl.value;
                route.color = color;
                this.mapView.changeRouteColor(route.id, color);
            });
            clone.addEventListener("click", () => {
                if (this.subwayMap.currentRoute == route)
                    return;
                this.routeSelectionChanged(route);
            });
            document.getElementById("panels")
                .appendChild(clone);
            return clone;
        }
        highlightPanel(route) {
            let panels = document.getElementById("panels").children;
            for (let i = 0; i < panels.length; i++) {
                panels[i].classList.remove("activated");
            }
            document.getElementById(`panel-${route.id}`).classList.add("activated");
        }
    }
    exports.RoutesController = RoutesController;
});
//# sourceMappingURL=RoutesController.js.map