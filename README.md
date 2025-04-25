# pagesnap

**pagesnap** is a lightweight, zero-dependency JavaScript library for creating full-page scrolling websites.

✅ Supports vertical scroll snapping  
✅ Mouse, keyboard, and touch navigation  
✅ URL hash anchors  
✅ Looping scroll  
✅ Callbacks + responsive behavior  
✅ Destroy/rebuild support  
✅ Tiny footprint & easy to integrate

---

## 🚀 Installation

```bash
npm install pagesnap
```

Or use via CDN:

```html
<script src="https://unpkg.com/pagesnap"></script>
```

---

## 🔧 Usage

### 1. HTML structure

```html
<div id="container">
  <section id="home">Home</section>
  <section id="about">About</section>
  <section id="contact">Contact</section>
</div>
```

---

### 2. CSS (required)

```css
html, body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  height: 100%;
}

#container {
  height: 100vh;
}

section {
  height: 100vh;
}
```

---

### 3. JavaScript

```javascript
import pagesnap from 'pagesnap';

const snap = pagesnap('#container', {
  delay: 700,
  loop: true,
  hash: true,
  disableBelow: 768,
  onBeforeLeave: (from, to) => {
    console.log('Leaving section:', from, '→', to);
  },
  onAfterLoad: (index) => {
    console.log('Arrived at section:', index);
  }
});
```

---

## ⚙️ Options

| Option           | Type     | Default | Description                                                  |
|------------------|----------|---------|--------------------------------------------------------------|
| `delay`          | `number` | `700`   | Transition delay in milliseconds                            |
| `loop`           | `boolean`| `false` | Loop from last section to first and vice versa              |
| `hash`           | `boolean`| `false` | Enable hash-based navigation (e.g., `#about`)               |
| `disableBelow`   | `number` | `0`     | Disable snapping if screen width is below this value        |
| `onBeforeLeave`  | `function`| `null` | Callback before a section change `(fromIndex, toIndex)`     |
| `onAfterLoad`    | `function`| `null` | Callback after a section change `(currentIndex)`            |

---

## 📦 Public API

```javascript
snap.goTo(index);          // Scroll to section index
snap.getCurrent();         // Returns current section index
snap.destroy();            // Disable pagesnap and unbind everything
snap.rebuild();            // Re-enable after destroy
```

---

## 🎨 Custom Styling (optional)

```css
.pagesnap-nav {
  position: fixed;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 1000;
}

.pagesnap-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: background 0.3s;
}

.pagesnap-dot.active {
  background: white;
}
```

---

## 📜 License

MIT License © 2025 Petko Petkov

Permission is granted to use, copy, modify, and distribute this software for any purpose.  
This software is provided "as is" without warranty of any kind.

---

## ❤️ Credits

Built with love and simplicity.  
Inspired by `fullPage.js` but with a lighter footprint and modern vanilla JavaScript design.

---

## 🔗 Roadmap (Optional)

- [ ] Horizontal slides support  
- [ ] Lazy loading sections  
- [ ] Smooth scroll-to-anchor on click  
- [ ] Full accessibility (ARIA roles, focus trapping)
