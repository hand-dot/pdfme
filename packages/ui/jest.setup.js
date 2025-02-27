// Mock ResizeObserver which is not available in jsdom
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    // Do nothing
  }
  unobserve() {
    // Do nothing
  }
  disconnect() {
    // Do nothing
  }
};

// Mock for other browser APIs not available in jsdom
global.MutationObserver = class {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    // Do nothing
  }
  disconnect() {
    // Do nothing
  }
};

// Mock for window.matchMedia
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};
