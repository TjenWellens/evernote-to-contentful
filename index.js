require('dotenv').config()

const {findNotebook, findTags, findNotes} = require("./lib.findPublishedBlogposts");
const {createEntryFromTag} = require("./lib.createEntryFromTag");
const {createEntryFromNote} = require("./lib.createEntryFromNote");
const {findUpdatedNoteIds} = require("./lib.findUpdates");
const {findNoteById} = require("./lib.findPublishedBlogposts");


async function createNotes(noteIds, tags) {
	console.log(`creating/updating ${noteIds.length} notes...`)
	let success = 0
	let failed = 0
	for (const id of noteIds) {
		const note = await findNoteById(id)
		await createEntryFromNote(note, tags)
			.then(_ => success++)
			.catch(_ => failed++)
	}
	console.log(`${success} notes created (${failed} failed)`)
}

async function createTags(tags) {
	console.log(`creating ${tags.length} tags...`)
	let success = 0
	let failed = 0
	for (const tag of tags) {
		await createEntryFromTag(tag)
			.then(_ => success++)
			.catch(_ => failed++)
	}
	console.log(`${success} tags created (${failed} failed)`)
}

async function note2post() {
	const notebook = await findNotebook("Blog")
	const tags = await findTags(notebook)
	await createTags(tags)

	// const notes = await findNotes(notebook)
	const {stable, updated, created, removed} = await findUpdatedNoteIds(notebook);

	console.log(`notes found:
	stable: ${stable.length}
	updated: ${updated.length}
	created: ${created.length}
	removed: ${removed.length}
	`)

	await createNotes([...created, ...updated], tags);

	// const noteEntries = await Promise.all(notes.map(note => createEntryFromNote(note, tags)))
}

note2post()
