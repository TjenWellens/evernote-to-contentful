const {content2links} = require("./content2content/lib.content2links");
const {isInternalLink, parseNoteIdFromInternalUrl} = require("./content2content/parseNoteIdFromInternalUrl");
const {getTagsForNote} = require("../ext/evernote/lib.evernote.getTagsFromNote");
const {getNoteWithAttributes} = require("../ext/evernote/lib.evernote.getNoteWithAttributes");

function getPotentialClippingNoteIds(links) {
    return links.filter(isInternalLink).map(parseNoteIdFromInternalUrl);
}

async function gatherNoteIdsOfPotentialClippings(note) {
    const links = await content2links(note.content)
    const noteIds = getPotentialClippingNoteIds(links);
    return noteIds;
}

function withTags(noteId) {
    return getTagsForNote(noteId)
        .then(tags => {
            return {
                guid: noteId, tags
            }
        });
}

async function enrichWithTags(potentialClippings) {
    return (await Promise.all(potentialClippings.map(withTags)));
}

function isNoteClipped({guid, tags}) {
    return tags.includes("clipping")
}

async function enrichWithAttributes(note) {
    const guid = note.guid
    let noteWithAttrs = await getNoteWithAttributes(guid);
    return {
        ...note,
        ...noteWithAttrs
    };
}

function reduceNotesToClippingLookup(lookup, note) {
    lookup[note.guid] = note.attributes.sourceURL
    return lookup
}

async function gatherClippings(note) {
    const potentialClippings = await gatherNoteIdsOfPotentialClippings(note);
    const idsWithTags = await enrichWithTags(potentialClippings);
    const clippingIds = idsWithTags
        .filter(isNoteClipped)
    const clippingNotes = await Promise.all(
        clippingIds.map(enrichWithAttributes)
    );
    return clippingNotes
        .reduce(reduceNotesToClippingLookup, {})
}

module.exports = {
    gatherClippings,
    _getPotentialClippingNoteIds: getPotentialClippingNoteIds,
}