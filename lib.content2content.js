const xml2js = require('xml2js');

const parser = new xml2js.Parser({
	// trim: true,
	preserveChildrenOrder: true,
	explicitChildren: true,
	charsAsChildren: true,
});

function paragraph(text) {
	return {
		"data": {},
		"content": [
			{
				"data": {},
				"marks": [],
				"value": text.trim(),
				"nodeType": "text"
			}
		],
		"nodeType": "paragraph"
	}
}

function newline() {
	return paragraph("")
}

function image(node, images) {
	const hash = node.$.hash
	const {assetId} = images[hash]
	return {
		"data": {
			"target": {
				"sys": {
					type: 'Link',
					linkType: 'Asset',
					id: assetId
				},
			}
		},
		"content": [],
		"nodeType": "embedded-asset-block"
	}
}

function isNode(node) {
	return node.$$ && node.$$.length !== 0
}

function isText(node) {
	return node["#name"] === "__text__"
}

function isImage(node) {
	return node["#name"] === "en-media"
}

function isNewline(node) {
	return node["#name"] === "br"
}

function isImageNode(node) {
	return isNode(node) && node.$$.some(isImage)
}

function isOrderedList(node) {
	return node["#name"] === "ol";
}

function isUnorderedList(node) {
	return node["#name"] === "ul";
}

function isList(node) {
	return isOrderedList(node) || isUnorderedList(node)
}

function listItem(node) {
	return {
		"data": {},
		"content": parseNode(node.$$[0]),
		"nodeType": "list-item"
	}
}

function listType(node) {
	if(isOrderedList(node)) return "ordered-list"
	if(isUnorderedList(node)) return "unordered-list"
	throw new Error("unknown list type" + JSON.stringify(node));
}

function list(node) {
	return {
		"data": {},
		"content": node.$$.map(listItem),
		"nodeType": listType(node)
	};
}

function isTodo(node) {
	return node["#name"] === "en-todo";
}

function todo(node) {
	const textNode = node.$$.filter(node => !isTodo(node))[0];
	if(!isText(textNode)) throw new Error('textnode expected in todo' + JSON.stringify(textNode))
	return paragraph("[ ] " + textNode._.trim())
}

function isTodoNode(node) {
	return isNode(node) && node.$$.some(isTodo)
}

function isHorizontalLine(node) {
	return node["#name"] === "hr";
}

function horizontalLine() {
	return {
		"data": {},
		"content": [],
		"nodeType": "hr"
	}
}

function text(node) {
	return {
		"data": {},
		"marks": [],
		"value": node._,
		"nodeType": "text"
	}
}

function isLink(node) {
	return node["#name"] === "a";
}

function link(node) {
	return {
		"data": {
			"uri": node.$.href
		},
		"content": node.$$.map(parseInline),
		"nodeType": "hyperlink"
	};
}

function isInline(node) {
	return isText(node) || isLink(node)
}

function parseInline(node) {
	if (isText(node)) return text(node)
	if (isLink(node)) return link(node)
	throw new Error('Unknown inline node type ' + JSON.stringify(node))
}

function isInlineNode(node) {
	return isNode(node) && node.$$.every(isInline)
}

function parseInlineNode(node) {
	return {
		"data": {},
		"content": node.$$.map(parseInline),
		"nodeType": "paragraph"
	}
}

function parseNode(node, images) {
	if(isInlineNode(node)) return parseInlineNode(node)

	if(isTodoNode(node)) return [todo(node)]

	if (isImageNode(node)) {
		// evernote always adds a newline between text and image
		// we don't want those to be added
		return node.$$
			.filter(node => !isNewline(node))
			.flatMap(node => parseNode(node, images))
	}

	if (isList(node)) return [list(node)]

	if (isNode(node)) return node.$$.flatMap(node => parseNode(node, images))

	if (isText(node)) return [paragraph(node._)]

	if (isImage(node)) return [image(node, images)]

	if (isNewline(node)) return [newline()]

	if(isHorizontalLine(node)) return [horizontalLine()]

	throw new Error("Unknown node type" + JSON.stringify(node))
}

async function content2content(noteContent, images) {
	const parsedNodeContent = await parser.parseStringPromise(noteContent)
	return parsedNodeContent["en-note"].$$.flatMap(node => parseNode(node, images))
}

module.exports = {
	content2content
}