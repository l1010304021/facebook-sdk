

class Leaderboard
{
    private m_sName:                                    string;                     //排行榜名字

    /*
     * 设置分数，子类重载接口，data字段为 LeaderboardEntry
     */
    public async SetScore(nScore: number, exData: string) : Promise<PromiseResult>
    {
        return Promise.resolve({success: false, errcode: ErrorCode.LeaderboardNotFound, errmsg: "leaderboard not found."});
    }

    /*
     * 获取玩家排名，子类重载接口，data字段为 LeaderboardEntry，如果玩家没有排名，则显示null
     */
    public async GetRank() : Promise<PromiseResult>
    {
        return Promise.resolve({success: false, errcode: ErrorCode.LeaderboardNotFound, errmsg: "leaderboard not found."});
    }

    /*
     * 获取范围排名，子类重载接口，data字段为Array<LeaderboardEntry>
     */
    public async GetRankRange(nCount: number, nIndex: number) : Promise<PromiseResult>
    {
        return Promise.resolve({success: false, errcode: ErrorCode.LeaderboardNotFound, errmsg: "leaderboard not found."});
    }
}

class LeaderboardEntry
{
    private m_nScore:                                   number;                     //当前分数
    private m_nRank:                                    number;                     //当前排行
    private m_exData:                                   string;                     //附加数据
    
    private m_sUID:                                     string;                     //玩家ID
    private m_sName:                                    string;                     //玩家名字
    private m_sPhoto:                                   string;                     //玩家头像

    constructor(nScore: number, nRank: number, exData: string, sUID: string, sName: string, sPhoto: string)
    {
        this.m_nScore = nScore;
        this.m_nRank = nRank;
        this.m_exData = exData;

        this.m_sUID = sUID;
        this.m_sName = sName;
        this.m_sPhoto = sPhoto;
    }

    /*
     * 获取玩家分数
     */
    public GetScore()
    {
        return this.m_nScore;
    }

    /*
     * 获取玩家排行
     */
    public GetRank()
    {
        return this.m_nRank;
    }

    /*
     * 获取玩家附加数据
     */
    public GetExtraData()
    {
        return this.m_exData;
    }

    /*
     * 获取玩家ID
     */
    public GetPlayerID()
    {
        return this.m_sUID;
    }

    /*
     * 获取玩家名字
     */
    public GetPlayerName()
    {
        return this.m_sName;
    }

    /*
     * 获取玩家头像
     */
    public GetPlayerPhoto()
    {
        return this.m_sPhoto;
    }
}