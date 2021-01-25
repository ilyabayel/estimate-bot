import "dotenv/config";
import Discord, { Emoji } from "discord.js";

const client = new Discord.Client();
const Token = process.env.Token;

client.login(Token);

client.on("ready", () => {
  console.info(`Logged in as ${client.user.tag}!`);
});

client.on("message", async (msg) => {
  if (msg.content.match(/^!est /)) {
    const results = {
      "0️⃣": 0,
      "1️⃣": 0,
      "2️⃣": 0,
      "3️⃣": 0,
      "5️⃣": 0,
      "8️⃣": 0,
      "🔢": 0,
      "🛑": 0,
    };
    const pollName = msg.content.replace(/^!est /, "");

    const estMessage = await msg.channel.send(pollName);

    await Promise.allSettled([
      ...Object.keys(results).map((key) => estMessage.react(key)),
    ]);

    console.log("poll ready");

    console.log("poll start");
    const filter = (r) => r.emoji.name.match(/0️⃣|1️⃣|2️⃣|3️⃣|5️⃣|8️⃣|🔢|🛑/);

    const controller = estMessage.createReactionCollector(filter);

    controller.on("collect", (collected) => {
      if (collected.emoji.name === "🛑") {
        controller.stop("Stopped by user");
      }
    });

    controller.on("end", (collection) => {
      collection.forEach((reaction) => {
        results[reaction.emoji.name] = reaction.count - 1;
      });
      msg.channel.send(resultsGenerator(pollName, results));
      estMessage.delete();
    });
  }
});

function resultsGenerator(pollName, results) {
  let res = `Задача: ${pollName}\n`;
  let winner = {
    name: "",
    value: 0,
  };
  for (let key in results) {
    res += `${key} - ${results[key]}\n`;

    if (winner.value < results[key]) {
      winner.name = key;
      winner.value = results[key];
    }
  }
  res += `Победил вариант ${winner.name} - ${winner.value} ${voteGenerator(
    winner.value.toString()
  )}\n`;
  return res;
}

function voteGenerator(valueStr) {
  const lastDigit = valueStr.charAt(valueStr.length - 1);
  if (parseInt(valueStr) > 10 && parseInt(valueStr) < 20) return "голосов";
  if (lastDigit.match(/1/)) return "голос";
  if (lastDigit.match(/[2-4]/)) return "голоса";
  return "голосов";
}

//minimal change
