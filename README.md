# xml-streamr

`xml-streamr` is a Node.js XML stream parser and editor, based on
[node-expat](https://github.com/astro/node-expat) (libexpat SAX-like parser
binding).

    $ npm install xml-streamr

This is a fork of the `xml-stream` package. See [Background](#background) below.

## Rationale

When working with large XML files, it is probably a bad idea to use an XML to
JavaScript object converter, or simply buffer the whole document in memory.
Then again, a typical SAX parser might be too low-level for some tasks (and
often a real pain).

This is why we've rolled our own stream parser that tries to address these
shortcomings. It processes an XML stream chunk by chunk and fires events only
for nodes of interest, matching them with CSS-like selectors.

## Events

Supported events:

* `data` on outgoing data chunk,
* `end` when parsing has ended,
* `startElement[: selector]` on opening tag for selector match,
* `updateElement[: selector]` on finished node for selector match
  with its contents buffered,
* `endElement[: selector]` on closing tag for selector match,
* `text[: selector]` on tag text for selector match.

When adding listeners for `startElement`, `updateElement`, and `text` the
callback can modify the provided node, before it is sent to the consumer.

Selector syntax is CSS-like and currently supports:

* `ancestor descendant`
* `parent > child`

Take a look at the examples for more information.

## Element Node

Each of the four node events has a callback with one argument. When parsing,
this argument is set to the current matched node. Having a chunk of XML like
this:

```xml
<item id="123" type="common">
  <title>Item Title</title>
  <description>Description of this item.</description>
  (text)
</item>
```

The structure of the **item** element node would be:

```javascript
{
  title: 'Item Title',
  description: 'Description of this item.',
  '$': {
    'id': '123',
    'type': 'common'
  },
  '$name': 'item',
  '$text': '(text)'
}
```

Naturally, element text and child elements wouldn't be known until discovered
in the stream, so the structure may differ across events. The complete
structure as displayed should be available on **updateElement**. The **$name**
is not available on **endElement**.

# Collecting Children

It is sometimes required to select elements that have many children with
one and the same name. Like this XML:

```xml
<item id="1">
  <subitem>one</subitem>
  <subitem>two</subitem>
</item>
<item id="2">
  <subitem>three</subitem>
  <subitem>four</subitem>
  <subitem>five</subitem>
</item>
```

By default, parsed element node contains children as properties. In the case
of several children with same names, the last one would overwrite others.
To collect all of *subitem* elements in an array use **collect**:

```javascript
xml.collect('subitem');
xml.on('endElement: item', function(item) {
  console.log(item);
})
```

# Preserving Elements and Text

By default, element text is returned as one concatenated string. In this XML:

```xml
<item>
  one <a>1</a>
  two <b>2</b>
</item>
```

The value of **$text** for *item* would be: `one 1 two 2` without any
indication of the order of element *a*, element *b*, and text parts.
To preserve this order:

```javascript
xml.preserve('item');
xml.on('endElement: item', function(item) {
  console.log(item);
})
```

# Pause and resume parsing

If you want parsing to pause (for example, until some asynchronous operation 
of yours is finished), you can pause and resume XML parsing:
```javascript
xml.pause();
myAsyncFunction( function() {
  xml.resume();
});
```
Beware that resume() **must not** be called from within a handler callback.

# Options

```javascript
const defaultOptions = {
      textNodeName: '$text',  // Name the returned text node
      coerce: false,          // Coerce Numerice and Boolean typed text node 
      encoding: null          // Text encoding ie: "UTF-8" - default if not supplied
};
```

# Background
This is a fork of the venerable [xml-stream](https://www.npmjs.com/package/xml-stream) package.

The [AssistUnion](https://github.com/assistunion) organisation that spawned the orignal is orphaned and therefore not accepting Pull Requests. 

At the time of writing there were [100+ forks](https://github.com/assistunion/xml-stream/network/members).

Of these forks:
- 2/5 are forks with no further commits
- 1/3 are behind on commits and
- 1/4 are ahead on commits

The overarching themes of those ahead on commits are:
- Dependency version bumps
- Dropping or changing encoding (`iconv`, `iconv-lite`)
- Replacing or substituting `sax` parsing for `expat`, in the browser or no
- Forced / "Always On" collection of child nodes
- Minor changes to events and stream handling

## Goals
This package updates the `xml-stream` dependencies and adds options to customise the parsing and event handling.

# Change log

## 0.2.0
- Allow basic type coercion for possible numeric and boolean text nodes.

eg:
```javascript
const XmlStreamr = require('xml-streamr');
const options {
  coerce: true
};

var stream = fs.createReadStream('some.xml')
var xml = new XmlStreamr(stream, options);
```

```xml
<root>
  <item>1</item>
  <item>True</item>
</root>
```

Results in:
```json
[
    { "$text": 1 },
    { "$text": true }
]
```

Instead of:
```json
[
    { "$text": "1" },
    { "$text": "True" }
]
```



## 0.1.1
- Improve internal options defaults and handling

## 0.1.0
- Drop encoding parameter in favour of embedding it an options object
- Add a `textNodeName` option to name the text node as something other than `$text` in the parsed JSON. Defaults to `$text` if not supplied.

eg:
```javascript
const XmlStreamr = require('xml-streamr');
const options {
  textNodeName: "value",
  encoding: "UTF-8"
};

var stream = fs.createReadStream('some.xml')
var xml = new XmlStreamr(stream, options);
```
## 0.0.2 & 0.0.3
Update README.md
## 0.0.1
#### Upgrade dependnecies :
"iconv": "^3.0.1" from "^2.1.4"   
"node-expat": "^2.4.0" from "^2.3.7"   
"readable-stream": "^4.0.0" from "^1.0.31"   
"mocha": "^10.0.0" from "^1.21.4"   

#### Update license
Additional copyright.