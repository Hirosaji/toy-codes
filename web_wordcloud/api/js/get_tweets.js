const express = require("express");
const app = express();
const bodyParser = require('body-parser');

const server = app.listen(3000, function(){
	console.log("Node.js is listening to PORT:" + server.address().port);
});

const fs = require('fs');
const MeCab = require('mecab-async');
const twitterClient = require('twitter');
const credentials = require('./credentials.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function(req, res) {

	function get_tweets(){

		return new Promise(function(resolve){

			let client = new twitterClient({
			    consumer_key:        credentials.twitter_API_Key,
			    consumer_secret:     credentials.twitter_API_Secret,
			    access_token_key:    credentials.twitter_Access_Token,
			    access_token_secret: credentials.twitter_Access_Token_Secret,
			});

			let params = {
				user_id: credentials.twitter_userID,
				count: 200,
			};

			client.get('statuses/user_timeline', params, function(error, tweets, response){

				// // ローカルテスト用
				// const format_tweets_json = JSON.stringify(tweets);
				// const format_response_json = JSON.stringify(response)
				// fs.writeFile('json/tweets.json', format_tweets_json)
				// fs.writeFile('json/response.json', format_response_json)

				resolve(tweets_preformat(tweets));

			});

		});

	}

	function tweets_preformat(tweets){

		return new Promise(function(resolve){

			let all_tweet_text = '';

			tweets.forEach(function(tweet){
				all_tweet_text = all_tweet_text + tweet['text'];
			});

			let all_tweet_word = '';
			let words_freq = [['count', 'word']];
			let exist_words = [];
			let mecab = new MeCab();
			let escape_words = ['RT', 'http', 'https', '://', ':', ';', '@', '@_', '：@_', '#', '/', '.', 'D'];

			all_tweet_text = all_tweet_text.replace(/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?/g, '');

			mecab.parse(all_tweet_text, function(err, words_info) {

				words_info.forEach(function(word_info){
					if(word_info[1] === '名詞' && isNaN(word_info[0]) && escape_words.indexOf(word_info[0]) === -1){
						let word_order = exist_words.indexOf(word_info[0]);
						if(word_order === -1){
							words_freq.push([1, word_info[0]]);
							exist_words.push(word_info[0]);
						}
						else {
							words_freq[word_order+1][0] = words_freq[word_order+1][0] + 1;
						}
					}
				});
				resolve(words_freq);

			});

		});

	}

	get_tweets().then(function(tweets){
		res.json({ 'body': tweets });
	});

});

