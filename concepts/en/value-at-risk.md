---
title: Value at Risk
subject: risk
summary: The loss that a portfolio will not exceed with probability α over a given horizon, i.e. a quantile of the loss distribution. The industry's standard risk number, quick to compute and easy to misread, and the reason expected shortfall exists.
difficulty: 2
interview: 4
tags: [risk, var, expected-shortfall, quantile, backtesting, basel]
prerequisites: [conditional-probability]
related: [greeks, linear-regression]
---

## Intuition

"With 99 % confidence we will not lose more than 2.6 % tomorrow." Walk from the left of tomorrow's loss distribution until 99 % of the mass is behind you: the loss there is $\mathrm{VaR}_{0.99}$. It gives the boundary of the tail in currency, so an equity book and a rates book compare. It says nothing about what lies *beyond*: 1 % of days lose more than 1 M, but "more" could be 1.1 M or 50 M. Three choices define any VaR — horizon, level $\alpha$, loss model.

## Key Formulas

| Name | Formula |
|---|---|
| Definition | $\mathrm{VaR}_\alpha(L) = \inf\{\ell : \mathbb{P}(L \le \ell) \ge \alpha\}$ |
| Normal VaR | $\mu + \sigma z_\alpha$, with $z_{0.99} = 2.326$ |
| Normal ES | $\mu + \sigma\,\varphi(z_\alpha)/(1-\alpha) = \mu + 2.665\,\sigma$ at 99 % |
| Expected shortfall | $\mathrm{ES}_\alpha = \frac{1}{1-\alpha}\int_\alpha^1 \mathrm{VaR}_u\,du = \mathbb{E}[L \mid L \ge \mathrm{VaR}_\alpha]$ |
| Time scaling (i.i.d. normal) | $\mathrm{VaR}^{(h)} = \sqrt{h}\,\mathrm{VaR}^{(1)}$ |
| Kupiec test | $x \sim \mathrm{Bin}(n, 1-\alpha)$ under $H_0$; $\mathrm{LR}_{\text{POF}} \sim \chi^2_1$ |

## Common Mistakes

::: pitfall Reading VaR as the worst case
$\mathrm{VaR}_{0.99}$ is the *best* of the 1 % worst days. The expected loss on a bad day is the ES, which with fat tails can be double the VaR.
:::

::: pitfall Scaling a fat-tailed or autocorrelated VaR by $\sqrt{h}$
Needs i.i.d. normal returns: autocorrelation makes it underestimate, fat tails overstate the long-horizon tail, GARCH makes the multiplier regime-dependent.
:::

::: pitfall Trusting a 99 % quantile from 250 observations
It hangs on 2–3 points, with a standard error comparable to its value. Prefer a longer window with volatility scaling, or a parametric tail (Student-$t$, extreme value theory).
:::

::: pitfall Adding VaRs across desks
With concentrated jump risk the sum of desk VaRs can be *smaller* than the firm-wide VaR. Aggregate the loss distributions, or use ES.
:::

## 30-Second Revision

VaR at level $\alpha$ is the $\alpha$-quantile of the loss over a horizon: $\mu + \sigma z_\alpha$ in the normal case, otherwise the empirical or simulated quantile. It is not subadditive (two bonds with 4 % default probability: $\mathrm{VaR}_{0.95}$ is 0 for each, 100 together) and blind beyond the quantile; expected shortfall $\mathbb{E}[L \mid L \ge \mathrm{VaR}]$ fixes both and is what Basel (FRTB) now uses at 97.5 %. Scale by $\sqrt{h}$ only for i.i.d. normal returns. Backtest by counting exceptions: $\mathrm{Binomial}(n, 1-\alpha)$ under the null, Kupiec's likelihood-ratio test.

## Mathematical Formulation

Let $L = -(V_{t+h} - V_t)$ be the loss over the horizon $h$ (positive when money is lost), with distribution function $F_L$.

::: formula Value at Risk
$$
\mathrm{VaR}_\alpha(L) = \inf\{\, \ell \in \mathbb{R} : F_L(\ell) \ge \alpha \,\} = q_\alpha(L),
$$
the $\alpha$-quantile of the loss. Equivalently $\mathbb{P}(L > \mathrm{VaR}_\alpha) \le 1 - \alpha$, with equality when $L$ is continuous.
:::

::: formula Parametric (normal) VaR and ES
If $L \sim \mathcal{N}(\mu, \sigma^2)$ and $z_\alpha = \Phi^{-1}(\alpha)$,
$$
\mathrm{VaR}_\alpha = \mu + \sigma z_\alpha, \qquad \mathrm{ES}_\alpha = \mu + \sigma\,\frac{\varphi(z_\alpha)}{1 - \alpha}.
$$
For $\alpha = 0.99$: $z_\alpha = 2.326$ and $\varphi(z_\alpha)/(1-\alpha) = 2.665$.
:::

::: formula Expected shortfall
$$
\mathrm{ES}_\alpha(L) = \frac{1}{1-\alpha}\int_\alpha^1 \mathrm{VaR}_u(L)\,du = \mathbb{E}[L \mid L \ge \mathrm{VaR}_\alpha] \quad (\text{if } L \text{ is continuous}).
$$
:::

::: formula Square-root-of-time scaling
For i.i.d. normal returns with zero mean,
$$
\mathrm{VaR}_\alpha^{(h\text{ days})} = \sqrt{h}\;\mathrm{VaR}_\alpha^{(1\text{ day})}.
$$
:::

Three estimation methods:

- **Parametric.** Estimate $\mu, \Sigma$; loss $\sim \mathcal{N}(-w^\top\mu,\; w^\top\Sigma w)$. Misses fat tails, and linear, so wrong for options.
- **Historical.** Replay the last $n$ days of factor moves on today's book, take the empirical quantile. 250 days put 2–3 points in the 1 % tail; slow to a regime change.
- **Monte Carlo.** Simulate factors, revalue, take the quantile. Model risk plus sampling error, and expensive for exotics.

**Coherence** (Artzner, Delbaen, Eber and Heath, 1999): monotone, translation-invariant, positively homogeneous and **subadditive**, $\rho(L_1 + L_2) \le \rho(L_1) + \rho(L_2)$. VaR fails the last one; ES satisfies all four.

## Derivation

**Normal VaR.** $L = \mu + \sigma Z$ gives $\mathbb{P}(L \le \ell) = \Phi\big((\ell - \mu)/\sigma\big) = \alpha$, so $\ell = \mu + \sigma z_\alpha$.

**Normal ES.** Using $\varphi'(z) = -z\varphi(z)$,
$$
\mathbb{E}[Z \mid Z > z_\alpha] = \frac{1}{1-\alpha}\int_{z_\alpha}^{\infty} z\varphi(z)\,dz = \frac{1}{1-\alpha}\Big[-\varphi(z)\Big]_{z_\alpha}^{\infty} = \frac{\varphi(z_\alpha)}{1-\alpha},
$$
so $\mathrm{ES}_\alpha = \mu + \sigma\,\mathbb{E}[Z \mid Z > z_\alpha]$. For $\mu = 0$, $\mathrm{ES}/\mathrm{VaR} = \varphi(z_\alpha)/((1-\alpha)z_\alpha) = 1.15$ at 99 % and tends to 1: the normal tail is thin.

**Square root of time.** Daily returns i.i.d. $\mathcal{N}(0, \sigma^2)$ give an $h$-day return $\mathcal{N}(0, h\sigma^2)$ — the linear variance growth of a [[brownian-motion]]. Independence gives the variance; normality keeps the *shape*, so the quantile follows the standard deviation. With a drift, $-\mu h + \sigma\sqrt{h}\,z_\alpha$.

**Why VaR fails subadditivity.** Two independent bonds, each losing 100 with probability 4 %, at $\alpha = 95\,\%$: alone, $\mathbb{P}(L \ge 100) = 4\,\% < 5\,\%$ so $\mathrm{VaR}_{0.95} = 0$; together, $1 - 0.96^2 = 7.84\,\% > 5\,\%$ so $\mathrm{VaR}_{0.95} = 100 > 0 + 0$. ES repairs this: $\frac{0.04 \times 100}{0.05} = 80$ per bond, and for the pair the loss is 100 with probability $2 \times 0.04 \times 0.96 = 7.68\,\%$, 200 with probability $0.04^2 = 0.16\,\%$, so
$$
\mathrm{ES}_{0.95}(A + B) = \frac{(0.9984 - 0.95)\times 100 + 0.0016 \times 200}{0.05} = 103.2 \le 80 + 80.
$$

**Backtesting (Kupiec, 1995).** Exceptions $x$ over $n$ days satisfy $x \sim \mathrm{Binomial}(n, p)$, $p = 1 - \alpha$, and
$$
\mathrm{LR}_{\text{POF}} = -2\ln\frac{(1-p)^{\,n-x}\,p^{\,x}}{(1 - x/n)^{\,n-x}\,(x/n)^{\,x}} \;\sim\; \chi^2_1 \quad \text{under } H_0
$$
rejects a rate too high *or* too low (too low wastes capital). With $n = 250$, $\alpha = 0.99$: expect 2.5 exceptions, reject at $x \ge 7$ (and at $x = 0$, $p$-value 0.025). Christoffersen adds a test that exceptions do not cluster.

## Assumptions & Edge Cases

- **Square root of time** needs i.i.d. normal returns: autocorrelation makes the true $h$-day VaR larger, mean reversion smaller, GARCH regime-dependent. With fat tails the central limit theorem pulls the $h$-day sum towards the normal, so $\sqrt{h}$ *overstates*. Option books are non-linear ([[greeks]]): revalue at the horizon.
- **Not subadditive** for discrete or heavy-tailed losses (bonds, digitals, CDS), but subadditive for jointly elliptical factors and linear positions — which is why the variance–covariance world never notices.
- **Blind beyond itself.** Two portfolios with the same VaR can have ES differing tenfold; selling far out-of-the-money options lowers VaR while making the tail catastrophic.
- **Historical windows.** A one-year window at 99 % rests on the 2–3 worst days and jumps when one drops out; filtered historical simulation rescales past returns by current volatility.
- **Estimation error** on a 99 % quantile from 250 points is enormous, larger still for ES, which averages even fewer points.

## Worked Example

2 000 daily returns from a Student-$t$ with $\nu = 3$ scaled to a 1 % daily standard deviation; 99 % VaR and ES three ways.

```python
import numpy as np
from scipy import stats

rng = np.random.default_rng(7)
n, nu, sigma, alpha = 2000, 3, 0.01, 0.99      # 8 years of daily returns, fat tails
scale = sigma / np.sqrt(nu / (nu - 2))          # Student-t scaled to daily std = sigma
r = scale * rng.standard_t(nu, n)
loss = -r

# Parametric (variance-covariance) VaR and ES: assume losses are normal
mu, sd = loss.mean(), loss.std(ddof=1)
z = stats.norm.ppf(alpha)
var_norm = mu + sd * z
es_norm = mu + sd * stats.norm.pdf(z) / (1 - alpha)

# Historical VaR and ES: empirical quantile and tail average
var_hist = np.quantile(loss, alpha)
es_hist = loss[loss >= var_hist].mean()

# True values for the Student-t that generated the data
tq = stats.t.ppf(alpha, nu)
var_true = scale * tq
es_true = scale * stats.t.pdf(tq, nu) / (1 - alpha) * (nu + tq**2) / (nu - 1)

print(f"{'method':<12}{'VaR 99%':>10}{'ES 99%':>10}")
for name, v, e in [("normal", var_norm, es_norm), ("historical", var_hist, es_hist), ("true t(3)", var_true, es_true)]:
    print(f"{name:<12}{100*v:>9.2f}%{100*e:>9.2f}%")

# Backtest the normal VaR in-sample: Kupiec proportion-of-failures test
x = np.sum(loss > var_norm)
p = 1 - alpha
lr = -2 * ((n - x) * np.log(1 - p) + x * np.log(p)) + 2 * ((n - x) * np.log(1 - x / n) + x * np.log(x / n))
print(f"exceptions: expected {n * p:.0f}, observed {x}, Kupiec p-value {stats.chi2.sf(lr, 1):.4f}")
```

::: output
```
method         VaR 99%    ES 99%
normal           2.11%     2.41%
historical       2.47%     3.20%
true t(3)        2.62%     4.04%
exceptions: expected 20, observed 34, Kupiec p-value 0.0042
```
:::

At equal standard deviation the normal fit gives $2.1\,\%$ against a true $2.62\,\%$, and a normal ES half the true $4.04\,\%$. Historical is close for VaR, far off for ES: 20 tail points cannot pin down a $t_3$ tail. Kupiec rejects the normal model, 34 exceptions against 20. That gap is 2008 in one line: the boundary of the tail roughly right, its *depth* completely wrong.

## Why It Matters in Quant Finance

- **Capital and limits.** Every desk runs against a VaR limit, and regulatory market-risk capital is built from it.
- **Basel.** The 1996 Market Risk Amendment allowed an internal 10-day 99 % VaR times at least 3, the multiplier set by a 250-day backtest (traffic light: green up to 4 exceptions, yellow 5–9, red 10 or more). Basel 2.5 added a *stressed VaR*; FRTB (2019) replaced VaR with a 97.5 % expected shortfall over liquidity horizons of 10 to 120 days, because VaR is not coherent — while still backtesting VaR exceptions at 97.5 % and 99 %, an ES exception being unobservable.
- **ES is a conditional expectation** on the tail event, see [[conditional-probability]]; Euler decomposition $\mathrm{ES}(L) = \sum_i \mathbb{E}[L_i \mid L \ge \mathrm{VaR}_\alpha]$ attributes the tail to positions.
- **Option books.** Delta-normal VaR is $z_\alpha\sqrt{\delta^\top \Sigma\, \delta}$ ([[greeks]]), delta-gamma adds the second-order term; both break for large moves, so Monte Carlo with full revaluation ([[black-scholes]]) is the honest alternative.
- **Factor VaR.** Mapping positions to factors by [[linear-regression]] turns a 5 000-instrument book into a 50-factor covariance matrix.
- **Fat tails.** Real daily returns are closer to $t_4$ than to normal; scale historical returns by a GARCH or EWMA volatility before taking the quantile.

## Interview Questions

::: question A portfolio's daily P&L is normal with mean zero and standard deviation 2 M. What are its 1-day and 10-day 99 % VaR?
::: hint
$z_{0.99} = 2.326$, and think about how variance grows with the horizon.
:::
::: answer
$2.326 \times 2 = 4.65$ M at 1 day. Under i.i.d. normality the 10-day standard deviation is $\sqrt{10} \times 2$ M, so $\sqrt{10} \times 4.65 = 14.7$ M. The follow-up: "when is $\sqrt{10}$ wrong?" — autocorrelation, volatility clustering, fat tails, non-linear positions, a drift that matters at long horizons.
:::
:::

::: question Why is VaR not a coherent risk measure? Give a concrete example.
::: hint
Which of the four axioms fails? Build a portfolio where diversification looks bad.
:::
::: answer
Subadditivity. Two independent bonds each losing 100 with probability 4 %: alone, $\mathrm{VaR}_{0.95} = 0$, since a 4 % event sits inside the 5 % tail; together, at least 100 with probability $1 - 0.96^2 = 7.84\,\% > 5\,\%$, so $\mathrm{VaR}_{0.95} = 100 > 0 + 0$. ES is subadditive: 80 each, 103.2 for the pair.
:::
:::

::: question You backtest a 1-day 99 % VaR over 250 trading days and observe 6 exceptions. Is the model rejected? What does the regulator do?
::: hint
Expected exceptions are $250 \times 0.01 = 2.5$. Compute Kupiec's likelihood ratio and compare with $\chi^2_1$.
:::
::: answer
$\mathrm{LR}_{\text{POF}} = -2\big[244\ln 0.99 + 6\ln 0.01\big] + 2\big[244\ln 0.976 + 6\ln 0.024\big] \approx 3.56$, below the 5 % critical value 3.84 ($p \approx 0.06$): not rejected, but only just — 7 would reject. Basel traffic light: 6 exceptions is the yellow zone, the multiplier rises from 3 to 3.5 and the bank must explain them.
:::
:::

::: question Derive the ratio $\mathrm{ES}_\alpha / \mathrm{VaR}_\alpha$ for a normal loss and for a Student-$t$ loss as $\alpha \to 1$. What does the comparison tell you about model choice?
::: hint
For the normal use $\varphi(z)/(1 - \Phi(z)) \approx z$ for large $z$. For the $t_\nu$, the tail is a power law with index $\nu$.
:::
::: answer
Normal: $\mathrm{ES}/\mathrm{VaR} = \varphi(z_\alpha)/\big((1-\alpha) z_\alpha\big)$, and since $1 - \Phi(z) \sim \varphi(z)/z$ the ratio tends to 1 — 1.15 at 99 %, 1.09 at 99.9 %. Student-$t_\nu$: the tail decays like $\ell^{-\nu}$, so beyond a high quantile the loss is approximately Pareto and $\mathrm{ES}/\mathrm{VaR} \to \nu/(\nu - 1)$: 1.5 for $\nu = 3$ (1.54 at 99 %), 1.33 for $\nu = 4$. Bounded away from 1, so a normal model understates ES far more than VaR — why regulators moved to ES, and why the tail model matters more than the confidence level.
:::
:::
