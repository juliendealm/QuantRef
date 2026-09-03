---
title: Brownian Motion
subject: stochastic
summary: The continuous-time limit of a random walk, with Gaussian independent increments, continuous but nowhere smooth paths, and a quadratic variation equal to elapsed time. The noise that drives every continuous price model, and the reason volatility scales with the square root of time.
difficulty: 3
interview: 4
tags: [stochastic, brownian-motion, wiener-process, random-walk, quadratic-variation, gbm]
prerequisites: [martingales]
related: [ito-lemma, black-scholes]
---

## Intuition

Take a coin-flip random walk and speed it up: $n$ steps per unit of time, each of size $1/\sqrt{n}$ — the only scaling that keeps the variance at $t$ whatever $n$ is, since after time $t$ there are $nt$ steps of variance $1/n$. The limit is **Brownian motion**: a continuous path that is, at every scale, a sum of tiny independent shocks. Zoom in and it looks like the whole, with no tangent line anywhere. Over a small interval $h$ it moves by about $\sqrt{h}$, far more than the $h$ of a smooth curve — which is why $(dW)^2$ is not negligible and why [[ito-lemma|Itô's calculus]] replaces ordinary calculus.

::: viz brownian-motion Paths inside the √t envelope
Spread grows like √t, not t: the envelope is a parabola on its side. Add paths and about 95 % of them stay inside it.
:::

## Key Formulas

| Name | Formula |
|---|---|
| Increments | $W_t - W_s \sim N(0, t - s)$, independent over disjoint intervals |
| Covariance | $\mathrm{Cov}(W_s, W_t) = \min(s, t)$ |
| Scaled random walk | $S_{\lfloor nt \rfloor} / \sqrt{n} \xrightarrow{d} W_t$ |
| Quadratic variation | $\sum (\Delta W)^2 \to t$, i.e. $(dW_t)^2 = dt$ |
| Scaling | $c^{-1/2} W_{ct}$ is a Brownian motion |
| Reflection principle | $\mathbb{P}(\max_{s \le t} W_s \ge a) = 2\big(1 - \Phi(a / \sqrt{t})\big)$ |
| Brownian bridge | $W_s \mid W_t = x \sim N\big(\tfrac{s}{t}x,\ \tfrac{s(t - s)}{t}\big)$, $s \le t$ |
| Geometric Brownian motion | $S_t = S_0 e^{(\mu - \sigma^2/2)t + \sigma W_t}$, $\mathbb{E}[S_t] = S_0 e^{\mu t}$ |

## Common Mistakes

::: pitfall Scaling with $t$ instead of $\sqrt{t}$
Volatility over one month is $\sigma_{\text{annual}} \times \sqrt{1/12}$, not $\sigma_{\text{annual}} / 12$. In code, simulate increments with `rng.normal(0, np.sqrt(dt))`, not `rng.normal(0, dt)`: numpy's second argument is the standard deviation.
:::

::: pitfall Using the ordinary chain rule on $f(W_t)$
$d(W_t^2) \ne 2W_t\,dW_t$; the missing $dt$ is the quadratic variation. Applied to geometric Brownian motion, forgetting it gives $\mathbb{E}[\log S_T] = \log S_0 + \mu T$ instead of $\log S_0 + (\mu - \sigma^2/2)T$.
:::

::: pitfall Confusing the mean growth rate with the typical growth rate
$\mathbb{E}[S_t] = S_0 e^{\mu t}$, but a typical path grows like $S_0 e^{(\mu - \sigma^2/2)t}$. With $\sigma = 40\,\%$ the gap is $8\,\%$ per year, and long-horizon expected values are dominated by rare, very large outcomes.
:::

::: pitfall Independent increments does not mean independent values
$W_s$ and $W_t$ are correlated, with $\mathrm{Corr} = \sqrt{s/t}$; only increments over disjoint intervals are independent. Conditioning on $W_1 = x$ changes the law of $W_{1/2}$ to $N(x/2, 1/4)$.
:::

## 30-Second Revision

Brownian motion: $W_0 = 0$, independent stationary Gaussian increments $W_t - W_s \sim N(0, t - s)$, continuous paths. It is the $1/\sqrt{n}$-scaled limit of any finite-variance random walk (Donsker), with $\mathrm{Cov}(W_s, W_t) = \min(s, t)$. Paths are nowhere differentiable and of infinite variation, but their quadratic variation is $[W]_t = t$: $(dW)^2 = dt$, the root of Itô calculus. Scaling $c^{-1/2} W_{ct}$, reflection $\mathbb{P}(\max_{s \le t} W_s \ge a) = 2\,\mathbb{P}(W_t \ge a)$, Markov property, and $W_t$, $W_t^2 - t$, $e^{\sigma W_t - \sigma^2 t/2}$ are martingales. Geometric Brownian motion $S_t = S_0 e^{(\mu - \sigma^2/2)t + \sigma W_t}$: log-normal prices, mean $S_0 e^{\mu t}$, typical growth rate $\mu - \sigma^2/2$.

## Mathematical Formulation

::: formula Definition
A standard Brownian motion $(W_t)_{t \ge 0}$ is a process such that
1. $W_0 = 0$;
2. increments over disjoint intervals are independent: for $0 \le t_0 < t_1 < \cdots < t_n$, the variables $W_{t_i} - W_{t_{i-1}}$ are independent;
3. increments are Gaussian and stationary: $W_t - W_s \sim N(0,\, t - s)$ for $s \le t$;
4. the paths $t \mapsto W_t$ are continuous almost surely.
:::

Hence $\mathbb{E}[W_t] = 0$, $\mathrm{Var}(W_t) = t$, and

::: formula Covariance
$$
\mathrm{Cov}(W_s, W_t) = \min(s, t), \qquad \mathrm{Corr}(W_s, W_t) = \sqrt{s/t} \quad \text{for } s \le t.
$$
:::

Equivalently: the centred Gaussian process with continuous paths and covariance $\min(s, t)$. With $\xi_i$ i.i.d. of mean $0$ and variance $1$ and $S_k = \sum_{i \le k} \xi_i$:

::: formula Donsker's invariance principle
$$
W^{(n)}_t = \frac{S_{\lfloor nt \rfloor}}{\sqrt{n}}, \qquad W^{(n)} \;\underset{n \to \infty}{\Longrightarrow}\; W \ \text{ in } D[0,T]
$$
Convergence is in distribution on the path space $D[0,T]$ with the Skorokhod topology: the law of the whole path converges, not only each marginal. The limit does not depend on the law of $\xi$, hence "invariance".
:::

- *Scaling and symmetries.* For $c > 0$, $(c^{-1/2} W_{ct})_{t \ge 0}$ is a Brownian motion. So are $-W_t$ (reflection), $W_{t+s} - W_s$ (fresh start at $s$), and $t\,W_{1/t}$ for $t > 0$, set to $0$ at $t = 0$ (time inversion; continuity at the origin is the non-trivial part).
- *Quadratic variation*, over partitions $0 = t_0 < \cdots < t_n = t$ with mesh $\max_i (t_i - t_{i-1}) \to 0$:

::: formula Quadratic variation
$$
[W]_t = \lim \sum_{i} \big(W_{t_i} - W_{t_{i-1}}\big)^2 = t \quad (\text{in } L^2), \qquad \text{whereas} \qquad \sum_{i} \big\lvert W_{t_i} - W_{t_{i-1}} \big\rvert \to \infty.
$$
In differential shorthand: $(dW_t)^2 = dt$, $dW_t\,dt = 0$, $(dt)^2 = 0$.
:::

- *Regularity.* Paths are Hölder continuous of every order $< 1/2$, nowhere differentiable, of infinite variation on every interval.
- *Reflection principle.* With $M_t = \max_{s \le t} W_s$ and $a > 0$, $\mathbb{P}(M_t \ge a) = 2\,\mathbb{P}(W_t \ge a) = 2\big(1 - \Phi(a/\sqrt{t})\big)$. The first passage time $\tau_a = \inf\{t : W_t = a\}$ is finite a.s. but $\mathbb{E}[\tau_a] = \infty$.
- *Markov and martingale.* $W$ is a (strong) Markov process, and $W_t$, $W_t^2 - t$, $\exp(\sigma W_t - \sigma^2 t/2)$ are [[martingales]]. Lévy's characterisation: any continuous local martingale $M$ with $M_0 = 0$ and $[M]_t = t$ is a Brownian motion.

::: formula Geometric Brownian motion
$$
S_t = S_0 \exp\!\Big(\big(\mu - \tfrac12 \sigma^2\big)t + \sigma W_t\Big), \qquad dS_t = \mu S_t\,dt + \sigma S_t\,dW_t,
$$
so $\log(S_t / S_0) \sim N\big((\mu - \tfrac12\sigma^2)t,\ \sigma^2 t\big)$, $\mathbb{E}[S_t] = S_0 e^{\mu t}$, and the median is $S_0 e^{(\mu - \sigma^2/2)t}$.
:::

## Derivation

**Why $\sqrt{n}$.** $W^{(n)}_t$ has variance $\lfloor nt \rfloor / n \to t$; scaling by $n^{-\alpha}$ kills the variance if $\alpha > 1/2$ and lets it diverge if $\alpha < 1/2$. The central limit theorem gives $W^{(n)}_t \to N(0, t)$ for each $t$, and increments over disjoint intervals are sums over disjoint blocks of $\xi$'s, hence independent. Donsker adds tightness, upgrading the finite-dimensional laws to the path law.

**Covariance.** For $s \le t$, $\mathrm{Cov}(W_s, W_t) = \mathrm{Cov}\big(W_s,\, W_s + (W_t - W_s)\big) = \mathrm{Var}(W_s) = s$.

**Quadratic variation.** With $\Delta_i = W_{t_i} - W_{t_{i-1}} \sim N(0, \delta_i)$ independent, $\mathrm{Var}(\Delta_i^2) = 3\delta_i^2 - \delta_i^2 = 2\delta_i^2$, so for $Q_n = \sum_i \Delta_i^2$,
$$
\mathbb{E}[Q_n] = \sum_i \delta_i = t, \qquad \mathrm{Var}(Q_n) = 2\sum_i \delta_i^2 \le 2\,\max_i \delta_i \cdot t \xrightarrow[\text{mesh} \to 0]{} 0,
$$
i.e. $Q_n \to t$ in $L^2$. For the total variation, $\sum_i \lvert \Delta_i \rvert \ge \sum_i \Delta_i^2 / \max_i \lvert \Delta_i \rvert$, whose numerator tends to $t > 0$ and denominator to $0$: infinite. A $C^1$ function is the opposite — finite variation, zero quadratic variation.

**Non-differentiability, heuristically.** $(W_{t+h} - W_t)/h \sim N(0, 1/h)$, whose spread $h^{-1/2}$ blows up as $h \to 0$. The statement for *all* $t$ simultaneously is Paley–Wiener–Zygmund.

**Reflection principle.** $\{M_t \ge a\} = \{\tau_a \le t\}$, and by the strong Markov property the path after $\tau_a$ is a fresh Brownian motion started at $a$, so $\mathbb{P}(\tau_a \le t,\, W_t \ge a) = \mathbb{P}(\tau_a \le t,\, W_t \le a)$. Since $\{W_t \ge a\} \subseteq \{\tau_a \le t\}$, adding gives $\mathbb{P}(\tau_a \le t) = 2\,\mathbb{P}(W_t \ge a)$, hence $\mathbb{P}(\tau_a < \infty) = 1$. Differentiating in $t$ gives the density $\dfrac{a}{\sqrt{2\pi t^3}}\,e^{-a^2/(2t)}$, whose $t^{-3/2}$ tail makes $\mathbb{E}[\tau_a] = \infty$.

**Geometric Brownian motion.** [[ito-lemma|Itô's formula]] on $\log S_t$ with $(dS_t)^2 = \sigma^2 S_t^2\,dt$:
$$
d\log S_t = \frac{dS_t}{S_t} - \frac{1}{2}\,\frac{(dS_t)^2}{S_t^2} = \big(\mu - \tfrac12 \sigma^2\big)\,dt + \sigma\,dW_t,
$$
and integrating gives the closed form. The mean follows from the exponential martingale: $\mathbb{E}[S_t] = S_0 e^{\mu t}\,\mathbb{E}\big[e^{\sigma W_t - \sigma^2 t/2}\big] = S_0 e^{\mu t}$.

## Assumptions & Edge Cases

- **Existence is a theorem.** Wiener (1923); standard constructions use Kolmogorov's extension and continuity theorems, or the Lévy–Ciesielski series.
- **Gaussian increments mean thin tails and no jumps.** Real returns have fat tails, jumps and volatility clustering; Brownian motion is the building block, not the model. Extensions: stochastic volatility, jump-diffusions, Lévy processes.
- **Continuous but not differentiable.** $dW_t / dt$ does not exist as a function; "white noise" is only a generalised process, and any calculus with $dW$ must be Itô's ([[ito-lemma]]) or Stratonovich's.
- **Quadratic variation is a limit along partitions.** In $L^2$ for any mesh $\to 0$, almost surely along refining (e.g. dyadic) partitions; over *all* partitions the supremum of $\sum \Delta_i^2$ is infinite.
- **The model breaks at the tick scale.** Realised variance from ultra-high-frequency returns *increases* with the sampling frequency because of microstructure noise (bid–ask bounce, price discreteness) — the opposite of $[W]_t = t$.
- **Geometric Brownian motion: right sign, wrong tail.** Prices stay positive and log-returns are additive, but constant $\sigma$ and i.i.d. Gaussian log-returns are empirically false. The drift $\mu$ governs $\mathbb{E}[S_t]$ while a typical path grows at rate $\mu - \sigma^2/2$: if $\mu < \sigma^2/2$ then $S_t \to 0$ almost surely, and when $0 < \mu < \sigma^2/2$ this happens even though $\mathbb{E}[S_t] \to \infty$.
- **Several dimensions.** Correlated Brownian motions are built as $W = LZ$ with $L$ a Cholesky factor of the correlation matrix and $Z$ independent Brownian motions; then $d\langle W^i, W^j \rangle_t = \rho_{ij}\,dt$.

## Worked Example

The code simulates $20\,000$ paths on $[0, 2]$ and checks $\mathrm{Var}(W_t) = t$, $\mathrm{Cov}(W_{0.5}, W_{1.5}) = 0.5$ and $\mathbb{E}[e^{W_1 - 1/2}] = 1$. It then takes a *single* path on $[0, 1]$ made of $10\,000$ fine increments and computes, on grids of $m = 10$, $100$, $1\,000$ and $10\,000$ steps, the total variation and the quadratic variation. Coarse-grid increments are sums of fine ones, so all four rows describe the same path.

```python
import numpy as np

rng = np.random.default_rng(11)
n_paths, n_steps, T = 20_000, 400, 2.0
dt = T / n_steps
dW = rng.normal(0.0, np.sqrt(dt), size=(n_paths, n_steps))   # increments ~ N(0, dt)
W = np.hstack([np.zeros((n_paths, 1)), dW.cumsum(axis=1)])   # W_0 = 0

# 1. Gaussian marginals: E[W_t] = 0, Var(W_t) = t, Cov(W_s, W_t) = min(s, t)
for ti in (0.5, 1.0, 2.0):
    i = round(ti / dt)
    print(f"t={ti}: mean={W[:, i].mean():+.4f}  var={W[:, i].var():.4f}  (exact {ti})")
i_s, i_t = round(0.5 / dt), round(1.5 / dt)
print(f"Cov(W_0.5, W_1.5) = {np.mean(W[:, i_s] * W[:, i_t]):.4f}  (exact 0.5)")
print(f"E[exp(W_1 - 1/2)] = {np.exp(W[:, round(1 / dt)] - 0.5).mean():.4f}  (exact 1)")

# 2. Quadratic variation on ONE path over [0, 1], refining the grid
fine = rng.normal(0.0, np.sqrt(1 / 10_000), size=10_000)     # 10 000 fine increments
for m in (10, 100, 1_000, 10_000):
    inc = fine.reshape(m, -1).sum(axis=1)                    # same path on m steps
    print(f"m={m:>6}: sum|dW| = {np.abs(inc).sum():7.3f}   sum dW^2 = {(inc ** 2).sum():.4f}")
```

::: output
```
t=0.5: mean=+0.0051  var=0.5096  (exact 0.5)
t=1.0: mean=+0.0064  var=0.9998  (exact 1.0)
t=2.0: mean=+0.0140  var=2.0075  (exact 2.0)
Cov(W_0.5, W_1.5) = 0.5075  (exact 0.5)
E[exp(W_1 - 1/2)] = 1.0034  (exact 1)
m=    10: sum|dW| =   2.704   sum dW^2 = 1.1000
m=   100: sum|dW| =   7.808   sum dW^2 = 0.9361
m=  1000: sum|dW| =  25.263   sum dW^2 = 0.9901
m= 10000: sum|dW| =  79.326   sum dW^2 = 0.9891
```
:::

Variance and covariance match within Monte Carlo error (about $1\,\%$). On the single path the quadratic variation settles near $1$, with standard deviation $\sqrt{2/m}$ — $0.45$ at $m = 10$, $0.014$ at $m = 10\,000$ — exactly the spread seen. The total variation instead grows like $\sqrt{2m/\pi}$ ($2.5$, $8.0$, $25.2$, $79.8$): it diverges as the grid refines.

Analytically, take geometric Brownian motion with $\mu = 8\,\%$, $\sigma = 40\,\%$, $T = 10$ years. Then $\mu - \sigma^2/2 = 0$, so the median terminal price is exactly $S_0$ and $\mathbb{P}(S_T < S_0) = 1/2$, while $\mathbb{E}[S_T] = S_0 e^{0.8} \approx 2.23\,S_0$. The probability of beating the mean is $\mathbb{P}(\sigma W_T > \sigma^2 T / 2) = 1 - \Phi(0.632) \approx 0.26$: the average is carried by a quarter of the paths. This is volatility drag.

## Why It Matters in Quant Finance

- **The Black–Scholes engine.** Under $\mathbb{Q}$ the stock is a geometric Brownian motion with drift $r$ and an option price is a Gaussian integral over $W_T$: every formula in [[black-scholes]] is a property of Brownian motion in disguise.
- **Itô's $(dW)^2 = dt$.** The correction $\tfrac12 f''(W_t)\,dt$ in [[ito-lemma]] *is* the quadratic variation. Without it there is no $-\sigma^2/2$, no theta–gamma trade-off, no Black–Scholes equation.
- **The $\sqrt{t}$ rule.** $\mathrm{Var}(W_t) = t$: daily vol $\times \sqrt{252}$ is annual vol, and a 10-day [[value-at-risk|VaR]] is $\sqrt{10}$ times the 1-day VaR — exactly only under independent increments.
- **Realised variance is quadratic variation.** $\sum_i r_i^2$ over a day estimates $\int_0^1 \sigma_s^2\,ds$, which is what variance swaps pay, with the sampling error $\sqrt{2/m}$ seen above.
- **Martingale structure.** $W$ is the canonical continuous [[martingales|martingale]]; its exponential martingale is the Girsanov density turning $\mathbb{P}$ into $\mathbb{Q}$, changing the drift from $\mu$ to $r$ without touching $\sigma$.
- **First-passage problems.** The reflection principle prices barrier and lookback options and gives the probability that a stop-loss is hit before expiry.
- **Simulation.** Monte Carlo discretises $\Delta W = \sqrt{\Delta t}\,Z$ with $Z \sim N(0, 1)$; Gaussian state-space models such as the [[kalman-filter|Kalman filter]] are the discrete-time cousins.

## Interview Questions

::: question Compute $\mathrm{Cov}(W_s, W_t)$ and $\mathrm{Corr}(W_s, W_t)$ for $s < t$. What is $\mathbb{E}[W_s W_t^2]$?
::: hint
Write $W_t = W_s + (W_t - W_s)$ and use the independence of the increment from $W_s$.
:::
::: answer
$\mathrm{Cov}(W_s, W_t) = \mathrm{Var}(W_s) = s$ and $\mathrm{Corr} = s / \sqrt{s t} = \sqrt{s/t}$. With $\Delta = W_t - W_s$: $\mathbb{E}[W_s (W_s + \Delta)^2] = \mathbb{E}[W_s^3] + 2\,\mathbb{E}[W_s^2]\,\mathbb{E}[\Delta] + \mathbb{E}[W_s]\,\mathbb{E}[\Delta^2] = 0$, since odd moments of centred Gaussians vanish.
:::
:::

::: question Given $W_1 = x$, what is the distribution of $W_{1/2}$? Generalise to $W_s$ given $W_t$ for $s < t$.
::: hint
$(W_s, W_t)$ is jointly Gaussian; use the Gaussian conditioning formula, or write $W_s = \frac{s}{t} W_t + \big(W_s - \frac{s}{t} W_t\big)$ and check that the two pieces are uncorrelated.
:::
::: answer
$\mathbb{E}[W_s \mid W_t] = \dfrac{\mathrm{Cov}(W_s, W_t)}{\mathrm{Var}(W_t)}\,W_t = \dfrac{s}{t}\,W_t$ and $\mathrm{Var}(W_s \mid W_t) = s - \dfrac{s^2}{t} = \dfrac{s(t - s)}{t}$, so $W_{1/2} \mid W_1 = x \sim N(x/2,\ 1/4)$. This is the Brownian bridge, the tool for filling in a path between two observed points (Monte Carlo for barrier options, stratified sampling of $W_T$).
:::
:::

::: question Prove that the quadratic variation of Brownian motion on $[0, t]$ equals $t$ in $L^2$, and explain in one sentence why this forces a new calculus.
::: hint
Compute the mean and variance of $\sum_i \Delta_i^2$ using $\mathbb{E}[Z^4] = 3$ for a standard Gaussian $Z$.
:::
::: answer
With $\Delta_i \sim N(0, \delta_i)$ independent, $\mathbb{E}[\sum_i \Delta_i^2] = \sum_i \delta_i = t$ and $\mathrm{Var}(\sum_i \Delta_i^2) = \sum_i 2\delta_i^2 \le 2t \max_i \delta_i \to 0$, so $\sum_i \Delta_i^2 \to t$ in $L^2$. Because $(dW)^2 = dt$ is of first order in $dt$, a Taylor expansion of $f(W_t)$ must keep $\tfrac12 f''(W_t)(dW_t)^2 = \tfrac12 f''(W_t)\,dt$ — Itô's formula; the ordinary chain rule silently drops it.
:::
:::

::: question Derive $\mathbb{P}(\max_{s \le t} W_s \ge a)$ for $a > 0$ using the reflection principle. Evaluate it for $a = 1$, $t = 1$, and deduce whether $\mathbb{E}[\tau_a]$ is finite.
::: hint
On $\{\tau_a \le t\}$, the path after $\tau_a$ is a fresh Brownian motion started at $a$, hence symmetric about $a$.
:::
::: answer
$\{\max_{s \le t} W_s \ge a\} = \{\tau_a \le t\}$. By the strong Markov property and symmetry, $\mathbb{P}(\tau_a \le t, W_t \ge a) = \mathbb{P}(\tau_a \le t, W_t \le a)$; since $\{W_t \ge a\} \subseteq \{\tau_a \le t\}$, adding gives $\mathbb{P}(\tau_a \le t) = 2\big(1 - \Phi(a/\sqrt{t})\big)$, which is $2(1 - \Phi(1)) \approx 0.317$ for $a = t = 1$. Differentiating, $\tau_a$ has density $\dfrac{a}{\sqrt{2\pi t^3}} e^{-a^2/(2t)} \sim t^{-3/2}$, so $\mathbb{E}[\tau_a] = \infty$: the level is reached almost surely but with infinite expected waiting time, the continuous-time twin of the random-walk result in [[martingales]]. Financially, a driftless log-price touches a barrier $a$ before $t$ with probability $2\big(1 - \Phi(a/(\sigma\sqrt{t}))\big)$.
:::
:::
