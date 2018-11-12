
enum AdvertType
{
    Reward,
    Interstitial
};

enum AdvertStatus
{
    UnLoad,
    Loading,
    Loaded,
    Playing
}

class Advert
{
    protected m_eStatus:                            AdvertStatus;               //广告状态
    protected m_sId:                                string;                     //广告ID
    protected m_eType:                              AdvertType;                 //广告类型
    

    constructor(sId: string, eType: AdvertType)
    {
        this.m_eStatus = AdvertStatus.UnLoad;

        this.m_sId = sId;
        this.m_eType = eType;
    }

    /*
     * 广告是否可用
     */
    public IsSupport()
    {
        if (Platform.IsMobile() === false) return false;

        if (this.m_sId === "") return false;

        return true;
    }

    /*
     * 是否正在播放
     */
    public IsPlaying()
    {
        return this.m_eStatus === AdvertStatus.Playing;
    }

    /*
     * 加载广告
     */
    public PreLoad(): Promise<PromiseResult>
    {
        let PromiseResult: PromiseResult = {
            success: false,
            errcode: ErrorCode.AdvertNotSupport,
            errmsg: "ad is not support."
        };

        return Promise.resolve(PromiseResult);
    }

    /*
     * 播放广告
     */
    public Show(): Promise<PromiseResult>
    {
        let PromiseResult: PromiseResult = {
            success: false,
            errcode: ErrorCode.AdvertNotSupport,
            errmsg: "ad is not support."
        };

        return Promise.resolve(PromiseResult);
    }
};