function isInternalUrl(url) {
	return url.startsWith("evernote:///view/");
}

function parseNoteIdFromInternalUrl(url) {
	if (!isInternalUrl(url)) throw new Error('not an internal url')
	return url.split('/')[6];
}

module.exports = {
	parseNoteIdFromInternalUrl,
	isInternalUrl,
}
