function isImage(entry) {
	return entry.nodeType === "embedded-asset-block";
}

function yankImageToRoot(entry) {
	const child = entry.content[0];
	if (isImage(child))
		return child
	return entry
}

module.exports = {
	yankImageToRoot,
}
