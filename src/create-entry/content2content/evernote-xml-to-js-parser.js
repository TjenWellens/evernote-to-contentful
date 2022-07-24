const xml2js = require('xml2js');

const parser = new xml2js.Parser({
    // trim: true,
    preserveChildrenOrder: true,
    explicitChildren: true,
    charsAsChildren: true,
});

async function parseXmlToJs(noteContent) {
    const parsedNodeContent = await parser.parseStringPromise(noteContent)
    const content = parsedNodeContent["en-note"];
    return content;
}

module.exports = {
    parseXmlToJs
}