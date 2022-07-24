const {parseXmlToJs} = require("./evernote-xml-to-js-parser");

async function content2links(noteContent) {
    const content = await parseXmlToJs(noteContent)
    return []
}

module.exports = {
    content2links
}