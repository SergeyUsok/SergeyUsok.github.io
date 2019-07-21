define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RoutesController {
        constructor(subwayMap, drawer) {
            this.subwayMap = subwayMap;
            this.drawer = drawer;
            this.lineIdCounter = 0;
            this.initialize(drawer.getCanvas());
        }
        removeRoute(route) {
            this.subwayMap.removeRoute(route);
            // if current/selected route was removed
            if (this.subwayMap.currentRoute == null)
                this.routeSelectionChanged(this.subwayMap.routes.length > 0 ? this.subwayMap.routes[0] : null);
            this.drawer.redrawMap(this.subwayMap);
        }
        routeSelectionChanged(newSelection) {
            if (this.subwayMap.currentRoute != null) {
                this.drawer.deselectRoute(this.subwayMap.currentRoute);
            }
            if (newSelection != null) {
                this.drawer.selectRoute(newSelection);
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
                this.drawer.redrawMap(this.subwayMap);
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
            if (!(event.target instanceof SVGCircleElement)) {
                return; // nothing to do
            }
            let station = this.subwayMap.getStation(this.drawer.getId(event.target));
            let result = this.subwayMap.newConnection(this.subwayMap.currentRoute, station);
            if (result.ok) {
                this.drawer.redrawMap(this.subwayMap);
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
                this.drawer.changeRouteColor(route.id, color);
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