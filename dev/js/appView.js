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
            // console.log("-JS DESTROY APP, ", e, this);
            var app = $(this).parent().siblings().text().toLowerCase();
        });

    };
    var displayApp = function (option) {
        //var option = option || {};

        console.log("display app: ", option);

        var serverContainer = $('#' + option.server.id);
        var double_app = "";
        if (option.app_index === 1){
            double_app = 'app_half_box';
           serverContainer.children('div').addClass('app_half_box');
        }
        var app_item = '<div class="app_box_' + option.app.type + ' ' +double_app+'" ><span class="short_title">' + option.app.short_name + '</span><span class="title">' + option.app.type + '</span></div>';

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
        console.log("removing item: ", id);

        var server_target = $('#' + id);
        console.log("target is: ", server_target);
        server_target.hide('slow', function () {
            server_target.remove();
        })
    };

    init();

    return view;
};