import {Client, Emoji, GuildEmoji, Message, MessageReaction, ReactionCollector} from "discord.js";
import {
  createObjectFromArrayOfKeys,
  createObjectFromTwoArrays,
} from "../utils";
import Collection from "@discordjs/collection";

class EstimationController {
  private pollName: string = "";
  private pollMsg: Message | undefined;
  private emojiDict: {[key: string]: GuildEmoji} = {};
  private keys = ["zero", "one", "two", "three", "five", "eight", "thirteen", "stop"];
  private results = createObjectFromArrayOfKeys<{value: number; users: string[]}>(this.keys, { value: 0, users: [] });
  private reactionController: ReactionCollector | undefined;
  private reactionCounter: number = 0;

  constructor(private client: Client, private msg: Message) {}

  private async init(): Promise<void> {
    this.pollName = this.msg.content.replace(/^!est /, "");
    this.emojiDict = createObjectFromTwoArrays(
      [...this.client.emojis.cache.array().map((e) => e.name)],
      [...this.client.emojis.cache.array().map((e) => e)]
    );
    this.pollMsg = await this.msg.channel.send(`${this.pollName} (0 votes)`);
  }

  public async run(): Promise<void> {
    await this.init();

    Promise.allSettled(
      this.keys.map((key) => this.pollMsg?.react(this.emojiDict[key].id))
    ).then(() => {
      this.reactionController = this.pollMsg?.createReactionCollector(
          (r) => r.emoji.name in this.results,
          { dispose: true }
      );

      if (!this.reactionController) return;

      this.reactionController.on("collect",this.onReactionCollect);
      this.reactionController.on("remove",this.onReactionRemove);
      this.reactionController.on("end", this.controllerEnd);
    });
  }

  private onReactionCollect = (r: MessageReaction): void => {
    if (!this.reactionController) return;

    if (r.emoji.name === "stop") {
      this.reactionController.stop("stopped by user");
      return;
    }

    this.updateReactionCounter(1)
  }

  private onReactionRemove = (): void => {
    this.updateReactionCounter(-1)
  }

  private updateReactionCounter = (count: 1 | -1): void =>  {
    this.reactionCounter += count;
    const newMessageContent = this.pollMsg?.content.substring(0, this.pollName.length) + ` (${this.reactionCounter} votes)`
    this.pollMsg?.edit(newMessageContent)
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
        .filter((user) => user.id !== this.client.user?.id)
        .array();

      for (let user of filteredUsers) {
        const nickname = this.msg.guild?.members.cache.get(user.id)?.nickname
        if (!nickname) return;
        this.results[reaction.emoji.name].users.push(nickname);
      }
    });

    this.msg.channel.send(this.resultsGenerator());
    this.pollMsg?.delete();
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
