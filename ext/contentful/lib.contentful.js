const contentful = require('contentful-management')

function createContentfulClient() {
	return contentful.createClient({
		accessToken: process.env.CONTENTFUL_CONTENT_MANAGEMENT_API_KEY
	})
}

module.exports = {
	createContentfulClient,
}
