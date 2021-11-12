# cs410_group_project

To load this extension, use the following directions:
1. Open the Extension Management page by navigating to chrome://extensions.
	1. Alternatively, open this page by clicking on the Extensions menu button and selecting Manage Extensions at the bottom of the menu.
	1. Alternatively, open this page by clicking on the Chrome menu, hovering over More Tools then selecting Extensions
1. Enable Developer Mode by clicking the toggle switch next to Developer mode.
1. Click the Load unpacked button and select the extension directory.
1. The extension in the selected directory will load.


Development for this extension:

This extension uses WinkNLP which uses NodeJS. In order to properly develop this extension, you will need to follow the directions here:
https://winkjs.org/wink-nlp/wink-nlp-in-browsers.html

Do your development in background.js, then run:
"browserify background.js -o background-bundle.js"

In background.js, 
