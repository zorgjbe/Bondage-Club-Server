interface ServerAccount {
    Name: string;
    AccountName: string;
    Password: string;
    Email: string;
}

interface Account extends ServerAccount {
    MemberNumber: number;
    OnlineID: string;
}