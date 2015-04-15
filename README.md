#freemock
#####Easy Mock for Node.js
#Install
    npm install freemock

#Hello world - Example
    var freemock = require('freemock');
    freemock.start()
    var mockObj = freemock.getMock(mod);
    mockObj.setMethod({
        "method1":{
            willReturn:1,//假象方法将返回的值
            willCallback:function(){},//假象方法将执行的回调
            expectArgs:[1,2],//假象方法预期的参数
            willThrow:new Error(),//假象方法会返回的异常
            runTime:1//假象方法会被执行的次数
        },
        "method2":{
            willReturn:1,//假象方法将返回的值
            willCallback:function(){},//假象方法将执行的回调
            expectArgs:[1,2],//假象方法预期的参数
            willThrow:new Error(),//假象方法会返回的异常
            runTime:1//假象方法会被执行的次数
        },
        ...
    })
    freemock.end();

#with Mocha
###example - test.js
	var freemock = require('freemock');
	before(function() {})
	after(function() {})
	beforeEach(function() {
		freemock.start();
	});
	afterEach(function() {
		freemock.end();
	});

	describe("test", function() {
		describe("test hello", function() {
			it("flag exist", function() {
				var hello = require('./../hello');
				var result = hello.hello(true);
			});
			it("flag not exist", function() {
				var mock_util = freemock.getMock('./shit');
				mock_util.setMethod({
					util: {
						expectArgs: [function(){}],
						willReturn: 1
					}
				})
				var hello = require('./../hello');
				hello.hello();
			})
		})
	})

#with Mocha and istanbul
###example
######run.js
	var Mocha = require('mocha');
	var mocha = new Mocha;
	mocha.addFile(__dirname+'/test/hello.test.js')
	mocha.run();
######test.js
	var freemock = require('freemock');
	freemock.setIgnore(['./util'])//加上这个方法，让istanbul不检测这个模块
	before(function() {})
	after(function() {})
	beforeEach(function() {
		freemock.start();
	});
	afterEach(function() {
		freemock.end();
	});
	describe("test", function() {
		describe("test hello", function() {
			it("flag exist", function() {
				var hello = require('./../hello');
				var result = hello.hello(true);
			});
			it("flag not exist", function() {
				var mock_util = freemock.getMock('./util');
				mock_util.setMethod({
					util: {
						expectArgs: [1],
						willReturn: 1
					}
				})
				var hello = require('./../hello');
				hello.hello();
			})

		})
	})
command: istanbul cover run.js

### freemock.setMethod(options)
options:
 - willReturn //假象方法将返回的值
 - willCallback //假象方法将执行的回调
 - expectArgs //假象方法预期的参数
 - willThrow //假象方法会返回的异常
 - runTime //假象方法会被执行的次数

