const {createOrUpdateEntry} = require("./lib.createEntry");


function createEntryFromTag(tag) {
	return createOrUpdateEntry({
		contentTypeId: process.env.CONTENTFUL_TAG_ENTRY_TYPE_ID,
		entryId: tag.guid,
		fields: {
			id: tag.guid,
			name: tag.name,
		}
	})
}

module.exports = {
	createEntryFromTag
}
