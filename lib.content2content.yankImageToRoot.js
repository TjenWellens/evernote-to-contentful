function isImage(entry) {
	return entry.nodeType === "embedded-asset-block";
}

function hasChildren(entry) {
	return entry.content;
}

function yankImageToRoot(entry) {
	if (hasChildren(entry) && isImage(entry.content[0]))
		return entry.content[0]
	return entry
}

module.exports = {
	yankImageToRoot,
}
