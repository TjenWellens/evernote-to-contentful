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

async function findExistingAssets(resourceGuids) {
	const space = await contentfulClient.getSpace(process.env.CONTENTFUL_SPACE)
	const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT)
	const assets = await environment.getAssets({
		'sys.id[in]': resourceGuids.join(',')
	});
	if (assets.total > assets.limit)
		throw new Error(`too many assets(${assets.total}), expected less than ${assets.limit}, needs software changes`)
	return assets.items
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

	const url = await fetchResourceUrl(resourceGuid)
	const {mime, fileName} = await fetchResourceMimeAndFilename(resourceGuid);
	const stream = await fetchEvernoteResource(url)
	const upload = await createUploadForStream(stream)

	const description = resource.data.bodyHash.toString('hex');
	const asset = await createAssetFromUpload({
		uploadId: upload.sys.id,
		contentType: mime,
		fileName: fileName || 'default-filename.jpg',
		assetId: resourceGuid,
		title: resourceGuid,
		description,
	})
	return asset
}

async function createAssetsFromEvernoteResources(resources) {
	const resourceGuids = resources.map(({guid}) => guid)
	const existingAssets = await findExistingAssets(resourceGuids)
	const existingAssetIds = existingAssets.map(asset => asset.sys.id)
	const newResources = resources.filter(({guid}) => !existingAssetIds.includes(guid))
	const result = []

	// add existing assets to result
	for (const asset of existingAssets) {
		const resource = resources.find(({guid}) => asset.sys.id === guid)
		result.push({
			asset,
			resource,
		})
	}

	// create new assets, add to result
	for (const resource of newResources) {
		const asset = await createAssetFromEvernoteResource(resource)
		result.push({
			asset,
			resource,
		})
	}
	return result
}

module.exports = {
	createAssetFromUpload,
	fetchEvernoteResource,
	createUploadForStream,
	fetchResourceUrl,
	fetchResourceMimeAndFilename,
	findExistingAssets,
	createAssetsFromEvernoteResources
}
