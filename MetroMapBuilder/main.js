requirejs(['startup'], function (app) {
    console.log('starting application...');

    let startup = new app.Startup();
    startup.run();
});