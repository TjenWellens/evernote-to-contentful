function isImage(entry) {
	return entry.nodeType === "embedded-asset-block";
}

function yankImageToRoot(entry) {
	if (entry.content && isImage(entry.content[0]))
		return entry.content[0]
	return entry
}

module.exports = {
	yankImageToRoot,
}
