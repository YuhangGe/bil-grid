import type { GridSelection, Selection } from './common';

export function uid() {
  return Date.now().toString(32) + Math.floor(Math.random() * 0xffff).toString(32);
}
export function isNum(v: unknown): v is number {
  return typeof v === 'number';
}
export function isStr(v: unknown): v is string {
  return typeof v === 'string';
}
export function isObj<T = Record<string, unknown>>(v: unknown): v is T {
  return typeof v === 'object' && v !== null;
}
export function isUndefined(v: unknown): v is undefined {
  return typeof v === 'undefined';
}
export function cs(...args: (string | Record<string, boolean> | boolean | null | undefined)[]) {
  const segs: string[] = [];
  args.forEach((arg) => {
    if (isObj(arg)) {
      Object.keys(arg).forEach((k) => {
        if (arg[k]) {
          segs.push(k.trim());
        }
      });
    } else if (isStr(arg) && arg.trim()) {
      segs.push(arg);
    }
  });
  return segs.join(' ');
}

export function getGridSelection(sel: Selection): GridSelection {
  return sel.all
    ? {
        all: true,
        exclude: [...sel.exclude.values()],
      }
    : {
        all: false,
        include: [...sel.include.values()],
      };
}
