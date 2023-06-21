import {
  AllMiddlewareArgs,
  KnownEventFromType,
  SayFn,
  App as SlackApp,
  SlackCommandMiddlewareArgs,
  SlackEventMiddlewareArgs,
} from "@slack/bolt";
import { AsciiTable3 } from "ascii-table3";
import App from "basekit/src/app";
import { Err, Ok, Result } from "ts-results";
import { SharedData } from "./config";
import { onDisburse } from "./app";
import { WebClient } from "@slack/web-api";
import { ChallengeDisbursementUserbankFriendly } from "./queries";
import { announceTopFiveTrending } from "./trending";

export const establishSlackConnection = async (app: App<SharedData>) => {
  const slack = initSlack(app).unwrap();
  const port = process.env.SLACK_SOCKET_PORT || 3008;
  await slack.start(port);
  console.log("slack connection established ⚡️");
};

export const initSlack = (app: App<SharedData>): Result<SlackApp, string> => {
  const botToken = process.env.SLACK_BOT_TOKEN;
  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  const appToken = process.env.SLACK_APP_TOKEN;

  if (botToken === undefined) return new Err("botToken undefined");
  if (signingSecret === undefined) return new Err("signingSecret undefined");
  if (appToken === undefined) return new Err("appToken undefined");

  const slackApp = new SlackApp({
    token: botToken,
    signingSecret,
    socketMode: true,
    appToken,
  });

  // register callbacks
  slackApp.command("/echo", async (args) => await echo(app, args));
  slackApp.command(
    "/disburse",
    async (args) => await disburse(app, args, false)
  );
  slackApp.command(
    "/disbursetest",
    async (args) => await disburse(app, args, true)
  );
  slackApp.command(
    "/trending",
    async (args) => await trending(app, args)
  )

  return new Ok(slackApp);
};

const echo = async (
  app: App<SharedData>,
  args: SlackCommandMiddlewareArgs
): Promise<void> => {
  const { command, ack, respond } = args;
  await ack();
  await respond(`${command.text}`);
};

const disburse = async (
  app: App<SharedData>,
  args: SlackCommandMiddlewareArgs,
  dryRun: boolean
): Promise<void> => {
  const { command, ack, respond } = args;
  await ack();
  await onDisburse(app, dryRun);
};

const trending = async (
  app: App<SharedData>,
  args: SlackCommandMiddlewareArgs
): Promise<void> => {
  const { command, ack, respond } = args;
  await ack();
  const text = command.text
  if (text !== undefined && text.trim() !== "") await announceTopFiveTrending(app, text)
  else { await announceTopFiveTrending(app) }
}

export const formatDisbursementTable = (
  challenges: ChallengeDisbursementUserbankFriendly[]
): string =>
  challenges
    .reduce(
      (acc: AsciiTable3, curr) =>
        acc
          .addRow([curr.challenge_id, curr.handle, curr.slot])
          .setWidths([30, 30, 30]),
      new AsciiTable3("Challenge Disbursements").setHeading(
        "Challenge",
        "Handle",
        "Slot"
      )
    )
    .toString();
