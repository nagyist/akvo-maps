const util = require('util')
var assert = require('assert');
var step = require('step');
var windshaft = require('windshaft/lib/windshaft');
var PSQL = require('windshaft/node_modules/cartodb-psql'); // dependency of windshaft
var _ = require('underscore');

var MapConfig = windshaft.model.MapConfig;
var DummyMapConfigProvider = require('windshaft/lib/windshaft/models/providers/dummy_mapconfig_provider');

var MapStoreMapConfigProvider = windshaft.model.provider.MapStoreMapConfig;

/**
 * @param app
 * @param {MapStore} mapStore
 * @param {MapBackend} mapBackend
 * @param {TileBackend} tileBackend
 * @param {AttributesBackend} attributesBackend
 * @constructor
 */
function MapController(app, mapStore, mapBackend, tileBackend, attributesBackend) {
    this._app = app;
    this.mapStore = mapStore;
    this.mapBackend = mapBackend;
    this.tileBackend = tileBackend;
    this.attributesBackend = attributesBackend;
}

module.exports = MapController;


MapController.prototype.register = function(app) {
    app.get(app.base_url_mapconfig + '/:token/:z/:x/:y@:scale_factor?x.:format', this.tile.bind(this));
    app.get(app.base_url_mapconfig + '/:token/:z/:x/:y.:format', this.tile.bind(this));
    app.get(app.base_url_mapconfig + '/:token/:layer/:z/:x/:y.(:format)', this.layer.bind(this));
    app.options(app.base_url_mapconfig, this.cors.bind(this));
    app.get(app.base_url_mapconfig, this.createGet.bind(this));
    app.post(app.base_url_mapconfig, this.createPost.bind(this));
    app.get(app.base_url_mapconfig + '/:token/:layer/attributes/:fid', this.attributes.bind(this));
};

// send CORS headers when client send options.
MapController.prototype.cors = function(req, res, next) {
    this._app.doCORS(res, "Content-Type");
    return next();
};

// Gets attributes for a given layer feature
MapController.prototype.attributes = function(req, res) {
    var self = this;

    this._app.doCORS(res);

    step(
        function setupParams() {
            self._app.req2params(req, this);
        },
        function retrieveFeatureAttributes(err) {
            assert.ifError(err);
            var mapConfigProvider = new MapStoreMapConfigProvider(self.mapStore, req.params);
            self.attributesBackend.getFeatureAttributes(mapConfigProvider, req.params, false, this);
        },
        function finish(err, tile) {
            if (err) {
                // See https://github.com/Vizzuality/Windshaft-cartodb/issues/68
                var errMsg = err.message ? ( '' + err.message ) : ( '' + err );
                self._app.sendError(res, { errors: [errMsg] }, self._app.findStatusCode(err), 'ATTRIBUTES', err);
            } else {
                res.set('Cache-Control', 'max-age=31536000');
                res.send(tile, 200);
            }
        }
    );

};

MapController.prototype.addLastModifiedTimestamp = function(req, response, cb) {
  var self = this;

  var known_tables = [];
  var client;

  step (
        function extractKnownTablesFromMetadata() {
          for (var i=0; i<response.metadata.layers.length; ++i) {
            var lyr = response.metadata.layers[i];
            var stats = lyr.meta.stats;
            for (var j=0; j<stats.length; ++j) {
              var s = stats[j];
              //console.log("XXXX layer " + i + " stat " + j + " is " + util.inspect(s, false, null));
              if ( s.type != 'table' ) continue;
              known_tables[s.name] = 1;
            }
          }

          known_tables = _.keys(known_tables);
          console.log("XXXX known_tables: ", known_tables);
          if ( known_tables.length == 0 ) {
            cb(null, response); // nothing more to do here
            return;
          }
          return known_tables;
        },
        function getPGClient(err) {
            assert.ifError(err);
            var dbParams = {
              user: req.params.dbuser,
              pass: req.params.dbpassword,
              host: req.params.dbhost,
              port: req.params.dbport,
              dbname: req.params.dbname
            }

            //console.log("XXX dbParams: ", util.inspect(dbParams));

            return new PSQL(dbParams);
        },
        function queryLastModified(err, c) {
            assert.ifError(err);

            client = c;
            var sql = "";
            for (var i=0; i<known_tables.length; ++i) {
              var table = known_tables[i];
              if ( sql != "" ) sql += " UNION ALL "
              sql += "SELECT max(last_updated) FROM " + table;
            }
            sql = "SELECT max(max) FROM ( " + sql + " ) foo";
            client.query(sql, this);
        },
        function readSqlResult(err, result) {
            assert.ifError(err);

            var lastUpdate = result.rows[0].max;
            lastUpdate = new Date(lastUpdate).getTime();
            response.layergroupid = response.layergroupid + ":" + lastUpdate;
            return response;
        },
        function finish(err) {
            if ( err ) console.log("XXX LastModified fetch error: " + err)
            cb(null, response);
        }
  )
}

MapController.prototype.create = function(req, res, prepareConfigFn) {
    var self = this;

    this._app.doCORS(res);

    res.header('X-USER', req.headers['X-USER']);

    step(
        function setupParams(){
            self._app.req2params(req, this);
        },
        prepareConfigFn,
        function initLayergroup(err, requestMapConfig) {
            assert.ifError(err);
            var mapConfig = MapConfig.create(requestMapConfig);
            self.mapBackend.createLayergroup(
                mapConfig, req.params, new DummyMapConfigProvider(mapConfig, req.params), this
            );
        },
        function addLastModifiedTimestamp(err, response) {
            assert.ifError(err);
            //console.log("XXXX(pre) response is: ", util.inspect(response, false, null));
            return self.addLastModifiedTimestamp(req, response, this);
        },
        function finish(err, response){
            //console.log("XXXX(post) response is: ", util.inspect(response, false, null));
            if (err) {
                self._app.sendError(res, { errors: [ err.message ] }, self._app.findStatusCode(err), 'LAYERGROUP', err);
            } else {
                res.status(200).send(response);
            }
        }
    );
};

MapController.prototype.createGet = function(req, res){
    this.create(req, res, function createGet$prepareConfig(err, req) {
        assert.ifError(err);
        if ( ! req.params.config ) {
            throw new Error('layergroup GET needs a "config" parameter');
        }
        return JSON.parse(req.params.config);
    });
};

// TODO rewrite this so it is possible to share code with `MapController::create` method
MapController.prototype.createPost = function(req, res) {
    this.create(req, res, function createPost$prepareConfig(err, req) {
        assert.ifError(err);
        if ( ! req.headers['content-type'] || req.headers['content-type'].split(';')[0] !== 'application/json' ) {
            throw new Error('layergroup POST data must be of type application/json');
        }
        return req.body;
    });
};

// Gets a tile for a given token and set of tile ZXY coords. (OSM style)
MapController.prototype.tile = function(req, res) {
    this.tileOrLayer(req, res);
};

// Gets a tile for a given token, layer set of tile ZXY coords. (OSM style)
MapController.prototype.layer = function(req, res, next) {
    if (req.params.token === 'static') {
        return next();
    }
    this.tileOrLayer(req, res);
};

MapController.prototype.tileOrLayer = function (req, res) {
    var self = this;

    this._app.doCORS(res);
    step(
        function mapController$prepareParams() {
            self._app.req2params(req, this);
        },
        function mapController$getTile(err) {
            if ( err ) {
                throw err;
            }
            self.tileBackend.getTile(new MapStoreMapConfigProvider(self.mapStore, req.params), req.params, this);
        },
        function mapController$finalize(err, tile, headers) {
            self.finalizeGetTileOrGrid(err, req, res, tile, headers);
            return null;
        },
        function finish(err) {
            if ( err ) {
                console.error("windshaft.tiles: " + err);
            }
        }
    );
};

// This function is meant for being called as the very last
// step by all endpoints serving tiles or grids
MapController.prototype.finalizeGetTileOrGrid = function(err, req, res, tile, headers) {
    if (err){
        // See https://github.com/Vizzuality/Windshaft-cartodb/issues/68
        var errMsg = err.message ? ( '' + err.message ) : ( '' + err );

        // Rewrite mapnik parsing errors to start with layer number
        var matches = errMsg.match("(.*) in style 'layer([0-9]+)'");
        if (matches) {
            errMsg = 'style'+matches[2]+': ' + matches[1];
        }

        this._app.sendError(res, { errors: ['' + errMsg] }, this._app.findStatusCode(err), 'TILE', err);
    } else {
        res.set('Cache-Control', 'max-age=31536000');
        res.status(200);
        if (headers) res.set(headers);

        if (!Buffer.isBuffer(tile) && typeof tile === 'object') {
            if (req.query && req.query.callback) {
                res.jsonp(tile);
            } else {
                res.json(tile);
            }
        } else {
            res.send(tile);
        }

    }
};
