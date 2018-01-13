const githubController = function() {
	this.request = require("request");
	this.auth = {};
	this.options = {
		method: "POST",
		json: true,
		headers: {
			"Content-Type":"application/json",
			"User-Agent": "sitsuji"
		},
	};

	this.show = () => {
		console.log(this.options);
	};

	this.setAuthData = (data) => {
		this.auth = data;
	};

	this.createIssue = (title, description, repository) => {
		this.options["url"] = "https://api.github.com/repos/" + repository + "/issues";

		return new Promise( (resolve, reject) => {
			this.options.auth = this.auth;
			this.options.form = JSON.stringify({
				title: title,
				body: description
			});

			this.request(this.options, (err, res)=>{
				if(err) reject(err);
				if([200, 201].indexOf(res.statusCode) == -1) reject(res.statusCode);
				return resolve(res);
			});
		});
	};
};

module.exports = new githubController();
