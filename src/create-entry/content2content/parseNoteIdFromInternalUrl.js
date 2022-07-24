function parseNoteIdFromInternalUrl(url) {
	if (!url.startsWith("evernote:///")) throw new Error('not an internal url')
	return url.split('/')[6];
}

module.exports = {
	parseNoteIdFromInternalUrl,
}
