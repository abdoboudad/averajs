class Averajs {
  constructor(options) {
    this.el = document.querySelector(options.el);
    this.data = options.data;
    this.template = this.el.innerHTML;
    this.refs = {};

    this.render();
    this.observe();
  }

  observe() {
    for (const key in this.data) {
      let value = this.data[key];
      Object.defineProperty(this.data, key, {
        get: () => value,
        set: (newVal) => {
          value = newVal;
          this.render();
        },
      });
    }
  }

  render() {
    // Reset HTML each time from original template
    this.el.innerHTML = this.template;

    // Handle loops first
    this.Avloop();

    // Then handle {{ expressions }}
    let html = this.el.innerHTML;
    html = html.replace(/\{\{(.*?)\}\}/g, (match, expr) => {
      try {
        const keys = Object.keys(this.data);
        const values = Object.values(this.data);
        const func = new Function(...keys, `return ${expr.trim()}`);
        return func(...values);
      } catch (err) {
        console.error("Error evaluating expression:", expr, err);
        return "";
      }
    });

    this.el.innerHTML = html;
    this.collectRefs();
  }

  collectRefs() {
    this.refs = {};
    const refElements = this.el.querySelectorAll("[ref]");
    refElements.forEach((element) => {
      const name = element.getAttribute("ref");
      this.refs[name] = element;
    });
  }

Avloop() {
  const loops = this.el.querySelectorAll("[av-loop]");
  loops.forEach((loopEl) => {
    const loopExp = loopEl.getAttribute("av-loop").trim();
    const [itemName, arrayName] = loopExp.split(" in ").map((s) => s.trim());
    const array = this.data[arrayName];

    if (Array.isArray(array)) {
      const parent = loopEl.parentNode;

      array.forEach((val) => {
        const clone = loopEl.cloneNode(true);
        clone.removeAttribute("av-loop");

        // temporary mini data context (copy base + loop variable)
        const localData = { ...this.data };
        localData[itemName] = val;

        // handle expressions inside {{ }}
        clone.innerHTML = clone.innerHTML.replace(/\{\{(.*?)\}\}/g, (match, expr) => {
          try {
            const keys = Object.keys(localData);
            const values = Object.values(localData);
            const func = new Function(...keys, `return ${expr.trim()}`);
            return func(...values);
          } catch (err) {
            console.warn("Loop expression error:", expr, err);
            return "";
          }
        });

        parent.insertBefore(clone, loopEl);
      });
    }

    loopEl.remove();
  });
}

}
