const {parseXmlToJs} = require("./evernote-xml-to-js-parser");
const {RootElementHandler} = require('./content-elements');

async function content2content(noteContent, images, clippings = {}) {
	const content = await parseXmlToJs(noteContent)
	const defaultHandler = new RootElementHandler()
	if (!defaultHandler.appliesTo(content)) {
		return []
	}
	return defaultHandler.parse(content, {images, clippings})
}

function richText(content) {
	return {
		"data": {},
		"content": content,
		"nodeType": "document"
	}
}

async function content2contentAsRichText(noteContent, images, clippings) {
	const content = await content2content(noteContent, images, clippings)
	return richText(content)
}

module.exports = {
	content2content,
	content2contentAsRichText,
}
