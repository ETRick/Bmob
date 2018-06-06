class RemoteStorage {
    // 当前用户的Bmob objectId
    private currentUserObjectId: string
    // _User表的query
    private userQuery: any;

    private USER_TABLE_NAME = "_User";

    private innerLog: Function;

    public constructor() {
        super();
    }

    // 初始化
    public init(appId, restAPIKey) {
        Bmob.initialize(appId, restAPIKey);
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
     *  User添加/修改数据（保留数据不可修改）
     * 由于数量小，暂时都放在User表中
     */
    public async setUserRecord(key: string, value: string) {
        try {
            let queryRst = await this.userQuery.get(this.currentUserObjectId);
            queryRst.set(key, value);
            await queryRst.save();
        } catch (e) {
            this.innerLog("setUserRecord save error: " + JSON.stringify(e));
        }
    }

    /**
     * 获取用户某个字段的值
     * 由于数量小，暂时都放在User表中
     */
    public async getUserRecord(key: string) {
        try {
            let result = await this.userQuery.get(this.currentUserObjectId);
            return result[key];
        } catch (e) {
            this.innerLog("getUserRecord save error : " + JSON.stringify(e));
        }
    }

    /**
     * 删除用户某个字段
     */
    public async deleteUserRecord(key: string) {
        try {
            let query = await this.userQuery.get(this.currentUserObjectId);
            query.unset(key);
            query.save();
        } catch (e) {
            this.innerLog("deleteUserRecord save error : " + JSON.stringify(e));
        }
    }

    public find(tableName: string, equalParams: QueryEqualParam[] = []): QueryTask {
        let query = Bmob.Query(tableName);
        return new QueryTask(query);
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

class QueryTask {
    private query: any;
    constructor(query: any) {
        this.query = query;
    }

    public ands(params: QueryEqualParam[]) {
        for (let i = 0; i < params.length; i++) {
            let param = params[i];
            this.query.equalTo(param.key, param.operator, param.val);
        }

        return this;
    }

    public and(param: QueryEqualParam) {
        this.query.equalTo(param.key, param.operator, param.val);
        return this;
    }

    public or(param1: QueryEqualParam, param2: QueryEqualParam) {
        const query1 = this.query.equalTo(param1.key, param1.operator, param1.val);
        const query2 = this.query.equalTo(param2.key, param2.operator, param2.val);
        this.query.or(query1, query2);
        return this;
    }

    public async complete() {
        let result = await this.query.find();
        return result;
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
    constructor(key: string, operator: string, val: any, isOr: boolean = false) {
        this.key = key;
        this.operator = operator,
        this.val = val;
    }
}
