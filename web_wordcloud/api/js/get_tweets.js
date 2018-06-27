/*jshint esversion: 6 */

const express = require("express");
const app = express();
const bodyParser = require('body-parser');

const server = app.listen(3000, function(){
	console.log("Node.js is listening to PORT:" + server.address().port);
});

const fs = require('fs');
const kuromoji = require('kuromoji');
const twitterClient = require('twitter');
const credentials = require('./credentials.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.post('/', function(req, res) {

	function get_tweets(){

		return new Promise(function(resolve){

			let client = new twitterClient({
			    consumer_key:        credentials.twitter_API_Key,
			    consumer_secret:     credentials.twitter_API_Secret,
			    access_token_key:    credentials.twitter_Access_Token,
			    access_token_secret: credentials.twitter_Access_Token_Secret,
			});

			let user_id = req.body.id;

			let params = {
				'user_id': user_id,
				'count': 200,
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
				all_tweet_text = all_tweet_text + tweet['text'].replace(/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?/g, '');
			});

			let all_tweet_word = '';
			let words_freq = [];
			let filtered_words_freq = [];
			let exist_words = [];
			var builder = kuromoji.builder({
				dicPath: '../node_modules/kuromoji/dict/'
			});
			let escape_words = ['RT', ':', ';', '@', '@_', '：@_', '.@', '#', '/', '.', 'D', '[', ']'];

			builder.build(function(err, tokenizer){
				if(err) {
					console.log(err);
					return;
				}
				var words_info = tokenizer.tokenize(all_tweet_text);

				words_info.forEach(function(word_info){
					if(word_info['pos'] === '名詞' && isNaN(word_info['surface_form']) && escape_words.indexOf(word_info['surface_form']) === -1){
						let word_order = exist_words.indexOf(word_info['surface_form']);
						if(word_order === -1){
							words_freq.push([1, word_info['surface_form']]);
							exist_words.push(word_info['surface_form']);
						}
						else {
							words_freq[word_order][0] = words_freq[word_order][0] + 1;
						}
					}
				});
				words_freq.forEach(function(words_freq_info){
					if(words_freq_info[0] !== 1){
						filtered_words_freq.push(words_freq_info);
					}
				})
				resolve(filtered_words_freq);

			});

		});

	}

	get_tweets().then(function(tweets){
		res.json({ 'body': tweets });
	});

});

