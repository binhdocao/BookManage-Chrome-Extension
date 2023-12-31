// Binh Do-Cao
// Background.js


// Displays the settings page upon the extension being installed.
chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === "install") {
        chrome.tabs.create({ url: "login.html" });
    }
    
});

// Keeps track of session state
// User has to relogin after closing the browser`

chrome.runtime.onStartup.addListener(() => {
    chrome.storage.local.remove(['isLoggedIn'], function() {
        console.log("Session state cleared.");
    });
});