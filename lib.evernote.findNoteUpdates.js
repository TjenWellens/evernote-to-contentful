const {NoteStore} = require("evernote");
const {createEvernoteClient} = require("./lib.evernote");

const noteStore = createEvernoteClient().getNoteStore();

async function* getNotesGenerator(notebook, preferredPageSize = 100) {
	const filter = new NoteStore.NoteFilter({
		notebookGuid: notebook.guid,
	});
	const spec = new NoteStore.NotesMetadataResultSpec({
		includeUpdated: true,
		includeTitle: false,
		includeContentLength: false,
		includeCreated: false,
		includeDeleted: false,
		includeUpdateSequenceNum: true,
		includeNotebookGuid: false,
		includeTagGuids: false,
		includeAttributes: false,
		includeLargestResourceMime: false,
		includeLargestResourceSize: false,
	});

	let page = 0
	let res
	do {
		res = await noteStore.findNotesMetadata(filter, entryCount(), preferredPageSize, spec)
		for (const entry of res.notes) {
			yield entry
		}
		page += 1
	} while (res.totalNotes > entryCount())

	function entryCount() {
		if(!res) return 0
		return res.startIndex + res.notes.length
	}
}

async function toArray(promisedGenerator) {
	const result = []
	for await (const entry of promisedGenerator) {
		result.push(entry)
	}
	return result
}

async function getNotesUpdates(notebook) {
	const notes = await toArray(getNotesGenerator(notebook));
	return notes.map(({guid, updated, updateSequenceNum}) => ({
		id: guid,
		updated,
		updateSequenceNum
	}))
}

module.exports = {
	getNotesUpdates,
}
