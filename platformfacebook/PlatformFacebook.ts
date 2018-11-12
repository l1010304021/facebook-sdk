class FacebookPlatfrom extends Platform
{
    private m_sSignature:                                   string;                             //Signature.



    //初始化平台
    protected async InitPlatform() : Promise<PromiseResult>
    {
        try
        {
            await FBInstant.initializeAsync();
        }
        catch(e)
        {
            console.log("Facebook initializeAsync() failed, code: " + e.code + " msg: " + e.message);

            return Promise.resolve({success: false, errcode: ErrorCode.OperationFailed, errmsg: e.message});
        }

        //IOS | ANDROID | WEB | MOBILE_WEB
        Platform.DeviceType = FBInstant.getPlatform();

        return Promise.resolve({success: true});
    }

    //Facebook 登陆
    protected async RequestLogin() : Promise<PromiseResult>
    {
        try
        {
            let ret = await FBInstant.player.getSignedPlayerInfoAsync();

            this.m_sSignature = ret.getSignature();
        }
        catch(e)
        {
            console.log("Facebook getSignedPlayerInfoAsync() failed, code: " + e.code + " msg: " + e.message);

            if (e.code === "NETWORK_FAILURE")
            {
                return Promise.resolve({success: false, errcode: ErrorCode.NetworkError, errmsg: e.message});
            }

            if (e.code === "INVALID_PARAM")
            {
                return Promise.resolve({success: false, errcode: ErrorCode.InvalidParameter, errmsg: e.message});
            }

            return Promise.resolve({success: false, errcode: ErrorCode.OperationFailed, errmsg: e.message});
        }

        return Promise.resolve({success: true});
    }

    /*
     * 设置加载进度，子类重载接口
     */
    public SetLoadingProgress(nProgress: number)
    {
        FBInstant.setLoadingProgress(nProgress);
    }

    /*
     * 开始游戏，子类重载接口，隐藏加载场景
     */
    public async StartGame(): Promise<PromiseResult>
    {
        try
        {
            await FBInstant.startGameAsync();

            return Promise.resolve({success: true});
        }
        catch(e)
        {
            console.log("Facebook FBInstant.startGameAsync() failed, code: " + e.code + " msg: " + e.message);

            return Promise.resolve({success: false, errcode: ErrorCode.OperationFailed, errmsg: e.message});
        }
    }

    public getEntryPointData(): Object
    {
        return FBInstant.getEntryPointData();
    }

    //创建玩家对象
    protected CreatePlayer()
    {
        //默认数据，子类自行重载
        return new FacebookPlayer(this.m_sSignature);
    }

    //获取排行榜
    protected async OnGetLeaderboard(sName: string) : Promise<PromiseResult>
    {
        try
        {
            let ret: FBInstant.Leaderboard = await FBInstant.getLeaderboardAsync(sName);

            this.m_arrayLeaderboard[sName] = new FacebookLeaderboard(ret);

            return Promise.resolve({success: true, data: this.m_arrayLeaderboard[sName]});
        }
        catch(e)
        {
            console.log("Facebook FBInstant.getLeaderboardAsync() failed, code: " + e.code + " msg: " + e.message);

            if(e.code === "LEADERBOARD_NOT_FOUND")
            {
                return Promise.resolve({success: false, errcode: ErrorCode.LeaderboardNotFound, errmsg: e.message});
            }

            if(e.code === "NETWORK_FAILURE")
            {
                return Promise.resolve({success: false, errcode: ErrorCode.NetworkError, errmsg: e.message});
            }

            if(e.code === "INVALID_PARAM")
            {
                return Promise.resolve({success: false, errcode: ErrorCode.InvalidParameter, errmsg: e.message});
            }

            return Promise.resolve({success: false, errcode: ErrorCode.OperationFailed, errmsg: e.message});
        }
    }

    /*
     * 更新消息
     */
    private UpdateAsync(image: string, text: string, data?: object) : Promise<PromiseResult>
    {
        let payLoad: FBInstant.CustomUpdatePayload = {
            action:                     "CUSTOM",
            template:                   "",
            image:                      image,
            text:                       text,
            data:                       data
        };

        return FBInstant.updateAsync(payLoad).then(()=>{
            return Promise.resolve({success: true});
        }).catch((e)=>{
            console.log("Facebook FBInstant.updateAsync() failed, code: " + e.code + " msg: " + e.message);

            if(e.code === "INVALID_PARAM")
            {
                return Promise.resolve({success: false, errcode: ErrorCode.InvalidParameter, errmsg: e.message});
            }

            return Promise.resolve({success: false, errcode: ErrorCode.OperationFailed, errmsg: e.message});
        });
    }

    /*
     * 分享给玩家，子类重载接口
     */
    public ShareToFriend(image: string, text: string, data?: object): Promise<PromiseResult>
    {
        if(!data)
        {
            data={};
        }
        data["shareType"]="message";
        AnalyticsUtils.event(AnalyticsUtils.EVENTS.EVENT_SEND_SHARE,1,{type:"message"});
        return FBInstant.context.chooseAsync().then((ret)=>{
            return this.UpdateAsync(image, text, data);
        }).catch((e)=>{
            console.log("Facebook FBInstant.chooseAsync() failed, code: " + e.code + " msg: " + e.message);

            if(e.code === "NETWORK_FAILURE")
            {
                return Promise.resolve({success: false, errcode: ErrorCode.NetworkError, errmsg: e.message});
            }

            if(e.code === "INVALID_PARAM")
            {
                return Promise.resolve({success: false, errcode: ErrorCode.InvalidParameter, errmsg: e.message});
            }

            if(e.code === "USER_INPUT")
            {
                //玩家取消
                return Promise.resolve({success: false, errcode: ErrorCode.OperationFailed, errmsg: e.message});
            }

            if(e.code === "SAME_CONTEXT")
            {
                //点了与前一个相同的
                return Promise.resolve({success: true});
            }

            return Promise.resolve({success: false, errcode: ErrorCode.OperationFailed, errmsg: e.message});
        });
    }

    /*
     * 分享到主页，子类重载接口
     */
    public ShareToTimeLine(image: string, text: string, data?: object): Promise<PromiseResult>
    {
        if(!data)
        {
            data={};
        }
        data["shareType"]="feed";
        AnalyticsUtils.event(AnalyticsUtils.EVENTS.EVENT_SEND_SHARE,1,{type:"feed"});
        return FBInstant.shareAsync({
            intent: 'REQUEST',
            image: image,
            text: text,
            data: data,
        }).then(()=>{
            return Promise.resolve({success: true});
        }).catch((e)=>{
            console.log("Facebook FBInstant.shareAsync() failed, code: " + e.code + " msg: " + e.message);

            if(e.code === "NETWORK_FAILURE")
            {
                return Promise.resolve({success: false, errcode: ErrorCode.NetworkError, errmsg: e.message});
            }

            if(e.code === "INVALID_PARAM")
            {
                return Promise.resolve({success: false, errcode: ErrorCode.InvalidParameter, errmsg: e.message});
            }

            return Promise.resolve({success: false, errcode: ErrorCode.OperationFailed, errmsg: e.message});
        });
    }

    protected CreateAdvert(sId: string, eType: AdvertType) : Advert
    {
        return new FacebookAvert(sId, eType);
    }
}

class FacebookPlayer extends Player
{
    constructor(sSignature: string)
    {
        super(sSignature, FBInstant.player.getID(), FBInstant.player.getName(), FBInstant.player.getPhoto());
    }

    public GetId(): string
    {
        return FBInstant.player.getID();
    }

    public GetName(): string
    {
        return FBInstant.player.getName();
    }

    public GetPhoto(): string
    {
        return FBInstant.player.getPhoto();
    }

    public async SetData(data: any): Promise<PromiseResult>
    {
        try
        {
            await FBInstant.player.setDataAsync(data);
        }
        catch(e)
        {
            console.log("Facebook FBInstant.player.setDataAsync() failed, code: " + e.code + " msg: " + e.message);

            if (e.code === "NETWORK_FAILURE")
            {
                return Promise.resolve({success: false, errcode: ErrorCode.NetworkError, errmsg: e.message});
            }

            if (e.code === "INVALID_PARAM")
            {
                return Promise.resolve({success: false, errcode: ErrorCode.InvalidParameter, errmsg: e.message});
            }

            return Promise.resolve({success: false, errcode: ErrorCode.OperationFailed, errmsg: e.message});
        }


        return Promise.resolve({success: true});
    }

    public async GetData(keys: Array<string>): Promise<PromiseResult>
    {
        try
        {
            let data = await FBInstant.player.getDataAsync(keys);

            let ret = {};

            for (let i = 0; i < keys.length; i++)
            {
                ret[keys[i]] = data[keys[i]];
            }

            return Promise.resolve({success: true, data: ret});
        }
        catch(e)
        {
            console.log("Facebook FBInstant.player.getDataAsync() failed, code: " + e.code + " msg: " + e.message);

            if (e.code === "NETWORK_FAILURE")
            {
                return Promise.resolve({success: false, errcode: ErrorCode.NetworkError, errmsg: e.message});
            }

            if (e.code === "INVALID_PARAM")
            {
                return Promise.resolve({success: false, errcode: ErrorCode.InvalidParameter, errmsg: e.message});
            }

            return Promise.resolve({success: false, errcode: ErrorCode.OperationFailed, errmsg: e.message});
        }
    }
}

class FacebookLeaderboard extends Leaderboard
{
    private m_fbLeaderboard:                            FBInstant.Leaderboard;                  //排行榜

    constructor(fbLeaderboard: FBInstant.Leaderboard)
    {
        super();

        this.m_fbLeaderboard = fbLeaderboard;
    }
    /*
     * 设置分数
     */
    public async SetScore(nScore: number, exData: string) : Promise<PromiseResult>
    {
        try
        {
            console.log(nScore, "   ", exData);
            let entry: FBInstant.LeaderboardEntry = await this.m_fbLeaderboard.setScoreAsync(nScore, exData);

            return Promise.resolve({success: true, data: new FacebookLeaderboardEntry(entry)});
        }
        catch(e)
        {
            console.log("Facebook FBInstant.Leaderboard.setScoreAsync() failed, code: " + e.code + " msg: " + e.message);

            if (e.code === "NETWORK_FAILURE")
            {
                return Promise.resolve({success: false, errcode: ErrorCode.NetworkError, errmsg: e.message});
            }

            if (e.code === "INVALID_PARAM")
            {
                return Promise.resolve({success: false, errcode: ErrorCode.InvalidParameter, errmsg: e.message});
            }

            if (e.code === "RATE_LIMITED")
            {
                return Promise.resolve({success: false, errcode: ErrorCode.OperationFrequent, errmsg: e.message});
            }

            return Promise.resolve({success: false, errcode: ErrorCode.OperationFailed, errmsg: e.message});
        }
    }

    /*
     * 获取玩家排名
     */
    public async GetRank() : Promise<PromiseResult>
    {
        try
        {
            let entry: FBInstant.LeaderboardEntry = await this.m_fbLeaderboard.getPlayerEntryAsync();

            if(entry === null)
            {
                //玩家没有排名数据
                return Promise.resolve({success: true, data: null});
            }
            else
            {
                //玩家排名
                return Promise.resolve({success: true, data: new FacebookLeaderboardEntry(entry)});
            }
        }
        catch(e)
        {
            console.log("Facebook FBInstant.Leaderboard.getPlayerEntryAsync() failed, code: " + e.code + " msg: " + e.message);

            if (e.code === "NETWORK_FAILURE")
            {
                return Promise.resolve({success: false, errcode: ErrorCode.NetworkError, errmsg: e.message});
            }

            if (e.code === "RATE_LIMITED")
            {
                return Promise.resolve({success: false, errcode: ErrorCode.OperationFrequent, errmsg: e.message});
            }

            return Promise.resolve({success: false, errcode: ErrorCode.OperationFailed, errmsg: e.message});
        }
    }

    /*
     * 获取范围排名，data字段为Array<LeaderboardEntry>
     */
    public async GetRankRange(nCount: number, nIndex: number): Promise<PromiseResult>
    {
        try
        {
            let entries: Array<FBInstant.LeaderboardEntry> = await this.m_fbLeaderboard.getEntriesAsync(nCount, nIndex);

            if(entries === null || entries.length === 0)
            {
                //玩家没有排名数据
                return Promise.resolve({success: true, data: null});
            }
            else
            {
                let ret = new Array();
                //玩家排名
                for(let i = 0; i < entries.length; i++)
                {
                    ret.push(new FacebookLeaderboardEntry(entries[i]));
                }

                return Promise.resolve({success: true, data: ret});
            }
        }
        catch(e)
        {
            console.log("Facebook FBInstant.Leaderboard.getEntriesAsync() failed, code: " + e.code + " msg: " + e.message);

            if (e.code === "NETWORK_FAILURE")
            {
                return Promise.resolve({success: false, errcode: ErrorCode.NetworkError, errmsg: e.message});
            }

            if (e.code === "RATE_LIMITED")
            {
                return Promise.resolve({success: false, errcode: ErrorCode.OperationFrequent, errmsg: e.message});
            }

            return Promise.resolve({success: false, errcode: ErrorCode.OperationFailed, errmsg: e.message});
        }
    }
}

class FacebookLeaderboardEntry extends LeaderboardEntry
{
    constructor(entry: FBInstant.LeaderboardEntry)
    {
        super(entry.getScore(), entry.getRank(), entry.getExtraData(), entry.getPlayer().getID(), entry.getPlayer().getName(), entry.getPlayer().getPhoto());
    }
}


class FacebookAvert extends Advert
{
    private m_adInst:                                       FBInstant.AdInstance;               //广告实例
    private m_promiseLoading:                               Promise<PromiseResult>;             //加载Promise

    constructor(sId: string, eType: AdvertType)
    {
        super(sId, eType);

        this.m_adInst = null;
        this.m_promiseLoading = null;
    }

    /*
     *
     */
    private Reset()
    {
        this.m_adInst = null;
        this.m_promiseLoading = null;
        this.m_eStatus = AdvertStatus.UnLoad;
    }

    /*
     * 加载广告
     */
    public PreLoad(): Promise<PromiseResult>
    {
        if(this.IsSupport() !== true)
        {
            return Promise.resolve({success: false, errcode: ErrorCode.AdvertNotSupport, errmsg: "ad is not support."});
        }

        if(this.m_eStatus !== AdvertStatus.UnLoad)
        {
            switch(this.m_eStatus)
            {
            case AdvertStatus.Loading:
                {
                    //正在加载。
                    return Promise.resolve({success: true});
                }
            case AdvertStatus.Loaded:
                {
                    return Promise.resolve({success: true});
                }
            case AdvertStatus.Playing:
                {
                    return Promise.resolve({success: false, errcode: ErrorCode.OperationFailed, errmsg: "ad is playing."});
                }
            }
        }

        this.m_eStatus = AdvertStatus.Loading;

        if(this.m_adInst === null)
        {
            return FBInstant.getRewardedVideoAsync(this.m_sId).then((ret: FBInstant.AdInstance)=>{
                this.m_adInst = ret;
                this.m_promiseLoading = this.LoadAd();
                return Promise.resolve({success: true});
            }).catch((e)=>{
                this.m_eStatus = AdvertStatus.UnLoad;
                console.log("Facebook FBInstant.getRewardedVideoAsync() failed, code: " + e.code + " msg: " + e.message);

                if (e.code == "ADS_TOO_MANY_INSTANCES")
                {
                    return Promise.resolve({success: false, errcode: ErrorCode.InstanceTooMuch, errmsg: "There are too many concurrent ad instances!"});
                }

                return Promise.resolve({success: false, errcode: ErrorCode.AdvertNotSupport, errmsg: "current device is not support ad."});
            });
        }
        else
        {
            this.m_promiseLoading = this.LoadAd();
            return Promise.resolve({success: true});
        }
    }

    private LoadAd() : Promise<PromiseResult>
    {
        return this.m_adInst.loadAsync().then(()=>{
            this.m_eStatus = AdvertStatus.Loaded;
            return Promise.resolve({success: true});
        }).catch(err=>{
            this.m_eStatus = AdvertStatus.UnLoad;

            console.log("Facebook FBInstant.AdInstance.loadAsync() failed, code: " + err.code + " msg: " + err.message);

            if (err.code === "ADS_FREQUENT_LOAD")
            {
                return Promise.resolve({success: false, errcode: ErrorCode.OperationFrequent, errmsg: "Ads are being loaded too frequently, try again later."});
            }
            
            if(err.code === "ADS_NO_FILL")
            {
                return Promise.resolve({success: false, errcode: ErrorCode.AdvertNotSupport, errmsg: "No available video now!"});
            }

            if(err.code === "NETWORK_FAILURE")
            {
                return Promise.resolve({success: false, errcode: ErrorCode.NetworkError, errmsg: err.message});
            }

            if(err.code === "INVALID_PARAM")
            {
                return Promise.resolve({success: false, errcode: ErrorCode.InvalidParameter, errmsg: err.message});
            }

            return Promise.resolve({success: false, errcode: ErrorCode.OperationFailed, errmsg: err.message});
        });
    }

    /*
     * 播放广告
     */
    public Show(): Promise<PromiseResult>
    {
        if(this.m_eStatus !== AdvertStatus.Loaded)
        {
            //如果还未加载，判断状态
            switch(this.m_eStatus)
            {
            case AdvertStatus.Loading:
                {
                    //如果正在加载，那么等待加载成功。
                    return this.m_promiseLoading.then(ret=>{
                        if(ret.success == true)
                        {
                            //加载成功，可以播放
                            return this.ShowAd();
                        }
                        
                        this.m_eStatus = AdvertStatus.UnLoad;
                        return Promise.resolve(ret);
                    });
                }
            case AdvertStatus.Playing:
                {
                    //正在播放，返回失败
                    return Promise.resolve({success: false, errcode: ErrorCode.OperationFailed, errmsg: "Ads is playing."});
                }
            case AdvertStatus.UnLoad:
                {
                    return this.PreLoad().then(ret=>{
                        return this.Show();
                    });
                }
            }

            return Promise.resolve({success: false, errcode: ErrorCode.OperationFailed, errmsg: "Invalid ad status."});
        }

        return this.ShowAd();
    }

    private ShowAd(): Promise<PromiseResult>
    {
        this.m_eStatus = AdvertStatus.Playing;

        return this.m_adInst.showAsync().then(()=>{
            this.Reset();
            return Promise.resolve({success: true});
        }).catch(err=>{
            this.m_eStatus = AdvertStatus.Loaded;

            console.log("Facebook FBInstant.AdInstance.loadAsync() failed, code: " + err.code + " msg: " + err.message);

            if (err.code === "ADS_NOT_LOADED")
            {
                return this.PreLoad().then(ret=>{
                    return this.Show();
                });
            }
            
            if(err.code === "INVALID_OPERATION")
            {
                return Promise.resolve({success: false, errcode: ErrorCode.AdvertNotSupport, errmsg: "current device is not support ad."});
            }

            if(err.code === "NETWORK_FAILURE")
            {
                return Promise.resolve({success: false, errcode: ErrorCode.NetworkError, errmsg: err.message});
            }

            if(err.code === "INVALID_PARAM")
            {
                return Promise.resolve({success: false, errcode: ErrorCode.InvalidParameter, errmsg: err.message});
            }

            return Promise.resolve({success: false, errcode: ErrorCode.OperationFailed, errmsg: err.message});
        });
    }
}