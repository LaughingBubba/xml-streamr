var fs = require('fs')
  , path = require('path')
  ,	assert = require('assert')
  , XmlStream = require('../lib/xml-stream');


describe('XmlStream', function() {

	it('should should rename text nodes', function(done) {
		var stream = fs.createReadStream(path.resolve(__dirname, 'fixtures/simple-parse.xml'));
		var fileExpected = fs.readFileSync(path.resolve(__dirname, 'fixtures/textnode-rename.json'));
		var xml = new XmlStream(stream, {textNodeName: "value"});
		var results = [];

		xml.collect('subitem');
		xml.on('endElement: item', function(item) {
		  results.push(item);
		});

		xml.on('end', function () {

			var expected = JSON.parse(fileExpected);

			assert.deepEqual(results, expected);
			done();
		});

		xml.on('error', function (err) {
			done(err);
		});
	});
});
