const contentful = require('contentful-management')
const axios = require('axios');
const qs = require('querystring')
const httpAdapter = require('axios/lib/adapters/http');
const {createEvernoteClient} = require("./lib.evernote");

const contentfulClient = contentful.createClient({
	accessToken: process.env.CONTENTFUL_CONTENT_MANAGEMENT_API_KEY
})

const evernoteClient = createEvernoteClient()

function createAssetFromUpload({uploadId, contentType, fileName, assetId, title, description}) {
	return contentfulClient.getSpace(process.env.CONTENTFUL_SPACE)
		.then((space) => space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT))
		.then((environment) => environment.createAssetWithId(assetId, {
			fields: {
				title: {
					'en-US': title
				},
				description: {
					'en-US': description
				},
				file: {
					'en-US': {
						contentType: contentType,
						fileName: fileName,
						uploadFrom: {
							"sys": {
								"type": "Link",
								"linkType": "Upload",
								"id": uploadId
							}
						},
					}
				}
			}
		}))
		.then((asset) => asset.processForAllLocales())
		.then((asset) => asset.publish())
}

function fetchEvernoteResource(url) {
	return axios.post(url,
		qs.stringify({auth: process.env.EVERNOTE_TOKEN}), {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			responseType: 'stream',
			adapter: httpAdapter,
		})
		.then(response => response.data);
}

async function createUploadForStream(stream) {
	const space = await contentfulClient.getSpace(process.env.CONTENTFUL_SPACE)
	const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT)

	return environment.createUpload({file: stream})
}

async function fetchResourceUrl(resourceGuid) {
	const userStore = evernoteClient.getUserStore()
	const user = await userStore.getUser()

	const publicUserInfo = await userStore.getPublicUserInfo(user.username)

	const resourceUrl = parseResourceUrl(publicUserInfo, resourceGuid)
	return resourceUrl
}

function parseResourceUrl(publicUserInfo, resourceGuid) {
	if (publicUserInfo.webApiUrlPrefix.endsWith('/')) {
		return publicUserInfo.webApiUrlPrefix + "res/" + resourceGuid;
	} else {
		return publicUserInfo.webApiUrlPrefix + "/res/" + resourceGuid;
	}
}

async function fetchResourceMimeAndFilename(resourceGuid) {
	const noteStore = evernoteClient.getNoteStore()
	const resource = await noteStore.getResource(resourceGuid, false, false, true, false)

	return {
		mime: resource.mime,
		fileName: resource.attributes.fileName,
	}
}

async function tryFindAsset(resourceGuid) {
	const space = await contentfulClient.getSpace(process.env.CONTENTFUL_SPACE)
	const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT)
	return environment.getAsset(resourceGuid)
		.catch(reason => {
			if (reason.name !== 'NotFound') throw new Error('tryFindEntry failed for unknown reason: ' + reason.message)
			return null
		})
}

async function createAssetFromEvernoteResource(resource) {
	const resourceGuid = resource.guid
	const alreadyExists = await tryFindAsset(resourceGuid)
	if(alreadyExists) return alreadyExists

	const url = await fetchResourceUrl(resourceGuid)
	const {mime, fileName} = await fetchResourceMimeAndFilename(resourceGuid);
	const stream = await fetchEvernoteResource(url)
	const upload = await createUploadForStream(stream)

	const description = resource.data.bodyHash.toString('hex');
	const asset = await createAssetFromUpload({
		uploadId: upload.sys.id,
		contentType:
		mime,
		fileName,
		assetId: resourceGuid,
		title: resourceGuid,
		description,
	})
	return asset
}

async function createAssetsFromEvernoteResources(resources) {
	const pairs = []
	for(const resource of resources) {
		const pair = await createAssetFromEvernoteResource(resource).then(asset =>({asset, resource}))
		pairs.push(pair)
	}
	return pairs
}

module.exports = {
	createAssetFromUpload,
	fetchEvernoteResource,
	createUploadForStream,
	fetchResourceUrl,
	fetchResourceMimeAndFilename,
	createAssetsFromEvernoteResources
}
