const {flattenArrayOnId} = require("./lib.compareUpdates");
const {createIdMap} = require("./lib.compareUpdates");
const {compareUpdates} = require("./lib.compareUpdates");
const posts = [
	{id: "a", contentful: {updated: "2020-12-08T10:33:30.453Z"}},
	{id: "b", contentful: {updated: "2020-12-08T10:33:29.893Z"}},
	{id: "c", contentful: {updated: "2020-12-08T10:33:30.453Z"}},
]

const notes = [
	{id: "a", contentful: {updated: 1606749377000}},
	{id: "b", contentful: {updated: 1606641087000}},
]

describe('compareUpdates should', () => {
	it('all notes to be new', () => {
		const timestamp = new Date().getTime();
		const id = "a";
		const notes = [{id, updated: timestamp}];
		const posts = [];
		expect(compareUpdates(notes, posts)).toEqual({
			stable: [],
			updated: [],
			created: [id],
			removed: [],
		})
	})

	it('all notes to be removed', () => {
		const timestamp = new Date().getTime();
		const id = "a";
		const notes = [];
		const posts = [{id, updated: timestamp}];
		expect(compareUpdates(notes, posts)).toEqual({
			stable: [],
			updated: [],
			created: [],
			removed: [id],
		})
	})

	it('all notes to be updated', () => {
		const timestamp = new Date().getTime();
		const id = "a";
		const notes = [{id, updated: timestamp}];
		const posts = [{id, updated: timestamp - 1000}];
		expect(compareUpdates(notes, posts)).toEqual({
			stable: [],
			updated: [id],
			created: [],
			removed: [],
		})
	})

	it('all notes to be stable', () => {
		const timestamp = new Date().getTime();
		const id = "a";
		const notes = [{id, updated: timestamp - 1000}];
		const posts = [{id, updated: timestamp}];
		expect(compareUpdates(notes, posts)).toEqual({
			stable: [id],
			updated: [],
			created: [],
			removed: [],
		})
	})
})

describe('js date', () => {
	it('is reversible', () => {
		const utc = 1606749377000;
		const date = new Date(utc);
		expect(date.getTime()).toEqual(utc)
		expect(new Date(date.toISOString()).getTime()).toEqual(utc)
	})

	it('can be compared', ()=>{
		expect(new Date(10) > new Date(1)).toBeTruthy()
		expect(new Date(1) > new Date(10)).toBeFalsy()
		expect(new Date(10) > new Date(10)).toBeFalsy()
		expect(new Date(10) >=new Date(10)).toBeTruthy()
	})
})

it('createIdMap', () => {
	expect(createIdMap([
		{id: 'a', foo: 'bar'}
	])).toEqual({
		'a': {id: 'a', foo: 'bar'}
	})
})

it('flattenArrayOnId', () => {
	expect(flattenArrayOnId([
		{id: 'a', data: 'a1'},
		{id: 'a', data: 'a2'},
		{id: 'b', data: 'b1'},
	])).toEqual(
		[
			{
				id: 'a', items: [
					{id: 'a', data: 'a1'},
					{id: 'a', data: 'a2'},
				]
			},
			{
				id: 'b', items: [
					{id: 'b', data: 'b1'},
				]
			},
		]
	)
})
