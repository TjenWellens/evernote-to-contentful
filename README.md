## What does it do?
Syncs evernote notes to contentful.
It selects all notes that are
- in a notebook called `Blog`
- have the tag `published`
and creates corresponding blogposts on contentful.

## Prerequisites
- evernote api key
- contentful api key (content management)
- contentful content model [of this structure](contentful.model.json)

## Setup
create a `.env` file in project root

```
EVERNOTE_TOKEN="..."
EVERNOTE_NOTESTORE_URL="https://sandbox.evernote.com/shard/s1/notestore"
CONTENTFUL_SPACE="..."
CONTENTFUL_ENVIRONMENT="master"
CONTENTFUL_BLOGPOST_ENTRY_TYPE_ID="everpost"
CONTENTFUL_TAG_ENTRY_TYPE_ID="evertag"
CONTENTFUL_CONTENT_MANAGEMENT_API_KEY="..."
```
Don't commit this to git.
(I have removed all personal info with `...`)

## With npm
### Install
```
npm install
```

### Run
```
npm start
```

## With Docker
### install
```
docker build -t evernote-to-contentful .
```

### run
```
docker run -it evernote-to-contentful
```
