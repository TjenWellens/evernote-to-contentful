const {content2links} = require("../../create-entry/content2content/lib.content2links");

jest.mock('../../create-entry/content2content/lib.getAssetIdForHash')

describe('real world cases should parse', () => {
	const fs = require('fs')
	const basePath = './src/__tests__/content2content/failing-cases';

	test('parse case 690ab66a-dc65-4c46-a7f7-932d85566942', async () => {
		const id = '690ab66a-dc65-4c46-a7f7-932d85566942'
		const noteContent = fs.readFileSync(`${basePath}/note_${id}_content.xml`)
		const result = await content2links(noteContent)
		expect(result).toEqual([
			'https://www.youtube.com/watch?v=2zYxWEZ0gYg',
			'evernote:///view/30809684/s230/aefbbfb7-aa83-4336-ad37-754426b7d9f3/aefbbfb7-aa83-4336-ad37-754426b7d9f3/',
			'evernote:///view/30809684/s230/05c7c290-d8ef-499e-8a3b-b68067d52191/05c7c290-d8ef-499e-8a3b-b68067d52191/',
			'evernote:///view/30809684/s230/b8d9a582-cd66-4ac7-abf0-dfab6e8e3d7d/b8d9a582-cd66-4ac7-abf0-dfab6e8e3d7d/',
			'evernote:///view/30809684/s230/4875a4ed-acfa-4441-9220-7943fd889da3/4875a4ed-acfa-4441-9220-7943fd889da3/',
			'evernote:///view/30809684/s230/4875a4ed-acfa-4441-9220-7943fd889da3/4875a4ed-acfa-4441-9220-7943fd889da3/',
			'evernote:///view/30809684/s230/1d150a77-30b3-4bbf-ab9a-3feec87f74c4/1d150a77-30b3-4bbf-ab9a-3feec87f74c4/',
			'evernote:///view/30809684/s230/e7b93024-e42c-4d56-842d-403a64e04652/e7b93024-e42c-4d56-842d-403a64e04652/',
			'evernote:///view/30809684/s230/bb922d44-c45f-4974-8a39-f04847492dfb/bb922d44-c45f-4974-8a39-f04847492dfb/',
			'evernote:///view/30809684/s230/424d054d-6c86-4bd1-867d-88bc43c9d560/424d054d-6c86-4bd1-867d-88bc43c9d560/',
			'evernote:///view/30809684/s230/22bf3b34-5f03-4ac0-910c-2be90c969390/22bf3b34-5f03-4ac0-910c-2be90c969390/',
		])
	})
})
