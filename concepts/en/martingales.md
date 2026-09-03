---
title: Martingales
subject: probability
summary: A process whose best forecast, given everything known today, is its current value, the mathematical form of a fair game. Discounted prices are martingales under the pricing measure, which is why every derivative price is a conditional expectation.
difficulty: 3
interview: 5
tags: [probability, martingale, filtration, optional-stopping, risk-neutral]
prerequisites: [conditional-probability]
related: [brownian-motion, black-scholes]
---

## Intuition

A martingale is a fair game: whatever has happened so far, your expected fortune after the next round equals your fortune now — not "zero mean overall", but conditionally on the whole history. The consequence is a no-free-lunch statement: no betting strategy that chooses its stake from the past alone turns a martingale into a game with positive expectation, at least not in bounded time on bounded credit. In finance the fair game is not the stock price under $\mathbb{P}$ (stocks earn a risk premium) but the *discounted* price under the risk-neutral measure $\mathbb{Q}$, and derivative pricing is that statement plus the tower property of [[conditional-probability|conditional expectation]].

::: viz martingales A fair game, and a barely unfair one
At p = 0.5 the average across paths stays pinned at zero however wild the individual paths get. Nudge p by half a percent and the average drifts off — no stopping rule can bring it back.
:::

## Key Formulas

| Name | Formula |
|---|---|
| Martingale | $\mathbb{E}[M_t \mid \mathcal{F}_s] = M_s$, $s \le t$ |
| Constant mean | $\mathbb{E}[M_t] = \mathbb{E}[M_0]$ |
| Compensated square | $W_t^2 - t$, $S_n^2 - n$ |
| Exponential martingale | $\exp(\sigma W_t - \tfrac12 \sigma^2 t)$ |
| Doob martingale | $M_t = \mathbb{E}[X \mid \mathcal{F}_t]$ |
| Martingale transform | $G_n = \sum_{k \le n} H_k (M_k - M_{k-1})$, $H$ predictable |
| Optional stopping | $\mathbb{E}[M_\tau] = \mathbb{E}[M_0]$ under a stopping condition |
| Risk-neutral price | $V_t = B_t\,\mathbb{E}^{\mathbb{Q}}[H / B_T \mid \mathcal{F}_t]$ |

## Common Mistakes

::: pitfall Applying optional stopping without checking a condition
"$\tau$ is finite a.s., therefore $\mathbb{E}[M_\tau] = M_0$." False: the doubling strategy and the first hitting time of $+1$ both have $\tau < \infty$ a.s. and $\mathbb{E}[M_\tau] \ne M_0$. Check a bounded horizon, a bounded stopped process, or finite $\mathbb{E}[\tau]$ with bounded increments.
:::

::: pitfall Thinking the stock price is a martingale
Under $\mathbb{Q}$ it is $S_t/B_t$ that is a martingale, not $S_t$: $\mathbb{E}^{\mathbb{Q}}[S_T \mid \mathcal{F}_t] = S_t e^{r(T-t)}$. Under $\mathbb{P}$ neither is; the excess drift $\mu - r$ is the risk premium.
:::

::: pitfall Forgetting the filtration
$\mathbb{E}[M_t \mid \mathcal{F}_s] = M_s$ is a statement about a specific information set. The same process can fail to be a martingale for an insider's larger filtration, and a constant mean $\mathbb{E}[M_t] = \mathbb{E}[M_0]$ alone does not make a process a martingale.
:::

::: pitfall Confusing local and true martingales
Writing "$\int H\,dW$ is a martingale, so its expectation is zero" with no integrability condition such as $\mathbb{E}\int_0^t H_s^2\,ds < \infty$. Strict local martingales exist and have $\mathbb{E}[M_t] < M_0$.
:::

## 30-Second Revision

Martingale: adapted, integrable, $\mathbb{E}[M_t \mid \mathcal{F}_s] = M_s$; sub $\ge$, super $\le$. Examples: symmetric random walk, $S_n^2 - n$, $W_t$, $W_t^2 - t$, $e^{\sigma W_t - \sigma^2 t/2}$, and $\mathbb{E}[X \mid \mathcal{F}_t]$ (Doob). Predictable stakes give a martingale transform, still a martingale: no strategy beats a fair game. Optional stopping $\mathbb{E}[M_\tau] = \mathbb{E}[M_0]$ needs a bounded horizon, a bounded stopped process, or finite $\mathbb{E}[\tau]$ with bounded increments. Fundamental theorem: no arbitrage $\iff$ discounted prices are martingales under some $\mathbb{Q} \sim \mathbb{P}$, hence $V_t = B_t\,\mathbb{E}^{\mathbb{Q}}[H/B_T \mid \mathcal{F}_t]$.

## Mathematical Formulation

A **filtration** $(\mathcal{F}_t)$ is an increasing family of σ-algebras, the information available at $t$; a process is **adapted** if $X_t$ is $\mathcal{F}_t$-measurable.

::: formula Martingale
An adapted process $(M_t)$ with $\mathbb{E}|M_t| < \infty$ is a martingale with respect to $(\mathcal{F}_t, \mathbb{P})$ if
$$
\mathbb{E}[M_t \mid \mathcal{F}_s] = M_s \quad \text{for all } s \le t.
$$
It is a **submartingale** if $\mathbb{E}[M_t \mid \mathcal{F}_s] \ge M_s$ and a **supermartingale** if $\mathbb{E}[M_t \mid \mathcal{F}_s] \le M_s$.
:::

Hence $\mathbb{E}[M_t] = \mathbb{E}[M_0]$; a gambler's fortune is a supermartingale, the casino's a submartingale. In discrete time one step suffices. With $\xi_i$ i.i.d., $\mathbb{P}(\xi_i = \pm 1) = 1/2$, $S_n = \sum_{i \le n} \xi_i$ and $W$ a [[brownian-motion|Brownian motion]]:

| Process | Type |
|---|---|
| $S_n$ (symmetric random walk) | martingale |
| $S_n^2 - n$ | martingale |
| $S_n$ with $\mathbb{P}(\xi_i = 1) = p > 1/2$ | submartingale |
| $W_t$ | martingale |
| $W_t^2 - t$ | martingale |
| $\exp(\sigma W_t - \tfrac12 \sigma^2 t)$ | martingale |
| $M_t = \mathbb{E}[X \mid \mathcal{F}_t]$, $X$ integrable | martingale (Doob) |
| $G_n = \sum_{k \le n} H_k (M_k - M_{k-1})$, $H$ predictable and bounded | martingale (transform) |
| $\varphi(M_t)$ with $\varphi$ convex, e.g. $\lvert M_t \rvert$, $M_t^2$ | submartingale (Jensen) |

*Predictable* means $H_k$ is $\mathcal{F}_{k-1}$-measurable — the stake is chosen before the outcome — so $G_n$ is the P&L of holding $H_k$ units over period $k$.

::: formula Optional stopping theorem
Let $M$ be a martingale and $\tau$ a stopping time, i.e. $\{\tau \le n\} \in \mathcal{F}_n$ for all $n$. Then $\mathbb{E}[M_\tau] = \mathbb{E}[M_0]$ provided one of:
1. $\tau \le N$ almost surely for a constant $N$ (bounded horizon);
2. $\tau < \infty$ a.s. and $\lvert M_{n \wedge \tau} \rvert \le K$ for all $n$ (bounded stopped process);
3. $\mathbb{E}[\tau] < \infty$ and $\mathbb{E}\big[\lvert M_{n+1} - M_n \rvert \,\big|\, \mathcal{F}_n\big] \le c$ (bounded increments).
:::

The stopped process $M_{n \wedge \tau}$ is *always* a martingale; what fails without a condition is the limit $n \to \infty$.

::: formula Fundamental theorem of asset pricing
In discrete time with finitely many dates, a market with numéraire $B_t$ (e.g. $B_t = e^{rt}$) is arbitrage-free if and only if there exists a measure $\mathbb{Q}$ equivalent to $\mathbb{P}$ under which every discounted traded price $S_t / B_t$ is a $\mathbb{Q}$-martingale. (In continuous time the clean statement replaces "no arbitrage" by NFLVR and "martingale" by sigma-martingale.) Then for any attainable payoff $H$ paid at $T$,
$$
V_t = B_t\, \mathbb{E}^{\mathbb{Q}}\!\left[\frac{H}{B_T} \,\middle|\, \mathcal{F}_t\right].
$$
The market is complete (every payoff replicable) if and only if $\mathbb{Q}$ is unique.
:::

## Derivation

**$W_t^2 - t$.** The increment $W_t - W_s$ is independent of $\mathcal{F}_s$, mean $0$, variance $t - s$:
$$
\mathbb{E}[W_t^2 \mid \mathcal{F}_s] = W_s^2 + 2W_s\,\mathbb{E}[W_t - W_s \mid \mathcal{F}_s] + \mathbb{E}[(W_t - W_s)^2 \mid \mathcal{F}_s] = W_s^2 + (t - s),
$$
so $\mathbb{E}[W_t^2 - t \mid \mathcal{F}_s] = W_s^2 - s$. The same computation with $\mathbb{E}[\xi^2] = 1$ gives $S_n^2 - n$.

**Exponential martingale.** From $\mathbb{E}[e^{\sigma(W_t - W_s)}] = e^{\sigma^2(t - s)/2}$,
$$
\mathbb{E}\big[e^{\sigma W_t - \sigma^2 t/2} \,\big|\, \mathcal{F}_s\big] = e^{\sigma W_s - \sigma^2 t/2}\,\mathbb{E}\big[e^{\sigma (W_t - W_s)}\big] = e^{\sigma W_s - \sigma^2 s/2}.
$$

**Doob.** For $M_t = \mathbb{E}[X \mid \mathcal{F}_t]$ the tower property gives $\mathbb{E}[M_t \mid \mathcal{F}_s] = \mathbb{E}[X \mid \mathcal{F}_s] = M_s$: successive forecasts of a fixed quantity form a fair game.

**Transform and stopping.** $H_{n+1}$ is known at $n$ and factors out, so $\mathbb{E}[G_{n+1} - G_n \mid \mathcal{F}_n] = 0$; and
$$
M_{n \wedge \tau} = M_0 + \sum_{k=1}^{n} \mathbf{1}_{\{\tau \ge k\}}\,(M_k - M_{k-1}), \qquad \{\tau \ge k\} = \{\tau \le k-1\}^c \in \mathcal{F}_{k-1},
$$
makes $M_{n \wedge \tau}$ a transform with predictable $H_k \in \{0, 1\}$, so $\mathbb{E}[M_{n \wedge \tau}] = \mathbb{E}[M_0]$ for every $n$. Condition 1 takes $n = N$; conditions 2 and 3 are what dominated convergence needs to reach $\mathbb{E}[M_\tau]$.

**No arbitrage.** Discounted self-financing wealth $\tilde{V}_n = V_0 + \sum_{k \le n} H_k(\tilde{S}_k - \tilde{S}_{k-1})$ is a transform of $\tilde{S} = S/B$, so $\mathbb{E}^{\mathbb{Q}}[\tilde{V}_T] = V_0$ for admissible $H$. An arbitrage ($V_0 = 0$, $\tilde{V}_T \ge 0$, $\mathbb{P}(\tilde{V}_T > 0) > 0$, which $\mathbb{Q} \sim \mathbb{P}$ carries over) would give $\mathbb{E}^{\mathbb{Q}}[\tilde{V}_T] > 0 = V_0$. The converse is a separating-hyperplane argument, and the price is Doob's martingale, $\tilde{V}_t = \mathbb{E}^{\mathbb{Q}}[\tilde{H} \mid \mathcal{F}_t]$.

## Assumptions & Edge Cases

- **Integrability is part of the definition.** A Cauchy random walk is symmetric but has no mean, hence is no martingale.
- **With respect to what?** The property depends on the filtration *and* the measure. Under $\mathbb{P}$ the discounted stock is a submartingale when $\mu > r$; under $\mathbb{Q}$ a martingale; the undiscounted $S_t$ has $\mathbb{Q}$-drift $r$, so it is a $\mathbb{Q}$-submartingale when $r \ge 0$. An insider's larger $\mathcal{G}_t \supsetneq \mathcal{F}_t$ can destroy it.
- **Not "independent increments", not "Markov".** $\int_0^t H_s\,dW_s$ has dependent increments; a Markov process with drift is not a martingale.
- **Optional stopping fails without its conditions.** The hitting time $\tau_1$ of $+1$ is finite a.s. but $\mathbb{E}[S_{\tau_1}] = 1 \ne 0$, because $\mathbb{E}[\tau_1] = \infty$.
- **Local martingales.** Stochastic integrals are in general only *local* martingales, and a strict one can have decreasing expectation: the model of a price bubble. $\exp(\sigma W_t - \sigma^2 t/2)$ is a true martingale for constant $\sigma$ (Novikov), which legitimises Girsanov in [[black-scholes]].
- **Continuous time.** Paths are càdlàg and the filtration satisfies the usual conditions; without these, stopping times misbehave.
- **Convex images.** By Jensen, $\varphi(M_t)$ is a submartingale when integrable: $\lvert M_t \rvert$, $M_t^2$, $e^{M_t}$. Hence the compensator $-t$ in $W_t^2 - t$.

## Worked Example

The doubling ("martingale") strategy: bet 1 on a fair coin, double after each loss, stop at the first win. If the win comes at round $\tau$ you have lost $2^{\tau - 1} - 1$ and win $2^{\tau - 1}$: net $+1$. Since $\mathbb{P}(\tau = k) = 2^{-k}$, $\mathbb{E}[\tau] = 2$ and $V_\tau = 1$ almost surely while $V_0 = 0$ — "a sure profit from a fair game".

The wealth $V_n = \sum_{k \le n} H_k \xi_k$ with $H_k = 2^{k-1}\mathbf{1}_{\{\tau \ge k\}}$ *is* a martingale (predictable stakes), so the catch is optional stopping: the increments $2^{k-1}$ are unbounded (condition 3 fails) and $V_{n \wedge \tau}$ is unbounded below (condition 2 fails). A bounded horizon $N$, i.e. a credit line of $2^N - 1$, restores condition 1:
$$
\mathbb{E}[V_{\tau \wedge N}] = (1 - 2^{-N}) \cdot 1 + 2^{-N} \cdot \big(-(2^N - 1)\big) = 1 - 2^{-N} - 1 + 2^{-N} = 0.
$$
With $N = 10$: win $1$ with probability $0.999$, lose $1\,023$ with probability $0.001$ — mean zero, median $+1$, fat left tail: a short-volatility payoff.

```python
import numpy as np

rng = np.random.default_rng(3)
n_paths, horizon = 200_000, 10
steps = rng.choice([-1, 1], size=(n_paths, horizon))      # fair +-1 coin flips

# Doubling strategy: stake 2^k on round k until the first win, then stop.
# The stake is fixed *before* the flip (predictable), so the wealth is a
# martingale transform of the random walk S_n = sum of steps.
wealth = np.zeros(n_paths)
stake = np.ones(n_paths)
alive = np.ones(n_paths, dtype=bool)                      # not stopped yet
means = []
for k in range(horizon):
    wealth[alive] += (stake * steps[:, k])[alive]
    alive &= steps[:, k] != 1                             # a win stops the play
    stake = np.where(alive, 2 * stake, stake)
    means.append(wealth.mean())

se = wealth.std() / np.sqrt(n_paths)
print("E[wealth_n], n = 1..10:", np.round(means, 3))
print(f"P(stopped with a win) = {np.mean(~alive):.4f}  (exact {1 - 2**-horizon:.4f})")
print(f"mean wealth at stop   = {wealth.mean():+.4f} +- {se:.4f}  (martingale: 0)")
print(f"median wealth at stop = {np.median(wealth):+.0f},  worst = {wealth.min():.0f}  (exact {-(2**horizon - 1)})")

# The random walk itself: E[S_n] = 0 and E[S_n^2] = n
S = steps.cumsum(axis=1)
print(f"E[S_10] = {S[:, -1].mean():+.4f},  E[S_10^2] = {np.mean(S[:, -1] ** 2):.3f}  (exact 10)")
```

::: output
```
E[wealth_n], n = 1..10: [ 0.001  0.006 -0.003 -0.009 -0.018  0.004 -0.017  0.012  0.012  0.053]
P(stopped with a win) = 0.9991  (exact 0.9990)
mean wealth at stop   = +0.0528 +- 0.0696  (martingale: 0)
median wealth at stop = +1,  worst = -1023  (exact -1023)
E[S_10] = +0.0026,  E[S_10^2] = 10.009  (exact 10)
```
:::

The mean stays at zero at every intermediate time and at the stop, within one standard error. That error is large ($0.07$ from $200\,000$ paths) because the stopped wealth has standard deviation about $32$: the whole variance sits in the one-in-a-thousand loss of $1\,023$.

## Why It Matters in Quant Finance

- **Risk-neutral pricing.** [[black-scholes]] is the fundamental theorem with $\tilde{S}_t = S_0\exp(\sigma W^{\mathbb{Q}}_t - \sigma^2 t/2)$; the delta-hedged portfolio is the replicating transform.
- **Efficient markets.** Under $\mathbb{P}$ the deviation from a martingale is the risk premium; predictability tests ask whether $\mathbb{E}[r_{t+1} \mid \mathcal{F}_t]$ is constant.
- **Strategies are martingale transforms.** No bounded predictable $H$ has positive expected P&L $\sum_k H_k\,\Delta S_k$ against a martingale difference: no timing edge without information outside $\mathcal{F}_t$.
- **[[brownian-motion|Brownian motion]]** is the canonical continuous martingale; Lévy's characterisation says any continuous local martingale $M$ with $M_0 = 0$ and $[M]_t = t$ *is* one. [[ito-lemma|Itô's formula]] supplies the compensator that turns $f(W_t)$ into a martingale.
- **Filtering.** The innovations $y_t - \mathbb{E}[y_t \mid \mathcal{F}_{t-1}]$ of a [[kalman-filter|Kalman filter]] form a martingale difference sequence.
- **Drawdowns.** Doob's maximal inequality $\mathbb{P}(\max_{s \le t} M_s \ge \lambda) \le \mathbb{E}[M_t^+]/\lambda$ bounds the probability of hitting a stop-loss before $t$.

## Interview Questions

::: question Let $S_n$ be a symmetric random walk. Is $S_n^2$ a martingale? Find a function $f(n)$ such that $S_n^2 - f(n)$ is one.
::: hint
Compute $\mathbb{E}[S_{n+1}^2 \mid \mathcal{F}_n]$ using $S_{n+1} = S_n + \xi_{n+1}$.
:::
::: answer
$\mathbb{E}[S_{n+1}^2 \mid \mathcal{F}_n] = S_n^2 + 2S_n\,\mathbb{E}[\xi_{n+1}] + \mathbb{E}[\xi_{n+1}^2] = S_n^2 + 1$, so $S_n^2$ is a strict submartingale (Jensen with $x \mapsto x^2$). Removing the drift, $S_n^2 - n$ is a martingale; the "$-n$" is the quadratic variation of the walk, and $W_t^2 - t$ is the continuous analogue.
:::
:::

::: question A gambler starts with $x$ and bets $1$ on a fair coin until the fortune hits $0$ or $N$. What is the probability of reaching $N$, and the expected number of bets? Justify each use of optional stopping.
::: hint
Apply optional stopping to $S_n$ and to $S_n^2 - n$. The stopped fortune lives in $[0, N]$.
:::
::: answer
$\mathbb{E}[\tau] < \infty$: any block of $N$ consecutive heads ends the game and the number of blocks is geometric. The stopped walk is bounded by $N$, so condition 2 gives $\mathbb{E}[S_\tau] = x$, i.e. $N p_N = x$ and $p_N = x/N$. For $S_n^2 - n$ the stopped process is unbounded (the $-n$), but the increments $\lvert 2 S_n \xi_{n+1} \rvert \le 2N$ are bounded before $\tau$, so condition 3 gives $\mathbb{E}[S_\tau^2] - \mathbb{E}[\tau] = x^2$ and $\mathbb{E}[\tau] = N^2 \cdot x/N - x^2 = x(N - x)$. From $x = 50$ to $N = 100$: $2\,500$ bets.
:::
:::

::: question Show that $M_t = \exp(\sigma W_t - \sigma^2 t/2)$ is a martingale. Where does it appear in the Black–Scholes model?
::: hint
Split $W_t = W_s + (W_t - W_s)$ and use the moment generating function of a Gaussian, $\mathbb{E}[e^{\lambda Z}] = e^{\lambda^2/2}$ for $Z \sim N(0, 1)$.
:::
::: answer
$\mathbb{E}[M_t \mid \mathcal{F}_s] = e^{\sigma W_s - \sigma^2 t/2}\,e^{\sigma^2 (t-s)/2} = M_s$, and $\mathbb{E}[M_t] = 1 < \infty$. Under $\mathbb{Q}$, $S_t = S_0\,e^{(r - \sigma^2/2)t + \sigma W^{\mathbb{Q}}_t}$, so $e^{-rt} S_t = S_0 M_t$: the discounted stock is exactly this martingale, the fundamental theorem's condition in [[black-scholes]]. With $\sigma$ replaced by $-\lambda$ (minus the market price of risk) it is the Girsanov density $d\mathbb{Q}/d\mathbb{P}$ on $\mathcal{F}_t$.
:::
:::

::: question Let $\tau_1$ be the first time the symmetric random walk hits $+1$; it is known that $\tau_1 < \infty$ almost surely. Prove that $\mathbb{E}[\tau_1] = \infty$ using only optional stopping, and relate this to the doubling strategy.
::: hint
Assume $\mathbb{E}[\tau_1] < \infty$ and ask which optional stopping condition would then hold.
:::
::: answer
Suppose $\mathbb{E}[\tau_1] < \infty$. The increments of $S_n$ are bounded by $1$, so condition 3 gives $\mathbb{E}[S_{\tau_1}] = S_0 = 0$; but $S_{\tau_1} = 1$ almost surely. Hence $\mathbb{E}[\tau_1] = \infty$. "Bet $1$ each round, stop once up by $1$" is a sure win with infinite expected duration and unbounded drawdowns: by gambler's ruin $\mathbb{P}(\text{drawdown} \ge k \text{ before the win}) = 1/(k+1)$, whose sum diverges. The doubling strategy trades that infinite wait for infinite credit ($\mathbb{E}[\tau] = 2$, unbounded stakes). Either way a fair game cannot be beaten with finite time *and* finite capital — what admissibility (wealth bounded below) enforces in the fundamental theorem.
:::
:::
