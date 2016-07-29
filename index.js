const Botkit = require("botkit");

const settings = require("./data/settings.json");
const dictionary = require("./data/dictionary.json");

const gh = require("./module/github-controller")(settings.repository);
const sl = require("./module/slack-controller")("");
sl.setAuthData(settings.token.slack.token);
gh.setAuthData(settings.token.github);

let users = false;
sl.getUsersList()
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

bot.hears("(Create Issue)",["direct_message","direct_mention","mention"], (bot, message) => {
	let elements = message.text.split("\n");
	let title = createUser[0].name + ": " + elements[1];
	let body = elements.filter( (row, index) => {return index >= 2}).join("\n");
	let createUser = users.filter( (user) => {
		return user.id == message.user
	}) || {name:"Unknown"};

	bot.reply(
		message,
		dictionary[settings.lang]["Processing"].replace(/{title}/, title)
	);

	Promise.resolve()
	.then( () => {
		return gh.createIssue(title, body);
	})
	.then( (data) => {
		bot.reply(
			message,
			dictionary[settings.lang]["Success"].replace(/{title}/, title)
		);
		console.log(data);
	})
	.catch( (err) => {
		bot.reply(
			message,
			dictionary[settings.lang]["Error"].replace(/{error}/, err)
		);
	});
});
