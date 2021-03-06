const {compareTagUpdates} = require("./lib.compareUpdates");
const {flattenArrayOnId} = require("./lib.compareUpdates");
const {createIdMap} = require("./lib.compareUpdates");
const {compareNoteUpdates} = require("./lib.compareUpdates");

describe('compareNoteUpdates should', () => {
	it('all notes to be new', () => {
		const updateSequenceNum = 500;
		const id = "a";
		const notes = [{id, updateSequenceNum: updateSequenceNum}];
		const posts = [];
		expect(compareNoteUpdates(notes, posts)).toEqual({
			stable: [],
			updated: [],
			created: [id],
			removed: [],
		})
	})

	it('all notes to be removed', () => {
		const updateSequenceNum = 500;
		const id = "a";
		const notes = [];
		const posts = [{id, updateSequenceNum: updateSequenceNum}];
		expect(compareNoteUpdates(notes, posts)).toEqual({
			stable: [],
			updated: [],
			created: [],
			removed: [id],
		})
	})

	it('all notes to be updated', () => {
		const updateSequenceNum = 500;
		const id = "a";
		const notes = [{id, updateSequenceNum: updateSequenceNum}];
		const posts = [{id, updateSequenceNum: updateSequenceNum - 20}];
		expect(compareNoteUpdates(notes, posts)).toEqual({
			stable: [],
			updated: [id],
			created: [],
			removed: [],
		})
	})

	it('all notes to be stable', () => {
		const updateSequenceNum = 500;
		const id = "a";
		const notes = [{id, updateSequenceNum: updateSequenceNum}];
		const posts = [{id, updateSequenceNum: updateSequenceNum}];
		expect(compareNoteUpdates(notes, posts)).toEqual({
			stable: [id],
			updated: [],
			created: [],
			removed: [],
		})
	})
})

describe('compareTagUpdates should', () => {
	it('all notes to be new', () => {
		const name = "a name";
		const id = "a";
		const notes = [{id, name: name}];
		const posts = [];
		expect(compareTagUpdates(notes, posts)).toEqual({
			stable: [],
			updated: [],
			created: [id],
			removed: [],
		})
	})

	it('all notes to be removed', () => {
		const name = "a name";
		const id = "a";
		const notes = [];
		const posts = [{id, name: name}];
		expect(compareTagUpdates(notes, posts)).toEqual({
			stable: [],
			updated: [],
			created: [],
			removed: [id],
		})
	})

	it('all notes to be updated', () => {
		const name = "a name";
		const id = "a";
		const notes = [{id, name: name}];
		const posts = [{id, name: "something else"}];
		expect(compareTagUpdates(notes, posts)).toEqual({
			stable: [],
			updated: [id],
			created: [],
			removed: [],
		})
	})

	it('all notes to be stable', () => {
		const name = "a name";
		const id = "a";
		const notes = [{id, name: name}];
		const posts = [{id, name: name}];
		expect(compareTagUpdates(notes, posts)).toEqual({
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
