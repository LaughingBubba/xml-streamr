var fs = require('fs')
  , path = require('path')
  ,	assert = require('assert')
  , XmlStream = require('../lib/xml-stream');


describe('XmlStream', function() {

	it('should coerce text nodes', function(done) {
		var stream = fs.createReadStream(path.resolve(__dirname, 'fixtures/coercion.xml'));
		var fileExpected = fs.readFileSync(path.resolve(__dirname, 'fixtures/coercion.json'));
		var xml = new XmlStream(stream, {coerce: true});
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
