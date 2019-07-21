define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RoutesController {
        constructor(metadata, drawer) {
            this.metadata = metadata;
            this.drawer = drawer;
            this.lineIdCounter = 0;
            this.initialize(drawer.getCanvas());
        }
        removeRoute(toRemoveId) {
            this.metadata.removeRoute(toRemoveId);
            if (this.metadata.currentRoute.id == toRemoveId)
                this.routeSelectionChanged(this.metadata.routes.length > 0 ? this.metadata.routes[0] : null);
        }
        routeSelectionChanged(newSelection) {
            if (this.metadata.currentRoute != null) {
                this.drawer.deselectRoute(this.metadata.currentRoute);
            }
            if (newSelection != null) {
                this.drawer.selectRoute(newSelection);
                this.highlightPanel(newSelection);
            }
            this.metadata.currentRoute = newSelection;
        }
        initialize(canvas) {
            document.getElementById("addRoute")
                .addEventListener("click", () => this.addRoute());
            document.getElementById("lineWidth")
                .addEventListener("change", e => {
                let factor = parseFloat(e.target.value);
                this.metadata.lineWidthFactor = factor;
                this.drawer.redrawMap(this.metadata);
            });
            canvas.addEventListener("click", event => this.addConnection(event));
        }
        addRoute() {
            let id = this.lineIdCounter++;
            let route = this.metadata.newRoute(id);
            this.createControlPanel(route);
            this.routeSelectionChanged(route);
        }
        addConnection(event) {
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
        createControlPanel(route) {
            let clone = document.getElementById("linePanel").cloneNode(true);
            clone.setAttribute("id", `panel-${route.id}`); // save uniqueness of template element
            clone.classList.remove("d-none"); // make element visible
            let removeButton = clone.querySelector("button");
            removeButton.addEventListener("click", e => {
                clone.remove();
                this.removeRoute(route.id);
                this.drawer.redrawMap(this.metadata);
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
                if (this.metadata.currentRoute == route)
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