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
		includeUpdateSequenceNum: false,
		includeNotebookGuid: false,
		includeTagGuids: false,
		includeAttributes: false,
		includeLargestResourceMime: false,
		includeLargestResourceSize: false,
	});

	let page = 0
	let res
	do {
		res = await noteStore.findNotesMetadata(filter, page * entryCount(), preferredPageSize, spec)
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

async function findUpdatedNotes(notebook, query = {}) {
	const filter = new NoteStore.NoteFilter({
		...query,
		notebookGuid: notebook.guid,
	});
	const spec = new NoteStore.NotesMetadataResultSpec({
		includeUpdated: true,
		includeTitle: false,
		includeContentLength: false,
		includeCreated: false,
		includeDeleted: false,
		includeUpdateSequenceNum: false,
		includeNotebookGuid: false,
		includeTagGuids: false,
		includeAttributes: false,
		includeLargestResourceMime: false,
		includeLargestResourceSize: false,
	});

	const offset = 0;
	const limitPerPage = 500;
	const res = await noteStore.findNotesMetadata(filter, offset, limitPerPage, spec)

	return res.notes
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
	return notes.map(({guid, updated}) => ({
		id: guid,
		updated
	}))
}

module.exports = {
	getNotesUpdates,
}
