import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync } from "node:fs";
writeFileSync(new URL("../assets/mascot.png", import.meta.url), new Resvg(readFileSync(new URL("../assets/mascot.svg", import.meta.url)), { fitTo: { mode: "width", value: 512 } }).render().asPng());
