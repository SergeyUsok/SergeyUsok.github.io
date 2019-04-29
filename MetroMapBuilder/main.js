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
        let map = document.getElementById("map");
        let currentState = Phase.customizeGrid;
        var controller = new GridController_1.GridController(map);
        document.getElementById("next").onclick = next;
        function next() {
            if (currentState == Phase.customizeGrid) {
                currentState = Phase.stationsSetUp;
                document.getElementById("grid-customization").classList.add("disabled");
                document.getElementById("stations-setup").classList.add("active");
                document.getElementById("stations-setup").classList.remove("disabled");
            }
            else if (currentState == Phase.stationsSetUp) {
                currentState = Phase.linesSetUp;
            }
            else if (currentState == Phase.linesSetUp) {
                currentState = Phase.drawing;
            }
            controller.dispose();
            controller = controller.next();
        }
    });
});
//# sourceMappingURL=main.js.map