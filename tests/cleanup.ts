import { ImageFile } from "@mbriggs/image-file";

export const mochaHooks = {
  async afterAll() {
    await ImageFile.unlinkAll();
  },
};
