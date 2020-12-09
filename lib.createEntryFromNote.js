const {createAssetsFromEvernoteResources} = require("./lib.resource2asset");
const {content2contentAsRichText} = require("./lib.content2content");
const {createOrUpdateEntry} = require("./lib.createEntry");

async function createImages(note) {
	if(!note.resources) return {}

	const responses = await createAssetsFromEvernoteResources(note.resources)

	const images = responses.reduce((result, {asset, resource}) => ({
		...result,
		[resource.data.bodyHash.toString('hex')]: asset.sys.id
	}), {})
	return images;
}

async function createEntryFromNote(note, tags) {
	const images = await createImages(note);

	const entryContent = await content2contentAsRichText(note.content, images)

	note.tagGuids = note.tagGuids || []

	const tagLinks = tags
		.filter(tag => note.tagGuids.includes(tag.guid))
		.map(tag => ({sys: {
			type: 'Link',
			linkType: 'Entry',
			id: tag.guid
		}}))

	return createOrUpdateEntry({
		contentTypeId: process.env.CONTENTFUL_BLOGPOST_ENTRY_TYPE_ID,
		entryId: note.guid,
		fields: {
			id: note.guid,
			title: note.title,
			content: entryContent,
			tags: tagLinks,
			updateSequenceNum: note.updateSequenceNum
		}
	})
}

module.exports = {
	createEntryFromNote
}
