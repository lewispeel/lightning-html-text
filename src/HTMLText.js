import { Lightning } from "@lightningjs/sdk";

const MAX_WIDTH = 2024;
const MAX_HEIGHT = 2024;

const DEFAULT_DESCRIPTORS = {
  weight: 400,
  style: "normal",
};

const DEFAULT_STYLE = {
  padding: 0,
};

const fontStore = {};

export class HTMLText extends Lightning.Component {
  static async fontLoader(fonts) {
    return Promise.all(
      fonts.map(async ({ family, url, descriptors }) => {
        // ensure each font face has weight and style
        descriptors = {
          ...DEFAULT_DESCRIPTORS,
          ...descriptors,
        };
        // load the font into the browser
        const fontFace = new FontFace(family, `url('${url}')`, descriptors);
        document.fonts.add(fontFace);
        await fontFace.load();
        // fetch the file and get blob
        const response = await fetch(url);
        const data = await response.blob();
        // ensure we have an array to store the font
        if (!fontStore[family]) {
          fontStore[family] = [];
        }
        // convert blob to base64
        const src = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = (error) => reject(error);
          reader.onload = (event) => resolve(event.target.result);
          reader.readAsDataURL(data);
        });
        // push the base64 encoded font into the font family array
        fontStore[family].push({
          family,
          src,
          descriptors,
        });
      })
    );
  }

  constructor(stage) {
    super(stage);

    this._domElement;
    this._styleElement;
    this._svgRoot;
    this._foreignObject;
    this._image;
    this._resolution;
    this._htmlText;
    this._style;
    this._autoResolution = true;
    this._loading = false;
    this._shadow;
    this._shadowRoot;
    this._isDirty = false;

    const image = new Image();
    const nssvg = "http://www.w3.org/2000/svg";
    const nsxhtml = "http://www.w3.org/1999/xhtml";
    const shadow = document.createElement("div");
    const svgRoot = document.createElementNS(nssvg, "svg");
    const foreignObject = document.createElementNS(nssvg, "foreignObject");
    const domElement = document.createElementNS(nsxhtml, "div");
    const styleElement = document.createElementNS(nsxhtml, "style");

    foreignObject.setAttribute("width", "10000");
    foreignObject.setAttribute("height", "10000");
    foreignObject.style.overflow = "hidden";
    svgRoot.appendChild(foreignObject);

    this._domElement = domElement;
    this._styleElement = styleElement;
    this._svgRoot = svgRoot;
    this._foreignObject = foreignObject;
    this._foreignObject.appendChild(styleElement);
    this._foreignObject.appendChild(domElement);
    this._image = image;
    this._shadowRoot = shadow.attachShadow({ mode: "open" });
    this._shadowRoot.appendChild(svgRoot);

    shadow.setAttribute("data-lng-html-text", "1");

    Object.assign(shadow.style, {
      position: "absolute",
      top: "0",
      left: "-1px",
      width: "1px",
      height: "1px",
    });

    document.body.appendChild(shadow);
  }

  _detach() {
    const forceClear = null;

    this._style = forceClear;
    this._svgRoot && this._svgRoot.remove();
    this._svgRoot = forceClear;
    this._domElement && this._domElement.remove();
    this._domElement = forceClear;
    this._foreignObject && this._foreignObject.remove();
    this._foreignObject = forceClear;
    this._styleElement && this._styleElement.remove();
    this._styleElement = forceClear;
    this._shadow && this._shadow.remove();
    this._shadow = forceClear;
    this._shadowRoot = forceClear;
    this._image.onload = null;
    this._image.src = "";
    this._image = forceClear;
  }

  _measureText() {
    const { htmlText, style } = Object.assign({
      htmlText: this._htmlText,
      style: { ...DEFAULT_STYLE, ...this._style },
    });

    Object.assign(this._domElement, {
      innerHTML: htmlText,
      style: Object.entries(style)
        .map((prop) => `${prop[0]}: ${prop[1]}`)
        .join(";"),
    });

    const fontFamily = style["font-family"];
    if (fontFamily) {
      const fonts = fontStore[fontFamily];
      const faces = fonts.map(
        (font) => `
@font-face {
  font-family: ${font.family};
  src: url('${font.src}');
  font-weight: ${font.descriptors.weight};
  font-style: ${font.descriptors.style};
}`
      );
      this._styleElement.textContent = faces.join("\r\n");
    }

    const contentBounds = this._domElement.getBoundingClientRect();

    // this._svgRoot.remove();

    const contentWidth = Math.min(
      MAX_WIDTH,
      Math.ceil(contentBounds.x + contentBounds.width)
    );
    const contentHeight = Math.min(
      MAX_HEIGHT,
      Math.ceil(contentBounds.y + contentBounds.height)
    );

    this._svgRoot.setAttribute("width", contentWidth.toString());
    this._svgRoot.setAttribute("height", contentHeight.toString());

    // keeps only the numbers
    const padding = style.padding.toString().replace(/[^0-9.,]+/, "");

    return {
      width: contentWidth + padding * 2,
      height: contentHeight + padding * 2,
    };
  }

  _render() {
    this._updateText();
  }

  /**
   * Sanitise text - replace `<br>` with `<br/>`, `&nbsp;` with `&#160;`
   * @see https://www.sitepoint.com/community/t/xhtml-1-0-transitional-xml-parsing-error-entity-nbsp-not-defined/3392/3
   */
  _sanitiseText(text) {
    return text
      .replace(/<br>/gi, "<br/>")
      .replace(/<hr>/gi, "<hr/>")
      .replace(/&nbsp;/gi, "&#160;");
  }

  async _updateText() {
    const { _image: image } = this;

    const { width, height } = this._measureText();

    image.width = Math.ceil(Math.max(1, width));
    image.height = Math.ceil(Math.max(1, height));

    if (!this._loading) {
      this._loading = true;
      await new Promise((resolve) => {
        image.onload = async () => {
          this._loading = false;
          this._updateTexture();
          resolve();
        };
        const svgURL = new XMLSerializer().serializeToString(this._svgRoot);
        image.src = `data:image/svg+xml;charset=utf8,${encodeURIComponent(
          svgURL
        )}`;
      });
    }
  }

  _updateTexture() {
    const { _image: image } = this;

    const canvas = this.stage.platform.getDrawingCanvas();
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;

    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    this.texture = Lightning.Tools.getCanvasTexture(
      (cb) => cb(null, canvas),
      "html-text" + [canvas.width, canvas.height, this._htmlText].join(",")
    );

    this._isDirty = false;
  }

  _markDirty() {
    if (!this._isDirty) {
      this._isDirty = true;
      this.stage.once("frameEnd", () => this._render());
    }
  }

  get htmlText() {
    return this._htmlText;
  }

  set htmlText(htmlText) {
    htmlText = String(
      htmlText === "" || htmlText === null || htmlText === undefined
        ? " "
        : htmlText
    );
    htmlText = this._sanitiseText(htmlText);
    if (this._htmlText === htmlText) {
      return;
    }
    this._htmlText = htmlText;
    this._markDirty();
  }

  get style() {
    return this._style;
  }

  set style(style) {
    if (this._style === style) {
      return;
    }
    this._style = style || {};
    this._markDirty();
  }
}
