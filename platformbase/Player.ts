class Player
{
    private m_sSignature:                               string;                     //认证signature. OAuth2标准。现在所有平台应该都遵循这个标准
    private m_sId:                                      string;                     //玩家唯一ID
    private m_sName:                                    string;                     //玩家名字
    private m_sPhoto:                                   string;                     //玩家头像

    private m_data:                                     any;                        //玩家数据

    constructor(sSignature: string, sId: string, sName: string, sPhoto: string)
    {
        this.m_sSignature = sSignature;
        this.m_sId = sId;
        this.m_sName = sName;
        this.m_sPhoto = sPhoto;

        this.m_data = {};
    }

    public GetSignature(): string
    {
        return this.m_sSignature;
    }

    public GetId(): string
    {
        return this.m_sId;
    }

    public GetName(): string
    {
        return this.m_sName;
    }

    public GetPhoto(): string
    {
        return this.m_sPhoto;
    }

    public async SetData(data: any): Promise<PromiseResult>
    {
        for (let i in data)
        {
            this.m_data[i] = data[i];
        }

        return Promise.resolve({success: true});
    }

    public async GetData(keys: Array<string>): Promise<PromiseResult>
    {
        let ret = {};

        for (let i = 0; i < keys.length; i++)
        {
            ret[keys[i]] = this.m_data[keys[i]];
        }

        return Promise.resolve({success: true, data: ret});
    }
}