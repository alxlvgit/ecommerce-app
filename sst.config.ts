import { SSTConfig } from "sst";
import { API } from "./stacks/MyStack";
import * as dotenv from "dotenv";
dotenv.config();

export default {
  config(_input) {
    return {
      name: "shopping-app",
      region: "us-west-2",
    };
  },
  stacks(app) {
    app.stack(API);
  },
} satisfies SSTConfig;
