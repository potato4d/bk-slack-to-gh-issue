const githubController = function(params) {
	this.request = require("request");
	this.auth = {};
	this.options = {
		url: "https://api.github.com/repos/" + params + "/issues",
		method: "POST",
		json: true,
		headers: {
			"Content-Type":"application/json",
			"User-Agent": "BK-Slack-to-Issues"
		},
	};

	this.show = () => {
		console.log(this.options);
	};

	this.setAuthData = (data) => {
		this.auth = data;
	};

	this.createIssue = (title, description) => {
		return new Promise( (resolve, reject) => {
			this.options.auth = this.auth;
			this.options.form = JSON.stringify({
				title: title,
				body: description
			});

			this.request(this.options, (err, res)=>{
				if(err) reject(err);
				if(res.statusCode != 200) reject(res.statusCode);
				return resolve(res);
			});
		});
	};
};

module.exports = params => {return new githubController(params);};
