import * as t from "io-ts";
import { ImageFile } from "../image-file";
import { changeset } from "../changeset";
import { compose, crop, getImage, resize } from "./utils";
import { sprintf } from "sprintf-js";

export const CopyAndPasteCodec = t.type(
  {
    _transform: t.literal("copy_and_paste"),
    copySourceImage: t.string,
    copyWidth: t.number,
    copyHeight: t.number,
    copyX: t.number,
    copyY: t.number,
    pasteWidth: t.number,
    pasteHeight: t.number,
    pasteX: t.number,
    pasteY: t.number,
  },
  "CopyAndPaste"
);

export type CopyAndPaste = t.TypeOf<typeof CopyAndPasteCodec>;

export async function copyAndPaste(
  images: Map<string, ImageFile>,
  image: ImageFile,
  params: CopyAndPaste
) {
  let copyImageSource = getImage(images, params.copySourceImage);
  let copyImage = await buildCopyImage(copyImageSource, params);

  let changes = changeset();
  compose(changes, copyImage, sprintf("%+f%+f", params.pasteX, params.pasteY));

  let next = await image.apply(changes);
  return next;
}

async function buildCopyImage(image: ImageFile, params: CopyAndPaste) {
  let { copyWidth, copyHeight, copyX, copyY, pasteHeight, pasteWidth } = params;
  let changes = changeset();

  crop(changes, copyWidth, copyHeight, copyX, copyY);

  if (pasteWidth < 0) {
    changes("-flop");
  }

  if (pasteHeight < 0) {
    changes("-flip");
  }

  if (pasteWidth >= 0 && pasteHeight >= 0) {
    resize(changes, `${Math.abs(pasteWidth)}x${Math.abs(pasteHeight)}!`);
  }

  return await image.apply(changes);
}
