# Readify [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

[NPMIMGURL]:                https://img.shields.io/npm/v/readify.svg?style=flat
[BuildStatusIMGURL]:        https://img.shields.io/travis/coderaiser/readify/master.svg?style=flat
[DependencyStatusIMGURL]:   https://img.shields.io/gemnasium/coderaiser/readify.svg?style=flat
[LicenseIMGURL]:            https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[NPMURL]:                   https://npmjs.org/package/readify "npm"
[BuildStatusURL]:           https://travis-ci.org/coderaiser/readify  "Build Status"
[DependencyStatusURL]:      https://gemnasium.com/coderaiser/readify "Dependency Status"
[LicenseURL]:               https://tldrlegal.com/license/mit-license "MIT License"

Read directory content with file attributes: size, date, owner, mode.

## Install

With npm:

```
npm i readify --save
```

With bower:

```
npm i bower --save
```

## How to use?

Readify could be used in node.js based applications or in browsers
with help of [filer](https://github.com/filerjs/filer "Node-like file system for browsers").

`node.js` example:

```js
const readify = require('readify');

// basic
readify('/', (error, data) => {
    console.log(data);
    // output
    {
        path: '/',
        files:  [{
            name: 'readify.js',
            size: '4.22kb',
            date: '20.02.2016',
            owner: 'coderaiser',
            mode: 'rw- rw- r--',
        }]
    }
});

// raw output
readify('/', 'raw', (error, data) => {
    console.log(data);
    // output
    {
        path: '/',
        files:  [{
            name: 'readify.js',
            size: 4735,
            date: 2016-11-21T13:37:55.275Z,
            owner: 1000,
            mode: 33204
        }]
    }
});

// sort output
// available sort option: name, size, owner, date
// available order option: asc, desc
readify('/', {sort: 'size', order: 'desc'}, (error, data) => {
    console.log(data);
});

// all together
readify('/', {sort: 'size', order: 'desc', type: 'raw'}, (error, data) => {
    console.log(data);
});

```

`browser` example:

```js
var fs = new Filer.FileSystem();

readify('/', function(error, data) {
    console.log(error || data);
});
```

## Environments

In old `node.js` environments that supports `es5` only, `readify` could be used with:

```js
var readify = require('readify/legacy');
```

## License

MIT

[CoverageURL]:              https://coveralls.io/github/coderaiser/readify?branch=master
[CoverageIMGURL]:           https://coveralls.io/repos/coderaiser/readify/badge.svg?branch=master&service=github

