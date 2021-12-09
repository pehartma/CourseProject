let stopwordslider = document.getElementById("myRange");
let stopwordvalue = document.getElementById("k_value");
let engineSelection = document.getElementById("myEngine");
let engineValue = document.getElementById("engine_value");
let google = "Google"
let engine = google;
let engineNumericValue = engineValue;
stopwordvalue.innerHTML = stopwordslider.value; // Display the default slider value
console.log("initial stopwordslider.value = " + stopwordslider.value)

// Update the current slider value (each time you drag the slider handle)
stopwordslider.oninput = function() {
    stopwordvalue.innerHTML = this.value;
    console.log("stopwordslider.value = " + this.value);
    message = JSON.stringify({stopword: stopwordslider.value, enginevalue: engineSelection.value});
    document.cookie = "rabbithole_words=" + this.value;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message, function(confirmed) {});

        // can hang (unresponsive) consecutive fast reload
        // chrome.tabs.reload(tabs[0].id);
        // sleep(2000);
        

    
    //ignore this
    // attempt to reload on change
    // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    //     chrome.tabs.reload(tabs[0].id);
    //     sleep(20);
    });
}



engineValue.innerHTML = engine;
chrome.storage.sync.set({ engineNumericValue });

engineSelection.oninput = function() {
    console.log("this.value = " + this.value);
    if (this.value == 0) {
        engine = google;
    }
    else {
        engine = "Wikipedia";
    }
    engineValue.innerHTML = engine;
    message = JSON.stringify({stopword: stopwordslider.value, enginevalue: engineSelection.value});
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message, function(confirmed) {});
    });
}
