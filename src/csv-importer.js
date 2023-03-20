import assert from "assert";
import { parse } from "csv-parse";
import fs from "node:fs";

(async () => {
  // Initialise the parser by generating random records
  const parser = fs
    .createReadStream(new URL("../teste.csv", import.meta.url))
    .pipe(parse());
  // Intialise count
  let count = 0;
  // Report start
  process.stdout.write("start\n");
  // Iterate through each records
  for await (const record of parser) {
    // Report current line
    process.stdout.write(`${count++} ${record.join(",")}\n`);
    // Fake asynchronous operation
    await fetch("http://localhost:3333/tasks", {
      method: "POST",
      body: JSON.stringify({
        title: record[0],
        description: record[1],
      }),
    });
  }
  // Report end
  process.stdout.write("...done\n");
})();
