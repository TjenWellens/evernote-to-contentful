const xml2js = require('xml2js');
const {getAssetIdForHash} = require("./lib.getAssetIdForHash");

const parser = new xml2js.Parser({
	// trim: true,
	preserveChildrenOrder: true,
	explicitChildren: true,
	charsAsChildren: true,
});

function _paragraph(text) {
	return {
		"data": {},
		"content": [
			_text(text.trim())
		],
		"nodeType": "paragraph"
	}
}

function _paragraph_content(content) {
	return {
		"data": {},
		"content": content,
		"nodeType": "paragraph"
	}
}

function newline() {
	return _paragraph("")
}

function image(node, images) {
	const hash = node.$.hash
	const assetId = getAssetIdForHash(images, hash)
	if (!assetId) throw new Error(`link could not find matching image for hash(${hash}) in images(${JSON.stringify(images)})`)
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

function isParagraph(node) {
	return node["#name"] === "div"
}

function hasAttributes(node) {
	return node.$
}

function isIgnorable(node) {
	return isEmptyDiv(node) || isEmptySpan(node)
}

function isEmptyDiv(node) {
	return node["#name"] === "div" && !isNode(node)
}

function isEmptySpan(node) {
	return node["#name"] === "span" && !isNode(node)
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
	if (isOrderedList(node)) return "ordered-list"
	if (isUnorderedList(node)) return "unordered-list"
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
	return _text(" [ ] ");
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

function _text(text) {
	return {
		"data": {},
		"marks": [],
		"value": text,
		"nodeType": "text"
	}
}

function text(node) {
	return _text(node._)
}

function isLink(node) {
	return node["#name"] === "a";
}

function link(node) {
	return {
		"data": {
			"uri": node.$.href
		},
		"content": _parseInlineNodeContent(node),
		"nodeType": "hyperlink"
	};
}

function isInline(node) {
	return isText(node) || isLink(node) || isNewline(node) || isTodo(node)
}

function parseInline(node) {
	if (isText(node)) return text(node)
	if (isLink(node)) return link(node)
	if (isNewline(node)) return inlineNewline(node)
	if (isTodo(node)) return todo(node)
	throw new Error('Unknown inline node type ' + JSON.stringify(node))
}

function inlineNewline(node) {
	return _text('\n');
}

function isInlineNode(node) {
	return isNode(node) && node.$$.every(isInline)
}

function squashInlineNewline(children) {
	if (children.length === 0) return children
	const moreText = replaceNewlineWithText();
	const squashed = squashText(moreText);
	return replaceLeadingWhitespace(replaceTrailingWhitespace(squashed))

	function replaceLastText(input, fnReplacementText) {
		const result = [...input]
		const lastItem = last(input);
		const newItem = {
			...lastItem,
			_: fnReplacementText(lastItem._)
		};
		result.splice(input.length - 1, 1, newItem);
		return result;
	}

	function replaceFirstText(input, fnReplacementText) {
		const result = [...input]
		const firstItem = first(input);
		const newItem = {
			...firstItem,
			_: fnReplacementText(firstItem._)
		};
		result.splice(0, 1, newItem);
		return result;
	}

	function last(array) {
		return array[array.length - 1];
	}

	function first(array) {
		return array[0];
	}

	function squashText(children) {
		return children.reduce((squashed, child) => {
			if (squashed.length === 0)
				return [{...child}]

			if (!isText(child))
				return [...squashed, {...child}]

			const previous = last(squashed)
			if (!isText(previous))
				return [...squashed, {...child}]

			return replaceLastText(squashed, previousText => previousText + child._)
		}, [])
	}

	function textNewline() {
		return {
			"#name": "__text__",
			"_": "\n"
		}
	}

	function replaceNewlineWithText() {
		return children.map(node => isNewline(node) ? textNewline() : node);
	}

	function replaceTrailingWhitespace(children) {
		if (!isText(last(children)))
			return children

		return replaceLastText(children, text => text.replace(/\s+$/, ''))
	}

	function replaceLeadingWhitespace(children) {
		if (!isText(first(children)))
			return children

		return replaceFirstText(children, text => text.replace(/^\s+/, ''))
	}
}

function squashInlineTextAndCleanupWhitespace(children) {
	if (children.length === 0) return children
	const moreText = children;
	const squashed = squashText(moreText);
	return replaceLeadingWhitespace(replaceTrailingWhitespace(squashed))

	function replaceLastText(input, fnReplacementText) {
		const result = [...input]
		const lastItem = last(input);
		const newItem = {
			...lastItem,
			value: fnReplacementText(lastItem.value)
		};
		result.splice(input.length - 1, 1, newItem);
		return result;
	}

	function replaceFirstText(input, fnReplacementText) {
		const result = [...input]
		const firstItem = first(input);
		const newItem = {
			...firstItem,
			value: fnReplacementText(firstItem.value)
		};
		result.splice(0, 1, newItem);
		return result;
	}

	function last(array) {
		return array[array.length - 1];
	}

	function first(array) {
		return array[0];
	}

	function squashText(children) {
		return children.reduce((squashed, child) => {
			if (squashed.length === 0)
				return [{...child}]

			if (!isText(child))
				return [...squashed, {...child}]

			const previous = last(squashed)
			if (!isText(previous))
				return [...squashed, {...child}]

			return replaceLastText(squashed, previousText => previousText + child.value)
		}, [])
	}

	function textNewline() {
		return {
			"#name": "__text__",
			"_": "\n"
		}
	}

	function replaceNewlineWithText(children) {
		return children.map(node => isNewline(node) ? textNewline() : node);
	}

	function replaceTrailingWhitespace(children) {
		if (!isText(last(children)))
			return children

		return replaceLastText(children, text => text.replace(/\s+$/, ''))
	}

	function replaceLeadingWhitespace(children) {
		if (!isText(first(children)))
			return children

		return replaceFirstText(children, text => text.replace(/^\s+/, ''))
	}

	function isText({nodeType}) {
		return nodeType && nodeType === 'text';
	}
}

function _parseInlineNodeContent(node) {
	const contentSquashed = squashInlineTextAndCleanupWhitespace(node.$$.map(parseInline));

	return contentSquashed

	function isTextEntry({nodeType}) {
		return nodeType && nodeType === 'text';
	}

	function removeLeadingWhitespace(entry) {
		entry.value = entry.value.replace(/^\s+/, '')
	}

	function last(array) {
		return array[array.length - 1];
	}

	function squashText(children) {
		return children.reduce((squashed, child) => {
			if (squashed.length === 0)
				return [{...child}]

			if (!isTextEntry(child))
				return [...squashed, {...child}]

			const previous = last(squashed)
			if (!isTextEntry(previous))
				return [...squashed, {...child}]

			return replaceLastText(squashed, previousText => previousText + child.value)
		}, []);
	}

	function replaceLastText(input, fnReplacementText) {
		const result = [...input]
		const lastItem = last(input);
		const newItem = {
			...lastItem,
			value: fnReplacementText(lastItem.value)
		};
		result.splice(input.length - 1, 1, newItem);
		return result;
	}
}

function parseInlineNode(node) {
	return {
		"data": {},
		"content": _parseInlineNodeContent(node),
		"nodeType": "paragraph"
	}
}

function isTable(node, images) {
	return node["#name"] === "table"
}

function isTableBody(node) {
	return node["#name"] === "tbody"
}

function parseTable(node, images) {
	if (!node.$$) throw new Error('no weird tables allowed')
	const body = node.$$.find(isTableBody);
	if (!body) throw new Error('no weird tables allowed')
	return parseNode(body, images)
}

function parseNode(node, images) {
	if (isTable(node)) return parseTable(node, images)

	if (isInlineNode(node)) return [parseInlineNode(node)]

	if (isTodoNode(node)) return [todo(node)]

	if (isImageNode(node)) {
		// evernote always adds a newline between text and image
		// we don't want those to be added
		return node.$$
			.filter(node => !isNewline(node))
			.flatMap(node => parseNode(node, images))
	}

	if (isList(node)) return [list(node)]

	if (isNode(node)) return node.$$.flatMap(node => parseNode(node, images))

	if (isText(node)) return [_paragraph(node._)]

	if (isImage(node)) return [image(node, images)]

	if (isNewline(node)) return [newline()]

	if (isHorizontalLine(node)) return [horizontalLine()]

	if (isIgnorable(node)) return []

	throw new Error("Unknown node type" + JSON.stringify(node))
}

async function content2content(noteContent, images) {
	const parsedNodeContent = await parser.parseStringPromise(noteContent)
	const content = parsedNodeContent["en-note"];
	if (!content.$$) {
		return []
	}
	return content.$$.flatMap(node => parseNode(node, images))
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
	squashInlineTextAndCleanupWhitespace,
	content2contentAsRichText,
	_text,
	inlineNewline,
	link,
}
