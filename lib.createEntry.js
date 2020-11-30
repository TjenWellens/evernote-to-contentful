const contentful = require('contentful-management')
const client = contentful.createClient({
	accessToken: process.env.CONTENTFUL_CONTENT_MANAGEMENT_API_KEY
})

function field(data) {
	return {
		'en-US': data
	}
}

function fields({fields: {title, content, tags, id}}) {
	return {
		id: field(id),
		title: field(title),
		tags: field(tags),
		content: field(content),
	}
}

async function createEntry(environment, data) {
	const entry = await environment.createEntryWithId(data.contentTypeId, data.entryId, {
		fields: fields(data)
	})
	console.log(entry)
	return entry
}

async function updateEntry(entry, data) {
	entry.fields = fields(data)
	return entry.update()
}

function tryFindEntry(environment, data) {
	return environment.getEntry(data.entryId).catch(reason => {
		if (reason.name !== 'NotFound') throw new Error('tryFindEntry failed for unknown reason: ' + reason.message)
		return null
	})
}

async function createOrUpdateEntry(data) {
	const space = await client.getSpace(process.env.CONTENTFUL_SPACE)
	const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT)
	const entry = await tryFindEntry(environment, data)
	const saved = entry ? await updateEntry(entry, data) : await createEntry(environment, data);
	return saved.publish()
}

module.exports = {
	createOrUpdateEntry
}
