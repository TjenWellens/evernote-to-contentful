const {parseNoteIdFromInternalUrl} = require("./lib.content2content.parseNoteIdFromInternalUrl");

it('should parse noteId', () => {
	const id = `c91a6abd-cec2-426c-8685-2fd03460c23d`;
	const input = `evernote:///view/590605/s1/${id}/${id}/`
	expect(parseNoteIdFromInternalUrl(input)).toEqual(id)
})
