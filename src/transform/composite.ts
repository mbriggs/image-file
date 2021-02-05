import * as t from "io-ts";
import { ImageFile } from "../image-file";
import { changeset } from "../changeset";
import { compose, getImage, Gravity, resize } from "./utils";
import { sprintf } from "sprintf-js";

export const CompositeCodec = t.type(
  {
    _transform: t.literal("composite"),
    compositeImage: t.string,
    width: t.number,
    height: t.number,
    x: t.number,
    y: t.number,
    gravity: t.union(Gravity as any),
  },
  "Composite"
);

export type Composite = t.TypeOf<typeof CompositeCodec>;

export async function composite(
  images: Map<string, ImageFile>,
  image: ImageFile,
  params: Composite
) {
  let changes = changeset();

  let compositeImageSource = getImage(images, params.compositeImage);
  let compositeImage = await buildCompositeImage(params, compositeImageSource);

  compose(changes, compositeImage, sprintf("%+f%+f", params.x, params.y), params.gravity);

  let next = await image.apply(changes);
  return next;
}

function buildCompositeImage(params: Composite, image: ImageFile) {
  if (!resizeRequired(params, image)) {
    return image;
  }

  let changes = changeset();
  resize(changes, `${params.width}x${params.height}!`);
  let next = image.apply(changes);
  return next;
}

function resizeRequired(params: Composite, image: ImageFile) {
  let { width, height } = params;

  return width && height && (image.width !== width || image.height !== height);
}
