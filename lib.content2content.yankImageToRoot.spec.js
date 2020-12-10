const {yankImageToRoot} = require("./lib.content2content.yankImageToRoot");

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
