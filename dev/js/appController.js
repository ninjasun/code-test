/**
 * Created by davide on 17/10/2015.
 */
var controller = function (app) {

    console.log("controller underscore is: ", _);
    function App(type, id) {
        var getShortName = function (type) {
            switch (type) {
                case  'hadoop':
                    return 'Hd';
                case  'rails':
                    return 'Rl';
                case  'chronos':
                    return 'Ch';
                case  'storm':
                    return 'St';
                case  'spark':
                    return 'Sk';
            }
        };

        var app = {
            id: id || _.uniqueId('app_'),
            type: type,
            short_name: getShortName(type),
            date_creation: _.now()

        };

        return app;
    }

    function Server(id) {
        var _server = this;

        _server.id = id;
        _server.apps = [];
        _server.apps_limit = 2;
        /*return the index of the app created or -1 */
        _server.createApp = function (type, id) {
            var _self = this;
            if (_server.apps.legnth - 1 == _server.apps_limit) {
                /* SERVER FULL*/
                console.log("ERROR SERVER IS FULL ");
                return -1;
            }
            var app = new App(type, id);
            _server.apps.push(app);
            console.log("APP created at index: ", _server.apps.length - 1);
            return _server.apps.length - 1;
        };
        /*return the app destroyed */
        _server.destroyApp = function (id) {
            var app_index = _.findIndex(this.apps, {id: id});
            return this.apps.splice(app_index, 1);
        };
        /* destroy all the apps in the server*/
        _server.destroyAllApps = function () {
            var apps = [];
            _.each(this.apps, function (item, index) {
                apps.push(item.splice(index, 1));
            });
            return apps;
        }
    }


    function Cluster() {

        var _self = this;
        _self.server_list = [];
        _self.cluster_max_size = 16; //max number of server

        _self.getClusterMaxSize = function () {
            return _self.cluster_max_size;
        };
        _self.getServerList = function () {
            return this.server_list;
        };
        _self.init = function (n) {
            //add 4 server to cluster
            _self.addServer();
            n = n - 1;
            while (n--) {
                _self.addServer();
            }
            return _self.server_list;
        };
        _self.addServer = function () {
            //add one server
            if (_self.getServerList().length - 1 < _self.getClusterMaxSize() - 1) {
                var randomID = _.uniqueId('server_');
                var server = new Server(randomID);

                _self.server_list.push(server);
                return {
                    status: 'OK,',
                    value: randomID
                };
            }
            else {
                return {
                    status: 'KO',
                    value: "CLUSTER IS FULL"
                };
            }
        };
        _self.destroyServer = function (id) {
            if (_.isUndefined(id)) {

                var removed = _self.server_list.splice(_self.server_list.length - 1, 1);
                console.log("server removed is: ", removed);
                return removed[0];
            }
            var server;
            //find server by id
            server = _.findWhere(_self.server_list, {id: id});
            if (server) {
                console.log("finded server with id: ", id);
                var apps = server.destroyAllApps();

                _.each(apps, function (item) {
                    this.addApp(item.type, item.id);
                });
                var server_index = _.findIndex(_self.server_list, {id: id});

                return _self.server_list.splice(server_index, 1)[0];
            }
        };
        _self.addApp = function (type, id) {
            var status = {
                status: "",
                message: "",
                body: {}
            };
            var findServerFree = function () {
                var server_free_index;

                server_free_index = _.findIndex(_self.server_list, function (server) {
                    console.log("check server slot: ", server);
                    return server.apps.length === 0;
                });
                if (server_free_index != -1) {
                    console.log("FOUND SLOT FREE in SERVER at index: ", server_free_index);
                    return server_free_index;
                }
                else {
                    server_free_index = _.findIndex(_self.server_list, function (server) {
                        console.log("check server slot: ", server);
                        return server.apps.length === 1;
                    });
                    if (server_free_index != -1) {
                        console.log("FOUND SLOT FREE in SERVER at index: ", server_free_index);
                        return server_free_index;
                    }
                    else {
                        return -1; //no slot n any server is free;
                    }
                }
            };
            var index_server_free = findServerFree();

            if (index_server_free != -1) {

                var server_free = _self.server_list[index_server_free];

                var app_index = server_free.createApp(type, id);
                console.log("app created at indezx: ", app_index);
                if (app_index != -1) {
                    status.status = 'OK';
                    status.body.server = server_free;
                    status.body.app = server_free.apps[app_index];
                    status.body.app_index = app_index;
                }
                else {
                    status.status = 'KO';
                    status.message = "ALL SERVER FULL!";
                }
                return status;
            }

        };
        _self.removeApp = function (type, id) {
            /*return index of the server and index of the app  */
            var findNewestApp = function (server_list, type) {
                var status = {
                    status: '',
                    body: {
                        server_index: -1,
                        app_index: -1
                    }
                };
                status.body.min_time_creation = _.now();

                _.each(server_list, function (server, index_of_server) {
                    _.each(server.apps, function (app, index_of_app) {
                        if (app.type === type && app.date_creation < status.body.min_time_creation) {

                            status.body.server_index = index_of_server;
                            status.body.app_index = index_of_app;
                            status.body.min_time_creation = app.date_creation;


                        }
                    })
                });
               // console.log("FIND NEWEST APP: ", status);
                return status;
            };

            var status;
            //remove the newest app=type

            status = findNewestApp(_self.getServerList(), type);

            var server = _self.getServerList()[status.body.server_index];
            var app_removed =server.apps.splice(status.body.app_index,1);
            if (app_removed){
                status.status = 'OK';
                status.body.server =server;
                status.body.app =app_removed[0];
            }
            else{
                status.status = 'KO';
                status.message ='ERROR DELETING APP';
                status.body = {};
            }
            //console.log("young app is: ", status.body.app);
            return status;

        };
        return _self;
    }


    var cluster;

    return {
        init: function (n) {
            cluster = new Cluster();
            cluster.init(n);

            return cluster;
        },
        getCluster: function () {
            return this.getServerList();
        },
        getClusterLength: function () {
            return this.server_list.length;
        },
        addServer: function () {
            return cluster.addServer();
        },
        destroyServer: function (id) {
            // var id = id || cluster.getServerList().length - 1; //remove or id or last
            return cluster.destroyServer(id);

        },
        addApp: function (type, id) {
            return cluster.addApp(type, id);
        },
        destroyApp: function (type, id) {
            return cluster.removeApp(type, id);
        }
    };
};