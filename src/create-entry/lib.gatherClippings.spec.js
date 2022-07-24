const {_getPotentialClippingNoteIds} = require("./lib.gatherClippings");

test('_getPotentialClippingNoteIds', async () => {
    expect(_getPotentialClippingNoteIds([
        'https://www.youtube.com/watch?v=2zYxWEZ0gYg',
        'evernote:///view/30809684/s230/aefbbfb7-aa83-4336-ad37-754426b7d9f3/aefbbfb7-aa83-4336-ad37-754426b7d9f3/',
        'evernote:///view/30809684/s230/05c7c290-d8ef-499e-8a3b-b68067d52191/05c7c290-d8ef-499e-8a3b-b68067d52191/',
    ])).toEqual([
        'aefbbfb7-aa83-4336-ad37-754426b7d9f3',
        '05c7c290-d8ef-499e-8a3b-b68067d52191',
    ])
})