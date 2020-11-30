const {createEvernoteClient, NoteStore} = require("./lib.evernote");

const client = createEvernoteClient()

const noteStore = client.getNoteStore();

function findPublishedNotes(notebook, publishedTag) {
	const filter = new NoteStore.NoteFilter({
		notebookGuid: notebook.guid,
		tagGuids: [
			publishedTag.guid,
		],
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
			// console.log(notesMetadataList)
			// todo: paging?
			return notesMetadataList.notes
		});
}

function findNotebook(name) {
	return noteStore.listNotebooks().then(notebooks => {
		return notebooks.find(notebook => name === notebook.name)
		// for (var i in notebooks) {
		// 	console.log("Notebook: " + notebooks[i].name);
		// }
	});
}

function findTags(notebook) {
	return noteStore.listTagsByNotebook(notebook.guid)
}

async function findPublishedTag(notebook) {
	const tags = await noteStore.listTagsByNotebook(notebook.guid)
	// console.log(tags)
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

async function findPublishedBlogposts() {
	const notebook = await findNotebook("Blog")
	console.log(`${notebook.name}\t${notebook.guid}`)

	const published = await findPublishedTag(notebook)
	console.log(`${published.name}\t${published.guid}`)

	const publishedNotes = await findPublishedNotes(notebook, published)
	// console.log(publishedNotes)
	publishedNotes.forEach(post => {
		console.log(`${post.title}\t${post.guid}`)
	})

	const publishedFullNotes = await fetchFullNotes(publishedNotes)
	return {
		notes: publishedFullNotes,
		tags: await findTags(notebook)
	}
}

module.exports = {
	findPublishedBlogposts,
}
