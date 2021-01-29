# estimate-bot

## About

This is a bot for Estimation Poll management. It creates and manages poll for planning using story points from 0 to 13 fibonacci

## How to use

```
!est <Title>              // This is discord message written by you
```

Output:

```
<Title>                   // This is discord message sent by bot
[1, 2, 3, 5, 8, 13, stop] // This is discord message reaction emojies. Click to Vote
```

After you click stop you will receive poll results

```
Задача: <Title>
[1] - <count> | UserName[] // emoji - votes count | list of users who voted for [1]
[2] - <count> | UserName[]
[3] - <count> | UserName[]
```
