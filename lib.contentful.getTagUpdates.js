const {getEntriesGenerator} = require("./lib.contentful.getEntryUpdates");
const {toArray} = require("./lib.contentful.getEntryUpdates");

async function getContentfulTagUpdates() {
	const entries = await toArray(getEntriesGenerator(process.env.CONTENTFUL_BLOGPOST_ENTRY_TYPE_ID, 'sys.id,fields.name'));
	return entries.map(({sys, fields}) => ({
		id: sys.id,
		name: fields && fields.name && fields.name['en-US']
	}))
}

module.exports = {
	getContentfulTagUpdates,
}
