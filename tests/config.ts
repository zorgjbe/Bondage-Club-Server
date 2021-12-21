import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";

// Load .env file
let env = dotenv.config()
dotenvExpand.default(env)
