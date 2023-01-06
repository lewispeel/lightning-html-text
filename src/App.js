/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 Metrological
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Lightning, Utils } from "@lightningjs/sdk";

import { HTMLText } from "./HTMLText";

export default class App extends Lightning.Component {
  static getFonts() {
    return [
      {
        family: "Roboto",
        url: Utils.asset("fonts/Roboto-Light.ttf"),
        descriptors: { weight: 300 },
      },
      {
        family: "Roboto",
        url: Utils.asset("fonts/Roboto-Regular.ttf"),
        descriptors: { weight: 400 },
      },
      {
        family: "Roboto",
        url: Utils.asset("fonts/Roboto-Italic.ttf"),
        descriptors: { style: "italic", weight: 400 },
      },
      {
        family: "Roboto",
        url: Utils.asset("fonts/Roboto-Bold.ttf"),
        descriptors: { weight: 700 },
      },
    ];
  }

  static _template() {
    return {
      w: 1920,
      h: 1080,
      Background: {
        w: (w) => w,
        h: (h) => h,
        rect: true,
        color: 0xff333333,
      },
      Styles: {
        x: 50,
        y: 50,
        htmlText:
          '<span style="font-weight: 300">Light</span> Regular <small>Small</small> <i>Italic</i> <b>Bold</b> <u>Underline</u> <sub>Subscript</sub> <sup>Superscript</sup> <mark>Mark</mark> <del>Delete</del>',
        style: {
          "background-image": "linear-gradient(to right, red, blue)",
          color: "white",
          "font-family": "Roboto",
          "font-size": "48px",
          "max-width": "1820px",
        },
        type: HTMLText,
      },
      Justified: {
        x: 50,
        y: 200,
        htmlText:
          "Lorem ipsum dolor sit amet, &#x1F680; <b>consectetur adipiscing elit</b>. Phasellus porta nisi est, vitae <i>sagittis ex gravida ac</i>. Sed vitae malesuada neque.",
        style: {
          color: "white",
          "font-family": "Roboto",
          "font-size": "32px",
          "letter-spacing": "3px",
          "line-height": "48px",
          "max-width": "400px",
          "text-align": "justify",
          "text-shadow": "1px 2px black",
          "word-wrap": true,
        },
        type: HTMLText,
      },
    };
  }
}
