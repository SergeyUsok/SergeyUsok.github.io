define(["require", "exports", "./Controllers/GridController", "./Utils/Metadata", "./Controllers/BackgroundController", "./Controllers/RoutesController", "./Controllers/StationsController", "./Utils/MapDrawer", "./Utils/Geometry", "./Controllers/RemovalController"], function (require, exports, GridController_1, Metadata_1, BackgroundController_1, RoutesController_1, StationsController_1, MapDrawer_1, Geometry_1, RemovalController_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    if (document.readyState === 'complete') {
        initApp();
    }
    else {
        document.addEventListener("DOMContentLoaded", initApp);
    }
    function initApp() {
        let gridConfig = getGridSettings();
        let metadata = new Metadata_1.Metadata(gridConfig);
        let map = createMapCanvas(metadata.gridConfig.canvasSize);
        let drawer = new MapDrawer_1.MapDrawer(map);
        Geometry_1.Geometry.init(gridConfig);
        let gridController = new GridController_1.GridController(metadata, drawer); // ok
        let backgroundController = new BackgroundController_1.BackgroundController(drawer); // ok
        let routesController = new RoutesController_1.RoutesController(metadata, drawer); // ok
        let stationsController = new StationsController_1.StationsController(metadata, drawer);
        let contextMenuController = new RemovalController_1.RemovalController(metadata, drawer);
        // add ControlPanelController
        function getGridSettings() {
            let gridSize = 80;
            let canvasSize = 1000;
            return new Metadata_1.GridSettings(gridSize, canvasSize);
        }
        function createMapCanvas(size) {
            let parent = document.getElementById("canvas");
            let map = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            map.setAttribute("width", size);
            map.setAttribute("height", size);
            map.setAttribute("class", "bgd-color");
            map.setAttribute("id", "map");
            parent.appendChild(map);
            return map;
        }
    }
});
//# sourceMappingURL=main.js.map