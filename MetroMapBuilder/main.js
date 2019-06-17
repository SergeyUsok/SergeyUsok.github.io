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
        document.getElementById("url").addEventListener("input", urlTextChaged);
        document.getElementById("load").addEventListener("click", loadBackground);
        document.getElementById("clear").addEventListener("click", clearBackground);
        let backgroundCheckbox = document.getElementById("background-switch");
        backgroundCheckbox.addEventListener("click", switchBackground);
        let backgroundUrl = '';
        let map = document.getElementById("map");
        let currentState = Phase.customizeGrid;
        let controller = new GridController_1.GridController(map);
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
        ;
        function enable(elementId) {
            document.getElementById(elementId).classList.remove("disabled");
            document.getElementById(elementId).classList.add("activated");
        }
        ;
        function switchBackground() {
            if (backgroundCheckbox.checked) {
                map.classList.remove("bgd-color");
                map.classList.add("bgd");
                map.style.backgroundImage = backgroundUrl;
            }
            else {
                map.classList.remove("bgd");
                map.classList.add("bgd-color");
                map.style.backgroundImage = '';
            }
        }
        ;
        function loadBackground() {
            let url = document.getElementById("url").value;
            let map = document.getElementById("map");
            map.classList.add("bgd");
            map.classList.remove("bgd-color");
            backgroundUrl = `url(${url})`;
            map.style.backgroundImage = backgroundUrl;
            document.getElementById("load").setAttribute("disabled", "disabled");
            document.getElementById("clear").removeAttribute("disabled");
            backgroundCheckbox.removeAttribute("disabled");
            backgroundCheckbox.checked = true;
        }
        ;
        function clearBackground() {
            let map = document.getElementById("map");
            map.classList.remove("bgd");
            map.classList.add("bgd-color");
            map.style.backgroundImage = '';
            document.getElementById("url").value = '';
            backgroundUrl = '';
            document.getElementById("clear").setAttribute("disabled", "disabled");
            backgroundCheckbox.setAttribute("disabled", "disabled");
            backgroundCheckbox.checked = false;
        }
        ;
        function urlTextChaged(e) {
            if (e.target.value != "") {
                document.getElementById("load").removeAttribute("disabled");
                document.getElementById("clear").removeAttribute("disabled");
            }
            else {
                document.getElementById("load").setAttribute("disabled", "disabled");
                document.getElementById("clear").setAttribute("disabled", "disabled");
            }
        }
        ;
    });
});
//# sourceMappingURL=main.js.map