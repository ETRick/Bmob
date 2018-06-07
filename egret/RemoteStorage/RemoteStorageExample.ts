class RemoteStoarageExample {

    private innerLog: Function;

    constructor() {
        this.innerLog = console.log.bind(console, "[RemoteStorageExample] ");
    }

    public async start() {
        await this.login();
        this.test();
    }

    // 用userCode登陆
    private async login() {
        // 这里是用户id，自己替换
        let userCode = await platform.login();
        try {
            // 这里是RemoteStorage的单例，实现方式自己定
            let remoteLoginRst = App.RemoteStorage.login(userCode, userCode);
            await remoteLoginRst;
        } catch (e) {
            this.innerLog("login err " + JSON.stringify(e));
        }
    }

    private test() {
        this.getOneRecord();
        // this.addNewRecord();
        // this.removeAttribute();
        // this.removeRecord();
        // this.queryAll();
        // this.updateArray();
        // this.removeArray();
        // this.queryTest();
        // this.batchModify();
        // this.batchAdd();
        // this.batchRemove();
        // this.bindOne2Many();
        // this.unBindOne2Many();
        // this.getRelatedRecords();
        // this.getPointedRecord();
    }

    // 通过主键获取一行记录
    private async getOneRecord() {
        let result = await App.RemoteStorage.getRecord("_User", "163f126f8d");
        this.innerLog(" getOneRecord " + JSON.stringify(result));
    }

    // 新增一行记录
    private async addNewRecord() {
        let result = await App.RemoteStorage.addRecord("Test", [["test", "addNewRecord"]]);
        this.innerLog(" addNewRecord " + JSON.stringify(result));
    }

    // 删除字段的值
    private async removeAttribute() {
        let result = await App.RemoteStorage.removeAttribute("Test", "m51S3336", "test");
        this.innerLog(" removeAttribute " + JSON.stringify(result));
    }

    // 删除一行记录
    private async removeRecord() {
        let result = await App.RemoteStorage.removeRecord("Test", "YfJV333W");
        this.innerLog(" removeRecord " + JSON.stringify(result));
    }

    // 查询一张表内所有记录
    private async queryAll() {
        let result = await App.RemoteStorage.find("Test").query();
        this.innerLog(" queryAll " + JSON.stringify(result));
    }

    // 添加数组
    private async updateArray() {
        let result = await App.RemoteStorage.updateArray("Test", "d02910ceb3", "arrTest", ["test1", "test2"]);
        this.innerLog(" updateArray " + JSON.stringify(result));
    }

    /**
     * 删除数组
     */
    private async removeArray() {
        let result = await App.RemoteStorage.removeArray("Test", "d02910ceb3", "arrTest", ["test2"]);
        this.innerLog(" removeArray " + JSON.stringify(result));
    }

    /**
     * 条件查询
     * query得到记录，count得到数量
     * 用法请看API， 参考http://doc.bmob.cn/data/wechat_app_new/index.html#_23
     */
    private async queryTest() {
        let param1 = new QueryEqualParam("createdAt", QueryOperator.le, "2018-06-07 18:00:28");
        let param2 = new QueryEqualParam("isLike", QueryOperator.le, 200);
        let param3 = new QueryEqualParam("isLike", QueryOperator.gt, 500)
        let count = await App.RemoteStorage.find("Test").and(param1).or(param2, param3).containedIn("isLike", [100, 150, 120, 500])
            .select("aab").exists("aab").doesNotExist("score").limit(5).orderByDesc("updatedAt")
            .count();

        this.innerLog(" queryTest count " + JSON.stringify(count));


        let result = await App.RemoteStorage.find("Test").and(param1).or(param2, param3).containedIn("isLike", [100, 150, 120, 500])
            .select("isLike").exists("aab").doesNotExist("score").limit(5).orderByDesc("updatedAt")
            .query();
        this.innerLog(" queryTest result " + JSON.stringify(result));
    }

    /**
     * 批量修改
     */
    private async batchModify() {
        let queryRst = await App.RemoteStorage.find("Test").exists("aab").query();
        let result = await App.RemoteStorage.batchModify(queryRst, [["aab", "batchModify"], ["aab2", "batchModify2"]]);
        this.innerLog(" batchModify " + JSON.stringify(result));
    }

    /**
     * 批量增加
     */
    private async batchAdd() {
        let result = await App.RemoteStorage.batchAdd("Test", [["aab", "1"], ["aab2", "2"]]);
        this.innerLog(" batchAdd " + JSON.stringify(result));
    }

    /**
     * 批量删除
     */
    private async batchRemove() {
        let param1 = new QueryEqualParam("createdAt", QueryOperator.gt, "2018-06-07 18:30:28");
        let queryRst = await App.RemoteStorage.find("Test").exists("aab").and(param1).query();
        let result = await App.RemoteStorage.batchRemove(queryRst);
        this.innerLog(" batchRemove " + JSON.stringify(result));
    }

    /**
     * 绑定一对多的关系
     */
    private async bindOne2Many() {
        // let result = await App.RemoteStorage.bindOne2Many("_User", "163f126f8d", "Test", ["XBHk333K", "m51S3336", "55c66bb44d"]);
        let result = await App.RemoteStorage.bindOne2Many("tableName", "28f3ab9279", "Test", ["XBHk333K", "m51S3336", "55c66bb44d"]);
        this.innerLog(" bindOne2Many " + JSON.stringify(result));
    }

    /**
     * 解绑一对多
     */
    private async unBindOne2Many() {
        let result = await App.RemoteStorage.unBindOne2Many("_User", "163f126f8d", "Test", ["XBHk333K", "m51S3336", "55c66bb44d"]);
        this.innerLog(" unBindOne2Many " + JSON.stringify(result));
    }

    /**
     * 获取related的记录
     */
    private async getRelatedRecords() {
        try {
            let result = await App.RemoteStorage.getRelatedRecords("tableName", "28f3ab9279", "Test", "two");
            this.innerLog(" getRelatedRecords " + JSON.stringify(result));
        } catch (e) {
            this.innerLog(e);
        }
    }

    private async getPointedRecord(){
         let result = await App.RemoteStorage.getPointedRecord("Test", "m51S3336");
        this.innerLog(" getPointedRecord " + JSON.stringify(result));
    }
}
