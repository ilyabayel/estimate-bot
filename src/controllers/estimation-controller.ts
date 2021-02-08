import {Client, Emoji, Message, MessageReaction, ReactionCollector} from "discord.js";
import {
  createObjectFromArrayOfKeys,
  createObjectFromTwoArrays,
} from "../utils";
import Collection from "@discordjs/collection";

class EstimationController {
  private client;
  private msg;
  private pollName;
  private pollMsg;
  private emojiDict;
  private keys = ["zero", "one", "two", "three", "five", "eight", "thirteen", "stop"];
  private results = createObjectFromArrayOfKeys<{value: number; users: string[]}>(this.keys, { value: 0, users: [] });
  private reactionController: ReactionCollector | undefined;

  constructor(client: Client, msg: Message) {
    this.client = client;
    this.msg = msg;
  }

  private async init(): Promise<void> {
    this.pollName = this.msg.content.replace(/^!est /, "");
    this.emojiDict = createObjectFromTwoArrays(
      [...this.client.emojis.cache.array().map((e) => e.name)],
      [...this.client.emojis.cache.array().map((e) => e)]
    );
    this.pollMsg = await this.msg.channel.send(this.pollName);
  }

  public async run(): Promise<void> {
    await this.init();

    Promise.allSettled(
      this.keys.map((key) => this.pollMsg.react(this.emojiDict[key].id))
    ).then(() => {
      this.reactionController = this.pollMsg.createReactionCollector(
          (r) => r.emoji.name in this.results
      );

      if (!this.reactionController) return;

      this.reactionController.on("collect",this.onControllerCollect);
      this.reactionController.on("end", this.controllerEnd);
    });
  }

  private onControllerCollect = (r: MessageReaction) => {
    if (!this.reactionController) return;

    if (r.emoji.name === "stop") {
      this.reactionController.stop("stopped by user");
      return;
    }


  }

  private controllerEnd = (collection: Collection<string, MessageReaction>): void => {
    collection.forEach((reaction: MessageReaction) => {
      if (reaction.emoji.name === "stop") {
        delete this.results[reaction.emoji.name];
        return;
      }

      if (!reaction.count) return
      this.results[reaction.emoji.name].value = reaction.count - 1;

      const filteredUsers = reaction.users.cache
        .filter((user) => user.id !== this.client.user.id)
        .array();

      for (let user of filteredUsers) {
        this.results[reaction.emoji.name].users.push(this.msg.guild.members.cache.get(user.id).nickname);
      }
    });

    this.msg.channel.send(this.resultsGenerator());
    this.pollMsg.delete();
  };

  private resultsGenerator = (): string => {
    let res = `Задача: ${this.pollName}\n\n`;

    for (let key in this.results) {
      let emoji: Emoji = this.emojiDict[key]
      const usersVotedResult = this.results[key].users.join(", ");
      res += `<:${emoji.identifier}> - ${this.results[key].value}       | ${usersVotedResult}\n`;
    }

    return res;
  };
}

export { EstimationController };
