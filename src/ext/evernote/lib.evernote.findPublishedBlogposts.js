const {createEvernoteClient, NoteStore} = require("./lib.evernote");

const client = createEvernoteClient()

const noteStore = client.getNoteStore();

function findPublishedNotes(notebook, publishedTag) {
	return findNotesMetadata(notebook, {
		tagGuids: [
			publishedTag.guid,
		],
	})
}

function findNotesMetadata(notebook, query={}) {
	const filter = new NoteStore.NoteFilter({
		...query,
		notebookGuid: notebook.guid,
	});
	const spec = new NoteStore.NotesMetadataResultSpec({
		includeTitle: true,
		includeContentLength: true,
		includeCreated: true,
		includeUpdated: true,
		includeDeleted: true,
		includeUpdateSequenceNum: true,
		includeNotebookGuid: true,
		includeTagGuids: true,
		includeAttributes: true,
		includeLargestResourceMime: true,
		includeLargestResourceSize: true,
	});

	return noteStore.findNotesMetadata(filter, 0, 500, spec)
		.then((notesMetadataList) => {
			// todo: paging?
			return notesMetadataList.notes
		});
}

function findNotes(notebook) {
	return findNotesMetadata(notebook)
		.then(fetchFullNotes)
}

async function findNotebook(name) {
	const notebooks = await noteStore.listNotebooks();
	return notebooks.find(notebook => name === notebook.name)
}

function findTags(notebook) {
	return noteStore.listTagsByNotebook(notebook.guid)
}

async function findPublishedTag(notebook) {
	const tags = await noteStore.listTagsByNotebook(notebook.guid)
	return tags.find(({name}) => name === "published")
}

function fetchFullNotes(publishedNotes) {
	const notesPromises = publishedNotes.map(noteMetadata => fetchFullNote(noteMetadata));
	return Promise.all(notesPromises)
}

function fetchFullNote(metadata) {
	return noteStore.getNoteWithResultSpec(metadata.guid, {
		includeContent: true,
		includeResourcesData: false,
	})
}

function findNoteById(id) {
	return fetchFullNote({guid: id})
}

module.exports = {
	findNotebook,
	findTags,
	findNotes,
	findNoteById,
}
