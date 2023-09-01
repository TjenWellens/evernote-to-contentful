const {createOrUpdateEntry} = require("../ext/contentful/lib.contentful.createEntry");


function createEntryFromTag(tag) {
	if (!tag.guid || !tag.name) throw new Error('tag malformed, needs guid and name ' + JSON.stringify(tag))
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
