const {content2content} = require("../lib.content2content");

it('should transform note-content to rich text', async () => {
	const fs = require('fs')
	const {note} = require('./exampleNote')
	const exampleContentfulEntryContentJson = fs.readFileSync('./__tests__/exampleContentfulEntryContent.json');
	const entryContent = JSON.parse(exampleContentfulEntryContentJson)

	expect(await content2content(note.content)).toEqual(entryContent)
})

it('should transform paragraphs', async () => {
	const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<div>Hello there</div>
<div>this is my first blogpost</div>
<div>hope you like it!</div>
</en-note>`
	const entryContent = [
		{
			"data": {},
			"content": [
				{
					"data": {},
					"marks": [],
					"value": "Hello there",
					"nodeType": "text"
				}
			],
			"nodeType": "paragraph"
		},
		{
			"data": {},
			"content": [
				{
					"data": {},
					"marks": [],
					"value": "this is my first blogpost",
					"nodeType": "text"
				}
			],
			"nodeType": "paragraph"
		},
		{
			"data": {},
			"content": [
				{
					"data": {},
					"marks": [],
					"value": "hope you like it!",
					"nodeType": "text"
				}
			],
			"nodeType": "paragraph"
		},
	]
	expect(await content2content(noteContent)).toEqual(entryContent)
})

it('should transform empty lines', async () => {
	const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<div>Hello there</div>
<div><br clear="none"/></div>
<div>hope you like it!</div>
</en-note>`
	const entryContent = [
		{
			"data": {},
			"content": [
				{
					"data": {},
					"marks": [],
					"value": "Hello there",
					"nodeType": "text"
				}
			],
			"nodeType": "paragraph"
		},
		{
			"data": {},
			"content": [
				{
					"data": {},
					"marks": [],
					"value": "",
					"nodeType": "text"
				}
			],
			"nodeType": "paragraph"
		},
		{
			"data": {},
			"content": [
				{
					"data": {},
					"marks": [],
					"value": "hope you like it!",
					"nodeType": "text"
				}
			],
			"nodeType": "paragraph"
		},
	]
	expect(await content2content(noteContent)).toEqual(entryContent)
})

describe('should transform images', () => {
	it('(without text)', async () => {
		const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<div>
  <en-media hash="373798d4ffbde8f490e01d418b9d2a01" type="image/png"></en-media>
</div>
</en-note>`
		const hash = "373798d4ffbde8f490e01d418b9d2a01"
		const assetId = "3n1RaUimNYsv0wGAtcEPn0";

		const entryContent = [
			{
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
			},
		]

		const images = {
			[hash]: {
				hash,
				assetId,
			}
		}

		expect(await content2content(noteContent, images)).toEqual(entryContent)
	})
})

