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

const CAT_CREATED = 'created'
const CAT_REMOVED = 'removed'
const CAT_UPDATED = 'updated'
const CAT_STABLE = 'stable'

function sortToCategory(mergeItem) {
	if (created(mergeItem.items)) return CAT_CREATED

	if (removed(mergeItem.items)) return CAT_REMOVED

	if (updated(mergeItem.items)) return CAT_UPDATED

	if (stable(mergeItem.items)) return CAT_STABLE

	throw new Error('should never reach this place' + JSON.stringify(mergeItem))

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

	function updated(items) {
		const evernoteItem = evernote(items.find(evernote));
		const contentfulItem = contentful(items.find(contentful));
		return evernoteItem && contentfulItem && !notesAreEquallyUpdated(evernoteItem, contentfulItem)
	}

	function notesAreEquallyUpdated(evernoteItem, contentfulItem) {
		return evernoteItem.updateSequenceNum === contentfulItem.updateSequenceNum;
	}

	function stable(items) {
		const evernoteItem = evernote(items.find(evernote));
		const contentfulItem = contentful(items.find(contentful));
		return evernoteItem && contentfulItem && notesAreEquallyUpdated(evernoteItem, contentfulItem)
	}
}

function reduceToIdsPerCategory(result, mergeItem) {
	const id = mergeItem.id

	const category = sortToCategory(mergeItem)
	return {
		...result,
		[category]: [
			...result[category],
			id
		]
	}
}

function compareUpdates(notes, posts) {
	const merged = flattenArrayOnId([...notes.map(mark('evernote')), ...posts.map(mark('contentful'))])

	return merged.reduce(reduceToIdsPerCategory, {
		[CAT_STABLE]: [],
		[CAT_UPDATED]: [],
		[CAT_CREATED]: [],
		[CAT_REMOVED]: [],
	})

	function mark(attribute) {
		return item => ({...item, [attribute]: true});
	}
}

module.exports = {
	compareUpdates,
	createIdMap,
	flattenArrayOnId,
}
