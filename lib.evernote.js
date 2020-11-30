const evernote = require('evernote');

function createEvernoteClient() {
	return new evernote.Client({token: process.env.EVERNOTE_DEVELOPER_TOKEN});
}

module.exports = {
	createEvernoteClient,
	NoteStore: evernote.NoteStore,
}
