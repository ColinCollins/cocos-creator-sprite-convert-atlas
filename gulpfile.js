const { series, parallel } = require('gulp');
const globby = require('globby');
const fs = require('fs');

const txtPath = 'C:/UnityWork/jump/client/cocos_client/assets/res/';
const prefabPath = 'C:/UnityWork/jump/client/cocos_client/assets/res/prefabs'
const plistPath = 'C:/UnityWork/jump/client/cocos_client/assets/resources/atlas';

// object
function metaObj () {}
function prefabObj () {}
function plistObj () {}

let metaDatas = [];
let prefabDatas = [];
let plistDatas = [];

// texture
function global (done) {

    done();
}

function initMeta (done) {
    var rawPath = globby.sync(txtPath + 'standTextures', {
        expandDirectories: {
            files: ['**/*'],
            extensions: ['png.meta']
        }
    });

    rawPath.forEach(path => {
        var data = fs.readFileSync(path, {
            encoding: 'utf8'
        });

        let parse = JSON.parse(data);
        let tmp = new metaObj();
        tmp.path = path;
        tmp.name = Object.getOwnPropertyNames(parse.subMetas)[0];
        // console.log(tmp.name);
        tmp.uuid = parse.subMetas[tmp.name].uuid;
        
        metaDatas.push(tmp);
    });
    

    done();
}

function initPrefabs(done) {
    var rawPath = globby.sync(prefabPath, {
        expandDirectories: {
            files: ['**/*'],
            extensions: ['prefab']
        }
    });

    rawPath.forEach(path => {
        var data = fs.readFileSync(path, {
            encoding: 'utf8'
        });

        let parse = JSON.parse(data);
        let tmp = new prefabObj();
        tmp.name = parse[1]['_name'];
        tmp.uuids = [];

        for (let i = 0; i < parse.length; i++) {
            let d = parse[i];
            if (d['__type__'] === 'cc.Sprite') {
                // console.log(parse[1]['_name']);
                tmp.uuids.push(d['_spriteFrame']['__uuid__']);
            }
        }
        
        prefabDatas.push(tmp);
    });

    done();
}

function initPlist (done) {
    var rawPath = globby.sync(plistPath, {
        expandDirectories: {
            files: ['**/*'],
            extensions: ['plist.meta']
        }
    });

    rawPath.forEach(path => {
        var data = fs.readFileSync(path, {
            encoding: 'utf8'
        });

        let parse = JSON.parse(data);

        let plistData = Object.getOwnPropertyNames(parse.subMetas);
        let plist = new plistObj();
        plist.uuid = plistData.uuid;

        for (let i = 0; i < plistData.length; i++) {
            let tmp = new Object();
            tmp.name = plistData[i];
            tmp.uuid = parse.subMetas[plistData[i]].uuid;
        }

        plistDatas.push(plist);
    });
    
    done();
}

function convert (done) {

    // 数据测试 meta
    let block1 = prefabDatas[0];
    
    for (let i = 0; i < block1.uuids.length; i++) {
        let oldUUid = block1.uuids[i];

        
    }

    metaDatas.forEach(meta => {

    });
    
    plistDatas.forEach(plist => {

    });

    done();
}


exports.default = series(global, initMeta, initPrefabs, initPlist, convert);