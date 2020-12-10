const {createContentfulClient} = require("./lib.contentful");

const client = createContentfulClient()

async function* getEntriesGenerator(preferredPageSize = 100) {
	const space = await client.getSpace(process.env.CONTENTFUL_SPACE)
	const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT)

	let page = 0
	let res = {}
	do {
		res = await environment.getEntries({
			content_type: process.env.CONTENTFUL_BLOGPOST_ENTRY_TYPE_ID,
			select: 'sys.id,sys.updatedAt,fields.updateSequenceNum',
			limit: preferredPageSize,
			skip: entryCount()
		})
		for (const entry of res.items) {
			yield entry
		}
		page += 1
	} while (res.total > entryCount())

	function entryCount() {
		return page * (res.limit || 0)
	}
}

async function toArray(promisedGenerator) {
	const result = []
	for await (const entry of promisedGenerator) {
		result.push(entry)
	}
	return result
}

async function getBlogUpdates() {
	const entries = await toArray(getEntriesGenerator());
	return entries.map(({sys, fields}) => ({
		id: sys.id,
		updated: sys.updatedAt,
		updateSequenceNum: fields && fields.updateSequenceNum && fields.updateSequenceNum['en-US'] || 0
	}))
}

module.exports = {
	getBlogUpdates,
}
