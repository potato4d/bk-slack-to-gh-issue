# BK Slack to Github Issue
Slack Message send to Github Issue Using Botkit.

# Installation

## 1. Download app
```
$ git clone https://github.com/potato4d/bk-slack-to-gh-issue/
$ cd bk-slack-to-gh-issue
$ npm install
$ cd data
$ cat settings-sample.json > settings.json
```

## Make settings file

1. Open file `data/settings.json`.
2. Edit settings json file comment.

### Settings file sample

```
{
	"lang": "ja",
	"token": {
		"slack": {
			"token": "****-*********************************"
		},

		"github": {
			"user": "potato4d",
			"password": "********************"
		}
	},
	"repository": "potato4d/bk-slack-to-gh-issue"
}

```

## Run app

```
$ npm start
```

# Keywords

Node.js, Botkit, GitHub API, and Slack API.


# LICENSE
[![license](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://github.com/potato4d/bk-slack-to-gh-issue/blob/master/LICENSE)

# Author

[Potato4d](https://twitter.com/potato4d)(TAKUMA Hanatani)
