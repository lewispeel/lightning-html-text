import { Launch } from "@lightningjs/sdk";
import App from "./App.js";

import { HTMLText } from "./HTMLText";

export default function () {
  /**
   * Lightning SDK does look for a fontLoader function
   * in the platform settings object but Lightning CLI
   * insists settings.json exists so adding a function
   * in there is impossible.
   *
   * see; https://github.com/rdkcentral/Lightning-SDK/blob/2b0d10e6d36ae9d855d8f0ac29e8eaccae807ebf/src/Application/index.js#L206
   *
   * The only way to change it is by intercepting the
   * arguments and overriding it.
   */
  arguments[1].fontLoader = HTMLText.fontLoader;

  return Launch(App, ...arguments);
}
