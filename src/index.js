import "dotenv/config";
import Discord from "discord.js";
import { EstimationController } from "./controllers";

const client = new Discord.Client();

client.login(process.env.TOKEN);

client.on("ready", () => {
  console.info(`Logged in as ${client.user.tag}!`);
});

client.on("message", async (msg) => {
  if (!msg.content.match(/^!est /)) return;
  const controller = new EstimationController(client, msg);
  controller.run();
});
