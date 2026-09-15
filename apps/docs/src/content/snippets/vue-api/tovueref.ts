import { defineComponent, h } from 'vue';
import { toVueRef, useSoundState } from '@reelkit/vue';

export const MuteIcon = defineComponent({
  setup() {
    const sound = useSoundState();
    const muted = toVueRef(sound.muted); // Readonly<Ref<boolean>>

    return () => h('span', muted.value ? '🔇' : '🔊');
  },
});
