function yankImageToRoot(entry) {
	if(entry.content[0].nodeType === "embedded-asset-block")
		return entry.content[0]
	return entry
}

module.exports = {
	yankImageToRoot,
}
