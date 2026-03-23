import { CodeBlock } from '../../../components/ui/CodeBlock';
import '../docs.css';

export default function VueApi() {
  return (
    <div className="docs-page">
      <div className="coming-soon-banner">
        <strong>Coming Soon</strong> — Vue bindings are under development. The
        API below is planned but not yet available.
      </div>
      <h1 className="docs-title">Vue API</h1>
      <p className="docs-description">
        The <code>@reelkit/vue</code> package provides Vue 3 composables and
        components.
      </p>

      <section className="docs-section">
        <h2>Reel Component</h2>
        <p>The main container component that provides slider context.</p>
        <CodeBlock
          language="html"
          code={`<script setup lang="ts">
import { ref } from 'vue';
import { Reel, ReelIndicator } from '@reelkit/vue';

const items = [
  { id: 1, title: 'Slide 1', color: '#6366f1' },
  { id: 2, title: 'Slide 2', color: '#8b5cf6' },
  { id: 3, title: 'Slide 3', color: '#ec4899' },
];

const currentIndex = ref(0);
</script>

<template>
  <Reel
    :count="items.length"
    :size="[400, 600]"
    direction="vertical"
    :enable-wheel="true"
    @after-change="(index) => currentIndex = index"
  >
    <template #default="{ index }">
      <div
        :style="{
          width: '100%',
          height: '100%',
          background: items[index].color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '2rem',
        }"
      >
        {{ items[index].title }}
      </div>
    </template>

    <ReelIndicator :count="items.length" />
  </Reel>
</template>`}
        />

        <h3>Props</h3>
        <table className="api-table">
          <thead>
            <tr>
              <th>Prop</th>
              <th>Type</th>
              <th>Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>count</code>
              </td>
              <td>
                <code>number</code>
              </td>
              <td>required</td>
              <td>Total number of items</td>
            </tr>
            <tr>
              <td>
                <code>size</code>
              </td>
              <td>
                <code>[number, number]</code>
              </td>
              <td>required</td>
              <td>[width, height]</td>
            </tr>
            <tr>
              <td>
                <code>direction</code>
              </td>
              <td>
                <code>'vertical' | 'horizontal'</code>
              </td>
              <td>
                <code>'vertical'</code>
              </td>
              <td>Scroll direction</td>
            </tr>
            <tr>
              <td>
                <code>initial-index</code>
              </td>
              <td>
                <code>number</code>
              </td>
              <td>
                <code>0</code>
              </td>
              <td>Starting index</td>
            </tr>
            <tr>
              <td>
                <code>enable-wheel</code>
              </td>
              <td>
                <code>boolean</code>
              </td>
              <td>
                <code>false</code>
              </td>
              <td>Enable wheel scroll</td>
            </tr>
            <tr>
              <td>
                <code>use-nav-keys</code>
              </td>
              <td>
                <code>boolean</code>
              </td>
              <td>
                <code>true</code>
              </td>
              <td>Enable keyboard nav</td>
            </tr>
            <tr>
              <td>
                <code>loop</code>
              </td>
              <td>
                <code>boolean</code>
              </td>
              <td>
                <code>false</code>
              </td>
              <td>Loop navigation</td>
            </tr>
          </tbody>
        </table>

        <h3>Events</h3>
        <table className="api-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Payload</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>@after-change</code>
              </td>
              <td>
                <code>(index: number, rangeIndex: number)</code>
              </td>
              <td>After slide change</td>
            </tr>
            <tr>
              <td>
                <code>@before-change</code>
              </td>
              <td>
                <code>(index: number, nextIndex: number)</code>
              </td>
              <td>Before slide change</td>
            </tr>
          </tbody>
        </table>

        <h3>Slots</h3>
        <table className="api-table">
          <thead>
            <tr>
              <th>Slot</th>
              <th>Props</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>default</code>
              </td>
              <td>
                <code>{'{ index, indexInRange, size }'}</code>
              </td>
              <td>Slide content</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="docs-section">
        <h2>API Access</h2>
        <p>Access the controller via template ref:</p>
        <CodeBlock
          language="html"
          code={`<script setup lang="ts">
import { ref } from 'vue';
import { Reel } from '@reelkit/vue';

const reelRef = ref();

function goToSlide(index: number) {
  reelRef.value?.goTo(index);
}
</script>

<template>
  <Reel ref="reelRef" :count="10" :size="[400, 600]">
    <!-- ... -->
  </Reel>

  <button @click="reelRef?.prev()">Prev</button>
  <button @click="reelRef?.next()">Next</button>
  <button @click="goToSlide(5)">Go to 5</button>
</template>`}
        />
      </section>

      <section className="docs-section">
        <h2>ReelIndicator</h2>
        <CodeBlock
          language="html"
          code={`<template>
  <Reel :count="10" :size="[400, 600]">
    <template #default="{ index }">
      <Slide :index="index" />
    </template>

    <ReelIndicator :count="10" />
  </Reel>
</template>`}
        />
      </section>
    </div>
  );
}
