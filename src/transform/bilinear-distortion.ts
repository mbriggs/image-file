import * as t from "io-ts";
import { ImageFile } from "../image-file";
import { changeset } from "../changeset";

export const BilinearDistortionCodec = t.type(
  {
    _transform: t.literal("bilinear_distortion"),
    topLeft: t.number,
    topRight: t.number,
    bottomLeft: t.number,
    bottomRight: t.number,
  },
  "BilinearDistortion"
);

export type BilinearDistortion = t.TypeOf<typeof BilinearDistortionCodec>;

export async function bilinearDistortion(
  images: Map<string, ImageFile>,
  image: ImageFile,
  params: BilinearDistortion
) {
  let { topLeft, topRight, bottomLeft, bottomRight } = params;
  let changes = changeset();
  changes(
    "-distort",
    "BilinearForward",
    [topLeft, topRight, bottomLeft, bottomRight].join(",")
  );
  let next = await image.apply(changes);
  return next;
}
