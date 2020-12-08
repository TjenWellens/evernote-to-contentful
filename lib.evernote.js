const evernote = require('evernote');

function createEvernoteClient() {
	return new evernote.Client({
		token: process.env.EVERNOTE_TOKEN,
		sandbox: process.env.EVERNOTE_IS_SANDBOX === 'true',
		china: false,
	});
}

module.exports = {
	createEvernoteClient,
	NoteStore: evernote.NoteStore,
}
