function createIdMap(arr) {
	return arr.reduce((result, item) => ({...result, [item.id]: item}), {})
}

function flattenArrayOnId(array) {
	const lookup = array.reduce((result, item) => {
		const id = item.id
		if (!id) throw new Error('item must have id' + JSON.stringify(item))
		const existing = result[id] || {id, items: []}
		return {
			...result,
			[id]: {
				id,
				items: [
					...existing.items,
					item,
				]
			}
		}
	}, {})

	return Object.values(lookup)
}

function mark(attribute) {
	return item => ({...item, [attribute]: true});
}

function compareUpdates(notes, posts) {
	const merged = flattenArrayOnId([...notes.map(mark('evernote')), ...posts.map(mark('contentful'))])

	return merged.reduce((result, mergeItem) => {
		const id = mergeItem.id

		if (created(mergeItem.items)) return {
			...result,
			created: [
				...result.created,
				id
			],
		}

		if (removed(mergeItem.items)) return {
			...result,
			removed: [
				...result.removed,
				id
			],
		}

		if (updated(mergeItem.items)) return {
			...result,
			updated: [
				...result.updated,
				id
			],
		}

		if (stable(mergeItem.items)) return {
			...result,
			stable: [
				...result.stable,
				id
			],
		}

		throw new Error('should never reach this place' + JSON.stringify(mergeItem))
	}, {
		stable: [],
		updated: [],
		created: [],
		removed: [],
	})

	function evernote(item) {
		return item && item.evernote && item;
	}

	function contentful(item) {
		return item && item.contentful && item;
	}

	function created(items) {
		return items.some(evernote) && !items.some(contentful)
	}

	function removed(items) {
		return !items.some(evernote) && items.some(contentful)
	}

	function date({updated}) {
		return new Date(updated);
	}

	function updated(items) {
		const evernoteItem = evernote(items.find(evernote));
		const contentfulItem = contentful(items.find(contentful));
		return evernoteItem && contentfulItem && date(evernoteItem) > date(contentfulItem)
	}

	function stable(items) {
		const evernoteItem = evernote(items.find(evernote));
		const contentfulItem = contentful(items.find(contentful));
		return evernoteItem && contentfulItem && date(evernoteItem) <= date(contentfulItem)
	}
}

module.exports = {
	compareUpdates,
	createIdMap,
	flattenArrayOnId,
}
