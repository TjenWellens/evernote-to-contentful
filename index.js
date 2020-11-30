require('dotenv').config()

const {findPublishedBlogposts} = require("./lib.findPublishedBlogposts");
const {createEntryFromNote} = require("./lib.createEntryFromNote");

async function note2post() {
	const {notes, tags} = await findPublishedBlogposts()

	const entries = Promise.all(notes.map(note => createEntryFromNote(note, tags)))
}

note2post()
