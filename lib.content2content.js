const xml2js = require('xml2js');

const parser = new xml2js.Parser({
	trim: true
});

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
	const result = []
	if (node["_"])
		result.push(paragraph(node["_"]))

	if (node["en-media"])
		result.push(image(node["en-media"], images))

	if (result.length === 0 && node["br"]) result.push(newline())

	if (result.length === 0)
		result.push(paragraph(node))

	return result
}

async function content2content(noteContent, images) {
	const parsedNodeContent = await parser.parseStringPromise(noteContent)
	return parsedNodeContent["en-note"].div.flatMap(node => parseNode(node, images))
}

module.exports = {
	content2content
}
