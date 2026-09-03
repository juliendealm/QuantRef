// Interactive visuals. One builder per concept slug, mounted on `::: viz <id>` blocks.
// No dependencies: plain canvas, range inputs, and the theme's CSS variables.
(function () {
  "use strict";

  const lang = document.documentElement.dataset.lang || "en";
  const L = (en, fr) => (lang === "fr" ? fr : en);

  // ------------------------------------------------------------------ helpers

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function css(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  const fmt = (v, d = 2) => v.toFixed(d);
  const pct = (v, d = 1) => `${(100 * v).toFixed(d)}%`;

  // Deterministic RNG so a given seed always draws the same picture.
  function rng(seed) {
    let a = (seed >>> 0) || 1;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function gauss(r) {
    let u = 0, v = 0;
    while (u === 0) u = r();
    while (v === 0) v = r();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  // Abramowitz & Stegun 26.2.17: enough for a picture.
  function ncdf(x) {
    const s = x < 0 ? -1 : 1;
    const z = Math.abs(x) / Math.SQRT2;
    const t = 1 / (1 + 0.3275911 * z);
    const y =
      1 -
      ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
        t *
        Math.exp(-z * z);
    return 0.5 * (1 + s * y);
  }

  const npdf = (x) => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);

  function bs(S, K, r, sig, T, put) {
    if (T <= 0 || sig <= 0) {
      const intr = put ? Math.max(K - S, 0) : Math.max(S - K, 0);
      return { price: intr, d1: 0, d2: 0, delta: put ? (S < K ? -1 : 0) : S > K ? 1 : 0, gamma: 0, vega: 0, theta: 0 };
    }
    const v = sig * Math.sqrt(T);
    const d1 = (Math.log(S / K) + (r + 0.5 * sig * sig) * T) / v;
    const d2 = d1 - v;
    const disc = Math.exp(-r * T);
    const price = put
      ? K * disc * ncdf(-d2) - S * ncdf(-d1)
      : S * ncdf(d1) - K * disc * ncdf(d2);
    const gamma = npdf(d1) / (S * v);
    const vega = S * npdf(d1) * Math.sqrt(T);
    const theta = put
      ? -(S * npdf(d1) * sig) / (2 * Math.sqrt(T)) + r * K * disc * ncdf(-d2)
      : -(S * npdf(d1) * sig) / (2 * Math.sqrt(T)) - r * K * disc * ncdf(d2);
    return { price, d1, d2, delta: put ? ncdf(d1) - 1 : ncdf(d1), gamma, vega, theta };
  }

  // ------------------------------------------------------------------ canvas

  function canvas(host, draw, height) {
    const cv = el("canvas", "viz-canvas");
    cv.style.height = `${height || 240}px`;
    host.appendChild(cv);
    const ctx = cv.getContext("2d");
    const api = { cv, ctx, w: 0, h: 0, redraw };

    function redraw() {
      const rect = cv.getBoundingClientRect();
      if (!rect.width) return;
      const dpr = window.devicePixelRatio || 1;
      api.w = rect.width;
      api.h = rect.height;
      cv.width = Math.round(rect.width * dpr);
      cv.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, api.w, api.h);
      draw(api);
    }

    if (window.ResizeObserver) new ResizeObserver(redraw).observe(cv);
    else window.addEventListener("resize", redraw);
    // Redraw on theme change: the colours come from CSS variables.
    new MutationObserver(redraw).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    requestAnimationFrame(redraw);
    return api;
  }

  // Linear scales plus axes, in a padded box. pad = [top, right, bottom, left].
  function frame(api, xdom, ydom, pad) {
    const p = pad || [12, 14, 26, 44];
    const x0 = p[3], x1 = api.w - p[1], y0 = api.h - p[2], y1 = p[0];
    const X = (v) => x0 + ((v - xdom[0]) / (xdom[1] - xdom[0])) * (x1 - x0);
    const Y = (v) => y0 + ((v - ydom[0]) / (ydom[1] - ydom[0])) * (y1 - y0);
    const ctx = api.ctx;
    return {
      X,
      Y,
      x0, x1, y0, y1,
      xdom, ydom,
      invX: (px) => xdom[0] + ((px - x0) / (x1 - x0)) * (xdom[1] - xdom[0]),
      invY: (py) => ydom[0] + ((py - y0) / (y1 - y0)) * (ydom[1] - ydom[0]),
      axes(opt) {
        const o = opt || {};
        const line = css("--line"), fg3 = css("--fg-3");
        ctx.font = "11px " + css("--sans");
        ctx.fillStyle = fg3;
        ctx.strokeStyle = line;
        ctx.lineWidth = 1;
        const xt = o.xticks || ticks(xdom), yt = o.yticks || ticks(ydom);
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        for (const v of xt) {
          const px = Math.round(X(v)) + 0.5;
          ctx.beginPath();
          ctx.moveTo(px, y1);
          ctx.lineTo(px, y0);
          ctx.stroke();
          ctx.fillText((o.xfmt || String)(v), px, y0 + 6);
        }
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        for (const v of yt) {
          const py = Math.round(Y(v)) + 0.5;
          ctx.beginPath();
          ctx.moveTo(x0, py);
          ctx.lineTo(x1, py);
          ctx.stroke();
          ctx.fillText((o.yfmt || String)(v), x0 - 7, py);
        }
      },
      path(pts, color, width) {
        ctx.strokeStyle = color;
        ctx.lineWidth = width || 1.6;
        ctx.lineJoin = "round";
        ctx.beginPath();
        pts.forEach((pt, i) => (i ? ctx.lineTo(X(pt[0]), Y(pt[1])) : ctx.moveTo(X(pt[0]), Y(pt[1]))));
        ctx.stroke();
      },
      dot(x, y, color, r) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(X(x), Y(y), r || 3, 0, 2 * Math.PI);
        ctx.fill();
      },
      vline(x, color, label) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(X(x), y1);
        ctx.lineTo(X(x), y0);
        ctx.stroke();
        ctx.setLineDash([]);
        if (label) {
          ctx.fillStyle = color;
          ctx.font = "11px " + css("--sans");
          ctx.textAlign = "left";
          ctx.textBaseline = "top";
          ctx.fillText(label, X(x) + 4, y1 + 2);
        }
      },
    };
  }

  function ticks(dom, n) {
    const count = n || 5;
    const span = dom[1] - dom[0];
    const step = Math.pow(10, Math.floor(Math.log10(span / count)));
    const err = (span / count) / step;
    const mult = err >= 7.5 ? 10 : err >= 3 ? 5 : err >= 1.5 ? 2 : 1;
    const s = step * mult;
    const out = [];
    for (let v = Math.ceil(dom[0] / s) * s; v <= dom[1] + 1e-9; v += s) out.push(Number(v.toFixed(10)));
    return out;
  }

  function legend(host, items) {
    const box = el("div", "viz-legend");
    for (const [label, color] of items) {
      const s = el("span", "viz-key");
      const i = el("i");
      i.style.background = color;
      s.appendChild(i);
      s.appendChild(el("span", null, label));
      box.appendChild(s);
    }
    // Keep the reading order: canvas, legend, then numbers and controls.
    const cv = host.querySelector(".viz-canvas");
    if (cv && cv.nextSibling) host.insertBefore(box, cv.nextSibling);
    else host.appendChild(box);
    return box;
  }

  // Controls: range sliders, selects and buttons. Returns a live state object.
  function controls(host, defs, onChange) {
    const box = el("div", "viz-controls");
    const state = {};
    for (const d of defs) {
      if (d.type === "button") {
        const b = el("button", "viz-btn", d.label);
        b.type = "button";
        b.addEventListener("click", () => d.onClick(state, onChange));
        box.appendChild(b);
        continue;
      }
      state[d.key] = d.value;
      const wrap = el("label", "viz-control");
      const head = el("span", "viz-control-head");
      head.appendChild(el("span", "viz-control-label", d.label));
      const out = el("span", "viz-control-value", d.fmt ? d.fmt(d.value) : String(d.value));
      head.appendChild(out);
      wrap.appendChild(head);
      let input;
      if (d.type === "select") {
        input = el("select", "viz-select");
        for (const [v, t] of d.options) {
          const o = el("option", null, t);
          o.value = v;
          input.appendChild(o);
        }
        input.value = String(d.value);
        out.remove();
        input.addEventListener("change", () => {
          state[d.key] = input.value;
          onChange(state);
        });
      } else {
        input = el("input", "viz-range");
        input.type = "range";
        input.min = d.min;
        input.max = d.max;
        input.step = d.step;
        input.value = d.value;
        input.addEventListener("input", () => {
          state[d.key] = Number(input.value);
          out.textContent = d.fmt ? d.fmt(state[d.key]) : input.value;
          onChange(state);
        });
      }
      input.setAttribute("aria-label", d.label);
      wrap.appendChild(input);
      box.appendChild(wrap);
    }
    host.appendChild(box);
    return state;
  }

  function readout(host) {
    const box = el("div", "viz-readout");
    host.appendChild(box);
    return function set(items) {
      box.textContent = "";
      for (const [label, value, color] of items) {
        const cell = el("div", "viz-stat");
        const v = el("b", null, value);
        if (color) v.style.color = color;
        cell.appendChild(v);
        cell.appendChild(el("span", null, label));
        box.appendChild(cell);
      }
    };
  }

  // Drag points around a canvas.
  function draggable(api, hitTest, onDrag) {
    let active = null;
    const pos = (e) => {
      const r = api.cv.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    };
    api.cv.style.touchAction = "none";
    api.cv.addEventListener("pointerdown", (e) => {
      const [x, y] = pos(e);
      active = hitTest(x, y);
      if (active != null) {
        api.cv.setPointerCapture(e.pointerId);
        api.cv.classList.add("grabbing");
        e.preventDefault();
      }
    });
    api.cv.addEventListener("pointermove", (e) => {
      const [x, y] = pos(e);
      if (active == null) {
        api.cv.classList.toggle("grabbable", hitTest(x, y) != null);
        return;
      }
      onDrag(active, x, y);
      api.redraw();
    });
    const stop = () => {
      active = null;
      api.cv.classList.remove("grabbing");
    };
    api.cv.addEventListener("pointerup", stop);
    api.cv.addEventListener("pointercancel", stop);
  }

  // ------------------------------------------------------------------ visuals

  const VIZ = {};

  // Conditional probability: a 20x20 population, coloured by A and B.
  VIZ["conditional-probability"] = function (host) {
    let show;
    const api = canvas(host, draw, 300);
    const set = readout(host);
    const s = controls(
      host,
      [
        { key: "pb", label: L("P(B)", "P(B)"), min: 0.05, max: 0.95, step: 0.01, value: 0.3, fmt: (v) => pct(v, 0) },
        { key: "pab", label: L("P(A | B)", "P(A | B)"), min: 0, max: 1, step: 0.01, value: 0.7, fmt: (v) => pct(v, 0) },
        { key: "panb", label: L("P(A | not B)", "P(A | non B)"), min: 0, max: 1, step: 0.01, value: 0.15, fmt: (v) => pct(v, 0) },
      ],
      () => api.redraw()
    );
    legend(host, [
      [L("A and B", "A et B"), css("--accent")],
      [L("B only", "B seul"), css("--info")],
      [L("A only", "A seul"), css("--warn")],
      [L("neither", "ni l'un ni l'autre"), css("--bg-3")],
    ]);

    function draw(a) {
      const n = 20, total = n * n;
      const nb = Math.round(s.pb * total);
      const nab = Math.round(s.pab * nb);
      const nanb = Math.round(s.panb * (total - nb));
      const size = Math.min(a.w / n, a.h / n) - 2;
      const ox = (a.w - n * (size + 2)) / 2;
      const cAB = css("--accent"), cB = css("--info"), cA = css("--warn"), cN = css("--bg-3");
      for (let i = 0; i < total; i++) {
        const inB = i < nb;
        const inA = inB ? i < nab : i - nb < nanb;
        a.ctx.fillStyle = inA && inB ? cAB : inB ? cB : inA ? cA : cN;
        const c = i % n, rw = Math.floor(i / n);
        a.ctx.fillRect(ox + c * (size + 2), rw * (size + 2) + 2, size, size);
      }
      const pa = (nab + nanb) / total;
      show = [
        [L("P(A)", "P(A)"), pct(pa), css("--warn")],
        [L("P(A ∩ B)", "P(A ∩ B)"), pct(nab / total), css("--accent")],
        [L("P(B | A)", "P(B | A)"), pa > 0 ? pct(nab / total / pa) : "—", css("--info")],
      ];
      set(show);
    }
  };

  // Bayes: base rate versus test accuracy, as counts out of 1000.
  VIZ["bayes-theorem"] = function (host) {
    const api = canvas(host, draw, 180);
    const set = readout(host);
    const s = controls(
      host,
      [
        { key: "prev", label: L("Prevalence", "Prévalence"), min: 0.001, max: 0.2, step: 0.001, value: 0.01, fmt: (v) => pct(v, 1) },
        { key: "sens", label: L("Sensitivity", "Sensibilité"), min: 0.5, max: 1, step: 0.005, value: 0.99, fmt: (v) => pct(v, 1) },
        { key: "spec", label: L("Specificity", "Spécificité"), min: 0.5, max: 1, step: 0.005, value: 0.95, fmt: (v) => pct(v, 1) },
      ],
      () => api.redraw()
    );
    legend(host, [
      [L("true positives", "vrais positifs"), css("--accent")],
      [L("false positives", "faux positifs"), css("--info")],
    ]);

    function draw(a) {
      const N = 1000;
      const sick = s.prev * N;
      const tp = sick * s.sens;
      const fp = (N - sick) * (1 - s.spec);
      const ppv = tp / (tp + fp || 1);

      const pad = 20, w = a.w - 2 * pad, h = 18;
      const bar = (y, value, color, label) => {
        a.ctx.fillStyle = css("--fg-2");
        a.ctx.font = "12px " + css("--sans");
        a.ctx.textAlign = "left";
        a.ctx.textBaseline = "alphabetic";
        a.ctx.fillText(`${label}: ${value.toFixed(1)}`, pad, y - 5);
        a.ctx.fillStyle = css("--bg-3");
        a.ctx.fillRect(pad, y, w, h);
        a.ctx.fillStyle = color;
        a.ctx.fillRect(pad, y, (w * value) / Math.max(tp + fp, 1), h);
      };
      bar(22, tp, css("--accent"), L("true positives", "vrais positifs"));
      bar(66, fp, css("--info"), L("false positives", "faux positifs"));

      // The same numbers as a stacked strip of all positive tests.
      const y = 116, sh = 34;
      const share = tp / (tp + fp || 1);
      a.ctx.fillStyle = css("--accent");
      a.ctx.fillRect(pad, y, w * share, sh);
      a.ctx.fillStyle = css("--info");
      a.ctx.fillRect(pad + w * share, y, w * (1 - share), sh);
      a.ctx.fillStyle = css("--fg-3");
      a.ctx.font = "11px " + css("--sans");
      a.ctx.textAlign = "center";
      a.ctx.textBaseline = "top";
      a.ctx.fillText(L("everyone who tested positive", "toutes les personnes testées positives"), a.w / 2, y + sh + 8);

      set([
        [L("P(sick | positive)", "P(malade | positif)"), pct(ppv), css("--accent")],
        [L("positives per 1000", "positifs pour 1000"), (tp + fp).toFixed(1)],
        [L("prior", "a priori"), pct(s.prev, 1), css("--fg-2")],
      ]);
    }
  };

  // Variance: drag the sample, watch the squared deviations.
  VIZ["variance"] = function (host) {
    const pts = [3, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 9];
    let f;
    const api = canvas(host, draw, 300);
    const set = readout(host);
    const s = controls(
      host,
      [
        { key: "n1", label: L("Denominator", "Dénominateur"), type: "select", value: "n1", options: [["n1", L("n − 1 (sample)", "n − 1 (échantillon)")], ["n", L("n (population)", "n (population)")]] },
      ],
      () => api.redraw()
    );
    function draw(a) {
      f = frame(a, [0, 12], [0, 1], [16, 16, 30, 20]);
      const mean = pts.reduce((x, y) => x + y, 0) / pts.length;
      const ss = pts.reduce((x, y) => x + (y - mean) ** 2, 0);
      const v = ss / (s.n1 === "n1" ? pts.length - 1 : pts.length);
      const yLine = 0.16;
      f.axes({ yticks: [] });
      // Each deviation drawn as a literal square, so its area is the squared term.
      for (const p of pts) {
        const side = Math.abs(f.X(p) - f.X(mean));
        if (side < 1) continue;
        a.ctx.fillStyle = css("--accent-2");
        a.ctx.strokeStyle = css("--accent");
        a.ctx.globalAlpha = 0.5;
        a.ctx.lineWidth = 1;
        a.ctx.fillRect(f.X(Math.min(p, mean)), f.Y(yLine) - side, side, side);
        a.ctx.strokeRect(f.X(Math.min(p, mean)) + 0.5, f.Y(yLine) - side + 0.5, side, side);
        a.ctx.globalAlpha = 1;
      }
      a.ctx.strokeStyle = css("--line");
      a.ctx.lineWidth = 1;
      a.ctx.beginPath();
      a.ctx.moveTo(f.x0, f.Y(yLine));
      a.ctx.lineTo(f.x1, f.Y(yLine));
      a.ctx.stroke();
      for (const p of pts) {
        a.ctx.strokeStyle = css("--fg-3");
        a.ctx.beginPath();
        a.ctx.moveTo(f.X(p), f.Y(yLine));
        a.ctx.lineTo(f.X(mean), f.Y(yLine));
        a.ctx.stroke();
        f.dot(p, yLine, css("--info"), 6);
      }
      f.vline(mean, css("--accent"), `x̄ = ${fmt(mean)}`);
      set([
        [L("variance", "variance"), fmt(v), css("--accent")],
        [L("std dev", "écart-type"), fmt(Math.sqrt(v))],
        [L("sum of squares", "somme des carrés"), fmt(ss), css("--fg-2")],
      ]);
    }

    draggable(
      api,
      (x, y) => {
        if (!f) return null;
        let best = null, bd = 14;
        pts.forEach((p, i) => {
          const d = Math.hypot(f.X(p) - x, f.Y(0.72) - y);
          if (d < bd) { bd = d; best = i; }
        });
        return best;
      },
      (i, x) => {
        pts[i] = Math.max(0.2, Math.min(11.8, f.invX(x)));
      }
    );
  };

  // Volatility: one price path, and the rolling estimate of a known sigma.
  VIZ["volatility"] = function (host) {
    const api = canvas(host, draw, 280);
    const set = readout(host);
    const s = controls(
      host,
      [
        { key: "sig", label: L("True annual σ", "σ annuelle vraie"), min: 0.05, max: 0.8, step: 0.01, value: 0.25, fmt: (v) => pct(v, 0) },
        { key: "win", label: L("Window (days)", "Fenêtre (jours)"), min: 5, max: 120, step: 1, value: 20 },
        { key: "seed", label: L("Seed", "Graine"), min: 1, max: 60, step: 1, value: 7 },
      ],
      () => api.redraw()
    );
    legend(host, [
      [L("rolling estimate", "estimation glissante"), css("--accent")],
      [L("true σ", "σ vraie"), css("--info")],
    ]);

    function draw(a) {
      const n = 500, dt = 1 / 252;
      const r = rng(s.seed * 1013);
      const rets = [];
      for (let i = 0; i < n; i++) rets.push(s.sig * Math.sqrt(dt) * gauss(r));
      const w = Math.round(s.win);
      const est = [];
      for (let i = w; i < n; i++) {
        let sum = 0;
        for (let k = i - w; k < i; k++) sum += rets[k] * rets[k];
        est.push([i, Math.sqrt((sum / w) / dt)]);
      }
      const vals = est.map((p) => p[1]);
      const hi = Math.max(s.sig * 1.6, ...vals) * 1.05;
      const f = frame(a, [0, n], [0, hi]);
      f.axes({ yfmt: (v) => pct(v, 0), xfmt: (v) => String(Math.round(v)) });
      a.ctx.strokeStyle = css("--info");
      a.ctx.lineWidth = 1.5;
      a.ctx.beginPath();
      a.ctx.moveTo(f.x0, f.Y(s.sig));
      a.ctx.lineTo(f.x1, f.Y(s.sig));
      a.ctx.stroke();
      f.path(est, css("--accent"));
      const mean = vals.reduce((x, y) => x + y, 0) / vals.length;
      const sd = Math.sqrt(vals.reduce((x, y) => x + (y - mean) ** 2, 0) / vals.length);
      set([
        [L("mean estimate", "estimation moyenne"), pct(mean), css("--accent")],
        [L("spread of estimates", "dispersion des estimations"), pct(sd)],
        [L("theoretical σ/√2n", "σ/√2n théorique"), pct(s.sig / Math.sqrt(2 * w)), css("--fg-2")],
      ]);
    }
  };

  // Brownian motion: paths against the √t envelope.
  VIZ["brownian-motion"] = function (host) {
    const api = canvas(host, draw, 300);
    const set = readout(host);
    const s = controls(
      host,
      [
        { key: "mu", label: L("Drift μ", "Dérive μ"), min: -1, max: 1, step: 0.05, value: 0, fmt: (v) => fmt(v) },
        { key: "sig", label: L("σ", "σ"), min: 0.1, max: 1.5, step: 0.05, value: 0.5, fmt: (v) => fmt(v) },
        { key: "paths", label: L("Paths", "Trajectoires"), min: 1, max: 60, step: 1, value: 12 },
        { key: "seed", label: L("Seed", "Graine"), min: 1, max: 60, step: 1, value: 3 },
      ],
      () => api.redraw()
    );
    legend(host, [
      [L("paths", "trajectoires"), css("--fg-3")],
      [L("mean μt", "moyenne μt"), css("--info")],
      [L("mean ± 2σ√t", "moyenne ± 2σ√t"), css("--accent")],
    ]);

    function draw(a) {
      const n = 250, T = 1, dt = T / n;
      const r = rng(s.seed * 7919);
      const paths = [];
      let endSum = 0, endSq = 0;
      for (let p = 0; p < s.paths; p++) {
        let x = 0;
        const pts = [[0, 0]];
        for (let i = 1; i <= n; i++) {
          x += s.mu * dt + s.sig * Math.sqrt(dt) * gauss(r);
          pts.push([i * dt, x]);
        }
        paths.push(pts);
        endSum += x;
        endSq += x * x;
      }
      const band = 2 * s.sig + Math.abs(s.mu);
      const f = frame(a, [0, T], [-band * 1.2, band * 1.2]);
      f.axes({ xfmt: (v) => fmt(v, 1), yfmt: (v) => fmt(v, 1) });
      a.ctx.globalAlpha = 0.55;
      for (const pts of paths) f.path(pts, css("--fg-3"), 1);
      a.ctx.globalAlpha = 1;
      const up = [], dn = [], mid = [];
      for (let i = 0; i <= n; i++) {
        const t = i * dt;
        mid.push([t, s.mu * t]);
        up.push([t, s.mu * t + 2 * s.sig * Math.sqrt(t)]);
        dn.push([t, s.mu * t - 2 * s.sig * Math.sqrt(t)]);
      }
      f.path(up, css("--accent"), 1.8);
      f.path(dn, css("--accent"), 1.8);
      f.path(mid, css("--info"), 1.5);
      const m = endSum / s.paths;
      set([
        [L("mean of W₁", "moyenne de W₁"), fmt(m), css("--info")],
        [L("sd of W₁", "écart-type de W₁"), fmt(Math.sqrt(Math.max(endSq / s.paths - m * m, 0))), css("--accent")],
        [L("theoretical sd", "écart-type théorique"), fmt(s.sig), css("--fg-2")],
      ]);
    }
  };

  // Martingales: a fair game stays flat in expectation; a biased one does not.
  VIZ["martingales"] = function (host) {
    const api = canvas(host, draw, 280);
    const set = readout(host);
    const s = controls(
      host,
      [
        { key: "p", label: L("P(up step)", "P(pas vers le haut)"), min: 0.3, max: 0.7, step: 0.005, value: 0.5, fmt: (v) => fmt(v, 3) },
        { key: "paths", label: L("Paths", "Trajectoires"), min: 5, max: 200, step: 5, value: 40 },
        { key: "seed", label: L("Seed", "Graine"), min: 1, max: 60, step: 1, value: 11 },
      ],
      () => api.redraw()
    );
    legend(host, [
      [L("paths", "trajectoires"), css("--fg-3")],
      [L("average across paths", "moyenne sur les trajectoires"), css("--accent")],
    ]);

    function draw(a) {
      const n = 120;
      const r = rng(s.seed * 3571);
      const paths = [];
      const avg = new Array(n + 1).fill(0);
      for (let p = 0; p < s.paths; p++) {
        let x = 0;
        const pts = [[0, 0]];
        for (let i = 1; i <= n; i++) {
          x += r() < s.p ? 1 : -1;
          pts.push([i, x]);
          avg[i] += x;
        }
        paths.push(pts);
      }
      const span = Math.max(20, 3 * Math.sqrt(n) + Math.abs(2 * s.p - 1) * n);
      const f = frame(a, [0, n], [-span, span]);
      f.axes({ xfmt: (v) => String(Math.round(v)) });
      a.ctx.globalAlpha = 0.4;
      for (const pts of paths) f.path(pts, css("--fg-3"), 1);
      a.ctx.globalAlpha = 1;
      f.path(avg.map((v, i) => [i, v / s.paths]), css("--accent"), 2.2);
      const drift = (2 * s.p - 1) * n;
      set([
        [L("mean of S₁₂₀", "moyenne de S₁₂₀"), fmt(avg[n] / s.paths, 2), css("--accent")],
        [L("E[Sₙ] = (2p−1)n", "E[Sₙ] = (2p−1)n"), fmt(drift, 2), css("--info")],
        [L("martingale?", "martingale ?"), s.p === 0.5 ? L("yes", "oui") : L("no", "non"), s.p === 0.5 ? css("--ok") : css("--warn")],
      ]);
    }
  };

  // Itô: the -½σ² correction separates the mean from the median of a GBM.
  VIZ["ito-lemma"] = function (host) {
    const api = canvas(host, draw, 290);
    const set = readout(host);
    const s = controls(
      host,
      [
        { key: "mu", label: L("Drift μ", "Dérive μ"), min: -0.2, max: 0.4, step: 0.01, value: 0.1, fmt: (v) => pct(v, 0) },
        { key: "sig", label: L("σ", "σ"), min: 0.05, max: 0.9, step: 0.01, value: 0.4, fmt: (v) => pct(v, 0) },
      ],
      () => api.redraw()
    );
    legend(host, [
      [L("mean: S₀·exp(μt)", "moyenne : S₀·exp(μt)"), css("--info")],
      [L("median: S₀·exp((μ−σ²/2)t)", "médiane : S₀·exp((μ−σ²/2)t)"), css("--accent")],
    ]);

    function draw(a) {
      const T = 5, n = 200;
      const mean = [], median = [];
      for (let i = 0; i <= n; i++) {
        const t = (i * T) / n;
        mean.push([t, 100 * Math.exp(s.mu * t)]);
        median.push([t, 100 * Math.exp((s.mu - 0.5 * s.sig * s.sig) * t)]);
      }
      const r = rng(4211);
      const paths = [];
      for (let p = 0; p < 20; p++) {
        let x = 100;
        const pts = [[0, 100]];
        const dt = T / n;
        for (let i = 1; i <= n; i++) {
          x *= Math.exp((s.mu - 0.5 * s.sig * s.sig) * dt + s.sig * Math.sqrt(dt) * gauss(r));
          pts.push([i * dt, x]);
        }
        paths.push(pts);
      }
      const top = Math.max(200, 100 * Math.exp((s.mu + s.sig) * T));
      const f = frame(a, [0, T], [0, Math.min(top, 600)]);
      f.axes({ xfmt: (v) => fmt(v, 0), yfmt: (v) => String(Math.round(v)) });
      a.ctx.globalAlpha = 0.35;
      for (const pts of paths) f.path(pts, css("--fg-3"), 1);
      a.ctx.globalAlpha = 1;
      f.path(mean, css("--info"), 2);
      f.path(median, css("--accent"), 2);
      set([
        [L("log-drift μ − σ²/2", "dérive log μ − σ²/2"), pct(s.mu - 0.5 * s.sig * s.sig, 1), css("--accent")],
        [L("Itô correction", "correction d'Itô"), pct(-0.5 * s.sig * s.sig, 1)],
        [L("median S₅ / mean S₅", "médiane S₅ / moyenne S₅"), fmt(Math.exp(-0.5 * s.sig * s.sig * 5), 2), css("--fg-2")],
      ]);
    }
  };

  // Black-Scholes: price curve against the payoff, as time and vol change.
  VIZ["black-scholes"] = function (host) {
    const api = canvas(host, draw, 290);
    const set = readout(host);
    const s = controls(
      host,
      [
        { key: "kind", label: L("Option", "Option"), type: "select", value: "call", options: [["call", L("Call", "Call")], ["put", L("Put", "Put")]] },
        { key: "sig", label: L("σ", "σ"), min: 0.05, max: 0.8, step: 0.01, value: 0.2, fmt: (v) => pct(v, 0) },
        { key: "T", label: L("Time to expiry (y)", "Maturité (années)"), min: 0.01, max: 2, step: 0.01, value: 1, fmt: (v) => fmt(v) },
        { key: "r", label: L("Rate r", "Taux r"), min: -0.02, max: 0.1, step: 0.005, value: 0.03, fmt: (v) => pct(v, 1) },
      ],
      () => api.redraw()
    );
    legend(host, [
      [L("price now", "prix aujourd'hui"), css("--accent")],
      [L("payoff at expiry", "payoff à maturité"), css("--fg-3")],
    ]);

    function draw(a) {
      const K = 100, put = s.kind === "put";
      const xs = [];
      for (let S = 40; S <= 170; S += 1) xs.push(S);
      const price = xs.map((S) => [S, bs(S, K, s.r, s.sig, s.T, put).price]);
      const payoff = xs.map((S) => [S, put ? Math.max(K - S, 0) : Math.max(S - K, 0)]);
      const hi = Math.max(...price.map((p) => p[1]), ...payoff.map((p) => p[1])) * 1.1;
      const f = frame(a, [40, 170], [0, hi]);
      f.axes({ xfmt: (v) => String(Math.round(v)), yfmt: (v) => fmt(v, 0) });
      f.path(payoff, css("--fg-3"), 1.5);
      f.path(price, css("--accent"), 2.2);
      f.vline(K, css("--info"), "K = 100");
      const atm = bs(100, K, s.r, s.sig, s.T, put);
      set([
        [L("price at S = 100", "prix en S = 100"), fmt(atm.price), css("--accent")],
        [L("time value", "valeur temps"), fmt(atm.price - (put ? Math.max(K - 100, 0) : Math.max(100 - K, 0)))],
        ["d₁", fmt(atm.d1), css("--fg-2")],
      ]);
    }
  };

  // Greeks: one curve at a time, against spot, as expiry approaches.
  VIZ["greeks"] = function (host) {
    const api = canvas(host, draw, 290);
    const set = readout(host);
    const s = controls(
      host,
      [
        {
          key: "greek",
          label: L("Greek", "Grecque"),
          type: "select",
          value: "delta",
          options: [["delta", "Delta"], ["gamma", "Gamma"], ["vega", "Vega"], ["theta", "Theta"]],
        },
        { key: "kind", label: L("Option", "Option"), type: "select", value: "call", options: [["call", L("Call", "Call")], ["put", L("Put", "Put")]] },
        { key: "T", label: L("Time to expiry (y)", "Maturité (années)"), min: 0.02, max: 2, step: 0.01, value: 0.5, fmt: (v) => fmt(v) },
        { key: "sig", label: L("σ", "σ"), min: 0.05, max: 0.8, step: 0.01, value: 0.25, fmt: (v) => pct(v, 0) },
      ],
      () => api.redraw()
    );

    function draw(a) {
      const K = 100, put = s.kind === "put", r = 0.02;
      const pick = (g) => (s.greek === "theta" ? g.theta / 365 : s.greek === "vega" ? g.vega / 100 : g[s.greek]);
      const pts = [];
      for (let S = 50; S <= 160; S += 0.5) pts.push([S, pick(bs(S, K, r, s.sig, s.T, put))]);
      const vals = pts.map((p) => p[1]);
      let lo = Math.min(0, ...vals), hi = Math.max(0, ...vals);
      const pad = (hi - lo) * 0.12 || 0.1;
      const f = frame(a, [50, 160], [lo - pad, hi + pad]);
      f.axes({ xfmt: (v) => String(Math.round(v)), yfmt: (v) => fmt(v, Math.abs(hi) < 1 ? 2 : 1) });
      a.ctx.strokeStyle = css("--line");
      a.ctx.beginPath();
      a.ctx.moveTo(f.x0, f.Y(0));
      a.ctx.lineTo(f.x1, f.Y(0));
      a.ctx.stroke();
      f.path(pts, css("--accent"), 2.2);
      f.vline(K, css("--info"), "K = 100");
      const g = bs(100, K, r, s.sig, s.T, put);
      set([
        [L("at S = 100", "en S = 100"), fmt(pick(g), 3), css("--accent")],
        [L("at S = 120", "en S = 120"), fmt(pick(bs(120, K, r, s.sig, s.T, put)), 3), css("--fg-2")],
        [L("price", "prix"), fmt(g.price)],
      ]);
    }
  };

  // VaR: where the cut falls, and how fat tails move it.
  VIZ["value-at-risk"] = function (host) {
    const api = canvas(host, draw, 280);
    const set = readout(host);
    const s = controls(
      host,
      [
        { key: "conf", label: L("Confidence", "Niveau de confiance"), min: 0.9, max: 0.995, step: 0.005, value: 0.99, fmt: (v) => pct(v, 1) },
        { key: "sig", label: L("Daily σ", "σ quotidienne"), min: 0.005, max: 0.05, step: 0.001, value: 0.015, fmt: (v) => pct(v, 1) },
        { key: "df", label: L("Tail heaviness (t d.f.)", "Épaisseur des queues (ddl t)"), min: 3, max: 40, step: 1, value: 40 },
      ],
      () => api.redraw()
    );
    legend(host, [
      [L("loss distribution", "distribution des pertes"), css("--info")],
      [L("VaR cut", "seuil de VaR"), css("--accent")],
      [L("beyond VaR (ES)", "au-delà de la VaR (ES)"), css("--warn")],
    ]);

    function draw(a) {
      const N = 10000, notional = 1e6;
      const r = rng(9091);
      const df = Math.round(s.df);
      const sample = [];
      for (let i = 0; i < N; i++) {
        // Student-t via a normal scaled by a chi-square-ish mixture; df large ⇒ normal.
        let chi = 0;
        for (let k = 0; k < df; k++) chi += gauss(r) ** 2;
        const t = gauss(r) / Math.sqrt(chi / df);
        sample.push(notional * s.sig * t * Math.sqrt((df - 2) / df));
      }
      sample.sort((x, y) => x - y);
      const idx = Math.floor((1 - s.conf) * N);
      const varq = -sample[idx];
      const es = -sample.slice(0, Math.max(idx, 1)).reduce((x, y) => x + y, 0) / Math.max(idx, 1);

      const lim = notional * s.sig * 5;
      const bins = 70, counts = new Array(bins).fill(0);
      for (const v of sample) {
        const b = Math.floor(((v + lim) / (2 * lim)) * bins);
        if (b >= 0 && b < bins) counts[b]++;
      }
      const f = frame(a, [-lim, lim], [0, Math.max(...counts) * 1.08]);
      f.axes({ xfmt: (v) => `${(v / 1000).toFixed(0)}k`, yticks: [] });
      const bw = (f.x1 - f.x0) / bins;
      for (let b = 0; b < bins; b++) {
        const x = -lim + ((b + 0.5) * 2 * lim) / bins;
        a.ctx.fillStyle = x < -varq ? css("--warn") : css("--info");
        a.ctx.fillRect(f.X(-lim) + b * bw, f.Y(counts[b]), bw - 1, f.Y(0) - f.Y(counts[b]));
      }
      f.vline(-varq, css("--accent"), `VaR ${pct(s.conf, 1)}`);
      set([
        [`VaR ${pct(s.conf, 1)}`, `${(varq / 1000).toFixed(1)}k`, css("--accent")],
        ["Expected shortfall", `${(es / 1000).toFixed(1)}k`, css("--warn")],
        ["ES / VaR", fmt(es / varq), css("--fg-2")],
      ]);
    }
  };

  // OLS: drag a point and watch the fit, the residuals and R² move.
  VIZ["linear-regression"] = function (host) {
    const r0 = rng(1234);
    const pts = [];
    for (let i = 0; i < 18; i++) {
      const x = 1 + (i * 8) / 18 + 0.3 * gauss(r0);
      pts.push([x, 2 + 0.8 * x + 1.2 * gauss(r0)]);
    }
    let f;
    const api = canvas(host, draw, 290);
    const set = readout(host);
    const s = controls(
      host,
      [{ key: "resid", label: L("Residuals", "Résidus"), type: "select", value: "on", options: [["on", L("shown", "affichés")], ["off", L("hidden", "masqués")]] }],
      () => api.redraw()
    );

    function fit() {
      const n = pts.length;
      const mx = pts.reduce((a, p) => a + p[0], 0) / n;
      const my = pts.reduce((a, p) => a + p[1], 0) / n;
      let sxy = 0, sxx = 0, syy = 0;
      for (const [x, y] of pts) {
        sxy += (x - mx) * (y - my);
        sxx += (x - mx) ** 2;
        syy += (y - my) ** 2;
      }
      const b1 = sxy / (sxx || 1e-9);
      const b0 = my - b1 * mx;
      let sse = 0;
      for (const [x, y] of pts) sse += (y - (b0 + b1 * x)) ** 2;
      return { b0, b1, r2: 1 - sse / (syy || 1e-9), sse };
    }

    function draw(a) {
      f = frame(a, [0, 10], [-4, 16]);
      f.axes({ xfmt: (v) => fmt(v, 0), yfmt: (v) => fmt(v, 0) });
      const { b0, b1, r2, sse } = fit();
      if (s.resid === "on") {
        a.ctx.strokeStyle = css("--warn");
        a.ctx.lineWidth = 1;
        for (const [x, y] of pts) {
          a.ctx.beginPath();
          a.ctx.moveTo(f.X(x), f.Y(y));
          a.ctx.lineTo(f.X(x), f.Y(b0 + b1 * x));
          a.ctx.stroke();
        }
      }
      f.path([[0, b0], [10, b0 + 10 * b1]], css("--accent"), 2.2);
      for (const [x, y] of pts) f.dot(x, y, css("--info"), 5);
      set([
        ["β₀", fmt(b0), css("--accent")],
        ["β₁", fmt(b1), css("--accent")],
        ["R²", fmt(r2, 3), css("--info")],
        [L("residual sum of squares", "somme des carrés résiduels"), fmt(sse, 1), css("--fg-2")],
      ]);
    }

    draggable(
      api,
      (x, y) => {
        if (!f) return null;
        let best = null, bd = 14;
        pts.forEach((p, i) => {
          const d = Math.hypot(f.X(p[0]) - x, f.Y(p[1]) - y);
          if (d < bd) { bd = d; best = i; }
        });
        return best;
      },
      (i, x, y) => {
        pts[i] = [Math.max(0.1, Math.min(9.9, f.invX(x))), Math.max(-3.9, Math.min(15.9, f.invY(y)))];
      }
    );
  };

  // Kalman: the trade-off between trusting the model and trusting the data.
  VIZ["kalman-filter"] = function (host) {
    const api = canvas(host, draw, 290);
    const set = readout(host);
    const s = controls(
      host,
      [
        { key: "q", label: L("Process noise Q", "Bruit de processus Q"), min: 0.001, max: 1, step: 0.001, value: 0.05, fmt: (v) => fmt(v, 3) },
        { key: "rr", label: L("Measurement noise R", "Bruit de mesure R"), min: 0.01, max: 4, step: 0.01, value: 1, fmt: (v) => fmt(v) },
        { key: "seed", label: L("Seed", "Graine"), min: 1, max: 60, step: 1, value: 5 },
      ],
      () => api.redraw()
    );
    legend(host, [
      [L("true state", "état vrai"), css("--ok")],
      [L("measurements", "mesures"), css("--fg-3")],
      [L("filtered estimate", "estimation filtrée"), css("--accent")],
    ]);

    function draw(a) {
      const n = 120;
      const r = rng(s.seed * 6421);
      const qTrue = 0.05, rTrue = 1;
      const truth = [], obs = [];
      let x = 0;
      for (let i = 0; i < n; i++) {
        x += Math.sqrt(qTrue) * gauss(r);
        truth.push([i, x]);
        obs.push([i, x + Math.sqrt(rTrue) * gauss(r)]);
      }
      // Scalar Kalman filter with the user's assumed Q and R.
      let xh = obs[0][1], P = s.rr;
      const est = [], gains = [];
      for (let i = 0; i < n; i++) {
        P += s.q; // predict
        const K = P / (P + s.rr);
        xh += K * (obs[i][1] - xh);
        P *= 1 - K;
        est.push([i, xh]);
        gains.push(K);
      }
      const all = truth.concat(obs, est).map((p) => p[1]);
      const f = frame(a, [0, n - 1], [Math.min(...all) - 0.3, Math.max(...all) + 0.3]);
      f.axes({ xfmt: (v) => String(Math.round(v)), yfmt: (v) => fmt(v, 1) });
      for (const [i, y] of obs) f.dot(i, y, css("--fg-3"), 2);
      f.path(truth, css("--ok"), 2);
      f.path(est, css("--accent"), 2);
      const rmse = Math.sqrt(est.reduce((acc, p, i) => acc + (p[1] - truth[i][1]) ** 2, 0) / n);
      const raw = Math.sqrt(obs.reduce((acc, p, i) => acc + (p[1] - truth[i][1]) ** 2, 0) / n);
      set([
        [L("filter RMSE", "RMSE du filtre"), fmt(rmse, 3), css("--accent")],
        [L("raw measurement RMSE", "RMSE des mesures brutes"), fmt(raw, 3), css("--fg-2")],
        [L("steady-state gain K", "gain K en régime"), fmt(gains[n - 1], 3), css("--info")],
      ]);
    }
  };

  // ------------------------------------------------------------------ mount

  document.querySelectorAll(".viz[data-viz]").forEach((figure) => {
    const id = figure.dataset.viz;
    const build = VIZ[id];
    const host = figure.querySelector(".viz-body");
    if (!build || !host) return;
    try {
      build(host);
      figure.classList.add("viz-ready");
    } catch (e) {
      console.error(`viz ${id}:`, e);
    }
  });
})();
