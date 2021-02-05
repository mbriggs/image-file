import * as t from "io-ts";
import { ImageFile } from "../image-file";
import { changeset } from "../changeset";
import { VISIBLE_RESIZE_FILTER } from "./utils";

export const BarrelDistortionCodec = t.type(
  {
    _transform: t.literal("barrel_distortion"),
    pointA: t.number,
    pointB: t.number,
    pointC: t.number,
    pointD: t.number,
  },
  "BarrelDistortion"
);

export type BarrelDistortion = t.TypeOf<typeof BarrelDistortionCodec>;

export async function barrelDistortion(
  images: Map<string, ImageFile>,
  image: ImageFile,
  params: BarrelDistortion
) {
  let { pointA, pointB, pointC, pointD } = params;
  let changes = changeset();
  changes("-virtual-pixel", "black");
  changes("-distort", "Barrel", [pointA, pointB, pointC, pointD].join(","));
  changes("-filter", VISIBLE_RESIZE_FILTER);
  let next = await image.apply(changes);
  return next;
}
