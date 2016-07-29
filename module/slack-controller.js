const slackController = function() {
	this.token = "";
	this.baseUrl = "https://slack.com/api/";
	this.endpoint = "";
	this.request = require("request");

	this.setAuthData = (token) => {
		this.token = token;
	};

	this.makeUri = () => {
		return this.baseUrl + this.endpoint + "?token=" + this.token + "&pretty=1";
	};

	this.getChannelsList = () => {
		return new Promise( (resolve, reject) => {
			this.endpoint = "channels.list";
			this.request(this.makeUri(), (err, res, body) => {
				if(err) reject(err);
				if(res.statusCode != 200) reject(res.statusCode);

				resolve(JSON.parse(body).channels);
			});
		});
	};

	this.getUsersList = () => {
		return new Promise( (resolve, reject) => {
			this.endpoint = "users.list";
			this.request(this.makeUri(), (err, res, body) => {
				if(err) reject(err);
				if(res.statusCode != 200) reject(res.statusCode);

				resolve(JSON.parse(body).members);
			});
		});
	};
};

module.exports = () => {return new slackController();};
