function findAllNodes(node) {
	if (!node.content || !node.content.length || node.content.length === 0)
		return [node]

	return [
		node,
		...node.content.flatMap(findAllNodes)
	]
}

function isEntryHyperlink(node) {
	return node.nodeType === 'entry-hyperlink';
}

function parseReferenceId(entryHyperlink) {
	return entryHyperlink.data.target.sys.id
}

function gatherReferences(noteEntryContent) {
	return noteEntryContent.flatMap(findAllNodes)
		.filter(isEntryHyperlink)
		.map(parseReferenceId)
}

module.exports = {
	gatherReferences,
}
