import yargs from "yargs/yargs";
import path from "path";
import {hideBin} from "yargs/helpers";

const {argv} = yargs(hideBin(process.argv));
const configPathGiven = argv.config as string;
if (!configPathGiven) {
    throw new Error("Usage index.js --config path/to/config/dir");
}
const configPath = path.resolve(configPathGiven);

console.log(`Config path: ${configPathGiven} (${configPath})`);

export default configPath;
