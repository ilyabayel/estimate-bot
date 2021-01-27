import {
  createObjectFromArrayOfKeys,
  createObjectFromTwoArrays,
} from "../utils";

class EstimationController {
  client;
  msg;
  pollName;
  pollMsg;
  emojieDict;
  keys = ["zero", "one", "two", "three", "five", "eight", "thirteen", "stop"];
  results = createObjectFromArrayOfKeys(this.keys, { value: 0, users: [] });

  constructor(client, msg) {
    this.client = client;
    this.msg = msg;
  }

  async init() {
    this.pollName = this.msg.content.replace(/^!est /, "");
    this.emojieDict = createObjectFromTwoArrays(
      [...this.client.emojis.cache.array().map((e) => e.name)],
      [...this.client.emojis.cache.array().map((e) => e.id)]
    );
    this.pollMsg = await this.msg.channel.send(this.pollName);
  }

  async run() {
    await this.init();

    await Promise.allSettled(
      this.keys.map((key) => this.pollMsg.react(this.emojieDict[key]))
    );

    const controller = this.pollMsg.createReactionCollector(
      (r) => r.emoji.name in this.results
    );

    controller.on(
      "collect",
      (r) => r.emoji.name === "stop" && controller.stop("stopped by user")
    );

    controller.on("end", this.controllerEnd);
  }

  controllerEnd = (collection) => {
    collection.forEach((reaction) => {
      if (reaction.emoji.name === "stop") {
        delete this.results[reaction.emoji.name];
        return;
      }
      this.results[reaction.emoji.name].value = reaction.count - 1;

      const filteredUsers = reaction.users.cache
        .filter((user) => user.id !== this.client.user.id)
        .array();

      for (let user of filteredUsers) {
        this.results[reaction.emoji.name].users.push(
          this.msg.guild.members.cache.get(user.id).nickname
        );
      }
    });

    this.msg.channel.send(this.resultsGenerator());
    this.pollMsg.delete();
  };

  resultsGenerator = () => {
    let res = `Задача: ${this.pollName}\n`;

    for (let key in this.results) {
      let emojie = this.client.emojis.cache.get(this.emojieDict[key]);
      const usersStr = this.results[key].users.join(", ");

      res += `${emojie} - ${this.results[key].value}       | ${usersStr}\n`;
    }

    return res;
  };
}

export { EstimationController };
