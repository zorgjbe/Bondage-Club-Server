type MemberNumber = number;

interface ServerAccount {
    Name: string;
    AccountName: string;
    Password: string;
    Email: string;
}

interface Account extends ServerAccount {
    Creation: number;
    LastLogin: number;
    Pose: string;
    ActivePose: string;
    ChatRoom: string;
    ID: string;
    MemberNumber: MemberNumber;
    Environment: string;
    Ownership: object;
    Lovership: object;
    Difficulty: number;
    Inventory: string[];
    ItemPermission: number;
    ArousalSettings: { Enabled: boolean };
    OnlineSharedSettings: { Online: boolean };
    Game: string;
    LabelColor: string;
    Appearance: string[];
    Reputation: number;
    Description: string;
    BlockItems: string[];
    LimitedItems: string[];
    FavoriteItems: string[];
    WhiteList: MemberNumber[];
    BlackList: MemberNumber[];
    FriendList: MemberNumber[];
    Title: string;
}