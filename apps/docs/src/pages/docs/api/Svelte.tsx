import { CodeBlock } from '../../../components/ui/CodeBlock';
import '../docs.css';

export default function SvelteApi() {
  return (
    <div className="docs-page">
      <div className="coming-soon-banner">
        <strong>Coming Soon</strong> — Svelte bindings are under development. The API below is planned but not yet available.
      </div>
      <h1 className="docs-title">Svelte API</h1>
      <p className="docs-description">
        The <code>@reelkit/svelte</code> package provides Svelte components.
      </p>

      <section className="docs-section">
        <h2>Reel Component</h2>
        <p>
          The main container component that handles slider logic.
        </p>
        <CodeBlock
          title="App.svelte"
          lang="svelte"
          code={`<script lang="ts">
  import { Reel, ReelIndicator } from '@reelkit/svelte';

  const items = [
    { id: 1, title: 'Slide 1', color: '#6366f1' },
    { id: 2, title: 'Slide 2', color: '#8b5cf6' },
    { id: 3, title: 'Slide 3', color: '#ec4899' },
  ];

  let currentIndex = 0;
</script>

<Reel
  count={items.length}
  size={[400, 600]}
  direction="vertical"
  enableWheel
  on:afterChange={(e) => currentIndex = e.detail}
  let:index
>
  <div
    style="
      width: 100%;
      height: 100%;
      background: {items[index].color};
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 2rem;
    "
  >
    {items[index].title}
  </div>

  <ReelIndicator count={items.length} slot="indicator" />
</Reel>`}
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
              <td><code>count</code></td>
              <td><code>number</code></td>
              <td>required</td>
              <td>Total number of items</td>
            </tr>
            <tr>
              <td><code>size</code></td>
              <td><code>[number, number]</code></td>
              <td>required</td>
              <td>[width, height]</td>
            </tr>
            <tr>
              <td><code>direction</code></td>
              <td><code>'vertical' | 'horizontal'</code></td>
              <td><code>'vertical'</code></td>
              <td>Scroll direction</td>
            </tr>
            <tr>
              <td><code>initialIndex</code></td>
              <td><code>number</code></td>
              <td><code>0</code></td>
              <td>Starting index</td>
            </tr>
            <tr>
              <td><code>enableWheel</code></td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
              <td>Enable wheel scroll</td>
            </tr>
            <tr>
              <td><code>useNavKeys</code></td>
              <td><code>boolean</code></td>
              <td><code>true</code></td>
              <td>Enable keyboard nav</td>
            </tr>
            <tr>
              <td><code>loop</code></td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
              <td>Loop navigation</td>
            </tr>
          </tbody>
        </table>

        <h3>Events</h3>
        <table className="api-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Detail</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>on:afterChange</code></td>
              <td><code>number</code></td>
              <td>Dispatched after slide change</td>
            </tr>
            <tr>
              <td><code>on:beforeChange</code></td>
              <td><code>{'{ index, nextIndex }'}</code></td>
              <td>Dispatched before slide change</td>
            </tr>
          </tbody>
        </table>

        <h3>Slot Props</h3>
        <table className="api-table">
          <thead>
            <tr>
              <th>Prop</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>index</code></td>
              <td><code>number</code></td>
              <td>Current item index</td>
            </tr>
            <tr>
              <td><code>indexInRange</code></td>
              <td><code>number</code></td>
              <td>Position in visible range</td>
            </tr>
            <tr>
              <td><code>size</code></td>
              <td><code>[number, number]</code></td>
              <td>Container size</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="docs-section">
        <h2>API Access</h2>
        <p>
          Bind to the component to access methods:
        </p>
        <CodeBlock
          lang="svelte"
          code={`<script lang="ts">
  import { Reel } from '@reelkit/svelte';

  let reel: Reel;
</script>

<Reel bind:this={reel} count={10} size={[400, 600]} let:index>
  <div>Slide {index}</div>
</Reel>

<button on:click={() => reel.prev()}>Prev</button>
<button on:click={() => reel.next()}>Next</button>
<button on:click={() => reel.goTo(5)}>Go to 5</button>`}
        />
      </section>

      <section className="docs-section">
        <h2>ReelIndicator</h2>
        <CodeBlock
          lang="svelte"
          code={`<Reel count={10} size={[400, 600]} let:index>
  <div>Slide {index}</div>

  <ReelIndicator count={10} slot="indicator" />
</Reel>`}
        />
      </section>
    </div>
  );
}
