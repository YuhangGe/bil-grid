import type { Ref } from 'vue';
import type { GridConfig, GridData } from './common';

export class Renderer<T extends GridData> {
  #cav: Ref<HTMLCanvasElement | undefined>;
  #cfg: GridConfig<T>;
  #dt: T[];

  constructor(canvas: Ref<HTMLCanvasElement | undefined>, config: GridConfig<T>) {
    this.#cav = canvas;
    this.#cfg = config;
    this.#dt = [];
  }
  setData(data: T[], rerender = true) {
    this.#dt = data;
    if (rerender) this.render();
  }
  render() {
    const $el = this.#cav.value;
    if (!$el) throw 'unexpected';
    const ctx = $el.getContext('2d');
    if (!ctx) throw 'unexpected';
    const { columns, rowHeight } = this.#cfg;
    const vw = $el.width;
    const vh = $el.height;
    ctx.clearRect(0, 0, vw, vh);
    const data = this.#dt;

    if (!data.length) {
      return;
    }

    ctx.save();
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '14px Arial';

    let y = 0;
    for (let row = 0; row < data.length; row++) {
      const dt = data[row];
      const rowH = dt.__rowHeight ?? rowHeight;
      let x = 0;
      for (let col = 0; col < columns.length; col++) {
        const column = columns[col];
        const tw = column.width;
        const tx = x + tw / 2;
        const ty = y + rowH / 2;
        const renderFn = column.render;
        if (renderFn) {
          renderFn(ctx, dt);
        } else {
          const txt = `${dt[column.key]}`;
          ctx.fillText(txt, tx, ty, tw);
        }
        x += tw;
        if (x > vw) {
          break;
        }
      }
      y += rowH;
      if (y > vh) {
        console.log(row, 'rows rendered');
        break;
      }
    }
  }
}
