const {squashInlineNewline} = require("../../lib.content2content");
const {content2content} = require("../../lib.content2content");

describe('real world cases should parse', () => {
	const fs = require('fs')
	const basePath = './__tests__/content2content/failing-cases';

	test.each([
		['06df248a-df35-491f-90e4-9bed811e3ee2']
	])( 'case %s', async (id) => {
		const noteContent = fs.readFileSync(`${basePath}/note_${id}_content.xml`)
		const expectedContent = fs.readFileSync(`${basePath}/note_${id}_expected.json`)
		const result = await content2content(noteContent)
		expect(result).toEqual(JSON.parse(expectedContent))
	})
})
