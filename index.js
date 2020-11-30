require('dotenv').config()
const {createAssetsFromEvernoteResources} = require("./lib.resource2asset");
const {content2content} = require("./lib.content2content");
const {findPublishedBlogposts} = require("./lib.findPublishedBlogposts");

async function note2post() {
	const {notes, tags} = await findPublishedBlogposts()

	const entries = Promise.all(notes.map(createEntry))
}

async function createEntry(note) {
	const responses = await createAssetsFromEvernoteResources(note.resources)

	console.log(responses)

	const images = responses.reduce((result, {asset, resource})=>({
		...result,
		[resource.data.bodyHash.toString('hex')]: asset.sys.id
	}), {})
	const entryContent = await content2content(note.content, images)
	console.log("yeehaa")
}

createAssetFromEvernoteResource('766297c1-ea9b-4f66-aad2-66c7b42c133f')
