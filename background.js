// background.js

const composeCorpus = require('wink-nlp-utils/src/string-compose-corpus');

//stopwordValue is what is set by the slider. The current value range is from 0 to 10, initial value 5.
//The value can be adjusted under button.css
let stopwordValue = getCookieValue('rabbithole_words', 5);
//engineLocalValue can be 0 (for Google) or 1 (for wikipedia). In replaceTextInNode, this value should be used to
//figure out which href to replace the text with.
let engineLocalValue = getCookieValue('rabbithole_engine', 0);

function getCookieValue(name, default_value) {
    let re = new RegExp(name + '=(\\d+)\\b');
    let match = document.cookie.match(re);
    if (match) {
        return parseInt(match[1]);
    }
    return default_value;
}

chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {
        const obj = JSON.parse(message);
        stopwordValue = obj.stopword;
        engineLocalValue = obj.enginevalue;
        sendResponse("message");
        document.cookie = "rabbithole_engine=" + engineLocalValue;
        document.cookie = "rabbithole_words=" + stopwordValue;
        //console.log(document.cookie);
    }
)

function loadPageTokens() {
    //This is where all of the language processing happens
    //The return value should be the Bag of Words that need to be replaced in the body.
    const winkNLP = require('wink-nlp');
    const model = require('wink-eng-lite-web-model');
    const utils = require('wink-nlp-utils');
    const nlp = winkNLP(model);
    const its = nlp.its;
    const as = nlp.as;

    var text = (document.body.textContent);
    text = text.replace(/<script.+\/script>/g, ' '); // Remove all scripts
    text = text.replace(/<style.+\/style>/g, ' '); // Remove all styles
    text = utils.string.removeHTMLTags(text);
    text = utils.string.removePunctuations(text);
    text = utils.string.removeExtraSpaces(text);
    text = utils.string.removeSplChars(text);
    text = utils.string.lowerCase(text);
    var doc = nlp.readDoc(text);
    var tok = utils.tokens.removeWords(doc.tokens().out());
    const bow = utils.tokens.bagOfWords(tok);
    return bow;
}

function replaceTextInNode (parentNode, tokens){
    //This is the code I used for testing the word replacement. I knew the page I was on had the word "shade" in it
    //And I replaced it with "shade-markup", so this code works. Basically, This code needs to be changed so that
    //for every bag of words token given by loadPageTokens, the "word" needs to be replaced with
    // "<a href=http//google.com/?word>word</a>"
    // or something like that.

    // for(var i = parentNode.childNodes.length-1; i >= 0; i--){
    //     var node = parentNode.childNodes[i];

    //     if(node.nodeType == Element.TEXT_NODE){
    //         node.textContent = node.textContent.replace('shade', 'shade-markup');
    //     } else if (node.nodeType == Element.ELEMENT_NODE){
    //         replaceTextInNode(node);
    //     }
    // }

    var regex = new RegExp('\\b(' + tokens.join('|') + ')\\b', 'ig');

    matchText(parentNode, regex, function(node, match, offset) {
        var a = document.createElement("a");
        a.target = "_blank";
        a.style = "color:#FFA833;";
        var preprocessQuery = function(queryText) {
            queryText = queryText.
                trim().
                replace(/\s+/g, "+");
            return encodeURIComponent(queryText).
                replace(/['()]/g, escape).
                replace(/\*/g, '%2A');
        };
        switch(engineLocalValue) {
            case 0: // Google link
                a.href = "https://www.google.com/search?q=" + preprocessQuery(match);
                break;
            case 1: // Wikipedia link
                a.href = "https://en.wikipedia.org/w/index.php?search=" + preprocessQuery(match);
                break;
        }
        a.textContent = match;
        return a;
    });
}

function matchText(node, regex, callback, excludeElements) {
    // Original Source: https://stackoverflow.com/questions/16662393/insert-html-into-text-node-with-javascript

    excludeElements || (excludeElements = ['a', 'script', 'style', 'iframe', 'canvas']);
    var child = node.firstChild;

    while (child) {
        switch (child.nodeType) {
        case 1:
            if (excludeElements.indexOf(child.tagName.toLowerCase()) > -1)
                break;
            matchText(child, regex, callback, excludeElements);
            break;
        case 3:
            var bk = 0;
            child.data.replace(regex, function(all) {
                var args = [].slice.call(arguments),
                    offset = args[args.length - 2],
                    newTextNode = child.splitText(offset+bk), tag;
                bk -= child.data.length + all.length;

                newTextNode.data = newTextNode.data.substr(all.length);
                tag = callback.apply(window, [child].concat(args));
                child.parentNode.insertBefore(tag, newTextNode);
                child = newTextNode;
            });
            regex.lastIndex = 0;
            break;
        }

        child = child.nextSibling;
    }

    return node;
};


var bagOfWords = loadPageTokens();
var sortedBOW = [];
for (var word in bagOfWords) {
    if (bagOfWords[word] >= stopwordValue){
        sortedBOW.push([word, bagOfWords[word]]);
    }
}

sortedBOW.sort((a, b) => b[1] - a[1]);
var tokens = [];
//for (var newToken in sortedBOW) {
for (let i = 0; i < sortedBOW.length; i++){
    tokens.push(sortedBOW[i][0]);
}

replaceTextInNode(document.body, tokens);

//console.log(document.cookie);
