import chalk from "chalk";
import { program } from "commander";

import { initializeAudiusLibs } from "./utils.mjs";

program.command("unrepost-track")
  .description("Unrepost track")
  .argument("<trackId>", "Id of the track to unrepost", Number)
  .option("-f, --from <from>", "The account to unrepost track from")
  .action(async (trackId, { from }) => {
    const audiusLibs = await initializeAudiusLibs(from);

    try {
      const response = await audiusLibs.EntityManager.unrepostTrack(trackId)

      if (response.error) {
        program.error(chalk.red(response.error));
      }
      console.log(chalk.green("Successfully unreposted track"));
    } catch (err) {
      program.error(err.message);
    }

    process.exit(0);
  });
