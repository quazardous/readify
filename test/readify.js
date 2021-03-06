'use strict';

let readify = require('..');
const os = require('os');
const fs = require('fs');
const path = require('path');
const test = require('tape');
const sinon = require('sinon');
const exec = require('execon');

const noop = () => {};

test('path: wrong', t => {
    readify('/wrong/path', (error) => {
        t.ok(error, error.message);
        t.end();
    });
});

test('path: correct', (t) => {
    readify('.', (error, json) => {
        t.notOk(error, 'no error');
        
        t.ok(json, 'json');
        t.equal(typeof json.path, 'string');
        t.ok(Array.isArray(json.files));
        
        t.end();
    });
});

test('result: should be sorted by name folders then files', (t) => {
    readify('.', (error, json) => {
        t.notOk(error, 'no error');
        
        const all   = json.files,
            isDir   = file => file.size === 'dir',
            not     = (fn) => {
                return (...args) => {
                    fn(...args);
                };
            },
            
            isFile  = not(isDir),
            
            files   = all.filter(isFile),
            dirs    = all.filter(isDir),
            
            names   = dirs
                .concat(files)
                .map(file =>
                    file.name
                ),
                
            sorted = names.sort((a, b) =>
                a > b ? 1 : -1
            );
        
        t.deepEqual(names, sorted);
        
        t.end();
    });
});

test('readify sort: accent', (t) => {
    const files = [
        'a.txt',
        'd.txt',
        'e.txt',
        'é.txt',
        'è.txt',
        'f.txt',
        'z.txt'
    ];
    
    const dir = path.join(__dirname, 'fixture', 'accents');
    readify(dir, (error, data) => {
        const names = data.files.map((file) => {
            return file.name;
        });
        
        t.deepEqual(names, files, 'should use correct order for accents');
        t.end();
    });
});

test('readify: result: no owner', (t) => {
    const update = () => {
        delete require.cache[require.resolve('..')];
        readify = require('..');
    };
    
    const {readdir, stat} = fs;
    
    const name = 'hello.txt';
    const mode = 16893;
    const size = 1024;
    const mtime = new Date('2016-11-23T14:36:46.311Z');
    const uid = 2;
    
    fs.readdir = (dir, fn) => {
        fn(null, [name]);
    };
    
    fs.stat = (name, fn) => {
        fn(null, {
            isDirectory: noop,
            name,
            mode,
            size,
            mtime,
            uid
        });
    };
    
    const expected = {
        path: './',
        files: [{
            name,
            size: '1.00kb',
            date: '23.11.2016',
            /* depends on npm@nicki     */
            /* could be different   */
            /* owner: 'bin',        */
            mode: 'rwx rwx r-x'
        }]
    };
    
    update();
    
    readify('.', (error, result) => {
        result.files = result.files.map(function(file) {
            delete file.owner;
            return file;
        });
        t.deepEqual(result, expected, 'should get raw values');
        
        fs.readdir = readdir;
        fs.stat = stat;
        
        update();
        
        t.end();
    });
});

test('readify: result: owner', (t) => {
    const update = () => {
        delete require.cache[require.resolve('..')];
        readify = require('..');
    };
    
    const {readdir, stat} = fs;
    
    const name = 'hello.txt';
    const mode = 16893;
    const size = 1024;
    const mtime = new Date('2016-11-23T14:36:46.311Z');
    const uid = 2;
    
    fs.readdir = (dir, fn) => {
        fn(null, [name]);
    };
    
    fs.stat = (name, fn) => {
        fn(null, {
            isDirectory: noop,
            name,
            mode,
            size,
            mtime,
            uid
        });
    };
    
    update();
    
    readify('.', (error, result) => {
        t.ok(result.files[0].owner, 'should contain owner');
        
        fs.readdir = readdir;
        fs.stat = stat;
        
        update();
        
        t.end();
    });
});

test('readify: result: "raw"', (t) => {
    const update = () => {
        delete require.cache[require.resolve('..')];
        readify = require('..');
    };
    
    const {readdir, stat} = fs;
    
    const name = 'hello.txt';
    const mode = 16893;
    const size = 1024;
    const mtime = new Date();
    const uid = 1000;
    
    fs.readdir = (dir, fn) => {
        fn(null, [name]);
    };
    
    fs.stat = (name, fn) => {
        fn(null, {
            isDirectory: noop,
            name,
            mode,
            size,
            mtime,
            uid
        });
    };
    
    const expected = {
        path: './',
        files: [{
            name,
            size,
            date: mtime,
            owner: uid,
            mode
        }]
    };
    
    update();
    
    readify('.', 'raw', (error, result) => {
        t.deepEqual(expected, result, 'should get raw values');
        
        fs.readdir = readdir;
        fs.stat = stat;
        
        update();
        
        t.end();
    });
});

test('readify: result: "raw": dir', (t) => {
    const update = () => {
        delete require.cache[require.resolve('..')];
        readify = require('..');
    };
    
    const {readdir, stat} = fs;
    
    const name = 'hello.txt';
    const mode = 16893;
    const size = 1024;
    const mtime = new Date();
    const uid = 1000;
    
    fs.readdir = (dir, fn) => {
        fn(null, [name]);
    };
    
    fs.stat = (name, fn) => {
        fn(null, {
            isDirectory: () => true,
            name,
            mode,
            size,
            mtime,
            uid
        });
    };
    
    const expected = {
        path: './',
        files: [{
            name,
            size: 'dir',
            date: mtime,
            owner: uid,
            mode
        }]
    };
    
    update();
    
    readify('.', 'raw', (error, result) => {
        t.deepEqual(expected, result, 'should get raw values');
        
        fs.readdir = readdir;
        fs.stat = stat;
        
        update();
        
        t.end();
    });
});

test('readify: result: uid: 0', (t) => {
    const update = () => {
        delete require.cache[require.resolve('..')];
        readify = require('..');
    };
    
    const {readdir, stat} = fs;
    
    const name = 'hello.txt';
    const mode = 16893;
    const size = 1024;
    const mtime = new Date();
    const uid = 0;
    
    fs.readdir = (dir, fn) => {
        fn(null, [name]);
    };
    
    fs.stat = (name, fn) => {
        fn(null, {
            isDirectory: () => true,
            name,
            mode,
            size,
            mtime,
            uid
        });
    };
    
    const expected = {
        path: './',
        files: [{
            name,
            size: 'dir',
            date: '10.01.2017',
            owner: 'root',
            mode: 'rwx rwx r-x'
        }]
    };
    
    update();
    
    readify('.', (error, result) => {
        t.deepEqual(result, expected, 'should get raw values');
        
        fs.readdir = readdir;
        fs.stat = stat;
        
        update();
        
        t.end();
    });
});

test('readify: result: nicki: no name found', (t) => {
    const update = () => {
        delete require.cache[require.resolve('..')];
        readify = require('..');
    };
    
    const {readdir, stat} = fs;
    
    const name = 'hello.txt';
    const mode = 16893;
    const size = 1024;
    const mtime = new Date();
    const uid = Math.random();
    
    fs.readdir = (dir, fn) => {
        fn(null, [name]);
    };
    
    fs.stat = (name, fn) => {
        fn(null, {
            isDirectory: () => true,
            name,
            mode,
            size,
            mtime,
            uid
        });
    };
    
    const expected = {
        path: './',
        files: [{
            name,
            size: 'dir',
            date: '10.01.2017',
            owner: uid,
            mode: 'rwx rwx r-x'
        }]
    };
    
    update();
    
    readify('.', (error, result) => {
        t.deepEqual(result, expected, 'should get raw values');
        
        fs.readdir = readdir;
        fs.stat = stat;
        
        update();
        
        t.end();
    });
});
test('result: files should have fields name, size, date, owner, mode', (t) => {
    readify('.', (error, json) => {
        const files       = json.files,
            length      = files.length,
            check       = () =>
                files.filter((file) =>
                    Object.keys(file).join(':') === 'name:size:date:owner:mode'
                ).length;
        
        t.notOk(error, 'no error');
        
        t.equal(check(), length, 'files array do not have fields: name, size, date, owner, mode');
        
        t.end();
    });
});

test('result: file names should not be empty', t => {
    readify('.', (error, json) => {
        const files       = json.files,
            check       = () =>
                files.filter((file) =>
                    !file.name
                ).forEach(file => {
                    throw Error('Filename should not be empty!\n' + JSON.stringify(file));
                });
        
        t.notOk(error, 'no error');
        t.doesNotThrow(check, 'should not throw');
        t.end();
    });
});

test('result: read empty directory', function(t) {
    var tmp = Math.random(),
        dir = os.tmpdir() + '/readify-' + tmp;
    
    fs.mkdir(dir, function(error) {
        t.notOk(error, 'directory created');
        
        readify(dir, function(error) {
            t.notOk(error, 'successfully read');
            
            fs.rmdir(dir, function(error) {
                t.notOk(error, 'directory removed');
                t.end();
            });
        });
    });
});

test('arguments: exception when no path', t => {
    t.throws(readify, /path should be string!/, 'should throw when no path');
    t.end();
});

test('arguments: exception when no callback', t => {
    const noCallback = exec.with(readify, '.');
    
    t.throws(noCallback, /callback should be function!/, 'should throw when no callback');
    t.end();
});

test('readify stat: error', (t) => {
    const stat = fs.stat;
    const files = [
        'readify.js',
        'readify.min.js',
        'readify.min.js.map'
    ].map((name) => {
        return {
            name,
            size: '0b',
            date: '',
            owner: 0,
            mode: ''
        };
    });
    
    fs.stat = (name, fn) => {
        fn(Error('EBUSY: resource busy or locked'));
    };
    
    const dir = path.resolve(__dirname, '..', 'dist');
    readify(dir, (error, data) => {
        t.notOk(error, 'no error when stat error');
        
        t.deepEqual(data.files, files, 'size, date, owner, mode should be empty');
        
        fs.stat = stat;
        t.end();
    });
});

test('readify sort: name asc', (t) => {
    const files = [
        '1.txt',
        '2.txt',
        '3.txt'
    ];
    
    readify('./test/dir', {sort: 'name'}, (error, data) => {
        t.notOk(error, 'no error');
        data.files = data.files.map(function(file) {
            return file.name;
        });
        t.deepEqual(data.files, files, 'correct order');
        t.end();
    });
});

test('readify sort: name desc', (t) => {
    const files = [
        '3.txt',
        '2.txt',
        '1.txt'
    ];
    
    readify('./test/dir', {sort: 'name', order: 'desc'}, (error, data) => {
        t.notOk(error, 'no error');
        data.files = data.files.map(function(file) {
            return file.name;
        });
        t.deepEqual(data.files, files, 'correct order');
        t.end();
    });
});

test('readify sort: size asc', (t) => {
    const files = [
        '2.txt',
        '3.txt',
        '1.txt'
    ];
    
    readify('./test/dir', {sort: 'size', order: 'asc'}, (error, data) => {
        t.notOk(error, 'no error');
        data.files = data.files.map(function(file) {
            return file.name;
        });
        t.deepEqual(data.files, files, 'correct order');
        t.end();
    });
});

test('readify sort: size asc raw', (t) => {
    const files = [
        '2.txt',
        '3.txt',
        '1.txt'
        ];
    
    readify('./test/dir', {sort: 'size', type: 'raw'}, (error, data) => {
        t.notOk(error, 'no error');
        data.files = data.files.map(function(file) {
            return file.name;
        });
        t.deepEqual(data.files, files, 'correct order');
        t.end();
    });
});

// no comment
test('readify sort: owner', (t) => {
    readify('./test/dir', {sort: 'owner'}, (error) => {
        t.notOk(error, 'no error');
        t.end();
    });
});

test('readify sort: date', (t) => {
    readify('./test/dir', {sort: 'date'}, (error) => {
        t.notOk(error, 'no error');
        t.end();
    });
});

test('browser: filer', (t) => {
    const Filer = {
        FileSystem: sinon.stub()
    };
    
    require('filer');
    require.cache[require.resolve('filer')].exports = Filer;
    
    before();
    
    t.ok(Filer.FileSystem.called, 'Filer should be called');
    
    after();
    
    t.end();
});

test('browser: nicki', (t) => {
    const FileSystem = function() {
        this.readdir = (name, callback) => callback(null, []);
    };
    
    const Filer = {
        FileSystem
    };
    
    const nicki = sinon.spy();
    
    require('nicki');
    require.cache[require.resolve('nicki')].exports = nicki;
    require('filer');
    require.cache[require.resolve('filer')].exports = Filer;
    
    before();
    
    readify(__dirname, (error) => {
        t.notOk(error, 'should not be error');
        t.notOk(nicki.called, 'nicki should not be called');
        t.end();
    });
});

function before() {
    global.window = {};
    delete require.cache[require.resolve('..')];
    readify = require('..');
}

function after() {
    delete global.window;
    delete global.Filer;
}

