const {squashInlineNewline} = require("../../lib.content2content");
const {content2content} = require("../../lib.content2content");
const {getAssetIdForHash} = require("../../lib.getAssetIdForHash");

jest.mock('../../lib.getAssetIdForHash')

describe('real world cases should parse', () => {
	const fs = require('fs')
	const basePath = './__tests__/content2content/failing-cases';

	const images = {}
	getAssetIdForHash.mockImplementation(() => 'someMockedResourceId')

	test.each([
		['06df248a-df35-491f-90e4-9bed811e3ee2'],
	])('check case %s', async (id) => {
		const noteContent = fs.readFileSync(`${basePath}/note_${id}_content.xml`)
		const expectedContent = fs.readFileSync(`${basePath}/note_${id}_expected.json`)
		const result = await content2content(noteContent, images)
		expect(result).toEqual(JSON.parse(expectedContent))
	})

	test.each([
		['3ed9cba4-96c2-4791-8c18-4bad86a8f09f'],
	])('parse case %s', async (id) => {
		const noteContent = fs.readFileSync(`${basePath}/note_${id}_content.xml`)
		const result = await content2content(noteContent, images)
	})
})
