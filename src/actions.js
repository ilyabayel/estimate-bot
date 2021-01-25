import Discord from "discord.js";
import {
  createObjectFromArrayOfKeys,
  createObjectFromTwoArrays,
  resultsGenerator,
} from "./utils";

export function init() {
  global.client = new Discord.Client();

  global.results = createObjectFromArrayOfKeys(
    ["zero", "one", "two", "three", "five", "eight", "thirteen", "stop"],
    { value: 0, users: [] }
  );

  global.client.login(process.env.TOKEN);

  global.client.on("ready", () => {
    console.info(`Logged in as ${client.user.tag}!`);
    global.emojieDict = createObjectFromTwoArrays(
      [...client.emojis.cache.array().map((e) => e.name)],
      [...client.emojis.cache.array().map((e) => e.id)]
    );
  });

  return global.client;
}

export async function createPoll(msg, pollName) {
  const pollMsg = await msg.channel.send(pollName);

  await Promise.allSettled([
    ...Object.keys(global.results).map((key) =>
      pollMsg.react(global.emojieDict[key])
    ),
  ]);

  return pollMsg;
}

export async function runEstimationController(pollMsg, pollName) {
  const controller = pollMsg.createReactionCollector(
    (r) => r.emoji.name in global.results
  );

  controller.on("collect", (r) => {
    if (r.emoji.name === "stop") controller.stop("stopped by user");
  });

  controller.on("end", (collection) => {
    collection.forEach((reaction) => {
      if (reaction.emoji.name === "stop") {
        delete global.results[reaction.emoji.name];
        return;
      }
      global.results[reaction.emoji.name].value = reaction.count - 1;

      const filteredUsers = reaction.users.cache
        .filter((user) => user.id !== client.user.id)
        .array();

      for (let user of filteredUsers) {
        global.results[reaction.emoji.name].users.push(
          pollMsg.guild.members.cache.get(user.id).nickname
        );
      }
    });

    pollMsg.channel.send(resultsGenerator(pollName, global.results));
    pollMsg.delete();
  });
}
