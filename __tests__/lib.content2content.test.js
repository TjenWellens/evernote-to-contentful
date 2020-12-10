const {squashInlineTextAndCleanupWhitespace} = require("../lib.content2content");
const {_text} = require("../lib.content2content");
const {inlineNewline} = require("../lib.content2content");
const {link} = require("../lib.content2content");
const {content2content} = require("../lib.content2content");

describe('should transform paragraphs', () => {
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

it('should transform empty lines', async () => {
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

describe('should transform images', () => {
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
})

describe('should transform list', () => {
	it('ordered', async () => {
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

	it('unordered', async () => {
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
})

describe('should transform todos', () => {
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
		 href="evernote:///view/30809684/s230/aefbbfb7-aa83-4336-ad37-754426b7d9f3/aefbbfb7-aa83-4336-ad37-754426b7d9f3/">
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
							"uri": "evernote:///view/30809684/s230/aefbbfb7-aa83-4336-ad37-754426b7d9f3/aefbbfb7-aa83-4336-ad37-754426b7d9f3/"
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

})

it('should transform horizontal lines', async () => {
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

it('should transform links', async () => {
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
						"uri": "evernote:///view/590605/s1/c91a6abd-cec2-426c-8685-2fd03460c23c/c91a6abd-cec2-426c-8685-2fd03460c23c/"
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

describe('should transform span', () => {
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
	it('when it contains media', async () => {
		const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<div><span><en-media hash="373798d4ffbde8f490e01d418b9d2a01" type="image/png"/></span></div>
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

it('should transform empty content', async () => {
	const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note />`
	const entryContent = []
	expect(await content2content(noteContent)).toEqual(entryContent)
})

describe('tables', () => {
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

describe('<b>', ()=>{
	it('should treat it like any text', async () => {
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
<a href="evernote:///view/30809684/s230/1ffa1dc1-7f4d-4ad7-8b4d-0e8900a5a31e/1ffa1dc1-7f4d-4ad7-8b4d-0e8900a5a31e/"
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
							"uri": "evernote:///view/30809684/s230/1ffa1dc1-7f4d-4ad7-8b4d-0e8900a5a31e/1ffa1dc1-7f4d-4ad7-8b4d-0e8900a5a31e/"
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

it('should work with span', async () => {
	const noteContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>
<div>
  <en-todo checked="false"/>
  <a href="evernote:///view/30809684/s230/22312a5c-dd45-4d27-8e1b-7c07e3152d3a/22312a5c-dd45-4d27-8e1b-7c07e3152d3a/"
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
						"uri": "evernote:///view/30809684/s230/22312a5c-dd45-4d27-8e1b-7c07e3152d3a/22312a5c-dd45-4d27-8e1b-7c07e3152d3a/"
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
href="evernote:///view/590605/s1/c91a6abd-cec2-426c-8685-2fd03460c23c/c91a6abd-cec2-426c-8685-2fd03460c23c/"
target="_blank"><font style="font-size: 36px;">Books</font></a>
</div>
</en-note>`

		const entryContent = [
			{
				"data": {},
				"content": [
					{
						"data": {
							"uri": "evernote:///view/590605/s1/c91a6abd-cec2-426c-8685-2fd03460c23c/c91a6abd-cec2-426c-8685-2fd03460c23c/"
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
