const Botkit = require("botkit");

const bot = Botkit.slackbot({
	debug: false
});

const settings = require("./data/settings.json");
const gh = require("./module/github-controller")(settings.repository);
gh.setAuthData(settings.token.github);

bot.spawn(settings.token.slack).startRTM();

bot.hears("(Create Issue)",["direct_message","direct_mention","mention"], (bot, message) => {
	let elements = message.text.split("\n");
	bot.reply(message, "Processing create issue...");

	Promise.resolve()
	.then( () => {
		return gh.createIssue(elements[1], elements[2]);
	})
	.then( () => {
		bot.reply(message, "Success! Created issue \"" + elements[1] + "\".");
	})
	.catch( (err) => {
		bot.reply(message, "Sorry, Issue create failed.\n" + err);
	});
});
