# coding: utf-8
from selenium import webdriver

# 読み込むURLを設定
url = "http://singo.jiyu.co.jp/"

# PhantomJSのドライバを設定
driver = webdriver.PhantomJS()
# 暗黙的な待機を３秒行う
driver.implicitly_wait(3)
# URL読み込み
driver.get(url)
# 流行語リストを取得
buzzwordsQuery = ""
buzzwords = driver.find_elements_by_class_name("grid-item-inner__word")
for word in buzzwords:
	buzzword = word.text
	buzzwordsQuery = buzzwordsQuery + buzzword + ", "
buzzwordsQuery = buzzwordsQuery[:-2]

# 出力
print(buzzwordsQuery)