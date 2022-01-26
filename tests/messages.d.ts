/** A heart-beat message sent regularly by the server */
interface ServerInfoMessage {
    /** The count of currently connected players */
    OnlinePlayers: number;
    /** The server's local time */
    Time: number;
}

type ServerAccountUpdateMessage = Partial<Account>;

interface ServerChatRoomCreateData {
    Name: string;
    Description: string;
    Background: string;
    Private: boolean;
}
