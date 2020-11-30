const xml2js = require('xml2js');

const parser = new xml2js.Parser(/* options */);

function paragraph(text) {
	return {
		"data": {},
		"content": [
			{
				"data": {},
				"marks": [],
				"value": text,
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
	const hash = node[0].$.hash
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

function parseNode(node, images) {
	if (node.br) return newline()
	if (node["en-media"]) return image(node["en-media"], images)
	return paragraph(node)
}

async function content2content(noteContent, images) {
	const parsedNodeContent = await parser.parseStringPromise(noteContent)
	return parsedNodeContent["en-note"].div.map(node => parseNode(node, images))
}

module.exports = {
	content2content
}
