define(["require", "exports", "./Controllers/GridController"], function (require, exports, GridController_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    $(document).ready(() => {
        let Phase;
        (function (Phase) {
            Phase[Phase["customizeGrid"] = 0] = "customizeGrid";
            Phase[Phase["stationsSetUp"] = 1] = "stationsSetUp";
            Phase[Phase["linesSetUp"] = 2] = "linesSetUp";
            Phase[Phase["drawing"] = 3] = "drawing";
        })(Phase || (Phase = {}));
        document.getElementById("next").onclick = next;
        let map = document.getElementById("map");
        let currentState = Phase.customizeGrid;
        var controller = new GridController_1.GridController(map);
        function next() {
            if (currentState == Phase.customizeGrid) {
                currentState = Phase.stationsSetUp;
                disable("grid-customization");
                enable("stations-setup");
            }
            else if (currentState == Phase.stationsSetUp) {
                currentState = Phase.linesSetUp;
                disable("stations-setup");
                enable("lines-setup");
            }
            else if (currentState == Phase.linesSetUp) {
                currentState = Phase.drawing;
                disable("lines-setup");
                enable("drawing");
            }
            controller.dispose();
            controller = controller.next();
        }
        function disable(elementId) {
            document.getElementById(elementId).classList.add("disabled");
            document.getElementById(elementId).classList.remove("activated");
        }
        function enable(elementId) {
            document.getElementById(elementId).classList.remove("disabled");
            document.getElementById(elementId).classList.add("activated");
        }
    });
});
//# sourceMappingURL=main.js.map