import "dotenv/config";
import Discord from "discord.js";
import {
  createObjectFromArrayOfKeys,
  createObjectFromTwoArrays,
  resultsGenerator,
} from "./utils";

const client = new Discord.Client();
const Token = process.env.TOKEN;

client.login(Token);

global.client = client;

client.on("ready", () => {
  console.info(`Logged in as ${client.user.tag}!`);
  const emojies = client.emojis.cache.array();

  global.emojieDict = createObjectFromTwoArrays(
    [...emojies.map((e) => e.name)],
    [...emojies.map((e) => e.id)]
  );
});

client.on("message", async (msg) => {
  if (msg.content.match(/^!est /)) {
    const results = createObjectFromArrayOfKeys(
      ["zero", "one", "two", "three", "five", "eight", "thirteen", "stop"],
      { value: 0, users: [] }
    );

    const pollName = msg.content.replace(/^!est /, "");

    const estMessage = await msg.channel.send(pollName);

    await Promise.allSettled([
      ...Object.keys(results).map((key) =>
        estMessage.react(global.emojieDict[key])
      ),
    ]);

    const filter = (r) => r.emoji.name in results;

    const controller = estMessage.createReactionCollector(filter);

    controller.on("collect", (r) => {
      if (r.emoji.name === "stop") controller.stop("stopped by user");
    });

    controller.on("end", (collection) => {
      collection.forEach((reaction) => {
        if (reaction.emoji.name === "stop") {
          delete results[reaction.emoji.name];
          return;
        }
        results[reaction.emoji.name].value = reaction.count - 1;

        const filteredUsers = reaction.users.cache
          .filter((user) => user.id !== client.user.id)
          .array();

        for (let user of filteredUsers) {
          results[reaction.emoji.name].users.push(user.tag);
        }
      });

      msg.channel.send(resultsGenerator(pollName, results));
      estMessage.delete();
    });
  }
});
