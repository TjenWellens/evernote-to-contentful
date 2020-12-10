function yankImageToRoot(entry) {
	if(entry.content[0].nodeType === "embedded-asset-block")
		return {
			"content": [],
			"data": {
				"target": {
					"sys": {
						"id": "2pWcZnigT6iUOMDJlEZyLr",
						"linkType": "Asset",
						"type": "Link"
					}
				}
			},
			"nodeType": "embedded-asset-block"
		}
	return entry
}

module.exports = {
	yankImageToRoot,
}
