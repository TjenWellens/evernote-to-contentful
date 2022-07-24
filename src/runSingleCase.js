require('dotenv').config()

const {findNotebook, findTags, findNotes} = require("./ext/evernote/lib.evernote.findPublishedBlogposts");
const {createEntryFromTag} = require("./lib.createEntryFromTag");
const {createEntryFromNote} = require("./lib.createEntryFromNote");
const {findUpdatedNoteIds} = require("./find-updates/lib.findUpdates");
const {findNoteById} = require("./ext/evernote/lib.evernote.findPublishedBlogposts");
const fs = require('fs');

async function createNotes(noteIds, tags) {
	console.log(`creating/updating ${noteIds.length} notes...`)
	let success = 0
	let failed = 0
	for (const id of noteIds) {
		const note = await findNoteById(id)
		await createEntryFromNote(note, tags)
			.then(entry => {
				console.log(`note created: "${note.title}" [${note.guid}]`)
				success++
				fs.writeFileSync(`note_${id}_content.xml`, note.content)
				fs.writeFileSync(`note_${id}_entry.json`, JSON.stringify(entry))
				return entry
			})
			.catch(e => {
				console.error(`'ERROR: Failed to create note "${note.title}" [${note.guid}]
				message: ${e.message}
				stack: ${e.stack}
				`)
				fs.writeFileSync(`note_${id}_content.xml`, note.content)
				failed++
			})

	}
	console.log(`${success} notes created (${failed} failed)`)
}

async function note2post() {
	const notebook = await findNotebook("Blog")
	const tags = await findTags(notebook)

	const id = '1521a489-f1ab-44e7-9024-142bb98982c3'

	await createNotes([id], tags)

	// const noteEntries = await Promise.all(notes.map(note => createEntryFromNote(note, tags)))
}

note2post()
