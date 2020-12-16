const {getEntriesGenerator} = require("./lib.contentful.getEntryUpdates");
const {toArray} = require("./lib.contentful.getEntryUpdates");

async function getBlogUpdates() {
	const entries = await toArray(getEntriesGenerator(process.env.CONTENTFUL_BLOGPOST_ENTRY_TYPE_ID, 'sys.id,sys.updatedAt,fields.updateSequenceNum'));
	return entries.map(({sys, fields}) => ({
		id: sys.id,
		updated: sys.updatedAt,
		updateSequenceNum: fields && fields.updateSequenceNum && fields.updateSequenceNum['en-US'] || 0
	}))
}

module.exports = {
	getBlogUpdates,
}
