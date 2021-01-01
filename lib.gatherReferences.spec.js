const {gatherReferences} = require("./lib.gatherReferences");


it('should gather a reference', () => {
	const input = [
		{
			"content": [
				{
					"content": [
						{
							"data": {},
							"marks": [],
							"nodeType": "text",
							"value": "Course: Advanced Distributed System Design - Udi Dahan"
						}
					],
					"data": {
						"target": {
							"sys": {
								"type": "Link",
								"linkType": "Entry",
								"id": "f08c4cb1-17ba-4b3d-8674-3c26583b1418"
							}
						}
					},
					"nodeType": "entry-hyperlink"
				}
			],
			"data": {},
			"nodeType": "paragraph"
		},
	]
	expect(gatherReferences(input)).toEqual([
		"f08c4cb1-17ba-4b3d-8674-3c26583b1418",
	])
})


it('should ignore text', () => {
	const input = [
		{
			"content": [
				{
					"data": {},
					"marks": [],
					"nodeType": "text",
					"value": "Course: Advanced Distributed System Design - Udi Dahan"
				}			],
			"data": {},
			"nodeType": "paragraph"
		},
	]
	expect(gatherReferences(input)).toEqual([
	])
})

it('should gather multiple references', () => {
	const input = [
		{
			"content": [
				{
					"data": {},
					"marks": [],
					"nodeType": "text",
					"value": "I was enrolled in the "
				},
				{
					"content": [
						{
							"data": {},
							"marks": [],
							"nodeType": "text",
							"value": "Course: Cloud Native Entrepreneur - Patrick Lee Scott"
						}
					],
					"data": {
						"target": {
							"sys": {
								"type": "Link",
								"linkType": "Entry",
								"id": "4ebd9da0-f2cf-41c6-b97b-7b7b80220794"
							}
						}
					},
					"nodeType": "entry-hyperlink"
				},
				{
					"data": {},
					"marks": [],
					"nodeType": "text",
					"value": " since December. In this\n\t\tcourse he teaches about cloud native (microservices and devops) and entrepreneurship."
				}
			],
			"data": {},
			"nodeType": "paragraph"
		},
		{
			"content": [
				{
					"data": {},
					"marks": [],
					"nodeType": "text",
					"value": "I enrolled in the "
				},
				{
					"content": [
						{
							"data": {},
							"marks": [],
							"nodeType": "text",
							"value": "Course: Advanced Distributed System Design - Udi Dahan"
						}
					],
					"data": {
						"target": {
							"sys": {
								"type": "Link",
								"linkType": "Entry",
								"id": "f08c4cb1-17ba-4b3d-8674-3c26583b1418"
							}
						}
					},
					"nodeType": "entry-hyperlink"
				},
				{
					"data": {},
					"marks": [],
					"nodeType": "text",
					"value": " where I picked up the\n\t\tidea that deciding which things are deployed on the same machine can be decided later"
				}
			],
			"data": {},
			"nodeType": "paragraph"
		},
		{
			"content": [
				{
					"content": [
						{
							"data": {},
							"marks": [],
							"nodeType": "text",
							"value": "Pattern: decouple logical and deployment boundary"
						}
					],
					"data": {
						"target": {
							"sys": {
								"type": "Link",
								"linkType": "Entry",
								"id": "e33f6643-ef8e-468f-9a33-7ca31ebf0909"
							}
						}
					},
					"nodeType": "entry-hyperlink"
				}
			],
			"data": {},
			"nodeType": "paragraph"
		},
		{
			"content": [
				{
					"content": [
						{
							"data": {},
							"marks": [],
							"nodeType": "text",
							"value": "Model: logical vs deployment boundary"
						}
					],
					"data": {
						"target": {
							"sys": {
								"type": "Link",
								"linkType": "Entry",
								"id": "d3b49e90-4ac4-4593-950c-7d318af98a00"
							}
						}
					},
					"nodeType": "entry-hyperlink"
				}
			],
			"data": {},
			"nodeType": "paragraph"
		},
		{
			"content": [
				{
					"data": {},
					"marks": [],
					"nodeType": "text",
					"value": "Later I got more serious about the problem to be solved: \"improve note taking while reading\" (see "
				},
				{
					"content": [
						{
							"data": {},
							"marks": [],
							"nodeType": "text",
							"value": "Mindmark.it - the origin story"
						}
					],
					"data": {
						"target": {
							"sys": {
								"type": "Link",
								"linkType": "Entry",
								"id": "f6cca091-b178-48c8-b7d4-63ba76bbb7a4"
							}
						}
					},
					"nodeType": "entry-hyperlink"
				},
				{
					"data": {},
					"marks": [],
					"nodeType": "text",
					"value": ")"
				}
			],
			"data": {},
			"nodeType": "paragraph"
		}
	]
	expect(gatherReferences(input)).toEqual([
		"4ebd9da0-f2cf-41c6-b97b-7b7b80220794",
		"f08c4cb1-17ba-4b3d-8674-3c26583b1418",
		"e33f6643-ef8e-468f-9a33-7ca31ebf0909",
		"d3b49e90-4ac4-4593-950c-7d318af98a00",
		"f6cca091-b178-48c8-b7d4-63ba76bbb7a4",
	])
})
