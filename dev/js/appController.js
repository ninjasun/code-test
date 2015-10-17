/**
 * Created by davide on 17/10/2015.
 */
var controller = function (app) {

    console.log("controller underscore is: ", _);
    function App(type, id) {
        var app = {
            id: id || _.uniqueId('app_'),
            type: type,
            date_creation: _.now()
        };
        return app;
    }

    function Server(id) {
        var _server = this;

        _server.id = id;
        _server.apps = [];
        _server.apps_limit = 2;
        _server.createApp = function (type, id) {
            var _self = this;
            if (_self.apps.legnht == _self.apps) {
                return {
                    status: 'KO',
                    message: 'server full'
                }
            }
            var app = new App(type, id);
            this.apps.push(app);
            console.log("APP created");
            return {
                status: 'OK',
                message: 'app created'
            };
        };
        _server.destroyApp = function (id) {
            var app_index = _.findIndex(this.apps, {id: id});
            return this.apps.splice(app_index, 1);
        };
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
            var randomID = _.uniqueId('server_');
            var server = new Server(randomID);
            _self.server_list.push(server);
            return randomID;
        };
        _self.destroyServer = function (id) {
            if (_.isUndefined(id)) {
                //must destroy last in the list

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
                body: {
                    server: {},
                    conf: {}
                }
            };
            _.each(_self.server_list, function (server) {
                if (server.apps.length === 0) {
                    //create an app in the server
                    server.createApp(type, id);
                    console.log("app created in server :", server);
                    status.status = 'OK';
                    status.body.server = server;
                    status.body.conf = server.apps[0];
                    return false;
                }

                else if (server.apps.lenght === 1) {
                    server.createApp(type, id);

                    status.status = 'OK';
                    status.body.server = server;
                    status.body.conf = server.apps[1];
                    return false;
                }
                else {
                    status.status = 'KO';
                    status.message = "ALL server are full";
                }
            });
            return status;
        };
        _self.removeApp = function (type, id) {
            //remove the newest app=type

            var app_list_of_type,
                app_newest;

            app_list_of_type = _.filter(_self.server_list, function (server) {
                return _.each(server.apps, function (app) {
                    return app.type == type;
                })
            });

            app_newest = _.min(app_list_of_type, function (item) {
                return item.date_creation;
            });
            console.log("young app is: ", app_newest);
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
        removeApp: function (type, id) {
            return cluster.removeApp(type, id);
        }
    };
};