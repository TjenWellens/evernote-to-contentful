function isImage(entry) {
	return entry.nodeType === "embedded-asset-block";
}

function hasChildren(entry) {
	return entry.content && entry.content.length > 0;
}

function yankImageToRoot(entry) {
	if (hasChildren(entry) && isImage(entry.content[0]))
		return entry.content[0]
	return entry
}

module.exports = {
	yankImageToRoot,
}
