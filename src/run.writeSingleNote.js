require('dotenv').config()

const {findNoteById} = require("./ext/evernote/lib.evernote.findPublishedBlogposts");
const fs = require('fs');
const {createImages} = require("./create-entry/lib.createEntryFromNote");
const {content2contentAsRichText} = require("./create-entry/content2content/lib.content2content");

async function run(id) {
	const note = await findNoteById(id)
	const images = await createImages(note);
	const entryContent = await content2contentAsRichText(note.content, images)
	fs.writeFileSync(`note_${id}_content.xml`, note.content)
	await fs.writeFileSync(`note_${id}_entry-content.json`, JSON.stringify(entryContent))
}

run('6860b5a8-2ef4-43f3-9915-53f5f17ad10a')
