import * as t from "io-ts";
import { ImageFile } from "../image-file";
import { changeset } from "../changeset";

export const AutoOrientCodec = t.type(
  {
    _transform: t.literal("auto_orient"),
  },
  "AutoOrient"
);

export type AutoOrient = t.TypeOf<typeof AutoOrientCodec>;

export async function autoOrient(
  images: Map<string, ImageFile>,
  image: ImageFile,
  _params: AutoOrient
) {
  let changes = changeset();
  changes("-auto-orient");
  let next = await image.apply(changes);
  return next;
}
