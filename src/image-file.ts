import path from "path";
import fs from "fs";

import * as tempy from "tempy";
import execa from "execa";

import { ImageFileReadError, InvalidImageFileError } from "./errors";

export class ImageFile {
  static tempfiles = [];

  static async unlinkAll() {
    for (let temp of this.tempfiles) {
      if (await fs.existsSync(temp)) {
        await fs.promises.unlink(temp);
      }
    }
  }

  static async read(imagePath: string, name?: string): Promise<ImageFile> {
    let file = new ImageFile(imagePath);
    file.name = name;
    await file.validate();
    await file.parse();
    return file;
  }

  static async open(imagePath: string, name?: string, source?: ImageFile): Promise<ImageFile> {
    let base = path.basename(imagePath);

    let temp = tempy.file({ name: base });
    this.tempfiles.push(temp);

    await fs.promises.copyFile(imagePath, temp, fs.constants.COPYFILE_FICLONE);

    let file = await this.read(temp, name);

    if (source) {
      file.source = source;
    } else {
      file.source = await this.read(imagePath, `Source: ${name}`);
    }

    return file;
  }

  static async follow(file: ImageFile, name?: string): Promise<ImageFile> {
    let next = await this.open(file.filePath, name, file);

    return file;
  }

  name: string;
  path: string;
  filePath: string;
  ext: string;
  extName: string;
  layers: string[];
  isMultiLayer: boolean;
  source: ImageFile | null;

  format: string;
  width: number;
  height: number;
  size: string;
  dpi: number;
  signature: string;

  constructor(path: string) {
    this.path = path;
    this.filePath = path;
    this.source = null;
  }

  async parse() {
    let identify = await this.identify();
    this.layers = identify.split("\n");
    this.isMultiLayer = this.layers.length > 1;
    this.extName = path.extname(this.filePath);
    this.ext = this.extName.substring(1);

    if (this.isMultiLayer) {
      this.path = `${this.filePath}[0]`;
    }

    let data = await this.identify(["-format", "%m %w %h %b %x %#"], false);
    let [format, width, height, size, dpi, signature] = data.split(" ");

    this.format = format;
    this.width = parseInt(width, 10);
    this.height = parseInt(height, 10);
    this.size = size;
    this.dpi = parseInt(dpi, 10);
    this.signature = signature;
  }

  async isValid() {
    try {
      await this.validate();
    } catch {
      return false;
    }
    return true;
  }

  read() {
    return fs.promises.readFile(this.path);
  }

  async validate() {
    try {
      await this.identify();
    } catch (e) {
      throw new InvalidImageFileError(e.message);
    }
  }

  async identify(args = [], multiLine = true) {
    args.push(this.path);
    let { stdout } = await execa("identify", args);

    let lines = stdout.split("\n");

    if (lines.length == 1 || multiLine) {
      return stdout;
    }

    throw new ImageFileReadError();
  }

  async unlink() {
    await fs.promises.unlink(this.filePath);
  }
}
