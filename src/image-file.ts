import path from "path";
import fs from "fs";

import * as tempy from "tempy";
import { flatten } from "lodash";
import execa from "execa";

import { ImageFileReadError, InvalidImageFileError } from "./errors";
import { Changeset } from "@mbriggs/image-file/changeset";

export class ImageFile {
  static mogrify = "mogrify";
  static convert = "convert";
  static identify = "identify";

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
    let temp = tempfile(imagePath);

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
    next.source = file;
    next.name = name;

    return next;
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

  async apply(changeset: Changeset, inPlace = false) {
    let changes = flatten(changeset.changes);
    let result: ImageFile;

    if (inPlace) {
      let command = ImageFile.mogrify;
      changes.push(this.path);

      await execa(command, changes);

      result = await ImageFile.read(this.path, this.name);
      result.source = this.source;
      await this.unlink();
    } else {
      let command = ImageFile.convert;
      let dest = tempfile(this.path);
      changes = [this.path].concat(changes);
      changes.push(dest);

      await execa(command, changes);

      result = await ImageFile.read(dest, this.name);
      result.source = this;
    }

    return result;
  }

  async identify(args = [], multiLine = true) {
    args.push(this.path);
    let { stdout } = await execa(ImageFile.identify, args);

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

function tempfile(source: string) {
  let base = path.basename(source);
  let temp = tempy.file({ name: base });
  return temp;
}
