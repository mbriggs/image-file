import * as imgc from "@mbriggs/image-file/controls/image";
import { ImageFile } from "@mbriggs/image-file";
import assert from "assert";

describe("ImageFile", () => {
  it("Copies the source when opening a file", async () => {
    let file = await imgc.example();

    assert(file.signature === imgc.signature());
    assert(file.format === imgc.format());
    assert(file.width === imgc.width());
    assert(file.height === imgc.height());
    assert(file.size === imgc.size());
    assert(file.dpi === imgc.dpi());
  });
});
