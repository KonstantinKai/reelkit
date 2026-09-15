import { Reel, ReelIndicator } from '@reelkit/react';

{/* Auto-connect: count and active are inherited from parent Reel */}
<Reel count={10} size={[400, 600]} itemBuilder={...}>
  <ReelIndicator />
</Reel>

{/* Manual usage: pass count and active explicitly (e.g. outside a Reel) */}
<ReelIndicator count={10} active={currentIndex} />
