
const {parseNoteIdFromInternalUrl} = require("./parseNoteIdFromInternalUrl");
const {yankImageToRoot} = require("./yankImageToRoot");
const {getAssetIdForHash} = require("./lib.getAssetIdForHash");

function hasChildren(node) {
	return node.$$ && node.$$.length !== 0
}

class CodeBlock {
	appliesTo(node) {
		return isDiv(node) && hasStyleAttribute(node) && styleAttributeContains(node, "-en-codeblock:true")

		function hasStyleAttribute(node) {
			return node.$ && node.$.style;
		}

		function styleAttributeContains(node, query) {
			return node.$.style.indexOf(query) > -1;
		}
	}

	parse(node, lookups) {
		const handler = [
			new Node(),
		].find(handler => handler.appliesTo(node))
		if (!handler.appliesTo(node)) throw new Error("Code block should only contain node elements" + JSON.stringify(node))
		const blocks = handler.parse(node, lookups);
		return [{
			"data": {},
			"content": blocks,
			"nodeType": "blockquote"
		}]
	}
}

class Table {
	appliesTo(node) {
		return node["#name"] === "table"
	}

	parse(node, lookups) {
		if (isEvernoteTable(node)) return parseEvernoteTable(node, lookups)

		if (isHtmlTable(node)) return parseHtmlTable(node, lookups)

		throw new Error('no weird tables allowed')

		function parseHtmlTable(node, lookups) {
			const rows = node.$$ || []
			if (rows.length !== 1) throw new Error('only simple tables with one row allowed')
			return rows.flatMap(row => parseHtmlTableRow(row, lookups))

			function parseHtmlTableRow(row, lookups) {
				const columns = row.$$
				if (!columns.every(isTableColumn)) throw new Error('html table can only have columns in a row')
				if (columns.length !== 1) throw new Error('only simple tables with one column allowed')
				return columns.flatMap(column => parseHtmlTableColumn(column, lookups))
			}

			function parseHtmlTableColumn(column, lookups) {
				return new Node()._parseSingle(column, lookups)
			}

			function isTableColumn(node) {
				return node["#name"] === "td"
			}
		}

		function parseEvernoteTable(node, lookups) {
			const body = node.$$.find(isTableBody);
			if (!body) throw new Error('no weird tables allowed')
			return new Node()._parseSingle(body, lookups)
		}

		function isTableBody(node) {
			return node["#name"] === "tbody"
		}

		function isEvernoteTableChildElement(node) {
			return isTableBody(node) || isTableColGroup(node)
		}

		function isTableColGroup(node) {
			return node["#name"] === "colgroup";
		}

		function isEvernoteTable(node) {
			return node.$$ && node.$$.every(isEvernoteTableChildElement)
		}

		function isTableRow(node) {
			return node["#name"] === "tr"
		}

		function isHtmlTable(node) {
			return node.$$ && node.$$.every(isTableRow)
		}
	}
}

class InlineNode {
	appliesTo(node) {
		return new Node().appliesTo(node) && node.$$.every(child => new Inline().appliesTo(child))
	}

	parse(node, lookups) {
		return [this._parseSingle(node, lookups)]
	}

	_parseSingle(node, lookups) {
		const parsed = _parseInlineNodeContent(node, lookups);
		const squashed = squashInlineTextAndCleanupWhitespace(parsed);
		const paragraph = {
			"data": {},
			"content": squashed,
			"nodeType": "paragraph"
		};
		return yankImageToRoot(paragraph)
	}
}

class ImageNode {
	appliesTo(node) {
		return new Node().appliesTo(node) && node.$$.some(child => new Image().appliesTo(child))
	}

	parse(node, lookups) {
		return node.$$
			.filter(node => !isNewline(node))
			.flatMap(node => new Node()._parseSingle(node, lookups))
	}
}

class List {
	appliesTo(node) {
		return this._isOrderedList(node) || this._isUnorderedList(node)
	}

	parse(node, lookups) {
		return [this._parseSingle(node, lookups)]
	}

	_parseSingle(node, lookups) {
		const handler = new ListItem()
		return {
			"data": {},
			"content": node.$$.map(node => handler.parse(node)),
			"nodeType": this._listType(node)
		};
	}

	_listType(node) {
		if (this._isOrderedList(node)) return "ordered-list"
		if (this._isUnorderedList(node)) return "unordered-list"
		throw new Error("unknown list type" + JSON.stringify(node));
	}

	_isOrderedList(node) {
		return node["#name"] === "ol";
	}

	_isUnorderedList(node) {
		return node["#name"] === "ul";
	}
}

class Node {
	appliesTo(node) {
		return hasChildren(node)
	}

	parse(node, images) {
		return node.$$.flatMap(node => this._parseSingle(node, {images}))
	}

	_parseSingle(node, lookups) {
		const handler = [
			new CodeBlock(),
			new Table(),
			new InlineNode(),
			new ImageNode(),
			new List(),
			new Node(),
			new Text_forParagraph(),
			new Image(),
			new Newline_block(),
			new HorizontalLine(),
			new Ignorable(),
		].find(handler => handler.appliesTo(node))

		if (handler) {
			return handler.parse(node, lookups)
		}

		throw new Error("Unknown node type" + JSON.stringify(node))
	}
}

class Image {
	appliesTo(node) {
		return node["#name"] === "en-media"
	}

	parse(node, lookups) {
		return [this._image(node, lookups)]
	}

	_image(node, {images}) {
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
}

class HorizontalLine {
	appliesTo(node) {
		return node["#name"] === "hr"
	}

	parse(node, lookups) {
		return [this._parseSingle()]
	}

	_parseSingle() {
		return {
			"data": {},
			"content": [],
			"nodeType": "hr"
		}
	}
}

class Ignorable {
	appliesTo(node) {
		return isEmptyDiv(node) || isEmptySpan(node)

		function isEmptyDiv(node) {
			return node["#name"] === "div" && !hasChildren(node)
		}

		function isEmptySpan(node) {
			return new Span().appliesTo(node) && !hasChildren(node)
		}
	}

	parse(node, lookups) {
		return []
	}
}

class Inline {
	_chainOfResponsibility_appliesTo = [
		// new Ignorable(),
		new Text_inline(),
		new Link(),
		new Newline_inline(),
		new Todo(),
		new Bold(),
		new Span(),
		// new Font(),
		// new Image_inline(),
	];
	_chainOfResponsibility_parse = [
		new Ignorable(),
		new Text_inline(),
		new Link(),
		new Newline_inline(),
		new Todo(),
		new Bold(),
		new Span(),
		new Font(),
		new Image(),
	];

	appliesTo(node) {
		return !!this._chainOfResponsibility_appliesTo.find(handler => handler.appliesTo(node))
	}

	parse(node, lookups) {
		const handler = this._chainOfResponsibility_parse.find(handler => handler.appliesTo(node))

		if (handler) {
			return handler.parse(node, lookups)
		}

		throw new Error('Unknown inline node type ' + JSON.stringify(node))
	}
}

class Newline_inline {
	appliesTo(node) {
		return isNewline(node)
	}

	parse(node, lookups) {
		return [this._parseSingle(node)]
	}

	_parseSingle(node) {
		return new Text_inline()._text('\n');
	}
}

class Link {
	appliesTo(node) {
		return node["#name"] === "a"
	}

	parse(node, lookups) {
		return [this._parseSingle(node, lookups)]
	}

	_parseSingle(node, lookups) {
		return {
			"data": isInternalLink() ? internalLinkData() : externalLinkData(),
			"content": squashInlineTextAndCleanupWhitespace(_parseInlineNodeContent(node, lookups)),
			"nodeType": isInternalLink() ? "entry-hyperlink" : "hyperlink"
		};

		function isInternalLink() {
			return href().startsWith("evernote:///view/")
		}

		function internalLinkData() {
			return {
				target: {
					sys: {
						type: 'Link',
						linkType: 'Entry',
						id: parseNoteIdFromInternalUrl(href())
					}
				}
			}
		}

		function externalLinkData() {
			return {
				"uri": href()
			}
		}

		function href() {
			return node.$.href;
		}
	}
}

class Todo {
	appliesTo(node) {
		return node["#name"] === "en-todo"
	}

	parse(node, lookups) {
		return [this._parseSingle(node)]
	}

	_parseSingle(node) {
		const checked = node.$ && node.$.checked && node.$.checked === 'true'
		const checkmark = checked ? 'x' : ' ';
		return new Text_inline()._text(` [${checkmark}] `);
	}
}

class Bold {
	appliesTo(node) {
		return node["#name"] === "b"
	}

	parse(node, lookups) {
		return _parseInlineNodeContent(node, lookups)
	}
}

class Span {
	appliesTo(node) {
		return node["#name"] === "span"
	}

	parse(node, lookups) {
		return _parseInlineNodeContent(node, lookups)
	}
}

class Font {
	appliesTo(node) {
		return node["#name"] === "font"
	}

	parse(node, lookups) {
		return _parseInlineNodeContent(node, lookups)
	}
}

class Newline_block {
	appliesTo(node) {
		return isNewline(node)
	}

	parse(node, lookups) {
		return [{
			"data": {},
			"content": new Text_inline()._text(""),
			"nodeType": "paragraph"
		}]
	}
}

class Text_inline {
	appliesTo(node) {
		return node["#name"] === "__text__"
	}

	parse(node, lookups) {
		return [this._parseSingle(node)]
	}

	_parseSingle(node) {
		return this._text(node._);
	}

	_text(value) {
		return {
			"data": {},
			"marks": [],
			"value": value,
			"nodeType": "text"
		};
	}
}

class Text_forParagraph {
	appliesTo(node) {
		return new Text_inline().appliesTo(node)
	}

	parse(node, lookups) {
		return [{
			"data": {},
			"content": squashInlineTextAndCleanupWhitespace(new Text_inline().parse(node)),
			"nodeType": "paragraph"
		}]
	}
}

class ListItem {
	appliesTo(node) {
		return node["#name"] === "li"
	}

	parse(node, lookups) {
		if (new ListItem().appliesTo(node)) {
			if (node.$$.length !== 1) {
				if (node.$$.length !== 2) {
					throw new Error('only list-items with one child are supported')
				}
				if (!isNewline(node.$$[1]) && !isDivAroundNewline(node.$$[1])) {
					throw new Error('only list-items with one child are supported')
				}
			}
			return this._listItem(new Node()._parseSingle(node.$$[0]))
		}

		const handler = new List();
		if (handler.appliesTo(node)) {
			return this._listItem([handler._parseSingle(node)])
		}

		if (isDivWithOneElement(node)) {
			return new ListItem().parse(node.$$[0])
		}

		throw new Error('unsupported list content')

		function isDivAroundNewline(node) {
			return isDiv(node) && node.$$.length === 1 && isNewline(node.$$[0]);
		}

		function isDivWithOneElement(node) {
			return isDiv(node) && node.$$.length === 1;
		}
	}

	_listItem(content) {
		return {
			"data": {},
			"content": content,
			"nodeType": "list-item"
		}
	}
}

function isNewline(node) {
	return node["#name"] === "br"
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

function _parseInlineNodeContent(node, lookups) {
	return node.$$.flatMap(node => new Inline().parse(node, lookups));

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

function isDiv(node) {
	return node["#name"] === "div";
}

module.exports = {
	RootElementHandler: Node,
	squashInlineTextAndCleanupWhitespace,
	_text: value => new Text_inline()._text(value),
	inlineNewline: node => new Newline_inline()._parseSingle(node),
	link: (node, images) => new Link()._parseSingle(node, {images}),
}
