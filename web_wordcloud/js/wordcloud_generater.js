const fs = require('fs');
const MeCab = require('mecab-async');
const twitterClient = require('twitter');
const credentials = require('./credentials.js');


function get_tweets(){

	let client = new twitterClient({
	    consumer_key:        credentials.twitter_API_Key,
	    consumer_secret:     credentials.twitter_API_Secret,
	    access_token_key:    credentials.twitter_Access_Token,
	    access_token_secret: credentials.twitter_Access_Token_Secret,
	});

	let params = {
		user_id: credentials.twitter_userID,
		count: 200,
	}

	client.get('statuses/user_timeline', params, function(error, tweets, response){

		// // ローカルテスト用
		// const format_tweets_json = JSON.stringify(tweets);
		// const format_response_json = JSON.stringify(response)
		// fs.writeFile('json/tweets.json', format_tweets_json)
		// fs.writeFile('json/response.json', format_response_json)

		tweets_preformat(tweets);

	})

}


function tweets_preformat(tweets){

	let all_tweet_text = '';

	tweets.forEach(function(tweet){
		all_tweet_text = all_tweet_text + tweet['text'];
	});

	let all_tweet_word = '';
	let words_freq = {};
	let mecab = new MeCab();
	let escape_words = ['RT', 'http', 'https', '://', ':', ';', '@', '@_', '#', '/', '.', 'D']

	mecab.parse(all_tweet_text, function(err, words_info) {

		words_info.forEach(function(word_info){
			if(word_info[1] === '名詞' && isNaN(word_info[0]) && escape_words.indexOf(word_info[0]) === -1){
				if(Object.keys(words_freq).indexOf(word_info[0])){
					words_freq[word_info[0]] = 1;
				}
				else {
					words_freq[word_info[0]] = words_freq[word_info[0]] + 1;
				}
			}
		})
		console.log(words_freq)

	});

}

get_tweets()

// // ローカルテスト用
// var tweets = JSON.parse(fs.readFileSync('../json/tweets.json', 'utf8'));
// tweets_preformat(tweets);
