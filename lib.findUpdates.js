const {compareTagUpdates} = require("./lib.compareUpdates");
const {getTagUpdates: getContentfulTagUpdates} = require("./lib.contentful.getTagUpdates");
const {getTagUpdates: getEvernoteTagUpdates} = require("./lib.evernote.getTagUpdates");

const {compareNoteUpdates} = require("./lib.compareUpdates");

const {getNotesUpdates} = require("./lib.evernote.findNoteUpdates");
const {getBlogUpdates} = require("./lib.contentful.getBlogUpdates");

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
