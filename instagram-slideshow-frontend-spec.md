# Instagram Feed Slideshow — Frontend Web Application Spec

The companion to the driver spec. This document covers **only the web
application**: how it consumes state from the PlaceOS driver and how it renders
that state as a continuous slideshow of images, muted-autoplay videos/Reels, and
scrollable carousels.

The driver's slide projection (defined in the driver spec, §4) is treated here as
a **fixed upstream contract**. The frontend mirrors that shape and does not
re-derive it.

---

## 1. Scope and boundaries

**The frontend does:**
- Subscribe to the driver's `slides` state and re-render reactively when it changes.
- Map incoming state onto a typed interface.
- Render each slide polymorphically by type.
- Run an unattended, looping slideshow with per-type pacing.
- Support manual navigation (swipe / arrow keys) layered over auto-advance.
- Degrade gracefully on media load failure or loss of connection to the driver.

**The frontend does NOT:**
- Call the Instagram API directly.
- Handle, store, or ever see access tokens or the app secret.
- Fetch or refresh media URLs (those come only from driver state).
- Persist anything authoritative — the driver is the single source of truth.

This separation is the whole point of the architecture: the display is a dumb,
safe renderer of a pre-shaped, pre-sanitized cache.

---

## 2. Render targets and layout modes

The application runs in one of two **layout modes**, each a different frame
shape. Neither render area is landscape — both are portrait-ish, which is
friendly to Instagram content.

| Mode         | Frame size  | Aspect | Notes                                          |
| ------------ | ----------- | ------ | ---------------------------------------------- |
| `vertical`   | 1080 × 1920 | 9:16   | Full portrait display.                         |
| `horizontal` | 960 × 1080  | 8:9    | The app occupies one half of a 1920×1080 display. |

The other 960×1080 half of the horizontal display shows **dynamic imagery** and
is **out of scope** for this application.

### 2.1 Orientation is an explicit mode, not sniffed

The active mode is supplied **explicitly** (config/prop/route), not inferred from
viewport dimensions. Explicit intent is more robust than dimension-sniffing and
avoids surprises if the container resizes. The component tree is identical across
modes; only layout, media fit, and caption placement swap per mode.

### 2.2 Media fit: blurred-backdrop contain (default)

Instagram content arrives in mixed aspect ratios — square (1:1), portrait (4:5),
and vertical Reels (9:16) — none of which matches either frame exactly. The
default fit strategy is **blurred-backdrop contain**:

- The media is `object-fit: contain` in the foreground (nothing cropped, whole
  image/video always visible).
- Behind it, the **same media is rendered `cover` and heavily blurred** to fill
  the frame, so there are no hard letterbox bars — the empty space reads as an
  intentional, soft, color-matched matte (the treatment Instagram and most TV/OTT
  apps use for mismatched media).

This applies in **both** modes and to images, video posters/frames, and carousel
children alike. It is the single fit rule across the app; do **not** use a bare
`object-fit: cover` crop (an earlier draft assumed a landscape wall — that no
longer applies, since both frames are portrait-ish and cropping would cut off
faces/text in mismatched posts).

### 2.3 Per-mode chrome differences

- **`vertical` (9:16):** ample height — a caption band along the bottom has room;
  the image gets generous vertical space.
- **`horizontal` (8:9):** squarer and tighter vertically — caption uses a
  smaller clamped overlay region; chrome (carousel indicators, attribution) must
  be more compact.

---

## 3. Data consumption

### 3.1 Source: PlaceOS state binding

The app connects to PlaceOS and **binds to the `slides` status variable** on the
Instagram driver module within the relevant system, receiving a reactive stream
of updates. When the driver's poll updates `slides`, the new array is pushed to
the frontend over the websocket and the slideshow updates — no polling or reload
on the frontend side.

Mechanism: the PlaceOS frontend client library (`@placeos/ts-client` or the
project's standard binding layer). The exact bind/listen calls should be
confirmed against the version in use; conceptually the app:

1. Establishes an authenticated PlaceOS websocket session.
2. Resolves the system → module (the Instagram driver) → status variable `slides`.
3. Binds and subscribes to its value stream.
4. Optionally also binds `poll_state` and `token_state` for an operator/health
   overlay (see §8.3).

> Confirm the precise binding API (`getModule` / `.binding('slides')` /
> `.bind()` / `.listen()` or equivalent) against the PlaceOS client version.

### 3.2 Reactive update model

- On each `slides` push, replace the app's source data with the new array.
- Updates must not jar the viewer: a new push **must not** hard-reset playback to
  slide 0 or interrupt a mid-play video. See §6.4 for the reconciliation rules.

### 3.3 Connection loss

If the websocket drops, **keep displaying the last known `slides`** and keep the
slideshow running off the in-memory copy. Attempt reconnection in the background.
A display should never go blank because the binding hiccupped — it shows the last
good set until fresh state arrives.

---

## 4. The typed interface (mirror of driver projection)

```typescript
type SlideType = "image" | "video" | "carousel";

interface CarouselChild {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnail?: string;
}

interface Slide {
  id: string;               // stable key
  type: SlideType;
  caption?: string;         // may be long (~1500 chars) or absent
  permalink: string;
  username: string;
  timestamp: string;        // ISO 8601 UTC

  url?: string;             // image: image URL; video: mp4 URL
  thumbnail?: string;       // video: poster/fallback image

  children?: CarouselChild[]; // carousel: grouped children, passed through
}
```

This interface is the contract. If the driver projection changes, this changes in
lockstep — they are two views of one shape.

---

## 5. Application state model

Separate **data** (owned by the driver) from **playback state** (owned locally):

| State           | Owner    | Description                                            |
| --------------- | -------- | ----------------------------------------------------- |
| `slides`        | driver   | The source array, received via binding.               |
| `currentIndex`  | frontend | Which top-level slide is showing.                     |
| `carouselIndex` | frontend | Which child within the current carousel is showing.   |
| `isPlaying`     | frontend | Playback running (vs. paused, if controls exist).     |
| `connection`    | frontend | Bound / reconnecting (for health overlay).            |

Playback state is purely local and ephemeral. Only `slides` comes from upstream.

---

## 6. Slideshow / playback engine

### 6.1 Advancement model (per type)

| Type       | Advances when…                                                            |
| ---------- | ------------------------------------------------------------------------- |
| `image`    | Its caption finishes auto-scrolling, **clamped to 8–25s** (§7.5).          |
| `video`    | The `ended` event fires (full play). No cap by default.                   |
| `carousel` | Each child has shown for its dwell (**5s default**), then advance to next slide. |

Defaults: image dwell is **scroll-driven, clamped 8–25s**; carousel-child dwell
**5s**; video plays **in full**. All configurable.

### 6.2 Looping

After the last slide, wrap to the first. The loop is infinite and unattended.

### 6.3 Empty / not-ready state

If `slides` is empty or not yet received (cold start, driver mid-first-poll),
show a neutral holding state (client branding, a quiet placeholder) rather than a
blank or broken screen. Transition into the slideshow once a non-empty array
arrives.

### 6.4 Reconciling a data update mid-show

When a new `slides` array arrives while the show is running:

- **Identify slides by `id`**, not by index, so reordering/insertion doesn't
  yank the viewer.
- If the currently-displayed slide's `id` still exists in the new array, **keep
  showing it** and continue from there; recompute `currentIndex` to its new
  position.
- If the current slide's `id` is gone (deleted post), finish the current dwell,
  then advance into the new array gracefully.
- New posts simply join the loop and appear when the rotation reaches them.

The rule: data updates are absorbed smoothly; the viewer never sees an abrupt
jump to slide 0 or a mid-video cut.

### 6.5 Manual navigation (swipe + arrow keys)

The viewer can drive the show manually via **swipe (touch)** or **left/right
arrow keys**. Swipe and arrows are equivalent: swipe-left = arrow-right = *next*;
swipe-right = arrow-left = *previous*.

**Carousel interaction — Instagram's model (child-then-post).** Left/right
operates at the top (post) level, except that a carousel is stepped through
internally first, matching how Instagram itself behaves:

- **Next** on a carousel → advance to the next *child*; when on the last child,
  the next *Next* moves to the following post.
- **Previous** on a carousel → previous *child*; when on the first child, the
  previous *Previous* moves to the prior post (landing on that post's first
  child / its start).
- **Next/Previous** on a non-carousel slide → simply the next/previous post.

This preserves the grouped-carousel structure (no flattening into N top-level
stops) while giving full manual control over every image.

**Interaction with auto-advance:**

- A manual nav **resets the current slide's dwell timer** (so it doesn't
  immediately auto-flip from a stale timer).
- Default behavior is **nudge-and-keep-playing**: manual input moves the show but
  auto-advance continues. (Alternative model — pause-on-interaction,
  resume-after-idle — is a configurable choice; see open items.)

**Video under manual nav:** navigating away from a playing video advances
immediately (do not wait for `ended`); navigating *to* a video starts it from the
top.

**Wrap-around:** Previous from the first post wraps to the last; Next from the
last wraps to the first — the loop is infinite in both directions.

**Input availability per mode:** swipe applies only on touch-capable hardware;
arrow keys apply where a keyboard/remote is present. Confirm which input(s) each
deployment actually has (§11).

---

## 7. Rendering

### 7.1 Polymorphic slide component

One component switches on `type` and delegates to a per-kind renderer. The
slideshow iterates the array and renders one `<Slide>` per item, agnostic to type.

```tsx
function Slide({ slide }: { slide: Slide }) {
  switch (slide.type) {
    case "image":    return <ImageSlide slide={slide} />;
    case "video":    return <VideoSlide slide={slide} />;
    case "carousel": return <CarouselSlide slide={slide} />;
  }
}
```

### 7.2 ImageSlide

- `<img src={slide.url}>` rendered with the **blurred-backdrop contain**
  treatment (§2.2): contained foreground, blurred `cover` copy behind. Nothing
  cropped.
- Caption overlay (see §7.5).
- `alt` derived from a caption substring or `""` (the API's `alt_text` is empty
  for this account).
- Advance on the image dwell timer.

### 7.3 VideoSlide

- `<video muted autoplay playsinline>` — **`muted` is mandatory** or browsers
  block autoplay; `playsinline` prevents fullscreen takeover on webkit kiosks.
- `poster={slide.thumbnail}` so a frame shows before/while the video loads.
- Advance on the `ended` event. Optionally cap long videos/Reels (e.g. 15s) and
  advance early — product decision.
- Uses the **blurred-backdrop contain** treatment (§2.2): the video is contained
  (whole frame visible), with a blurred fill behind. In the `vertical` (9:16)
  mode a Reel fills the frame nearly edge-to-edge; in the `horizontal` (8:9) mode
  the contain + blurred backdrop handles the taller-than-frame ratio cleanly.

### 7.4 CarouselSlide

- Renders `slide.children` as an internal sequence, scrolling/transitioning
  through each child for its dwell, then signals the engine to advance to the
  next top-level slide.
- Shows the **parent's** caption/permalink throughout (children carry neither).
- Each child uses the **blurred-backdrop contain** treatment (§2.2).
- A child whose `url` is missing is skipped (defensive; driver should already
  have dropped these).

### 7.5 Caption treatment

Captions can be ~1,500 characters and must not overflow. The strategy is
**auto-scroll**: the caption renders in a fixed region and slowly scrolls
through its full length.

**Caption scroll drives image dwell.** An image slide holds until its caption
finishes scrolling, **clamped to a min 8s / max 25s** window:

- Short captions reach the min (8s) and advance — they don't flip too fast.
- Long captions scroll for as long as needed, up to the 25s ceiling, then
  advance even if not fully scrolled (the cap prevents a giant caption from
  camping the slide).
- Tune scroll speed so a typical caption completes comfortably within the
  window; the clamp guarantees pacing regardless of caption length.

**Per type:**

- **Image** — dwell = scroll-driven (8–25s clamp), as above.
- **Carousel** — the parent caption auto-scrolls continuously across all
  children; child advancement is on the 5s child-dwell, independent of the
  caption scroll (the caption keeps scrolling underneath the changing images).
- **Video** — caption auto-scrolls during playback; the slide advances on
  `ended` regardless of scroll position.

Apply the same auto-scroll region styling consistently across all slide types;
only the dwell coupling differs (images are scroll-driven; video and carousel
have their own advancement clocks).

### 7.6 Attribution

Show `username` and treat `permalink` as the canonical link back to the post
(used for any "view on Instagram" affordance or QR, if desired). Content is the
client's account; attribution should be present and clear.

---

## 8. Resilience and error handling

### 8.1 Media load failure (the URL-expiry safety net)

A failed media load must **never** freeze the slideshow:

- `<img onError>` → skip to the next slide (or substitute a neutral placeholder).
- `<video onError>` → fall back to `thumbnail` as a still for the dwell, or skip.
- **Rule:** a failed load advances or substitutes; the loop always keeps moving.

Do **not** attempt to refetch a fresh URL on failure — fresh URLs come only from
the driver's next poll. (URLs carry a ~8-day lifetime, so this path is rare; it
exists purely as insurance.)

### 8.2 Driver/connection loss

Covered in §3.3: keep showing the last known set, reconnect in the background,
never blank the screen.

### 8.3 Health overlay (optional, operator-facing)

Optionally bind `poll_state` and `token_state` and surface a small,
non-intrusive indicator (or a hidden diagnostics view) so an operator can tell at
a glance whether the feed is live and the token is healthy. Not shown to the
general audience.

---

## 9. Edge cases from real account data

- **Long captions** (~1,500 chars) — must clamp/scroll (§7.5).
- **Empty `alt_text`** — derive alt from caption or use `""` (§7.2).
- **Mixed aspect ratios (1:1, 4:5, 9:16) vs. portrait-ish frames** — handled by
  blurred-backdrop contain (§2.2); nothing cropped in either mode.
- **Carousel parent `media_url` duplicates the first child** — irrelevant to the
  frontend because the driver passes carousels through as `children`; render only
  `children`, never a parent image.
- **Carousels vary 2–14 children** — the CarouselSlide must handle arbitrary
  child counts and pace accordingly.

---

## 10. Display / kiosk considerations

- Target is an unattended display (Chromium kiosk typical for PlaceOS), in one of
  the two layout modes (§2).
- Muted autoplay is reliable there; design assumes no audio.
- Layout sized to the known frame (1080×1920 or 960×1080); blurred-backdrop
  contain (§2.2) throughout — no hard cropping.
- The show runs and loops on its own; manual navigation (§6.5) is an overlay on
  top of auto-advance, not a requirement for operation.

---

## 11. Open items to confirm at build time

- **Transitions** between slides (cut, crossfade, slide) — visual/branding choice.
- **Manual-nav behavior**: nudge-and-keep-playing (default) vs.
  pause-on-interaction / resume-after-idle (§6.5).
- **Input hardware per deployment**: touch (swipe), keyboard/remote (arrows), or
  both (§6.5).
- **Media fit confirmation**: blurred-backdrop contain is the assumed default
  (§2.2) — confirm vs. plain contain/letterbox if the client prefers.
- **Branding/theming**: holding state, overlays, fonts, color — the client's look.
- **Exact PlaceOS binding API** for subscribing to `slides` (§3.1), per the
  client library version in use.
- Whether a **health overlay / diagnostics view** (§8.3) is wanted.
