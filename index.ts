import axios from "axios";
import chalk from "chalk";
import dayjs from "dayjs";

const mainnet = "https://mainnet.tezos.marigold.dev/";
const jakartanet = "https://jakartanet.tezos.marigold.dev/";
const kathmandunet = "https://kathmandunet.tezos.marigold.dev/";
const ghostnet = "https://ghostnet.tezos.marigold.dev/";

async function getBlockHeaderTimestampByLevel(testnet: string, level: number) {
    const res = await axios(testnet + "/chains/main/blocks/" + level);
    return res.data.header;
}

async function getHeadBlock(testnet: string) {
    let res = await axios(testnet + "/chains/main/blocks/head");
    return res.data;
}

async function testLastBlocks(testnet: string, blocksCount: number, defaultTime: number): Promise<void> {
	console.log(" TESTING THE LAST : " + blocksCount + " BLOCKS");
    console.log(" ON NETWORK: " + testnet);
    console.log(" LEVEL         TIMESTAMP                DIFF");
    let head = await getHeadBlock(testnet);
    let headLevel = head.header.level;
    let task = [];
    for (let i = headLevel; i > headLevel - blocksCount; i--) {
        let get_timestamp = getBlockHeaderTimestampByLevel(testnet, i);
        task.push(get_timestamp);
    }

    let blocksHeaders = await Promise.all(task);

    blocksHeaders.forEach((x, i) => {
        process.stdout.write(`\n ${x.level} -- ${x.timestamp}`);
        if (i != blocksHeaders.length - 1) {
            const diff = dayjs(x.timestamp).diff(
                dayjs(blocksHeaders[i + 1].timestamp),
                "seconds",
                true,
            );
			if(diff > defaultTime){
            process.stdout.write(chalk.red(`  --- +${diff}s`));
			} else{
            process.stdout.write(chalk.green(`  --- +${diff}s`));
			}
        } else {
            process.stdout.write(`\n`);
			process.stdout.write
			console.log("====================== END ======================");
        }
    });
}

const blocksCount = 100;

async function main(): Promise<void> {
	await testLastBlocks(mainnet, blocksCount, 30)
	await testLastBlocks(ghostnet, blocksCount, 15)
	await testLastBlocks(jakartanet, blocksCount, 15)
	await testLastBlocks(kathmandunet, blocksCount, 15)
}

main().catch(console.error);

