const { series, parallel } = require('gulp');
const globby = require('globby');
const fs = require('fs');

// modify path
const txtPath = ['C:/UnityWork/jump/client/cocos_client/assets/res/standTextures', 'C:/UnityWork/jump/client/cocos_client/assets/res/modifyTexture'];
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
function initMeta (done) {
    var rawPath = globby.sync(txtPath + '', {
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
        tmp.path = path;
        tmp.rawData = parse;
        tmp.name = parse[1]['_name'];
        tmp.oldUUids = [];
        tmp.newSprites = [];

        for (let i = 0; i < parse.length; i++) {
            let d = parse[i];
            if (d['__type__'] === 'cc.Sprite' && !d['_atlas']) {
                // console.log(parse[1]['_name']);
                tmp.oldUUids.push(d['_spriteFrame']['__uuid__']);
            }
        }

        if (tmp.oldUUids.length > 0)
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
        plist.uuid = parse.uuid;
        plist.sprites = [];

        for (let i = 0; i < plistData.length; i++) {
            let tmp = new Object();
            tmp.name = plistData[i];
            tmp.uuid = parse.subMetas[plistData[i]].uuid;
            plist.sprites.push(tmp);
        }

        plistDatas.push(plist);
    });
    
    done();
}

// remember // "_atlas": null,
function convert (done) {
    // 数据测试 meta
    // let block1 = prefabDatas[0];

    for (let i = 0; i < prefabDatas.length; i++) {
        let prefab = prefabDatas[i];
        if (convertData(prefab))
            writeData(prefab);
    }

    done();
}

function convertData (prefab) {
    for (let i = 0; i < prefab.oldUUids.length; i++) {
        let oldUUid = prefab.oldUUids[i];
        
        for (let j = 0; j < metaDatas.length; j++) {
            let meta = metaDatas[j];
            if (meta.uuid === oldUUid) {
                // 从名称中查找对应的 texture 数据
                for (let m = 0; m < plistDatas.length; m ++) {
                    let plist = plistDatas[m];
                    for (let n = 0; n < plist.sprites.length; n++) {
                        let sprite = plist.sprites[n];
                        // 若 plist sprite 的 name 中包含 meta 的 name，表示是同一张图，那么记录对应的 atlas uuid 以及 texture 的 uuid
                        if (sprite.name.includes(meta.name)) {
                            let t = new Object();
                            t.uuid = sprite.uuid;
                            t.atlasUUid = plist.uuid;
                            t.oldUUid = oldUUid;
                            prefab.newSprites.push(t);
                        }
                    }
                }

                break;
            }
        }
    }

    if (prefab.newSprites.length <= 0) {
        console.error(`警告数据丢失：${ prefab.name }`);
        return false;
    }
    
    try {
        for (let i = 0; i < prefab.newSprites.length; i++) {
            let sprite = prefab.newSprites[i];
            let oldId = sprite.oldUUid;
            for (let i = 0; i < prefab.rawData.length; i++) {
                let d = prefab.rawData[i];
                if (d['__type__'] === 'cc.Sprite' && d['_spriteFrame']['__uuid__'] === oldId) {
                    d['_spriteFrame']['__uuid__'] = sprite.uuid;
                    d['_atlas'] = {
                        __uuid__: sprite.atlasUUid
                    };
                }
            }
        }
    }
    catch (err) {
        console.error(err);
        return false; 
    }

    return true;
}

function writeData (prefab) {
    fs.writeFileSync(prefab.path, JSON.stringify(prefab.rawData));
}

exports.default = series(initMeta, initPrefabs, initPlist, convert);