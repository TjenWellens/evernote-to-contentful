const {squashInlineTextAndCleanupWhitespace} = require("./content-elements");
const {_text} = require("./content-elements");
const {inlineNewline} = require("./content-elements");
const {link} = require("./content-elements");
const {content2content} = require("./lib.content2content");

it('empty content', async () => {
	const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note />`
	const entryContent = []
	expect(await content2content(noteContent)).toEqual(entryContent)
})

describe('inline', () => {
	describe('todos', () => {
		it('lone todos', async () => {
			const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<div>are you done yet?</div>
<div><en-todo></en-todo>almost</div>
<div>are you done yet?</div>
</en-note>`
			const entryContent = [
				{
					"data": {},
					"content": [
						{
							"data": {},
							"marks": [],
							"value": "are you done yet?",
							"nodeType": "text"
						}
					],
					"nodeType": "paragraph"
				},
				{
					"data": {},
					"content": [
						{
							"data": {},
							"marks": [],
							"value": "[ ] almost",
							"nodeType": "text"
						}
					],
					"nodeType": "paragraph"
				},
				{
					"data": {},
					"content": [
						{
							"data": {},
							"marks": [],
							"value": "are you done yet?",
							"nodeType": "text"
						}
					],
					"nodeType": "paragraph"
				},
			]
			expect(await content2content(noteContent)).toEqual(entryContent)
		})
		it('lone todos with link', async () => {
			const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<div>
	<en-todo></en-todo>
	<a shape="rect" style="color: #69aa35;"
		 href="https://mindmark.it">
		Article: The IT Measurement Inversion - Douglas Hubbard
	</a>
</div>
</en-note>`
			const entryContent = [
				{
					"data": {},
					"content": [
						{
							"data": {},
							"marks": [],
							"value": "[ ] ",
							"nodeType": "text"
						},
						{
							"data": {
								"uri": "https://mindmark.it"
							},
							"content": [
								{
									"data": {},
									"marks": [],
									"value": "Article: The IT Measurement Inversion - Douglas Hubbard",
									"nodeType": "text"
								}
							],
							"nodeType": "hyperlink"
						}
					],
					"nodeType": "paragraph"
				},
			]
			expect(await content2content(noteContent)).toEqual(entryContent)
		})
		it('todo with inline elements as content', async () => {
			const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<div>
<en-todo checked="falser"/>
<span style="font-weight: bold;">Rules of play </span>
</div>
</en-note>`
			const entryContent = [
				{
					"data": {},
					"content": [
						{
							"data": {},
							"marks": [],
							"value": "[ ] Rules of play",
							"nodeType": "text"
						}
					],
					"nodeType": "paragraph"
				},
			]
			expect(await content2content(noteContent)).toEqual(entryContent)
		})
		describe('gets checked state from property "checked"', () => {
			it('checked="true"', async () => {
				const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<div><en-todo checked="true"/>almost</div>
</en-note>`
				const entryContent = [
					{
						"data": {},
						"content": [
							{
								"data": {},
								"marks": [],
								"value": "[x] almost",
								"nodeType": "text"
							}
						],
						"nodeType": "paragraph"
					},
				]
				expect(await content2content(noteContent)).toEqual(entryContent)
			})
			it('checked="false"', async () => {
				const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<div><en-todo checked="false"/>almost</div>
</en-note>`
				const entryContent = [
					{
						"data": {},
						"content": [
							{
								"data": {},
								"marks": [],
								"value": "[ ] almost",
								"nodeType": "text"
							}
						],
						"nodeType": "paragraph"
					},
				]
				expect(await content2content(noteContent)).toEqual(entryContent)
			})
			it('checked is absent', async () => {
				const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<div><en-todo/>almost</div>
</en-note>`
				const entryContent = [
					{
						"data": {},
						"content": [
							{
								"data": {},
								"marks": [],
								"value": "[ ] almost",
								"nodeType": "text"
							}
						],
						"nodeType": "paragraph"
					},
				]
				expect(await content2content(noteContent)).toEqual(entryContent)
			})
		})

	})
	describe('links', () => {
		it('internal links to "entry-hyperlink"', async () => {
			const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<div>(src: <a shape="rect"
href="evernote:///view/590605/s1/c91a6abd-cec2-426c-8685-2fd03460c23c/c91a6abd-cec2-426c-8685-2fd03460c23c/"
target="_blank">In progress blogpost</a>)
</div>
</en-note>`
			const entryContent = [
				{
					"data": {},
					"content": [
						{
							"data": {},
							"marks": [],
							"value": "(src: ",
							"nodeType": "text"
						},
						{
							"data": {
								target: {
									sys: {
										type: 'Link',
										linkType: 'Entry',
										id: 'c91a6abd-cec2-426c-8685-2fd03460c23c'
									}
								}
							},
							"content": [
								{
									"data": {},
									"marks": [],
									"value": "In progress blogpost",
									"nodeType": "text"
								}
							],
							"nodeType": "entry-hyperlink"
						},
						{
							"data": {},
							"marks": [],
							"value": ")",
							"nodeType": "text"
						}
					],
					"nodeType": "paragraph"
				},
			]
			expect(await content2content(noteContent)).toEqual(entryContent)
		})
		it('clipping links to "hyperlink"', async () => {
			let noteId = `c91a6abd-cec2-426c-8685-2fd03460c23c`;
			let clippingOrigin = 'https://some.external.link.com/foo';
			const clippings = {
				[noteId]: clippingOrigin
			}
			const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<div>(src: <a shape="rect"
href="evernote:///view/590605/s1/${noteId}/${noteId}/"
target="_blank">Article: something I found on the internet</a>)
</div>
</en-note>`
			const entryContent = [
				{
					"data": {},
					"content": [
						{
							"data": {},
							"marks": [],
							"value": "(src: ",
							"nodeType": "text"
						},
						{
							"data": {
								"uri": clippingOrigin
							},
							"content": [
								{
									"data": {},
									"marks": [],
									"value": "Article: something I found on the internet",
									"nodeType": "text"
								}
							],
							"nodeType": "hyperlink"
						},
						{
							"data": {},
							"marks": [],
							"value": ")",
							"nodeType": "text"
						}
					],
					"nodeType": "paragraph"
				},
			]
			expect(await content2content(noteContent, {}, clippings)).toEqual(entryContent)
		})
		it('external links to a', async () => {
			const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<div>(src: <a shape="rect"
href="https://www.mindmark.it"
target="_blank">In progress blogpost</a>)
</div>
</en-note>`
			const entryContent = [
				{
					"data": {},
					"content": [
						{
							"data": {},
							"marks": [],
							"value": "(src: ",
							"nodeType": "text"
						},
						{
							"data": {
								"uri": "https://www.mindmark.it"
							},
							"content": [
								{
									"data": {},
									"marks": [],
									"value": "In progress blogpost",
									"nodeType": "text"
								}
							],
							"nodeType": "hyperlink"
						},
						{
							"data": {},
							"marks": [],
							"value": ")",
							"nodeType": "text"
						}
					],
					"nodeType": "paragraph"
				},
			]
			expect(await content2content(noteContent)).toEqual(entryContent)
		})
		it('space between text and link is kept', async () => {
			const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<div>
<span style="-en-paragraph:true;">Teaching myself how to code, I started writing applications and immersed
myself more and more in the world of software. Initially I created small games, but over time also started
creating small utility programs for myself. I programmed by myself for years. And I learned, the hard way,
the need for maintainable code. I had to rewrite a big project multiple times! All that effort wasted! This
drove me to study topics like: version control, design patterns, clean code, tdd, ddd, architecture, … This
is the basis for my 
</span>
<a href="evernote:///view/30809684/s230/c2272844-4bd8-6400-23fa-52e53392378c/c2272844-4bd8-6400-23fa-52e53392378c/"
   style="color: rgb(105, 170, 53);">Quest: Learn to write adaptable software
</a>
<span style="-en-paragraph:true;">.</span>
</div>
</en-note>`
			const entryContent = [
				{
					"data": {},
					"content": [
						{
							"data": {},
							"marks": [],
							"value": "Teaching myself how to code, I started writing applications and immersed\nmyself more and more in the world of software. Initially I created small games, but over time also started\ncreating small utility programs for myself. I programmed by myself for years. And I learned, the hard way,\nthe need for maintainable code. I had to rewrite a big project multiple times! All that effort wasted! This\ndrove me to study topics like: version control, design patterns, clean code, tdd, ddd, architecture, … This\nis the basis for my \n",
							"nodeType": "text"
						},
						{
							"data": {
								"target": {
									"sys": {
										"id": "c2272844-4bd8-6400-23fa-52e53392378c",
										"type": "Link",
										"linkType": "Entry"
									}
								}
							},
							"content": [
								{
									"data": {},
									"marks": [],
									"value": "Quest: Learn to write adaptable software",
									"nodeType": "text"
								}
							],
							"nodeType": "entry-hyperlink"
						},
						{
							"data": {},
							"marks": [],
							"value": ".",
							"nodeType": "text"
						}
					],
					"nodeType": "paragraph"
				},
			]
			expect(await content2content(noteContent)).toEqual(entryContent)
		})
	})
	describe('ignored (treated as plain text)', () => {
		describe('span', () => {
			it('when it contains nbsp', async () => {
				const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<div>speed:<span> </span></div>
</en-note>`
				const hash = "373798d4ffbde8f490e01d418b9d2a01"
				const assetId = "3n1RaUimNYsv0wGAtcEPn0";

				const entryContent = [
					{
						"data": {},
						"content": [
							{
								"data": {},
								"marks": [],
								"value": "speed:",
								"nodeType": "text"
							}
						],
						"nodeType": "paragraph"
					},
				]
				const images = {
					[hash]: assetId
				}

				expect(await content2content(noteContent, images)).toEqual(entryContent)
			})
			it('inside another inline', async () => {
				const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<div>
  <en-todo checked="false"/>
  <a href="https://mindmark.it"
     rev="en_rl_none">
    <span style="color:#69aa35;">Book: Refactoring to Patterns - Joshua Kerievsky</span>
  </a>
</div>
</en-note>`
				const entryContent = [
					{
						"data": {},
						"content": [
							{
								"data": {},
								"marks": [],
								"value": "[ ] ",
								"nodeType": "text"
							},
							{
								"data": {
									"uri": "https://mindmark.it"
								},
								"content": [
									{
										"data": {},
										"marks": [],
										"value": "Book: Refactoring to Patterns - Joshua Kerievsky",
										"nodeType": "text"
									}
								],
								"nodeType": "hyperlink"
							},
						],
						"nodeType": "paragraph"
					},
				]
				expect(await content2content(noteContent)).toEqual(entryContent)
			})
		})
		describe('font', () => {

			it('ignore font tag when directly in div', async () => {
				const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<div>
<font style="font-size: 36px;">Books</font>
</div>
</en-note>`

				const entryContent = [
					{
						"data": {},
						"content": [
							{
								"data": {},
								"marks": [],
								"value": "Books",
								"nodeType": "text"
							}
						],
						"nodeType": "paragraph"
					},
				]
				const images = {}

				expect(await content2content(noteContent, images)).toEqual(entryContent)
			})
			it('ignore nested font tag', async () => {
				const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<div><a shape="rect"
href="https://mindmark.it"
target="_blank"><font style="font-size: 36px;">Books</font></a>
</div>
</en-note>`

				const entryContent = [
					{
						"data": {},
						"content": [
							{
								"data": {
									"uri": "https://mindmark.it"
								},
								"content": [
									{
										"data": {},
										"marks": [],
										"value": "Books",
										"nodeType": "text"
									}
								],
								"nodeType": "hyperlink"
							},
						],
						"nodeType": "paragraph"
					},
				]
				const images = {}

				expect(await content2content(noteContent, images)).toEqual(entryContent)
			})
		})
		describe('bold', () => {
			it('is ignored', async () => {
				const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<div>
<b>Book: The DevOps Handbook - Gene Kim, Jez Humble, Patrick Debois, John Willis</b>
</div>
</en-note>`

				const entryContent = [
					{
						"data": {},
						"content": [
							{
								"data": {},
								"marks": [],
								"value": "Book: The DevOps Handbook - Gene Kim, Jez Humble, Patrick Debois, John Willis",
								"nodeType": "text"
							}
						],
						"nodeType": "paragraph"
					},
				]
				const images = {}

				expect(await content2content(noteContent, images)).toEqual(entryContent)
			})
			it('should work inline', async () => {
				const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<div>
<a href="https://mindmark.it"
   style="color: rgb(105, 170, 53);">
	<b>Book: The DevOps Handbook - Gene Kim, Jez Humble, Patrick Debois, John Willis</b>
</a>
</div>
</en-note>`

				const entryContent = [
					{
						"data": {},
						"content": [
							{
								"content": [
									{
										"data": {},
										"marks": [],
										"nodeType": "text",
										"value": "Book: The DevOps Handbook - Gene Kim, Jez Humble, Patrick Debois, John Willis"
									}
								],
								"data": {
									"uri": "https://mindmark.it"
								},
								"nodeType": "hyperlink"
							}
						],
						"nodeType": "paragraph"
					},
				]
				const images = {}

				expect(await content2content(noteContent, images)).toEqual(entryContent)
			})
			it('should work with inline stuff in it', async () => {
				const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<div>
<b>
<font style="font-size: 36px;">Books</font>
</b>
</div>
</en-note>`

				const entryContent = [
					{
						"data": {},
						"content": [
							_text("Books")
						],
						"nodeType": "paragraph"
					},
				]
				const images = {}

				expect(await content2content(noteContent, images)).toEqual(entryContent)
			})
		})
	})
})

describe('block', () => {
	describe('list', () => {
		it('ordered list', async () => {
			const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<ol>
<li>first</li>
<li>second</li>
<li>third</li>
</ol>
</en-note>`
			const entryContent = [
				{
					"data": {},
					"content": [
						{
							"data": {},
							"content": [
								{
									"data": {},
									"content": [
										{
											"data": {},
											"marks": [],
											"value": "first",
											"nodeType": "text"
										}
									],
									"nodeType": "paragraph"
								}
							],
							"nodeType": "list-item"
						},
						{
							"data": {},
							"content": [
								{
									"data": {},
									"content": [
										{
											"data": {},
											"marks": [],
											"value": "second",
											"nodeType": "text"
										}
									],
									"nodeType": "paragraph"
								}
							],
							"nodeType": "list-item"
						},
						{
							"data": {},
							"content": [
								{
									"data": {},
									"content": [
										{
											"data": {},
											"marks": [],
											"value": "third",
											"nodeType": "text"
										}
									],
									"nodeType": "paragraph"
								}
							],
							"nodeType": "list-item"
						}
					],
					"nodeType": "ordered-list"
				},
			]
			expect(await content2content(noteContent)).toEqual(entryContent)
		})
		it('unordered list', async () => {
			const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<ul>
<li>aaa</li>
<li>bbb</li>
</ul>
</en-note>`
			const entryContent = [
				{
					"data": {},
					"content": [
						{
							"data": {},
							"content": [
								{
									"data": {},
									"content": [
										{
											"data": {},
											"marks": [],
											"value": "aaa",
											"nodeType": "text"
										}
									],
									"nodeType": "paragraph"
								}
							],
							"nodeType": "list-item"
						},
						{
							"data": {},
							"content": [
								{
									"data": {},
									"content": [
										{
											"data": {},
											"marks": [],
											"value": "bbb",
											"nodeType": "text"
										}
									],
									"nodeType": "paragraph"
								}
							],
							"nodeType": "list-item"
						}
					],
					"nodeType": "unordered-list"
				},
			]
			expect(await content2content(noteContent)).toEqual(entryContent)
		})
		it('nested list', async () => {
			const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<ol>
<li>
<div>understand your own emotions</div>
</li>
<li>
<div>why do I feel those emotions</div>
</li>
<li>
<div>personal values</div>
</li>
<ul>
<li>
<div>why do I consider this as success / failure</div>
</li>
<li>
<div>by what metric do I judge myself and those around me</div>
</li>
</ul>
</ol>
</en-note>`
			const entryContent = [
				{
					"data": {},
					"content": [
						{
							"data": {},
							"content": [
								{
									"data": {},
									"content": [
										{
											"data": {},
											"marks": [],
											"value": "understand your own emotions",
											"nodeType": "text"
										}
									],
									"nodeType": "paragraph"
								}
							],
							"nodeType": "list-item"
						},
						{
							"data": {},
							"content": [
								{
									"data": {},
									"content": [
										{
											"data": {},
											"marks": [],
											"value": "why do I feel those emotions",
											"nodeType": "text"
										}
									],
									"nodeType": "paragraph"
								}
							],
							"nodeType": "list-item"
						},
						{
							"data": {},
							"content": [
								{
									"data": {},
									"content": [
										{
											"data": {},
											"marks": [],
											"value": "personal values",
											"nodeType": "text"
										}
									],
									"nodeType": "paragraph"
								}
							],
							"nodeType": "list-item"
						},
						{
							"data": {},
							"content": [
								{
									"data": {},
									"content": [
										{
											"data": {},
											"content": [
												{
													"data": {},
													"content": [
														{
															"data": {},
															"marks": [],
															"value": "why do I consider this as success / failure",
															"nodeType": "text"
														}
													],
													"nodeType": "paragraph"
												}
											],
											"nodeType": "list-item"
										},
										{
											"data": {},
											"content": [
												{
													"data": {},
													"content": [
														{
															"data": {},
															"marks": [],
															"value": "by what metric do I judge myself and those around me",
															"nodeType": "text"
														}
													],
													"nodeType": "paragraph"
												}
											],
											"nodeType": "list-item"
										},
									],
									"nodeType": "unordered-list"
								},
							],
							"nodeType": "list-item"
						},
					],
					"nodeType": "ordered-list"
				},
			]
			expect(await content2content(noteContent)).toEqual(entryContent)
		})
	})
	describe('paragraphs', () => {
		it('simple line', async () => {
			const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<div>Hello there</div>
<div>this is my first blogpost</div>
<div>hope you like it!</div>
</en-note>`
			const entryContent = [
				{
					"data": {},
					"content": [
						{
							"data": {},
							"marks": [],
							"value": "Hello there",
							"nodeType": "text"
						}
					],
					"nodeType": "paragraph"
				},
				{
					"data": {},
					"content": [
						{
							"data": {},
							"marks": [],
							"value": "this is my first blogpost",
							"nodeType": "text"
						}
					],
					"nodeType": "paragraph"
				},
				{
					"data": {},
					"content": [
						{
							"data": {},
							"marks": [],
							"value": "hope you like it!",
							"nodeType": "text"
						}
					],
					"nodeType": "paragraph"
				},
			]
			expect(await content2content(noteContent)).toEqual(entryContent)
		})

		it('newline in same paragraph', async () => {
			const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<div>and some lines without new paragraph<br clear="none"/>this line<br clear="none"/>and this line<br
clear="none"/>and this line
</div>
</en-note>`
			const entryContent = [
				{
					"data": {},
					"content": [
						{
							"data": {},
							"marks": [],
							"value": "and some lines without new paragraph\nthis line\nand this line\nand this line",
							"nodeType": "text"
						}
					],
					"nodeType": "paragraph"
				},
			]
			expect(await content2content(noteContent)).toEqual(entryContent)
		})

		describe('squashInlineTextAndCleanupWhitespace', () => {
			it('empty', () => {
				expect(squashInlineTextAndCleanupWhitespace([])).toEqual([])
			});
			it('one entry', () => {
				expect(squashInlineTextAndCleanupWhitespace([
					_text("and some lines without new paragraph"),
				])).toEqual([
					_text("and some lines without new paragraph"),
				])
			});
			it('remove trailing newline: text + newline = text', () => {
				expect(squashInlineTextAndCleanupWhitespace([
					_text("and some lines without new paragraph"),
					inlineNewline(),
				])).toEqual([
					_text("and some lines without new paragraph"),
				])
			});
			it('remove leading newline: newline + text = text', () => {
				expect(squashInlineTextAndCleanupWhitespace([
					inlineNewline(),
					_text("and some lines without new paragraph"),
				])).toEqual([
					_text("and some lines without new paragraph"),
				])
			});
			it('join text with newline in between: text + newline + text = text_text', () => {
				expect(squashInlineTextAndCleanupWhitespace([
					_text("and some lines without new paragraph"),
					inlineNewline(),
					_text("this line"),
				])).toEqual([
					_text("and some lines without new paragraph\nthis line"),
				])
			});
			it('loads', () => {
				const children = [
					_text("and some lines without new paragraph"),
					inlineNewline(),
					_text("this line"),
					inlineNewline(),
					_text("and this line"),
					inlineNewline(),
					_text("and this line\n"),
				];
				expect(squashInlineTextAndCleanupWhitespace(children)).toEqual([
					_text("and some lines without new paragraph\nthis line\nand this line\nand this line"),
				])
			});
			it('only squash text (and not links!)', () => {
				const children = [
					_text("(src: "),
					link({
						"_": "In progress blogpost",
						"$": {
							"shape": "rect",
							"href": "evernote:///view/590605/s1/c91a6abd-cec2-426c-8685-2fd03460c23c/c91a6abd-cec2-426c-8685-2fd03460c23c/",
							"target": "_blank"
						},
						"#name": "a",
						"$$": [
							{
								"#name": "__text__",
								"_": "In progress blogpost"
							}
						]
					}),
					_text(")"),
				]
				expect(squashInlineTextAndCleanupWhitespace(children)).toEqual(children)
			})
		});
	})
	it('empty lines', async () => {
		const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<div>Hello there</div>
<div><br clear="none"/></div>
<div>hope you like it!</div>
</en-note>`
		const entryContent = [
			{
				"data": {},
				"content": [
					{
						"data": {},
						"marks": [],
						"value": "Hello there",
						"nodeType": "text"
					}
				],
				"nodeType": "paragraph"
			},
			{
				"data": {},
				"content": [
					{
						"data": {},
						"marks": [],
						"value": "",
						"nodeType": "text"
					}
				],
				"nodeType": "paragraph"
			},
			{
				"data": {},
				"content": [
					{
						"data": {},
						"marks": [],
						"value": "hope you like it!",
						"nodeType": "text"
					}
				],
				"nodeType": "paragraph"
			},
		]
		expect(await content2content(noteContent)).toEqual(entryContent)
	})
	describe('images', () => {
		it('(without text)', async () => {
			const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<div>
  <en-media hash="373798d4ffbde8f490e01d418b9d2a01" type="image/png"></en-media>
</div>
</en-note>`
			const hash = "373798d4ffbde8f490e01d418b9d2a01"
			const assetId = "3n1RaUimNYsv0wGAtcEPn0";

			const entryContent = [
				{
					"data": {
						"target": {
							"sys": {
								type: 'Link',
								linkType: 'Asset',
								id: assetId
							},
						}
					},
					"content": [],
					"nodeType": "embedded-asset-block"
				},
			]

			const images = {
				[hash]: assetId
			}

			expect(await content2content(noteContent, images)).toEqual(entryContent)
		})
		it('(with text)', async () => {
			const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<div>
  Here is an image
  <br clear="none"/>
  <en-media hash="215f60a9a488d2683632fce8526d2959" type="image/png"></en-media>
</div>
</en-note>`
			const hash = "215f60a9a488d2683632fce8526d2959"
			const assetId = "2pWcZnigT6iUOMDJlEZyLr";

			const entryContent = [
				{
					"data": {},
					"content": [
						{
							"data": {},
							"marks": [],
							"value": "Here is an image",
							"nodeType": "text"
						}
					],
					"nodeType": "paragraph"
				},
				{
					"data": {
						"target": {
							"sys": {
								type: 'Link',
								linkType: 'Asset',
								id: assetId
							},
						}
					},
					"content": [],
					"nodeType": "embedded-asset-block"
				},
			]

			const images = {
				[hash]: assetId,
			}

			expect(await content2content(noteContent, images)).toEqual(entryContent)
		})
		it('when span contains media', async () => {
			const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<div><span><en-media hash="373798d4ffbde8f490e01d418b9d2a01" type="image/png"/></span></div>
</en-note>`
			const hash = "373798d4ffbde8f490e01d418b9d2a01"
			const assetId = "3n1RaUimNYsv0wGAtcEPn0";

			const entryContent = [
				{
					"content": [],
					"data": {
						"target": {
							"sys": {
								"id": "3n1RaUimNYsv0wGAtcEPn0",
								"linkType": "Asset",
								"type": "Link"
							}
						}
					},
					"nodeType": "embedded-asset-block"
				}
			]
			const images = {
				[hash]: assetId
			}

			expect(await content2content(noteContent, images)).toEqual(entryContent)
		})
		it('nested inline images should go to root', async () => {
			const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<div>Digital Fluency Model</div>
<div><span><en-media hash="cfee0b80d905f0311a59e39dee9b3af1" type="image/png"/></span></div>
<div><br/></div>
<div>How do you adopt digital capabilities as an organisation</div>
</en-note>`
			const hash = "cfee0b80d905f0311a59e39dee9b3af1"
			const assetId = "2pWcZnigT6iUOMDJlEZyLr";

			const entryContent = [
				{
					"data": {},
					"content": [
						{
							"data": {},
							"marks": [],
							"value": "Digital Fluency Model",
							"nodeType": "text"
						}
					],
					"nodeType": "paragraph"
				},
				{
					"data": {
						"target": {
							"sys": {
								"type": "Link",
								"linkType": "Asset",
								"id": "2pWcZnigT6iUOMDJlEZyLr"
							}
						}
					},
					"content": [],
					"nodeType": "embedded-asset-block"
				},
				{
					"data": {},
					"content": [
						{
							"data": {},
							"marks": [],
							"value": "",
							"nodeType": "text"
						}
					],
					"nodeType": "paragraph"
				},
				{
					"data": {},
					"content": [
						{
							"data": {},
							"marks": [],
							"value": "How do you adopt digital capabilities as an organisation",
							"nodeType": "text"
						}
					],
					"nodeType": "paragraph"
				},
			]

			const images = {
				[hash]: assetId,
			}

			expect(await content2content(noteContent, images)).toEqual(entryContent)
		})
	})
	it('horizontal lines', async () => {
		const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<div>
<hr/>
</div>
</en-note>`
		const entryContent = [
			{
				"data": {},
				"content": [],
				"nodeType": "hr"
			},
		]
		expect(await content2content(noteContent)).toEqual(entryContent)
	})
	it('should ignore empty div', async () => {
		const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<div foo="bar"></div>
</en-note>`
		const hash = "373798d4ffbde8f490e01d418b9d2a01"
		const assetId = "3n1RaUimNYsv0wGAtcEPn0";

		const entryContent = []
		const images = {
			[hash]: assetId
		}

		expect(await content2content(noteContent, images)).toEqual(entryContent)
	})
	describe('tables', () => {
		describe('evernote tables', () => {
			it('should be treated as div', async () => {
				const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<table width="100%" border="0" style="background-color: rgb(212, 221, 229);">
	<colgroup>
		<col/>
	</colgroup>
	<tbody>
		<tr>
			<td>
				5. Social Relationships: The Slide Into "Shy"
			</td>
		</tr>
	</tbody>
</table>
</en-note>`
				const entryContent = [
					{
						"data": {},
						"content": [
							{
								"data": {},
								"marks": [],
								"value": '5. Social Relationships: The Slide Into "Shy"',
								"nodeType": "text"
							}
						],
						"nodeType": "paragraph"
					},
				]
				expect(await content2content(noteContent)).toEqual(entryContent)
			})
		})
		describe('html tables', () => {
			it('should be treated as div', async () => {
				const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<table width="100%" bgcolor="#D4DDE5" border="0">
<tr>
<td>
<h1>fallacy 11</h1>
<b>Source URL:</b>
</td>
</tr>
</table>
</en-note>`
				const entryContent = [
					{
						"data": {},
						"content": [
							{
								"data": {},
								"marks": [],
								"value": 'fallacy 11',
								"nodeType": "text"
							}
						],
						"nodeType": "paragraph"
					},
					{
						"data": {},
						"content": [
							{
								"data": {},
								"marks": [],
								"value": 'Source URL:',
								"nodeType": "text"
							}
						],
						"nodeType": "paragraph"
					},
				]
				expect(await content2content(noteContent)).toEqual(entryContent)
			})
		})
	})
	describe('code block', () => {

		it('should create code', async () => {
			const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<div style="box-sizing: border-box; padding: 8px; font-family: Monaco, Menlo, Consolas, &quot;Courier New&quot;, monospace; font-size: 12px; color: rgb(51, 51, 51); border-top-left-radius: 4px; border-top-right-radius: 4px; border-bottom-right-radius: 4px; border-bottom-left-radius: 4px; background-color: rgb(251, 250, 248); border: 1px solid rgba(0, 0, 0, 0.15);-en-codeblock:true;">
<div>flexibly move deployment boundaries</div>
</div>
</en-note>`

			const entryContent = [
				{
					"data": {},
					"content": [
						{
							"data": {},
							"content": [
								{
									"data": {},
									"marks": [],
									"value": "flexibly move deployment boundaries",
									"nodeType": "text"
								}
							],
							"nodeType": "paragraph"
						}
					],
					"nodeType": "blockquote"
				},
			]
			const images = {}

			expect(await content2content(noteContent, images)).toEqual(entryContent)
		})
	})
})
