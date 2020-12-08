const {compareUpdates} = require("./lib.compareUpdates");

const {getNotesUpdates} = require("./lib.evernote.findNoteUpdates");
const {getBlogUpdates} = require("./lib.contentful.getBlogUpdates");

async function findUpdatedNoteIds(notebook) {
	const notes = await getNotesUpdates(notebook)
	const posts = await getBlogUpdates()

	return compareUpdates(notes, posts);
}

module.exports = {
	findUpdatedNoteIds,
}
