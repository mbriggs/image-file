import * as p from "path";
import { ImageFile } from "@mbriggs/image-file";

export function path() {
  return p.join(__dirname, "image.jpg");
}

export function example() {
  return ImageFile.open(path(), name());
}

export function name() {
  return "control";
}

export function format() {
  return "JPEG";
}

export function width() {
  return 2000;
}

export function height() {
  return 3000;
}

export function size() {
  return "507459B";
}

export function dpi() {
  return 72;
}

export function signature() {
  return "30c53cdff09f7a8c56389516107ae5e90f6822156ba0a8d5c9089709ac5b551b";
}
