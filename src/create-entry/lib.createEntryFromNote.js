const {gatherReferences} = require("./lib.gatherReferences");
const {createAssetsFromEvernoteResources} = require("./lib.resource2asset");
const {content2contentAsRichText} = require("./content2content/lib.content2content");
const {createOrUpdateEntry} = require("../ext/contentful/lib.contentful.createEntry");
const {gatherClippings} = require("./lib.gatherClippings");

async function createImages(note) {
	if(!note.resources) return {}

	const responses = await createAssetsFromEvernoteResources(note.resources)

	const images = responses.reduce((result, {asset, resource}) => ({
		...result,
		[resource.data.bodyHash.toString('hex')]: asset.sys.id
	}), {})
	return images;
}

function everpostsLinked(references) {
	return references.map(id => ({sys: {
			type: 'Link',
			linkType: 'Entry',
			id: id
		}}))
}

async function createEntryFromNote(note, tags) {
	const images = await createImages(note);
	const clippings = await gatherClippings(note);

	const entryContent = await content2contentAsRichText(note.content, images, clippings)

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
			updateSequenceNum: note.updateSequenceNum,
			created: new Date(note.created).toISOString(),
			updated: new Date(note.updated).toISOString(),
			everpostsLinked: everpostsLinked(gatherReferences(entryContent.content)),
		}
	})
}

module.exports = {
	createEntryFromNote,
	createImages,
}
