var jf = require('jsonfile');
var util = require('util');
var file = __dirname + "/../config.json";
var hosts = jf.readFileSync(file);

module.exports = function(app) {
	
	app.get("/hosts", function(req, res) {
		res.render('host', {
			hosts: hosts,
            host : null
		});
	});

	app.post("/hosts/add", function(req, res, next) {
		var host = {};
		try {
			host.host = req.body.host;
			host.name = req.body.name;
		} catch (err) {
			return next(err);
		}
		hosts.push(host);
		jf.writeFileSync(file,hosts);
		res.json({
			hosts: hosts
		});
	});

	app.post("/hosts/delete", function(req, res, next) {
		var index = -1;
		for(var i=0;i<hosts.length;i++){
			if(hosts[i].name==req.body.name){
                index = i;
                break;
			}
		}
		if(index>=0){
			hosts.splice(index,1);
		}
		jf.writeFileSync(file,hosts);
		res.json({
			hosts: hosts
		});
	});
};
module.exports.hosts = hosts;