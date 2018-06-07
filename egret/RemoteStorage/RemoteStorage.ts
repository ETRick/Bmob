/**
 * Bmob接口封装
 * 请先调用init完成初始化后再进行其他操作
 */
class RemoteStorage {
    // 当前用户的Bmob objectId
    public currentUserObjectId: string
    // _User表的query
    private userQuery: any;

    private USER_TABLE_NAME = "_User";

    private innerLog: Function;

    public constructor() {
        super();
    }

    /**
     * 初始化
     */
    public init() {
        // 初始化这里id自己替换
        Bmob.initialize(GlobalData.BmobAppID, GlobalData.BmobRestApiKey);
        this.innerLog = console.log.bind(console, "[RemoteStorage] ");
    }

    /**
     * 用户登陆(登陆失败则自动注册)
     */
    public async login(username: string, password: string) {
        try {
            let loginRst = await Bmob.User.login(username, password);
            this.currentUserObjectId = loginRst.objectId;
            this.userQuery = Bmob.Query(this.USER_TABLE_NAME);
            this.innerLog("LoginSuccess");
        } catch (e) {
            try {
                let registerRst = await this.register(username, password);
                await this.login(username, password);
                this.innerLog("LoginSuccess");
            } catch (e) {
                this.innerLog("register error: " + JSON.stringify(e));
                throw (e);
            }
        }
    }

    /**
     * 获取表中objectId为objId的记录
     */
    public async getRecord(tableName: string, objId: string) {
        let query = Bmob.Query(tableName);
        let result = await query.get(objId);
        return result;
    }

    /**
     * 删除一条记录
     */
    public async removeRecord(tableName: string, objectId: string) {
        const query = Bmob.Query(tableName);
        return await query.destroy(objectId);
    }

    /**
     * 增加一条记录
     */
    public async addRecord(tableName: string, keyValues: [[string, any]]) {
        const query = Bmob.Query(tableName);
        for (var i = 0; i < keyValues.length; i++) {
            query.set(keyValues[i][0], keyValues[i][1]);
        }
        return await query.save();
    }

    /**
     * 添加/修改数据（保留数据不可修改）
     */
    public async setAttribute(tableName: string, objId: string, key: string, value: string) {
        try {
            let queryRst = await this.getRecord(tableName, objId);
            queryRst.set(key, value);
            return await queryRst.save();
        } catch (e) {
            this.innerLog("setUserRecord save error: " + JSON.stringify(e));
        }
    }

    /**
     * 获取表中objId对应记录的某个字段的值
     */
    public async getAttribute(tableName: string, objId: string, key: string) {
        try {
            let queryRst = await this.getRecord(tableName, objId);
            return queryRst[key];
        } catch (e) {
            this.innerLog("getUserRecord save error : " + JSON.stringify(e));
        }
    }

    /**
     * 删除某个字段
     */
    public async removeAttribute(tableName: string, objId: string, key: string) {
        try {
            let queryRst = await this.getRecord(tableName, objId);
            queryRst.unset(key);
            return await queryRst.save();
        } catch (e) {
            this.innerLog("deleteUserRecord save error : " + JSON.stringify(e));
        }
    }

    /**
     * 查询
     */
    public find(tableName: string, equalParams: QueryEqualParam[] = []): QueryTask {
        let query = Bmob.Query(tableName);
        return new QueryTask(query);
    }

    // 字段数组操作------------------------------------------------------------------
    /**
     * 更新数组(原子操作)
     * add在一个数组的末尾加入一个给定的对象。
     * addUnique只会把原本不存在的对象加入数组，所以加入的位置没有保证
     */
    public async updateArray(tableName: string, objectId: string, key: string, arr: any[], isUnique: boolean = true) {
        let rst = await this.getRecord(tableName, objectId);
        if (isUnique) {
            rst.addUnique(key, arr);
        } else {
            rst.add(key, arr);
        }
        return await rst.save();
    }

    /**
     * 删除数组(原子操作)
     */
    public async removeArray(tableName: string, objectId: string, key: string, arr: any[]) {
        let rst = await this.getRecord(tableName, objectId);
        rst.remove(key, arr);
        return await rst.save();
    }

    // end of 字段数组操作------------------------------------------------------------

    /**
     * 批量修改
     */
    public async batchModify(queryResult: any, keyValues: [string, any][]) {
        for (var i = 0; i < keyValues.length; i++) {
            queryResult.set(keyValues[i][0], keyValues[i][1]);
        }
        return await queryResult.saveAll();
    }

    /**
     * 批量增加
     */
    public async batchAdd(tableName: string, keyValues: [string, any][]) {
        let queryArray = [];
        for (var i = 0; i < keyValues.length; i++) {
            var queryObj = Bmob.Query(tableName);
            queryObj.set(keyValues[i][0], keyValues[i][1]);
            queryArray.push(queryObj);
        }

        return await Bmob.Query(tableName).saveAll(queryArray);
    }

    /**
     * 批量删除
     */
    public async batchRemove(queryResult) {
        return await queryResult.destroyAll();
    }

    /**
     * 绑定一对多数据，设置Relation和Pointer
     */
    public async bindOne2Many(
        oneTableName: string,
        oneObjId: string,
        manyTableName: string,
        manyObjIds: string[],
        relationKey: string = "two",
        pointerKey: string = "own") {

        let addRelationResut = this.addRelation(oneTableName, oneObjId, manyTableName, manyObjIds, relationKey);

        var addPiointerRsts = [];
        for (var i = 0; i < manyObjIds.length; i++) {
            let objId = manyObjIds[i];
            let addPointerRst = this.addPointer(manyTableName, objId, oneTableName, oneObjId, pointerKey);
            addPiointerRsts.push(addPointerRst);
        }

        // 上面先不等待一起执行，下面等待结果
        await addRelationResut;
        for (var i = 0; i < manyObjIds.length; i++) {
            await addPiointerRsts[i];
        }
    }

    /**
     * 解除一对多数据绑定
     */
    public async unBindOne2Many(
        oneTableName: string,
        oneObjId: string,
        manyTableName: string,
        manyObjIds: string[],
        relationKey: string = "two",
        pointerKey: string = "own") {

        let removeRelationRst = this.removeRelation(oneTableName, oneObjId, manyTableName, manyObjIds, relationKey);

        var removePiointerRsts = [];
        for (var i = 0; i < manyObjIds.length; i++) {
            let objId = manyObjIds[i];
            let removePointerRst = this.removePointer(manyTableName, objId, pointerKey);
            removePiointerRsts.push(removePointerRst);
        }

        // 上面先不等待一起执行，下面等待结果
        await removeRelationRst;
        for (var i = 0; i < manyObjIds.length; i++) {
            await removePiointerRsts[i];
        }
    }

    /**
     * 获取point的记录（只有一条）
     * 文档写的看不懂，照着写，跑不通
     */
    public async getPointedRecord(tableName: string, objectId: string, pointerKey: string = "own") {
        let query = Bmob.Query(tableName);
        //下面参数为Pointer字段名称， 可以一次查询多个表
        query.include(pointerKey);
        let rst = await query.find();
        return rst;
    }

    /**
     * 查询relatedTableName中objectId关联的记录（多条）
     * 不知道为什么有404错误，还没测通
     */
    public async getRelatedRecords(tableName: string, objectId: string, relatedTableName: string, relationKey: string) {
        let query = Bmob.Query(tableName)
        query.field(relationKey, objectId);
        let rst = await query.relation(relatedTableName);
        return rst;
    }

    /**
     * 增加Relation(推荐始用bindOne2Many来进行双向绑定)
     */
    public async addRelation(curTableName: string, curObjId: string, relatedTableName: string, relatedObjIds: string[], relatioKey: string) {
        let relation = Bmob.Relation(relatedTableName);
        let rekationId = relation.add(relatedObjIds);
        let query = Bmob.Query(curTableName);
        let rst = await query.get(curObjId);
        rst.set(relatioKey, rekationId);
        return await rst.save()
    }

    /**
     * 删除指定Relation(推荐始用unbindOne2Many来进行双向解绑)
     */
    public async removeRelation(curTableName: string, curObjId: string, relatedTableName: string, removeObjIds: string[], relatioKey: string) {
        let relation = Bmob.Relation('_User');
        let rekationId = relation.remove(removeObjIds);
        let query = Bmob.Query(curTableName);
        let rst = await query.get(curObjId);
        rst.set(relatioKey, rekationId);
        return await rst.save()
    }

    /**
    * 增加Pointer(推荐始用bindOne2Many来进行双向绑定)
    */
    public async addPointer(curTableName: string, curObjId: string, onwerTableName: string, ownerObjId: string, keyName: string = "own") {
        const pointer = Bmob.Pointer(onwerTableName);
        const pointId = pointer.set(ownerObjId);
        const query = Bmob.Query(curTableName);
        let queryRst = await query.get(curObjId);
        queryRst.set(keyName, pointId);
        return await queryRst.save();
    }

    /**
     * 删除Pointer(推荐始用unbindOne2Many来进行双向解绑)
     */
    public async removePointer(curTableName: string, curObjId: string, pointerKey: string = "own") {
        return await this.removeAttribute(curTableName, curObjId, pointerKey);
    }

    /**
     * 用户注册
     */
    private register(username: string, password: string): Promise<any> {
        let params = {
            username: username,
            password: password,
            email: `${username}@brainKing.com`
        }

        return Bmob.User.register(params).then();
    }
}

/**
 * 装饰者模式对Bmob的query的查询进行封装的类
 */
class QueryTask {
    private bmombQuery: any;
    constructor(bmombQuery: any) {
        this.bmombQuery = bmombQuery;
    }

    // 多个条件与
    public ands(params: QueryEqualParam[]) {
        for (let i = 0; i < params.length; i++) {
            let param = params[i];
            this.bmombQuery.equalTo(param.key, param.operator, param.val);
        }
        return this;
    }

    // 条件与
    public and(param: QueryEqualParam) {
        this.bmombQuery.equalTo(param.key, param.operator, param.val);
        return this;
    }

    // 条件或
    // 有bug，报错
    public or(param1: QueryEqualParam, param2: QueryEqualParam) {
        const query1 = this.bmombQuery.equalTo(param1.key, param1.operator, param1.val);
        const query2 = this.bmombQuery.equalTo(param2.key, param2.operator, param2.val);
        this.bmombQuery.or(query1, query2);
        return this;
    }

    // 分页
    public limit(param: number) {
        this.bmombQuery.limit(param);
        return this;
    }

    // 跳过查询的前多少条数据
    public skip(param: number) {
        this.bmombQuery.skip(param);
        return this;
    }

    // 查询指定列, 符合之前条件的列都会被返回，但是返回的结果中只包含 保存字段和select的字段
    public select(key: string) {
        this.bmombQuery.select(key);
        return this;
    }

    // 查询某一字段值在某一集合中的记录
    public containedIn(key: string, array: any[]) {
        this.bmombQuery.containedIn(key, array);
        return this;
    }

    // 查找存在key字段的记录
    public exists(key: string) {
        this.bmombQuery.exists(key);
        return this;
    }

    // 查找不存在key字段的记录
    public doesNotExist(key: string) {
        this.bmombQuery.doesNotExist(key);
        return this;
    }

    // 结果正序排列
    public orderBy(key: string) {
        this.bmombQuery.order(key);
        return this;
    }

    // 结果反序排列
    public orderByDesc(key: string) {
        this.bmombQuery.order("-" + key);
        return this;
    }

    /**
     * 结束查询，异步等待结果
     */
    public async query() {
        return await this.bmombQuery.find();
    }

    /**
     * 结束查询，异步返回符合条件的记录数目
     */
    public async count() {
        return await this.bmombQuery.count();
    }
}

// Query equal 查询始用的operator
const QueryOperator = {
    eq: "==",
    ne: "!=",
    gt: ">",
    ge: ">=",
    lt: "<",
    le: "<="
}

// 查询参数对象
class QueryEqualParam {
    public key: string;
    public operator: string;
    public val: any;
    constructor(key: string, operator: string, val: any) {
        this.key = key;
        this.operator = operator;
        this.val = val;
    }
}
