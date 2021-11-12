// background.js

//stopwordValue is what is set by the slider. The current value range is from 0 to 10, initial value 5.
//The value can be adjusted under button.css
let stopwordValue = 5
//engineLocalValue can be 0 (for Google) or 1 (for wikipedia). In replaceTextInNode, this value should be used to
//figure out which href to replace the text with.
let engineLocalValue = 0

chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {
        const obj = JSON.parse(message);
        stopwordValue = obj.stopword;
        engineLocalValue = obj.enginevalue;
        sendResponse("message");
        console.log("stopwordValue = "+ stopwordValue);
        console.log("engineLocalValue = "+ engineLocalValue);

    }
)
function loadPageTokens() {
    //This is where all of the language processing happens
    //The return value should be the Bag of Words that need to be replaced in the body.
    const winkNLP = require('wink-nlp');
    const model = require('wink-eng-lite-web-model');
    const nlp = winkNLP(model);
    const its = nlp.its;
    const as = nlp.as;

    const doc = nlp.readDoc(document.body.innerHTML)
    //console.log(doc.tokens().out())
    return doc;
}

function replaceTextInNode (parentNode){
    //This is the code I used for testing the word replacement. I knew the page I was on had the word "shade" in it
    //And I replaced it with "shade-markup", so this code works. Basically, This code needs to be changed so that
    //for every bag of words token given by loadPageTokens, the "word" needs to be replaced with
    // "<a href=http//google.com/?word>word</a>"
    // or something like that.
    for(var i = parentNode.childNodes.length-1; i >= 0; i--){
        var node = parentNode.childNodes[i];

        if(node.nodeType == Element.TEXT_NODE){
            node.textContent = node.textContent.replace('shade', 'shade-markup');
        } else if (node.nodeType == Element.ELEMENT_NODE){
            replaceTextInNode(node);
        }
    }
}


loadPageTokens()

replaceTextInNode(document.body);


