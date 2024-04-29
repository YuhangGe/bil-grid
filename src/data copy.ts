import type { GridData, GridSelection, Selection } from './common';
import { getGridSelection } from './util';

interface DataChunk<T> {
  list: T[];
  /** 当前 chunk 的在全量数据中的行范围 */
  bound: {
    start: number;
    end: number;
  };
  prev?: DataChunk<T>;
  next?: DataChunk<T>;
}
/**
 * 找到离 startRow 所在行最近的一个 chunk。
 * 最近 chunk 的定义是：
 *   在两个 chunk 的间隙中间（不在任何一个 chunk 的范围之内），其右边的这个 chunk;
 *   或是在该 chunk 的范围之内。
 */
function findStartChunk<T>(chunks: DataChunk<T>[], startRow: number) {
  let left = 0;
  let right = chunks.length - 1;
  let center = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (left === right) {
      center = left;
      break;
    }
    center = Math.floor((left + right) / 2);

    const b = chunks[center].bound;
    if (startRow > b.end) {
      left = center + 1;
    } else {
      if (center === 0) {
        break;
      } else if (startRow > chunks[center - 1].bound.end) {
        break;
      } else {
        right = center - 1;
      }
    }
  }
  return center;
}

function checkIsSelected(d: GridData, sel: Selection) {
  return sel.all ? !sel.exclude.has(d.id) : sel.include.has(d.id);
}

export class DataStore<T extends GridData> {
  #exp: Set<string | number>;
  #sel: Selection;
  /** data chunks */
  #dcs: DataChunk<T>[];
  constructor() {
    this.#dcs = [];
    this.#exp = new Set();
    this.#sel = { all: false, exclude: new Set(), include: new Set() };
  }

  getAt(rowAt: number) {
    const chunks = this.#dcs;
    if (!chunks.length) {
      return null;
    }
    const c0 = chunks[0];
    if (rowAt < c0.bound.start) {
      return null;
    }
    const cm = chunks[chunks.length - 1];
    if (rowAt > cm.bound.end) {
      return null;
    }
    const ci = findStartChunk(chunks, rowAt);
    const c = chunks[ci];
    const b = c.bound;
    if (rowAt < b.start || rowAt > b.end) return null;
    return c.list[rowAt - b.start];
  }

  get selection(): GridSelection {
    return getGridSelection(this.#sel);
  }
  expand(id: string | number, expand: boolean) {
    if (expand) {
      this.#exp.add(id);
    } else {
      this.#exp.delete(id);
    }
  }
  selectAll(selected: boolean) {
    if (selected) {
      this.#sel.all = true;
      this.#sel.exclude.clear();
    } else {
      this.#sel.all = false;
      this.#sel.include.clear();
    }
  }
  select(id: string | number, selected: boolean) {
    if (this.#sel.all) {
      if (selected) {
        this.#sel.exclude.delete(id);
      } else {
        this.#sel.exclude.add(id);
      }
    } else {
      if (selected) {
        this.#sel.include.add(id);
      } else {
        this.#sel.include.delete(id);
      }
    }
  }
  clear() {
    this.#dcs.length = 0;
  }
  read(
    startRow: number,
    endRow: number,
    iterFn: (options: {
      rowAt: number;
      data?: T | null;
      isExpand?: boolean;
      isSelected?: boolean;
    }) => boolean,
  ) {
    const chunks = this.#dcs;
    if (!chunks.length) {
      for (let i = startRow; i <= endRow; i++) {
        if (!iterFn({ rowAt: i })) break;
      }
      return;
    }
    const c0 = chunks[0];
    if (endRow < c0.bound.start) {
      for (let i = startRow; i <= endRow; i++) {
        if (!iterFn({ rowAt: i })) break;
      }
      return;
    }
    const cm = chunks[chunks.length - 1];
    if (startRow > cm.bound.end) {
      for (let i = startRow; i <= endRow; i++) {
        if (!iterFn({ rowAt: i })) break;
      }
      return;
    }
    const ci = findStartChunk(chunks, startRow);
    let c: DataChunk<T> | undefined = chunks[ci];
    let b: typeof c.bound | undefined = c.bound;
    let di = 0;
    for (let i = startRow; i <= endRow; i++) {
      if (!b || !c) {
        if (!iterFn({ rowAt: i })) break;
        continue;
      }
      if (i < b.start) {
        if (!iterFn({ rowAt: i })) break;
      } else {
        const d = c.list[di];
        if (
          !iterFn({
            rowAt: i,
            data: d,
            isSelected: checkIsSelected(d, this.#sel),
            isExpand: this.#exp.has(d.id),
          })
        )
          break;
        di++;
      }
      if (i === b.end) {
        c = c.next;
        b = c?.bound;
        di = 0;
      }
    }
  }
  fill(data: T[], startRow: number, endRow: number) {
    if (!data?.length) throw new Error('不能为空');
    if (data.length > 500) throw new Error('出于性能考虑，每次 fill 数据不能超过 500 条');
    if (endRow - startRow + 1 !== data.length)
      throw new Error('data 长度必须和 endRow - startRow + 1 一致');
    const newchunk = (prev?: DataChunk<T>, next?: DataChunk<T>) => ({
      list: data,
      bound: { start: startRow, end: endRow },
      prev,
      next,
    });
    const chunks = this.#dcs;
    if (!chunks.length) {
      chunks.push(newchunk());
      return;
    }
    const c0 = chunks[0];
    if (endRow < c0.bound.start) {
      chunks.unshift(newchunk(undefined, c0));
      return;
    }
    const cm = chunks[chunks.length - 1];
    if (startRow > cm.bound.end) {
      chunks.push(newchunk(cm));
      return;
    }

    const ci = findStartChunk(chunks, startRow);
    const c = chunks[ci];
    if (startRow >= c.bound.start && endRow <= c.bound.end) {
      // ignore; 所有数据都 已经在 chunk 中
      return;
    }
    const prev = c.prev;
    let next = c;
    let newdata = data;
    let sr = startRow;
    if (startRow >= c.bound.start) {
      sr = c.bound.start;
      if (!c.next) throw new Error('unexpected');
      next = c.next;
      newdata = c.list.slice(0, startRow - sr).concat(newdata);
    }
    while (endRow >= next.bound.start) {
      if (!next.next) throw new Error('unexpected');
      next = next.next;
    }
    let er = endRow;
    if (!next.prev) throw new Error('unexpected');
    if (next.prev.bound.end > endRow) {
      er = next.prev.bound.end;
      newdata = newdata.concat(next.prev.list.slice(next.prev.bound.end - endRow));
    }
    const nc: DataChunk<T> = {
      list: newdata,
      bound: {
        start: sr,
        end: er,
      },
      prev,
      next,
    };
    if (prev) prev.next = nc;
    next.prev = nc;
  }
}
