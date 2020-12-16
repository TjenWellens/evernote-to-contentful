const {findTags} = require("./lib.findPublishedBlogposts");

async function getTagUpdates(notebook) {
	const tags = await findTags(notebook);
	return tags.map(({guid, name}) => ({
		id: guid,
		name,
	}));
}

module.exports = {
	getTagUpdates,
}
