import * as imgc from "@mbriggs/image-file/controls/image";
import { ImageFile } from "@mbriggs/image-file";
import assert from "assert";

describe("ImageFile", () => {
  it("Copies the source when opening a file", async () => {
    let path = imgc.path();
    let name = imgc.name();

    let file = await ImageFile.open(path, name);

    assert(file.signature === imgc.signature());
    assert(file.path.startsWith("/tmp"));
    assert(file.path !== path);
  });
});
