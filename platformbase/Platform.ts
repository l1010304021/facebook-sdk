/*
 * 注意事项：
 * 所有Promise不允许抛出异常，返回值只能是 {success: boolean, errcode: ErrorCode, errmsg: string}.
 */


var DeviceType = {
    IOS:            "IOS",
    ANDROID:        "ANDROID",
    WEB:            "WEB",
    MOBILE_WEB:     "MOBILE_WEB",
    OTHER:          "OTHER"
};

class Platform
{
    static DeviceType:                              string = "NONE";            //设备类型

    protected m_sType:                              string;                     //平台类型
    protected m_adReward:                           Advert;                     //平台广告Reward
    protected m_adInterstitial:                     Advert;                     //平台广告Interstitial
    protected m_player:                             Player;                     //本地玩家对象

    protected m_arrayLeaderboard:                   Array<Leaderboard>;         //排行榜

    constructor(sType: string, sRewardId?: string, sInterstitialId?: string)
    {
        this.m_sType = sType;

        this.m_adReward = this.CreateAdvert(sRewardId, AdvertType.Reward);
        this.m_adInterstitial = this.CreateAdvert(sRewardId, AdvertType.Interstitial);

        this.m_arrayLeaderboard = new Array();
    }

    /*
     * 获取设备类型
     */
    public static GetDeviceType(): string
    {
        return Platform.DeviceType;
    }

    /*
     * 是否移动端
     */
    public static IsMobile(): boolean
    {
        return (Platform.DeviceType === "IOS" || Platform.DeviceType === "ANDROID");
    }
    
    /*
     * 登陆接口，负责平台初始化，登陆，预加载广告等接口，登陆成功回调。
     */
    public async Login(): Promise<PromiseResult>
    {
        //调用初始化接口
        let ret = await this.InitPlatform();

        if(ret.success !== true)
        {
            return Promise.resolve(ret);
        }

        //平台登陆
        ret = await this.RequestLogin();

        if(ret.success !== true)
        {
            return Promise.resolve(ret);
        }

        //创建玩家
        this.m_player = this.CreatePlayer();

        //加载广告
        this.m_adReward.PreLoad();
        this.m_adInterstitial.PreLoad();

        //登陆成功
        return Promise.resolve({success: true});
    }

    /*
     * 初始化平台，初始化设备类型
     * 子类需要重载
     */
    protected async InitPlatform(): Promise<PromiseResult>
    {
        //默认设置为Android.
        Platform.DeviceType = DeviceType.ANDROID;

        return Promise.resolve({success: true});
    }

    /*
     * 平台登陆，子类重载接口。
     * 返回值只支持：{success: boolean, err: "errormsg"};
     */
    protected async RequestLogin(): Promise<PromiseResult>
    {
        return Promise.resolve({success: true});
    }

    /*
     * 设置加载进度，子类重载接口
     */
    public SetLoadingProgress(nProgress: number)
    {
        
    }

    /*
     * 开始游戏，子类重载接口，隐藏加载场景
     */
    public async StartGame(): Promise<PromiseResult>
    {
        return Promise.resolve({success: true});
    }

    public getEntryPointData(): Object
    {
        return new Object;
    }


    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///玩家相关
    /*
     * 创建当前玩家对象，子类需要重载此接口
     */
    protected CreatePlayer()
    {
        //默认数据，子类自行重载
        return new Player("signed.test", "1000000000000000", "测试玩家", "http://img1.utuku.china.com/640x0/news/20170527/ea56147b-5f7b-4f84-8834-dfa4198697c5.jpg");
    }

    /*
     * 获取玩家
     */
    public GetPlayer(): Player
    {
        return this.m_player;
    }


    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///排行榜相关

    /*
     * 获取排行榜
     */
    public GetLeaderboard(sName: string) : Promise<PromiseResult>
    {
        if (this.m_arrayLeaderboard[sName] !== undefined)
        {
            return Promise.resolve({success: true, data: this.m_arrayLeaderboard[sName]});
        }

        return this.OnGetLeaderboard(sName);
    }

    /*
     * 获取排行榜，子类重载接口
     */
    protected OnGetLeaderboard(sName: string) : Promise<PromiseResult>
    {
        return Promise.resolve({success: false, errcode: ErrorCode.LeaderboardNotFound, errmsg: "Leaderboard not found."});
    }


    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///分享相关

    /*
     * 分享给玩家，子类重载接口
     */
    public ShareToFriend(image: string, text: string, data?: object): Promise<PromiseResult>
    {
        return Promise.resolve({success: true});
    }

    /*
     * 分享到主页，子类重载接口
     */
    public ShareToTimeLine(image: string, text: string, data?: object): Promise<PromiseResult>
    {
        return Promise.resolve({success: true});
    }




    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///广告相关

    /*
     * 创建广告对象，子类需要重载此接口
     */
    protected CreateAdvert(sId: string, eType: AdvertType) : Advert
    {
        return new Advert(sId, eType);
    }

    /*
     * 判断广告是否支持
     */
    public RewardADSupported(): boolean
    {
        return this.m_adReward.IsSupport();
    }

    /*
     * 播放广告
     */
    public ShowRewardADVideo() : Promise<PromiseResult>
    {
        if(this.RewardADSupported() === false)
        {
            return Promise.resolve({success: false, errcode: ErrorCode.AdvertNotSupport, errmsg: "ad is not support."});
        }

        return this.m_adReward.Show();
    }
};

