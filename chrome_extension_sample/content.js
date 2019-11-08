chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.log(message);
    console.log(JSON.parse(message).contents.target);
    return true;
});