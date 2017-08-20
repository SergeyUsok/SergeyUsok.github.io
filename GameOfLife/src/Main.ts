$(document).ready(() => {

    //let view = new MVP.View();
    //let game = new MVP.GamePresenter(view);

    let view = new MVC.View();
    let game = new MVC.GameController();
    view.showNotStartedGame();
});