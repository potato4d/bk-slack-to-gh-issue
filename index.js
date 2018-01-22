const Botkit = require("botkit");

let settings = require("./data/settings.json");
const dictionary = require("./data/dictionary.json");

const gh = require("./module/github-controller");
const sl = require("./module/slack-controller")("");
const gm = require("./module/gmail-controller");

sl.setAuthData(settings.token.slack.token);
gh.setAuthData(settings.token.github);

let users = false;

var fs = require("fs");

Promise.resolve()
.then( () => {
	return sl.getUsersList();
})
.then( (data) => {
	users = data;
})
.catch( (err) => {
	console.log("userList Get Error:" + err);
});

const bot = Botkit.slackbot({
	debug: false
});

bot.spawn(settings.token.slack).startRTM();

bot.hears("(メール送って)",["direct_message"], (bot, message) => {

	let splitMessage = message.text.split("\n");
	let sendingObject = {};
	sendingObject.id = createRandomString();
	sendingObject.from = "miyatsuki.shiku@gmail.com";
	sendingObject.to  = splitMessage[1].replace(/<mailto:|>|,/g, "").replace(/\|/g, " ").split(" ").filter(function(x,i,self){return self.indexOf(x) === i;}).join(", ");
	sendingObject.cc = splitMessage[2].replace(/<mailto:|>|,/g, "").replace(/\|/g, " ").split(" ").filter(function(x,i,self){return self.indexOf(x) === i;}).join(", ");
	sendingObject.subject = splitMessage[3];
	sendingObject.body = "";
	for(let i = 4; i < splitMessage.length; i++)
	{
		sendingObject.body += splitMessage[i] + "\n";
	}
	sendingObject.toString = function(){
		return "id: " + this.id + "\n" 
		+ "to: " + this.to + "\n"
		+ "cc: " + this.cc + "\n"
		+ "subject: " + this.subject + "\n"
		+ "body: " + this.body + "\n";
	};

	sendingObject.resolve = () => {
		bot.reply(
			message,
			"id: " + sendingObject.id + "のメール送信に成功しました");
	};

	sendingObject.reject = () => {
		bot.reply(
			message,
			"id: " + sendingObject.id + "のメール送信に失敗しました");
	};

	gm.getAuthURL(message.user, sendingObject, (url, sendingObject) => {
		bot.reply(
			message,
			"この内容でメールを送ってもよろしければ、下記のURLにアクセスしてください\n"
			 + sendingObject.toString() + "\n\n" + url);		
	});

});

bot.hears("(Set Repository)",["direct_message","direct_mention","mention"], (bot, message) => {
	let repository = message.text.split("\n")[1];
	let channel = message.channel;

	bot.reply(
		message,
		"Setting channel repository: " + repository
	);

	Promise.resolve()
	.then( () => {
		settings["repository"][channel] = repository;
		fs.writeFile("./data/settings.json", JSON.stringify(settings, null, "\t"));
	})
	.then( (data) => {
		bot.reply(
			message,
			"Success setting channel reposiory: " + repository
		);
		console.log(repository);
	})
	.catch( (err) => {
		bot.reply(
			message,
			"Error setting channel repository: " + repository + "\n" + err
		);
		console.log(err);
	});
});

bot.hears("(Create Issue)",["direct_message","direct_mention","mention"], (bot, message) => {
	let elements = message.text.split("\n");
	let createUser = users.filter( (user) => {
		return user.id == message.user;
	}) || {name:"Unknown"};

	let title = createUser[0].name + ": " + elements[1];
	let body = elements.filter( (row, index) => {return index >= 2;}).join("\n");
	let repository = settings["repository"][message.channel];

	bot.reply(
		message,
		"Create Issue " + title + " in " + repository
	);

	Promise.resolve()
	.then( () => {
		return gh.createIssue(title, body, repository);
	})
	.then( (data) => {
		bot.reply(
			message,
			"Succeed creating issue at " + title + " in " + repository + "\n" + data.body.html_url
		);
		console.log(data);
	})
	.catch( (err) => {
		bot.reply(
			message,
			"Failed creating issue at " + title + " in " + repository + "\n" + err
		);
		console.log(err);
	});
});

function createRandomString()
{
	// 生成する文字列の長さ
	var l = 20;

	// 生成する文字列に含める文字セット
	var c = "abcdefghijklmnopqrstuvwxyz0123456789";

	var cl = c.length;
	var r = "";
	for(var i=0; i<l; i++){
	  r += c[Math.floor(Math.random()*cl)];
	}

	return r;
}