define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class BackgroundController {
        constructor(drawer) {
            let map = drawer.getCanvas();
            this.initialize(map);
        }
        initialize(map) {
            let backgroundUrl = '';
            let backgroundCheckbox = document.getElementById("background-switch");
            backgroundCheckbox.addEventListener("click", () => {
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
            });
            document.getElementById("url").addEventListener("input", e => {
                if (e.target.value != "") {
                    document.getElementById("load").removeAttribute("disabled");
                    document.getElementById("clear").removeAttribute("disabled");
                }
                else {
                    document.getElementById("load").setAttribute("disabled", "disabled");
                    document.getElementById("clear").setAttribute("disabled", "disabled");
                }
            });
            document.getElementById("load").addEventListener("click", () => {
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
            });
            document.getElementById("clear").addEventListener("click", () => {
                map.classList.remove("bgd");
                map.classList.add("bgd-color");
                map.style.backgroundImage = '';
                document.getElementById("url").value = '';
                backgroundUrl = '';
                document.getElementById("clear").setAttribute("disabled", "disabled");
                backgroundCheckbox.setAttribute("disabled", "disabled");
                backgroundCheckbox.checked = false;
            });
        }
    }
    exports.BackgroundController = BackgroundController;
});
//# sourceMappingURL=BackgroundController.js.map