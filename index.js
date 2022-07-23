require('dotenv').config()
const assert = require('node:assert/strict');

const {findNotebook, findTags, findNotes} = require("./lib.findPublishedBlogposts");
const {createEntryFromTag} = require("./lib.createEntryFromTag");
const {createEntryFromNote} = require("./lib.createEntryFromNote");
const {findUpdatedNoteIds} = require("./lib.findUpdates");
const {findNoteById} = require("./lib.findPublishedBlogposts");
const fs = require('fs');
const {findUpdatedTagIds} = require("./lib.findUpdates");

async function createNotes(noteIds, tags) {
	console.log(`creating/updating ${noteIds.length} notes...`)
	let success = 0
	let failed = 0
	for (const id of noteIds) {
		const note = await findNoteById(id)
		console.log(`creating note... "${note.title}" [${note.guid}]`)
		await createEntryFromNote(note, tags)
			.then(entry => {
				console.log(`note created: "${note.title}" [${note.guid}]`)
				success++
				return entry
			})
			.catch(e => {
				console.error(`'ERROR: Failed to create note "${note.title}" [${note.guid}]`)
				fs.writeFileSync(`errors/note_${id}_content.xml`, note.content)
				fs.writeFileSync(`errors/note_${id}_error.txt`, `'ERROR: Failed to create note "${note.title}" [${note.guid}]

				message: ${e.message}

				stack: ${e.stack}
				`)
				failed++
			})

	}
	console.log(`${success} notes created (${failed} failed)`)
}

async function createTags(tagIds, allTags) {
	const tags = allTags.filter(tag => tagIds.includes(tag.guid));
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

	const tagUpdates = await findUpdatedTagIds(notebook)
	console.log(`tags found:
	stable: ${tagUpdates.stable.length}
	updated: ${tagUpdates.updated.length}
	created: ${tagUpdates.created.length}
	removed: ${tagUpdates.removed.length}
	`)
	const tags = await findTags(notebook)
	await createTags([...tagUpdates.created, ...tagUpdates.updated], tags)

	// const notes = await findNotes(notebook)
	const {stable, updated, created, removed} = await findUpdatedNoteIds(notebook)

	console.log(`notes found:
	stable: ${stable.length}
	updated: ${updated.length}
	created: ${created.length}
	removed: ${removed.length}
	`)

	await createNotes([...created, ...updated], tags)

	// const noteEntries = await Promise.all(notes.map(note => createEntryFromNote(note, tags)))
}

function assertEnvVariables() {
	assert.ok(process.env.EVERNOTE_TOKEN)
	assert.ok(process.env.EVERNOTE_NOTESTORE_URL)
	assert.ok(process.env.CONTENTFUL_SPACE)
	assert.ok(process.env.CONTENTFUL_ENVIRONMENT)
	assert.ok(process.env.CONTENTFUL_BLOGPOST_ENTRY_TYPE_ID)
	assert.ok(process.env.CONTENTFUL_TAG_ENTRY_TYPE_ID)
	assert.ok(process.env.CONTENTFUL_CONTENT_MANAGEMENT_API_KEY)
}

assertEnvVariables();
note2post()
	.catch(reason => {
		console.error(reason)
		console.log({
			EVERNOTE_NOTESTORE_URL: process.env.EVERNOTE_NOTESTORE_URL,
			CONTENTFUL_SPACE: process.env.CONTENTFUL_SPACE,
			CONTENTFUL_ENVIRONMENT: process.env.CONTENTFUL_ENVIRONMENT,
			CONTENTFUL_BLOGPOST_ENTRY_TYPE_ID: process.env.CONTENTFUL_BLOGPOST_ENTRY_TYPE_ID,
			CONTENTFUL_TAG_ENTRY_TYPE_ID: process.env.CONTENTFUL_TAG_ENTRY_TYPE_ID,
		})
		throw new Error("did not finish correctly")
	})
