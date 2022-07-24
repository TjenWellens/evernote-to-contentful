const {yankImageToRoot} = require("./yankImageToRoot");

it('should return the same when no image', () => {
	const input = {
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
	}
	expect(yankImageToRoot(input)).toEqual(input)
})

it('should yank image one level', () => {
	const input = {
		"content": [
			{
				"content": [],
				"data": {
					"target": {
						"sys": {
							"id": "2pWcZnigT6iUOMDJlEZyLr",
							"linkType": "Asset",
							"type": "Link"
						}
					}
				},
				"nodeType": "embedded-asset-block"
			}
		],
		"data": {},
		"nodeType": "paragraph"
	}
	expect(yankImageToRoot(input)).toEqual({
		"content": [],
		"data": {
			"target": {
				"sys": {
					"id": "2pWcZnigT6iUOMDJlEZyLr",
					"linkType": "Asset",
					"type": "Link"
				}
			}
		},
		"nodeType": "embedded-asset-block"
	})
})

it('should work with text entry', () => {
	const input = {
		"data": {},
		"marks": [],
		"value": "Here is an image",
		"nodeType": "text"
	}
	expect(yankImageToRoot(input)).toEqual(input)
})

it('should work with image entry', () => {
	const input = {
		"content": [],
		"data": {
			"target": {
				"sys": {
					"id": "3n1RaUimNYsv0wGAtcEPn0",
					"linkType": "Asset",
					"type": "Link"
				}
			}
		},
		"nodeType": "embedded-asset-block"
	}
	expect(yankImageToRoot(input)).toEqual(input)
})
