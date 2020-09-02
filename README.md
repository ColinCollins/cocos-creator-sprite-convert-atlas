# cocos-creator-sprite-convert-atlas
用于 cocos creator 碎图覆盖图集资源

1. 进入 gulpfile，设定 prefab 文件夹目录，atlas 文件夹目录，texture 碎图文件夹目录
通过 globby 遍历所有碎图 meta 后获取对应的 uuid 以及 name 属性
在 convert 过程中 遍历 prefab 的 sprite uuid 查找到对应的 uuid 后找到对应 texture name
在遍历 atlas 查看 name contain texture_name 后替换对应 prefab 的 uuid 。

这里是通过 regex 直接替换 string 类型的 uuid 但是暂时没这么写