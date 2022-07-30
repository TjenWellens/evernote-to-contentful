const {parseXmlToJs} = require("./evernote-xml-to-js-parser");

function hasChildren(node) {
    return node.$$ && node.$$.length !== 0
}

function isLink(node) {
    return node["#name"] === "a"
}

function getUrlFromLinkNode(node) {
    return node.$.href
}

function extractLinks(node) {
    if(isLink(node)) {
        return getUrlFromLinkNode(node)
    }

    if(hasChildren(node)) {
        return node.$$.flatMap(extractLinks)
    }

    return []
}

async function content2links(noteContent) {
    const content = await parseXmlToJs(noteContent)
    return content.$$.flatMap(extractLinks)
}

module.exports = {
    content2links
}