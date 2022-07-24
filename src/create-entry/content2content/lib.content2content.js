const {parseXmlToJs} = require("./evernote-xml-to-js-parser");
const {RootElementHandler} = require('./content-elements');

async function content2content(noteContent, images) {
	const content = await parseXmlToJs(noteContent)
	const defaultHandler = new RootElementHandler()
	if (!defaultHandler.appliesTo(content)) {
		return []
	}
	return defaultHandler.parse(content, images)
}

function richText(content) {
	return {
		"data": {},
		"content": content,
		"nodeType": "document"
	}
}

async function content2contentAsRichText(noteContent, images) {
	const content = await content2content(noteContent, images)
	return richText(content)
}

module.exports = {
	content2content,
	content2contentAsRichText,
}
