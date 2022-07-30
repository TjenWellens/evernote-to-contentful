const {createEvernoteClient} = require("./lib.evernote");
const noteStore = createEvernoteClient().getNoteStore();

async function getTagsForNote(id) {
    return await noteStore.getNoteTagNames(id);
}

module.exports = {
    getTagsForNote
}