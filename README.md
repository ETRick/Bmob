# Bmob.d.ts

Bmob针对微信小程序和小游戏仅提供了js版本的库，并未提供TS版，所以在TS项目中，需要自己编写描述文件(如何编写typescript描述文件，请看：https://zhongsp.gitbooks.io/typescript-handbook/content/doc/handbook/declaration%20files/Introduction.html)

API参考 http://doc.bmob.cn/data/wechat_app_new/index.html#_6

本仓库提供了符合egret第三方库的Bmob(Bmob-1.5.0)库，egret工程可直接始用本仓库配置Bmob。
另，针对TS项目，本仓库提供了一个简易封装的RemoteStorage.ts，隐蔽了Bmob的细节。
实现了
- Bmob初始化
- 用户登陆（用户不存在的时候自动注册并登陆）
- 设置/更改/获取/删除 用户数据(User表中)
- 匹配查找（自己又加了一层封装，通过find方法获得QueryTask，通过装饰者模式增加匹配条件）


 * 适用于Bmob-1.5.0
 * Bomb-1.5.0.min.js下载地址 https://github.com/bmob/hydrogen-js-sdk/blob/master/dist/Bmob-1.5.0.min.js
