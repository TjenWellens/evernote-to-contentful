require('dotenv').config()

const {findNotebook, findTags, findNotes} = require("./lib.findPublishedBlogposts");
const {createEntryFromTag} = require("./lib.createEntryFromTag");
const {createEntryFromNote} = require("./lib.createEntryFromNote");
const {findUpdatedNoteIds} = require("./lib.findUpdates");
const {findNoteById} = require("./lib.findPublishedBlogposts");
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
				return entry
			})
			.catch(e => {
				console.error(`'ERROR: Failed to create note "${note.title}" [${note.guid}]
				message: ${e.message}
				stack: ${e.stack}
				`)
				failed++
			})

	}
	console.log(`${success} notes created (${failed} failed)`)
}

async function note2post() {
	const notebook = await findNotebook("Blog")
	const tags = await findTags(notebook)

	const id = '06df248a-df35-491f-90e4-9bed811e3ee2'

	await createNotes([id], tags)

	// const noteEntries = await Promise.all(notes.map(note => createEntryFromNote(note, tags)))
}

note2post()
