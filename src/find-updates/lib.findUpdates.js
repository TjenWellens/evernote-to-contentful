const {compareTagUpdates} = require("./lib.compareUpdates");
const {getTagUpdates: getContentfulTagUpdates} = require("../ext/contentful/lib.contentful.getTagUpdates");
const {getTagUpdates: getEvernoteTagUpdates} = require("../ext/evernote/lib.evernote.getTagUpdates");

const {compareNoteUpdates} = require("./lib.compareUpdates");

const {getNotesUpdates} = require("../ext/evernote/lib.evernote.findNoteUpdates");
const {getBlogUpdates} = require("../ext/contentful/lib.contentful.getBlogUpdates");

async function findUpdatedNoteIds(notebook) {
	const notes = await getNotesUpdates(notebook)
	const posts = await getBlogUpdates()

	return compareNoteUpdates(notes, posts);
}

async function findUpdatedTagIds(notebook) {
	const notes = await getEvernoteTagUpdates(notebook)
	const posts = await getContentfulTagUpdates()

	return compareTagUpdates(notes, posts);
}

module.exports = {
	findUpdatedNoteIds,
	findUpdatedTagIds,
}
