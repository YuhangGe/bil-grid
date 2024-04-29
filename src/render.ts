import type { Ref } from 'vue';
import type { GridConfig, GridData, RenderState } from './common';
import type { DataStore } from './data';

export class Renderer<T extends GridData> {
  #cav: Ref<HTMLCanvasElement | undefined>;
  #cfg: GridConfig<T>;
  #state: RenderState;
  #store: DataStore<T>;

  constructor(
    canvas: Ref<HTMLCanvasElement | undefined>,
    config: GridConfig<T>,
    state: RenderState,
    store: DataStore<T>,
  ) {
    this.#cav = canvas;
    this.#cfg = config;
    this.#state = state;
    this.#store = store;

    store.onUpdated(() => this.render());
  }
  render() {
    const ctx = this.#cav.value?.getContext('2d');
    if (!ctx) throw 'unexpected';
    const {
      columns,
      row: { height, expandHeight },
    } = this.#cfg;
    const { visualHeight, visualWidth, total, startRow } = this.#state;
    const store = this.#store;
    ctx.clearRect(0, 0, visualWidth, visualHeight);

    if (total === 0) {
      return;
    }
    ctx.save();
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '14px Arial';

    let y = 0;
    let row = startRow;
    while (y < visualHeight && row < total) {
      const data = store.getAt(row);
      const rowH = data && store.checkSelected(data) ? expandHeight : height;
      // console.log('sdraw row:', row);

      if (!data) {
        store.fetchAt(row);
      } else {
        let x = 0;
        columns.forEach((column) => {
          const tw = column.width;
          const tx = x + tw / 2;
          const ty = y + rowH / 2;
          const renderFn = column.render;
          if (renderFn) {
            renderFn(ctx, data);
          } else {
            const txt = `${data[column.key]}`;

            ctx.fillText(txt, tx, ty, tw);
          }
          x += tw;
        });
      }

      row += 1;
      y += rowH;
    }
    this.#state.endRow = row;
    ctx.restore();
  }
}
