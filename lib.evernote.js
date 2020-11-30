const evernote = require('evernote');

function createEvernoteClient() {
	return new evernote.Client({token: process.env.EVERNOTE_TOKEN});
}

module.exports = {
	createEvernoteClient,
	NoteStore: evernote.NoteStore,
}
