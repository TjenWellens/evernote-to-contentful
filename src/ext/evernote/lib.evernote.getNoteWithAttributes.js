const {createEvernoteClient, NoteStore} = require("./lib.evernote");
const noteStore = createEvernoteClient().getNoteStore();

const resultSpec = new NoteStore.NoteResultSpec()

async function getNoteWithAttributes(guid) {
    return await noteStore.getNoteWithResultSpec(guid, resultSpec);
}

module.exports = {
    getNoteWithAttributes
}