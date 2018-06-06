/**
 * 更新于2018.6.6，
 * 适用于Bmob-1.5.0
 * https://github.com/bmob/hydrogen-js-sdk/blob/master/dist/Bmob-1.5.0.min.js
 * API参考http://doc.bmob.cn/data/wechat_app_new/index.html#_6
 */
declare namespace Bmob {
    /**
     * 初始化
     * @ appId: 你的Application ID
     * @ restApiKey: 你的REST API Key,
     * @ masterKey: 你的MasterKey（warning：MasterKey只在开发环境下使用，不要把MasterKey发布出去）
     */
    function initialize(appId: string, restApiKey: string, masterKey?: string);

    // User
    namespace User {
        /**
         * 登陆
         */
        function login(userName: string, password: string): Promise<any>;
        /**
         * 注册
         * @ params: {
         *      username: string,
         *      password: string,
         *      email: string,
         *      phone?: string
         *  }
         */
        function register(params): Promise<any>;
        /**
         * 手机验证码登陆
         */
        function signOrLoginByMobilePhone(phone: number, smsCode: number): Promise<any>;
        /**
         * 更新用户缓存
         * 通过用户名密码登陆，登陆成功后会在本地缓存保存用户的信息
         */
        function updateStorage(objectId: string): Promise<any>;
        /**
         * 查询用户
         */
        function users(): Promise<any>;
        /**
         * 获取用户登录信息
         * 此函数获取本地缓存用户信息，登陆后才有值，使用值前请先判断是否为空。
         * 微信小程序，小游戏适用， 快应用请始用异步方式获取
         */
        function current(): any
        /**
         * 快应用获取用户登陆信息
         */
        function current(): Promise<any>;
        /**
         * 验证 Email
         */
        function requestEmailVerify(emial: string): Promise<any>;
        /**
         *  小程序一键登录
         */
        function auth(): Promise<any>;
    }

    /**
     * 密码重置
     * @ data: {
     *      email: string
     *  }
     */
    function requestPasswordReset(data: any): Promise<any>;
    /**
     * 短信密码重置
     * @  data = {
     *      password: string
     *    }
     */
    function resetPasswordBySmsCode(smsCode: string, data: any): Promise<any>;
    /**
     * 提供旧密码方式安全修改用户密码
     * @ objectId: 用户id
     * @ data: {
     *      oldPassword: string,
     *      newPassword: string
     *      }
     */
    function updateUserPassword(objectId: string, data): Promise<any>;
    /**
     * App推送
     * @ data: 根据不同的需求进行定制
     */
    function push(data): Promise<any>;
    /**
     * 获取query
     */
    function Query(tableName: string);

    // Pointer 类型在数据库是一个json数据类型
    function Pointer(tableName: string);

    function Relation(tableName: string);

    // class Query {
    //     constructor(tableName: string);
    //     // 获取一行记录
    //     get(objectId): Promise<any>;
    //     //新增一行记录/修改一行记录
    //     set(key: string, data: string);
    //     // 保存
    //     save(): Promise<any>;
    //     // 删除
    //     unset(objectId: string): Promise<any>;
    //     // 查询所有数据
    //     find(): Promise<any>;
    //     // 在一个数组的末尾加入一个给定的对象
    //     add(objectId: string, array: any[]);
    //     // 只把原本不存在的对象加入数组
    //     addUnique(objectId: string, array: any[]);
    //     // 条件查询 equalTo 方法支持 "==","!=",">",">=","<","<="
    //     equalTo(key, operator, val);
    //     // 或查询
    //     or(queryResult1: any, queryResult2: any);
    //     // 查询指定列
    //     select(key: string);
    //     // 查询某一字段值在某一集合中的记录的话
    //     containedIn(key: string, array: any[]);
    //     // 查询含有某一特定属性的对象
    //     exists(key: string);
    //     // 查询不含有某一特定属性的对象
    //     doesNotExist(key: string);
    //     // 分页查询
    //     limit(parma: number);
    //     // 跳过查询的前多少条数据来实现分页查询的功能, 默认为10， 最大有效设置值1000
    //     skip(param: number);
    //     // 结果排序, （只支持number，date，string类型的排序）
    //     order(key);
    //     // 统计记录数量
    //     count(): Promise<any>;
    //     // 批量保存
    //     saveAll(array: any[]);

    //     field(key: string, objectId: string);
    //     // 查询Relation类型
    //     relation(tableName: string): Promise<any>;
    // }
}
