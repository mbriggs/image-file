import * as t from "io-ts";
import { ImageFile } from "../image-file";
import { changeset } from "../changeset";

export const AnnotateCodec = t.type(
  {
    _transform: t.literal("annotate"),
    text: t.string,
    textAlign: t.union([t.literal("center"), t.literal("left"), t.literal("right")]),
    characterCase: t.union([t.literal("upper"), t.literal("lower")]),
    characterLimit: t.number,
    pointSize: t.number,
    fontFamily: t.string,
    color: t.string,
    width: t.number,
    height: t.number,
    x: t.number,
    y: t.number,
  },
  "Annotate"
);

export type Annotate = t.TypeOf<typeof AnnotateCodec>;

export async function annotate(
  images: Map<string, ImageFile>,
  image: ImageFile,
  params: Annotate
) {
  let changes = changeset();

  changes("-pointsize", params.pointSize);
  changes("-font", params.fontFamily);
  changes("-gravity", annotation(params));
  changes("-fill", params.color);
  let text = `text ${position(image, params)} '${annotation(params)}'`;
  changes("-draw", text);

  let next = await image.apply(changes);

  return next;
}

function annotation(params: Annotate) {
  let text = params.text;

  if (params.characterCase === "upper") {
    text = text.toUpperCase();
  }

  if (params.characterCase === "lower") {
    text = text.toLowerCase();
  }

  if (params.characterLimit) {
    text = text.substring(0, params.characterLimit);
  }

  return text;
}

function position(image: ImageFile, params: Annotate) {
  let x = params.x;
  let y = params.y;

  if (params.textAlign === "center") {
    x = -0.5 * (image.width - params.width) + x;
  }

  if (params.textAlign === "right") {
    x = image.width - params.width - x;
  }

  y = image.height - params.height + y;

  return `${x},${y}`;
}

function alignment(params: Annotate) {
  switch (params.textAlign) {
    case "center":
      return "Center";
    case "right":
      return "East";
    case "left":
      return "West";
  }
}
