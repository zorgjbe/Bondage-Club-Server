/** A heart-beat message sent regularly by the server */
interface ServerInfoMessage {
    /** The count of currently connected players */
    OnlinePlayers: number;
    /** The server's local time */
    Time: number;
}

