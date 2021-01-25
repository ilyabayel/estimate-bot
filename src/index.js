import "dotenv/config";
import { createPoll, init, runEstimationController } from "./actions";

const client = init();

client.on("message", async (msg) => {
  if (!msg.content.match(/^!est /)) return;

  const pollName = msg.content.replace(/^!est /, "");
  const pollMsg = await createPoll(msg, pollName);
  runEstimationController(pollMsg, pollName);
});
