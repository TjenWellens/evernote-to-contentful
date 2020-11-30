const {createAssetsFromEvernoteResources} = require("./lib.resource2asset");
const {content2contentAsRichText} = require("./lib.content2content");
const {createOrUpdateEntry} = require("./lib.createEntry");

async function createEntryFromNote(note) {
	const responses = await createAssetsFromEvernoteResources(note.resources)

	console.log(responses)

	const images = responses.reduce((result, {asset, resource}) => ({
		...result,
		[resource.data.bodyHash.toString('hex')]: asset.sys.id
	}), {})
	const entryContent = await content2contentAsRichText(note.content, images)

	return createOrUpdateEntry({
		contentTypeId: 'everblog',
		entryId: note.guid,
		fields: {
			id: note.guid,
			title: note.title,
			content: entryContent,
			// todo
			tags: [
				"foo",
				"todo",
				"create actual tags"
			]
		}
	})
}

module.exports = {
	createEntryFromNote
}
