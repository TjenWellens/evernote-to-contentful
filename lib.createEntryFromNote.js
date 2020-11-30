const {createAssetsFromEvernoteResources} = require("./lib.resource2asset");
const {content2contentAsRichText} = require("./lib.content2content");
const {createOrUpdateEntry} = require("./lib.createEntry");

async function createEntryFromNote(note, tags) {
	const responses = await createAssetsFromEvernoteResources(note.resources)

	console.log(responses)

	const images = responses.reduce((result, {asset, resource}) => ({
		...result,
		[resource.data.bodyHash.toString('hex')]: asset.sys.id
	}), {})
	const entryContent = await content2contentAsRichText(note.content, images)

	const tagNames = tags
		.filter(tag => note.tagGuids.includes(tag.guid))
		.map(tag => tag.name)

	return createOrUpdateEntry({
		contentTypeId: process.env.CONTENTFUL_BLOGPOST_ENTRY_TYPE_ID,
		entryId: note.guid,
		fields: {
			id: note.guid,
			title: note.title,
			content: entryContent,
			tags: tagNames
		}
	})
}

module.exports = {
	createEntryFromNote
}
