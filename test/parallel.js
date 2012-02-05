var nue = require('../lib/nue');
var flow = nue.flow;
var parallel = nue.parallel;
var assert = require('assert');

describe('parallel', function() {
  it('should handle results in the end function', function (done) {
    flow(
      parallel(
        function () {
          this.fork();
        },
        [
          function () {
            this.join(1);
          },
          function () {
            var self = this;
            setTimeout(function () {
              self.join(2);
            }, 10)
          },
          function () {
            this.join(3);
          }
        ],
        function (err, results) {
          assert.strictEqual(err, null);
          assert.strictEqual(results.length, 3);
          assert.strictEqual(results[0], 1);
          assert.strictEqual(results[1], 2);
          assert.strictEqual(results[2], 3);
          done();
        }
      )
    )();
  });
  it('should handle err in the end function', function (done) {
    flow(
      parallel([
        function () {
          this.join(1);
        },
        function () {
          this.end('ERROR');
        },
        function () {
          this.join(3);
        }],
        function (err, results) {
          assert.strictEqual(err, 'ERROR');
          assert.strictEqual(results, undefined);
          done();
        }
      )
    )();
  });
  it('should accept arguments', function (done) {
    flow(
      parallel(
        function (a, b, c) {
          this.fork(a, b, c);
        },
        [ 
          function (a) {
            this.join(a);
          },
          function (b) {
            var self = this;
            setTimeout(function () {
              self.join(b);
            }, 10);
          },
          function (c) {
            this.join(c);
          }
        ],
        function (err, results) {
          assert.strictEqual(err, null);
          assert.strictEqual(results.length, 3, results);
          assert.strictEqual(results[0], 1);
          assert.strictEqual(results[1], 2);
          assert.strictEqual(results[2], 3);
          done();
        }
      )
    )(1, 2, 3);
  });
  it('should work without begin function', function (done) {
    flow(
      parallel([
        function () {
          this.join(1);
        },
        function () {
          this.join(2);
        },
        function () {
          this.join(3);
        }],
        function (err, results) {
          done();
        }
      )
    )();
  });
  it('should work without end function', function () {
    flow(
      parallel(
        function () {
          this.fork();
        },
        [
          function () {
            this.join(1);
          },
          function () {
            this.join(2);
          },
          function () {
            this.join(3);
          }
        ]
      )
    )();
  });
  it('should call the end function with the context for parallel', function (done) {
    var context = {};
    parallel(
      function () {
        this.fork();
      },
      [
        function () {
          this.join(1);
        },
        function () {
          this.join(2);
        },
        function () {
          this.join(3);
        }
      ],
      function (err, results) {
        assert.strictEqual(err, null);
        assert.strictEqual(results.length, 3);
        assert.strictEqual(results[0], 1);
        assert.strictEqual(results[1], 2);
        assert.strictEqual(results[2], 3);
        assert.strictEqual(this, context);
        done();
      }
    ).call(context);
  });
});