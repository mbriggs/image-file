import * as t from "io-ts";
import { ImageFile } from "../image-file";
import { changeset } from "../changeset";

export const BorderCodec = t.type(
  {
    _transform: t.literal("border"),
    color: t.string,
    width: t.number,
    height: t.number,
  },
  "Border"
);

export type Border = t.TypeOf<typeof BorderCodec>;

export async function border(
  images: Map<string, ImageFile>,
  image: ImageFile,
  params: Border
) {
  let { color, height, width } = params;
  let changes = changeset();
  changes("-bordercolor", color);
  changes("-border", [width, height].join("x"));
  let next = await image.apply(changes);
  return next;
}
