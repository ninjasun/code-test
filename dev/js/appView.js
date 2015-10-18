/**
 * Created by davide on 17/10/2015.
 */

'use strict';

var view = function (app, cluster) {
    var view = this;
    /*events listener */

    var init = function () {
        var _self = this;

        _.each(cluster.getServerList(), function (item) {
            displayServer(item.id);
        });

        //ADD SERVER
        $('.js-add-server').on('click', function (e) {

            var status = app.controller.addServer();
            if (status.status === 'KO'){
                alert(status.value);
                return
            }
            else{
                displayServer(status.value);
            }
        });

        // DESTROY SERVER
        $('.js-destroy-server').on('click', function (e) {

            var server_destroyed = app.controller.destroyServer();
            console.log("server destrutto is: ", server_destroyed);

            destroyServer(server_destroyed.id);
        });

        //ADD APP
        $('.js-add-app').on('click', function (e) {
            var app_type = $(this).parent().siblings().text().toLowerCase();

            var status = app.controller.addApp(app_type);
            console.log("-JS ADD APP, ", status);
            if (status.status == 'OK') {
                displayApp(status.body);
            }
            else {
                alert('all server are full');
            }
        });
        //DESTROY APP
        $('.js-destroy-app').on('click', function (e) {
             console.log("-JS DESTROY APP, ", e, this);
            var app_type = $(this).parent().siblings().text().toLowerCase();
            var status = app.controller.destroyApp(app_type);
            if (status.status == 'OK') {
                console.log("status OK: ",status);
                destroyApp(status.body);

            }
            else {
                alert('ERROR: removing app');
            }
        });
    };//CLOSE INIT


    /* DESTROY APP */
    var destroyApp = function(option){
        var id_app = option.app.id;
        var id_server = option.server.id;
        var serverContainer = $('#' + id_server);
        var app_target = $('#' + id_app);


        app_target.hide('slow', function () {
            app_target.remove();
            serverContainer.children('div').removeClass('app_half_box');
        });

    };
    var displayApp = function (option) {
        var serverContainer = $('#' + option.server.id);
        var double_app = "";
        if (option.app_index === 1){
            double_app = 'app_half_box';
           serverContainer.children('div').addClass('app_half_box');
        }
        var app_item = '<div class="app_box_' + option.app.type + ' ' +double_app+'" id="'+option.app.id +'" ><span class="short_title">' + option.app.short_name + '</span><span class="title">' + option.app.type + '</span></div>';

        serverContainer.append(app_item);
    };
    /*CREATE A ITEM SERVER IN THE VIEW WITH ID=id*/
    var displayServer = function (id) {

        var serversContainer = $('.main_container');
        var server_item = '<div class="server_item" id="' + id + '"></div>';
        //console.log("appending item: ",server_item);
        serversContainer.append(server_item);
        $('#id').show('slow');
    };
    /*DESTROU A ITEM SERVER IN THE VIEW WITH ID=id*/
    var destroyServer = function (id) {
        var server_target = $('#' + id);

        server_target.hide('slow', function () {
            server_target.remove();
        })
    };
    init();

    return view;
};