$(function () {

    var myApp = {};

    myApp.controller = controller(myApp);

    var cluster = myApp.controller.init(4);

    myApp.view = view(myApp, cluster);
});