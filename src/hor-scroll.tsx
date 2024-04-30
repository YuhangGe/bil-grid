import { defineComponent, onMounted, reactive, ref } from 'vue';
import type { GridConfig, GridData } from './common';

export const HorizionScrollbar = defineComponent(
  <T extends GridData>({ config }: { config: GridConfig<T>['scrollbar'] }) => {
    const tx = ref(0);
    const md = ref({
      sx: 0,
      tx: 0,
      maxTx: 0,
    });
    const el = ref<HTMLDivElement>();

    onMounted(() => {
      if (!el.value) return;
      md.value.maxTx = el.value.offsetWidth - config.buttonLength;
      console.log(md.value);
    });

    const onMove = (evt: MouseEvent) => {
      const el = evt.target as HTMLDivElement;
      if (!el?.parentElement) return;
      const nx = evt.pageX;
      const dx = nx - md.value.sx + md.value.tx;
      if (dx <= 0) {
        tx.value = 0;
      } else if (dx >= md.value.maxTx) {
        tx.value = md.value.maxTx;
      } else {
        tx.value = dx;
      }
    };
    const onUp = (evt: MouseEvent) => {
      console.log('rm me');
      document.body.removeEventListener('mousemove', onMove, { capture: true });
      document.body.removeEventListener('mouseup', onUp, { capture: true });
    };
    return () => {
      return (
        <div
          class='w-full select-none'
          ref={el}
          style={{ height: `${config.buttonBreadth}px`, backgroundColor: config.backgroundColor }}
        >
          <divw
            onMousedown={(evt) => {
              md.value.sx = evt.pageX;
              md.value.tx = tx.value;
              document.body.addEventListener('mousemove', onMove, { capture: true });
              document.body.addEventListener('mouseup', onUp, { capture: true });
            }}
            class='h-full cursor-pointer select-none'
            style={{
              width: `${config.buttonLength}px`,
              background: config.buttonColor,
              transform: `translateX(${tx.value}px)`,
            }}
          ></div>
        </div>
      );
    };
  },
  {
    props: ['config'],
  },
);
