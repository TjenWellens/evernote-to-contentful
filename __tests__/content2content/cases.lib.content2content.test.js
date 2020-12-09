const {squashInlineNewline} = require("../../lib.content2content");
const {content2content} = require("../../lib.content2content");

describe('real world cases should parse', () => {
	const fs = require('fs')
	const basePath = './__tests__/content2content/failing-cases';

	test.each([
		['note_06df248a-df35-491f-90e4-9bed811e3ee2_content.xml']
	])( 'case %s', async (fileName) => {
		const noteContent = fs.readFileSync(`${basePath}/${fileName}`)
		await content2content(noteContent)
		// no error expected
	})
})
