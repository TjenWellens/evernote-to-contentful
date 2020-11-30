const {content2content} = require("../lib.content2content");

it('should transform note-content to rich text', async () => {
	const fs = require('fs')
	const {note} = require('./exampleNote')
	const entryJson = fs.readFileSync('./__tests__/exampleContentfulEntry.json');
	const entry = JSON.parse(entryJson)
	const entryContent = entry.fields.content["en-US"].content

	const images = {
		"215f60a9a488d2683632fce8526d2959": {assetId: "766297c1-ea9b-4f66-aad2-66c7b42c133f"},
		"373798d4ffbde8f490e01d418b9d2a01": {assetId: "1b88f389-19df-4417-bde1-f759abc8a542"},
	}

	expect(await content2content(note.content, images)).toEqual(entryContent)
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
	it('(with text)', async () => {
		const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<div>
  Here is an image
  <br clear="none"/>
  <en-media hash="215f60a9a488d2683632fce8526d2959" type="image/png"></en-media>
</div>
</en-note>`
		const hash = "215f60a9a488d2683632fce8526d2959"
		const assetId = "2pWcZnigT6iUOMDJlEZyLr";

		const entryContent = [
			{
				"data": {},
				"content": [
					{
						"data": {},
						"marks": [],
						"value": "Here is an image",
						"nodeType": "text"
					}
				],
				"nodeType": "paragraph"
			},
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

describe('should transform list', () => {
	it('ordered', async () => {
		const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<ol>
<li>first</li>
<li>second</li>
<li>third</li>
</ol>
</en-note>`
		const entryContent = [
			{
				"data": {},
				"content": [
					{
						"data": {},
						"content": [
							{
								"data": {},
								"content": [
									{
										"data": {},
										"marks": [],
										"value": "first",
										"nodeType": "text"
									}
								],
								"nodeType": "paragraph"
							}
						],
						"nodeType": "list-item"
					},
					{
						"data": {},
						"content": [
							{
								"data": {},
								"content": [
									{
										"data": {},
										"marks": [],
										"value": "second",
										"nodeType": "text"
									}
								],
								"nodeType": "paragraph"
							}
						],
						"nodeType": "list-item"
					},
					{
						"data": {},
						"content": [
							{
								"data": {},
								"content": [
									{
										"data": {},
										"marks": [],
										"value": "third",
										"nodeType": "text"
									}
								],
								"nodeType": "paragraph"
							}
						],
						"nodeType": "list-item"
					}
				],
				"nodeType": "ordered-list"
			},
		]
		expect(await content2content(noteContent)).toEqual(entryContent)
	})

	it('unordered', async () => {
		const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<ul>
<li>aaa</li>
<li>bbb</li>
</ul>
</en-note>`
		const entryContent = [
			{
				"data": {},
				"content": [
					{
						"data": {},
						"content": [
							{
								"data": {},
								"content": [
									{
										"data": {},
										"marks": [],
										"value": "aaa",
										"nodeType": "text"
									}
								],
								"nodeType": "paragraph"
							}
						],
						"nodeType": "list-item"
					},
					{
						"data": {},
						"content": [
							{
								"data": {},
								"content": [
									{
										"data": {},
										"marks": [],
										"value": "bbb",
										"nodeType": "text"
									}
								],
								"nodeType": "paragraph"
							}
						],
						"nodeType": "list-item"
					}
				],
				"nodeType": "unordered-list"
			},
		]
		expect(await content2content(noteContent)).toEqual(entryContent)
	})
})
