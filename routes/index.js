/*
 * GET home page.
 */
var mongo = require("mongoskin");
var utils = require("./utils");

var config = require("./host").hosts;

mongo.ObjectID.prototype.toString = function() {
	return "ObjectId('" + this.toHexString() + "')";
};
mongo.ObjectID.prototype.inpect = mongo.ObjectID.prototype.toString;
mongo.ObjectID.prototype.toJSON = mongo.ObjectID.prototype.inpect;
module.exports = function(app) {
	var dbs = {};
	var getDB = function(host, dbName) {
		if (!dbs[host + dbName]) {
			var host0 = null;
			for (var i = 0; i < config.length; i++) {
				if (config[i].name === host) {
					host0 = config[i].host;
					break;
				}
			}
			dbs[host + dbName] = mongo.db(host0, {
				database: dbName,
				safe: true,
				retryMiliSeconds: 1000,
				numberOfRetries: 3
			});
		}
		return dbs[host + dbName];
	};
	//获取主机列表
	app.get("/", function(req, res, next) {
		if (config.length > 0) {
			res.render('index', {
				hosts: config,
				host: config[0].name
			});
		}else{
			res.redirect('/host');
		}

	});


	app.get("/dbs", function(req, res, next) {
		var host = req.query.host || config[0].name;
		var db = getDB(host, "admin");
		db.admin.listDatabases(function(err, databases) {
			if (err) {
				return next(err);
			}
			var result = {
				host: host,
				dbs: databases
			};
			res.json(result);
		});
	});

	app.get("/:host", function(req, res, next) {
		res.render('index', {
			hosts: config,
			host: req.params.host
		});
	});

	app.get("/:host/stats", function(req, res, next) {
		var db = getDB(req.params.host, "admin");
		db.admin.serverStatus(function(err, info) {
			if (err) {
				return next(err);
			}
			res.json({
				status: info
			});
		});
	});
	//获取数据库信息及表结构
	app.get("/:host/:database", function(req, res, next) {
		var db = getDB(req.params.host, req.params.database);
		db.collectionNames({
			namesOnly: true
		}, function(err, collectionNames) {
			if (err) {
				return next(err);
			}
			db.stats(function(err, stats) {
				if (err) {
					return next(err);
				}
				var colls = [];
				for (var i = 0; i < collectionNames.length; i++) {
					colls.push(collectionNames[i].substr(collectionNames[i].indexOf('.') + 1));
				}
				res.json({
					collectionNames: colls,
					status: stats
				});
			});

		});
	});

	app.get("/:host/:database/:collection", function(req, res, next) {
		var db = getDB(req.params.host, req.params.database);
		var q = {};
		if (req.query.q) {
			try {
				q = JSON.parse(req.query.q);
				utils.jsonConvert(q);
			} catch (err) {
				return res.json({err_msg:err.toString()});
			}
		}
		var offset = parseInt(req.query.offset || 0, 10);
		var limit = parseInt(req.query.limit || 10, 10);
		db.collection(req.params.collection).count(q, function(err, count) {
			if (err) {
				return next(err);
			}
			db.collection(req.params.collection).find(q).skip(offset).sort({
				_id: -1
			}).limit(limit).toArray(function(err, list) {
				if (err) {
					return next(err);
				}
				res.json({
					offset: offset,
					limit: limit,
					count: count,
					list: list
				});
			});
		});
	});

	app.post("/:host/:database/:collection/remove", function(req, res, next) {
		var db = getDB(req.params.host, req.params.database);
		var q = {};
		if (req.body.q) {
			try {
				q = JSON.parse(req.body.q);
				utils.jsonConvert(q);
			} catch (err) {
				return next(err);
			}
		}
		db.collection(req.params.collection).remove(q, {
			strict: true
		}, function(err, count) {
			if (err) {
				return next(err);
			}
			res.json({
				count: count
			});
		});
	});

	app.post("/:host/:database/:collection/insert", function(req, res, next) {
		var db = getDB(req.params.host, req.params.database);
		var data = {};
		if (req.body.data) {
			try {
				data = JSON.parse(req.body.data);
				utils.jsonConvert(data);
			} catch (err) {
				return next(err);
			}
		}
		db.collection(req.params.collection).insert(data, {
			strict: true
		}, function(err, count) {
			if (err) {
				return next(err);
			}
			res.json({
				count: count
			});
		});
	});


};