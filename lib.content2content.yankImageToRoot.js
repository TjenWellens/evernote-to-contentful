function isImage(entry) {
	return entry.nodeType === "embedded-asset-block";
}

function hasOneChild(entry) {
	return entry.content && entry.content.length > 0;
}

function getFirstChild(entry) {
	return entry.content[0];
}

function yankImageToRoot(entry) {
	if (hasOneChild(entry) && isImage(getFirstChild(entry)))
		return getFirstChild(entry)
	return entry
}

module.exports = {
	yankImageToRoot,
}
