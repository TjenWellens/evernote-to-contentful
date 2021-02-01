const xml2js = require('xml2js');
const {Node} = require('./content-elements');

const parser = new xml2js.Parser({
	// trim: true,
	preserveChildrenOrder: true,
	explicitChildren: true,
	charsAsChildren: true,
});

async function content2content(noteContent, images) {
	const parsedNodeContent = await parser.parseStringPromise(noteContent)
	const content = parsedNodeContent["en-note"];
	const defaultHandler = new Node()
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
