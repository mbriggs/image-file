export interface Changeset {
  (...params: any[]): void;
  changeset(): Changeset;
  changes: (string | string[])[];
}

export function changeset(): Changeset {
  let changes = [];

  let change: any = (...params: any[]) => {
    params = params.map((c) => {
      if (typeof c === "string") {
        return c;
      }

      if (c["toString"]) {
        return c.toString();
      }

      throw new Error("cannot convert param to string");
    });

    changes.push(...params);
  };

  change.changes = changes;

  change.changeset = () => {
    let inner = changeset();
    changes.push("\\(");
    changes.push(inner.changes);
    changes.push("\\)");
    return inner;
  };

  return change;
}
