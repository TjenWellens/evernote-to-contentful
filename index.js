require('dotenv').config()

const {findNotebook, findTags, findNotes} = require("./lib.findPublishedBlogposts");
const {createEntryFromTag} = require("./lib.createEntryFromTag");
const {createEntryFromNote} = require("./lib.createEntryFromNote");


async function note2post() {
	const notebook = await findNotebook("Blog")
	const tags = await findTags(notebook)
	const notes = await findNotes(notebook)

	const tagEntries = await Promise.all(tags.map(tag => createEntryFromTag(tag)))
	const noteEntries = await Promise.all(notes.map(note => createEntryFromNote(note, tags)))
}

note2post()
