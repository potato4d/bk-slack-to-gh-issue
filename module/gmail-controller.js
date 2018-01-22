const gmailController = function(){
	var express          = require( "express" )
    , app              = express()
    , server           = require( "http" ).createServer( app ); 
	server.listen( 3000 );
	app.set("views", __dirname + "/views");
	app.set("view engine", "ejs");
  
	var bodyParser = require("body-parser");
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());

	var fs = require("fs");
	var readline = require("readline");
	var google = require("googleapis");
	var googleAuth = require("google-auth-library");

  // If modifying these scopes, delete your previously saved credentials
  // at ~/.credentials/gmail-nodejs-quickstart.json
	var SCOPES = ["https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/gmail.send"];
    
	var oauth2Client;

	var sendingObjectDict = {};

	this.getAuthURL = (user, sendingObject, callback) =>{
		var url = "";

    // Load client secrets from a local file.
		fs.readFile("./data/client_secret.json", function processClientSecrets(err, content) {
			if (err) {
				text = "Error loading client secret file: " + err;
			}
        // Authorize a client with the loaded credentials, then call the
        // Gmail API.
			console.log("getAuthURL.user " + user);
			url = authorize(JSON.parse(content), user);

			sendingObjectDict[user] = sendingObject;
			callback(url, sendingObject);
		});
	};

	app.get("/auth/google/callback", function(req, res, next){
		var state = JSON.parse(decodeURIComponent(req.query.state));
		var user = state.user;
		var sendingObject = sendingObjectDict[user];

		console.log(state);
		console.log(sendingObjectDict);
		console.log(user);
		console.log(sendingObject);

		oauth2Client.getToken(req.query.code, function(err, token) {
			if (err) {
				console.log("Error while trying to retrieve access token", err);
				return;
			}
			oauth2Client.credentials = token;

			var mail = [
				"To: $to",
				"Cc: $cc",
				"Subject: =?utf-8?B?$subject?=",
				"Subject: $subject",
				"MIME-Version: 1.0",
				"Content-Type: text/plain; charset=UTF-8",
				"Content-Transfer-Encoding: Base64",
				"",
				"$body"
			].join("\n").trim();
			mail = mail
          .replace("$to", sendingObject.to)
          .replace("$cc", sendingObject.cc)
          .replace("$subject", btoa(unescape(encodeURIComponent(sendingObject.subject))))
          .replace("$body", sendingObject.body);

			console.log(mail);

			var encoded = btoa(unescape(encodeURIComponent(mail)))
          .replace(/\+/g, "-").replace(/\//g, "_");

			var sendRequest = google.gmail("v1").users.messages.send({
				userId: "me",
				auth: oauth2Client,
				resource: 
              { "raw": encoded}
			}, function(err, response){
				console.log(err);
				console.log(response);
				if(err == null)
            {
					sendingObject.resolve();
				}
				else
            {
					sendingObject.reject();
				}              
				res.redirect("/aftermail");  
			});
		});
	});

	app.get("/aftermail", function(req, res, next){
		res.render("aftermail");
	});

	function btoa(str) {  
		var buffer;
		if (Buffer.isBuffer(str)) {
			buffer = str;
		}
		else {
			buffer = new Buffer(str.toString(), "binary");
		}

		return buffer.toString("base64");
	}

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   *
   * @param {Object} credentials The authorization client credentials.
   */
	function authorize(credentials, user) {
		var clientSecret = credentials.web.client_secret;
		var clientId = credentials.web.client_id;
		var redirectUrl = "http://localhost:3000/auth/google/callback";
		var auth = new googleAuth();
		oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

		var authUrl = oauth2Client.generateAuthUrl({
      //    access_type: 'offline',
			scope: SCOPES,
			state: encodeURIComponent(JSON.stringify({user: user}))
		});

		console.log("authorize.user " + user);

		return authUrl;
	}

	function getSenderAddress(auth, resolve, reject){
		var gmail = google.gmail("v1");
		gmail.users.getProfile({auth: auth, userId: "me"},function(err, response)
          {
			if (err) {
				console.log("The API returned an error: " + err);
				reject(null);
			}
			else
              {
				resolve(response.emailAddress);
			}
		}
      );
	}
};

module.exports = new gmailController();