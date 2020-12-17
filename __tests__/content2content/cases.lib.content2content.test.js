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

	test('check case dd05b0c8-9954-424c-a8a5-a3763ae5be6e', async () => {
		const noteContent = fs.readFileSync(`${basePath}/note_dd05b0c8-9954-424c-a8a5-a3763ae5be6e_content.xml`)
		const expectedContent = fs.readFileSync(`${basePath}/note_dd05b0c8-9954-424c-a8a5-a3763ae5be6e_expected.json`)
		getAssetIdForHash.mockImplementation(() => '931c5646-2f71-4646-b32d-78f6b5c61fc8')
		const result = await content2content(noteContent, images)
		expect(result).toEqual(JSON.parse(expectedContent))
	})

	test('check case 3ed9cba4-96c2-4791-8c18-4bad86a8f09f', async () => {
		const noteContent = fs.readFileSync(`${basePath}/note_3ed9cba4-96c2-4791-8c18-4bad86a8f09f_content.xml`)
		const expectedContent = fs.readFileSync(`${basePath}/note_3ed9cba4-96c2-4791-8c18-4bad86a8f09f_expected.json`)
		getAssetIdForHash.mockImplementation(() => 'foo-asset-id')
		const result = await content2content(noteContent, images)
		expect(result).toEqual(JSON.parse(expectedContent))
	})

	test.each([
		['3ed9cba4-96c2-4791-8c18-4bad86a8f09f'],
		['f8e6a7e0-3fdf-4555-84fb-f72668066c88'],
		['0e0bc924-9a80-45a9-8e4e-a052306b652a'],
		['49703f01-1bff-4726-bf27-bf4ed2549332'],
		['6e72bb1d-d0d4-462f-8751-0845782e5a00'],
		['690ab66a-dc65-4c46-a7f7-932d85566942'],
		['b5c91703-724f-4174-83a0-5fa8f99fdd9d'],
		['5dc19a5e-12d8-47b4-9bac-dec0d8fc65e3'],
		['eef32f08-24e5-4640-b791-449dba4ac52e'],
		['e862e475-4415-4f9d-ab5f-c7c2fa91fb9b'],
	])('parse case %s', async (id) => {
		const noteContent = fs.readFileSync(`${basePath}/note_${id}_content.xml`)
		const result = await content2content(noteContent, images)
	})

	test('parse case f08c4cb1-17ba-4b3d-8674-3c26583b1418', async () => {
		const id = 'f08c4cb1-17ba-4b3d-8674-3c26583b1418'
		const noteContent = fs.readFileSync(`${basePath}/note_${id}_content.xml`)
		const result = await content2content(noteContent, images)
	})
})
