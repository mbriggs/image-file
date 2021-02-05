import * as t from "io-ts";
import { Changeset } from "../changeset";
import { sprintf } from "sprintf-js";
import { ImageFile } from "../image-file";

export const VISIBLE_RESIZE_FILTER = "Lagrange";
export const RESIZE_UNSHARPEN = "0x0.75+0.75+0.008";

export const Gravity = [
  t.literal("NorthWest"),
  t.literal("North"),
  t.literal("NorthEast"),
  t.literal("West"),
  t.literal("Center"),
  t.literal("East"),
  t.literal("SouthWest"),
  t.literal("South"),
  t.literal("SouthEast"),
];

export function getImage(images: Map<string, ImageFile>, key: string) {
  if (!images.has(key)) {
    throw new Error(`${key} not configured in images`);
  }

  return images.get(key);
}

export function resize(changes: Changeset, geometry: string) {
  changes("-resize", geometry);
  changes("-filter", VISIBLE_RESIZE_FILTER);
  changes("-unsharpen", RESIZE_UNSHARPEN);
}

export function noAlphaSupport(changes: Changeset) {
  changes("-background", "white");
  changes("-alpha", "remove");
}

export function printDPI(changes: Changeset) {
  changes("-set", "units", "PixelsPerInch");
  changes("-density", 300);
}

export function crop(changes: Changeset, width: number, height: number, x: number, y: number) {
  changes("+repage");
  changes("-crop", sprintf("%sx%s%+f%+f", width, height, x, y));
}

export function compose(
  changes: Changeset,
  composite: ImageFile,
  geometry: string,
  gravity = "NorthWest"
) {
  changes(composite.path);
  changes("+repage");
  changes("-compose", "src-over");
  changes("-gravity", gravity);
  changes("-geometry", geometry);
  changes("-composite");
}
