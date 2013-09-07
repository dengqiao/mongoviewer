var mongo = require('mongoskin');
exports.jsonConvert = function(json) {
	var convert = function(obj) {
		var keys = Object.keys(obj);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			var value = obj[key];
			var type = typeof(value);
			if (type === 'string') {
				var reg = /ObjectId\('(\w{24})'\)/.exec(value);
				if (reg !== null && reg.length === 2) {
					obj[key] = mongo.ObjectID.createFromHexString(reg[1]);
				}
			}
			if(type === 'object'){
				convert(value);
			}

		}
	};
	convert(json);
};