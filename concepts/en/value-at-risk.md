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

"With 99 % confidence we will not lose more than 2.6 % tomorrow." That sentence is a Value at Risk. Draw the distribution of tomorrow's loss and walk from the left until 99 % of the probability mass is behind you: the loss at that point is $\mathrm{VaR}_{0.99}$.

VaR says two useful things and hides one. It says how bad a "normal bad day" is — the boundary of the tail — and it says it in currency, so a desk head can compare an equity book with a rates book. It does **not** say how bad things get *beyond* the boundary: a VaR of 1 M tells you that 1 % of days lose more than 1 M, not whether "more" means 1.1 M or 50 M. That blind spot is why expected shortfall exists.

Three choices define every VaR number: the **horizon** (1 day, 10 days), the **confidence level** $\alpha$ (95 %, 99 %) and the **model** of the loss distribution (normal, historical, simulated). Change any of them and the number changes; a VaR quoted without all three is meaningless.

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

**Three estimation methods.**

| Method | Recipe | Pros | Cons |
|---|---|---|---|
| Parametric (variance–covariance) | Estimate $\mu$ and $\Sigma$ of the risk factors; portfolio loss $\sim \mathcal{N}(-w^\top\mu,\; w^\top\Sigma w)$; apply the formula | Fast, analytic, decomposes by position | Assumes normality, so underestimates fat tails; linear in the factors, so wrong for options |
| Historical simulation | Replay the last $n$ days of factor moves on today's portfolio, take the empirical $\alpha$-quantile | No distributional assumption; captures fat tails and non-linear payoffs | Only as good as the window: 250 days put 2–3 points in the 1 % tail; slow to react to a regime change |
| Monte Carlo | Simulate factor scenarios from a chosen model, revalue the portfolio, take the quantile | Any model (jumps, stochastic volatility), any payoff | Model risk plus sampling error; expensive for large books of exotics |

**Coherence.** A risk measure $\rho$ is *coherent* (Artzner, Delbaen, Eber and Heath, 1999) if it is monotone, translation-invariant, positively homogeneous and **subadditive**: $\rho(L_1 + L_2) \le \rho(L_1) + \rho(L_2)$, "diversification cannot increase risk". VaR satisfies the first three but not subadditivity in general; ES satisfies all four.

## Derivation

**Normal VaR.** If $L = \mu + \sigma Z$ with $Z \sim \mathcal{N}(0,1)$, then $\mathbb{P}(L \le \ell) = \Phi\big((\ell - \mu)/\sigma\big)$; setting this equal to $\alpha$ gives $\ell = \mu + \sigma z_\alpha$.

**Normal ES.** Using $\varphi'(z) = -z\varphi(z)$,
$$
\mathbb{E}[Z \mid Z > z_\alpha] = \frac{1}{1-\alpha}\int_{z_\alpha}^{\infty} z\varphi(z)\,dz = \frac{1}{1-\alpha}\Big[-\varphi(z)\Big]_{z_\alpha}^{\infty} = \frac{\varphi(z_\alpha)}{1-\alpha},
$$
and $\mathrm{ES}_\alpha = \mu + \sigma\,\mathbb{E}[Z \mid Z > z_\alpha]$. The ratio $\mathrm{ES}/\mathrm{VaR}$ is $1.15$ at 99 % for a normal and tends to 1 as $\alpha \to 1$: the normal tail is thin, so the average beyond the quantile is barely above the quantile.

**Square root of time.** If daily returns $r_1, \dots, r_h$ are i.i.d. $\mathcal{N}(0, \sigma^2)$, the $h$-day return is $\mathcal{N}(0, h\sigma^2)$, so its quantile is $\sqrt{h}$ times the daily quantile — the same linear growth of variance as in a [[brownian-motion]]. Both ingredients matter: independence gives the variance $h\sigma^2$, and normality guarantees that the $h$-day distribution has the same *shape* as the daily one, so the quantile scales with the standard deviation. With a drift $\mu \ne 0$ the correct expression is $-\mu h + \sigma\sqrt{h}\,z_\alpha$; the drift is negligible at 1–10 days and dominant at one year.

**Why VaR fails subadditivity: two bonds.** Two independent bonds each lose 100 with probability 4 % (default, zero recovery) and 0 otherwise. At $\alpha = 95\,\%$:

- One bond: $\mathbb{P}(L \ge 100) = 4\,\% < 5\,\%$, so the 95 % quantile is 0: $\mathrm{VaR}_{0.95} = 0$ for each bond alone.
- Both bonds: $\mathbb{P}(\text{at least one default}) = 1 - 0.96^2 = 7.84\,\% > 5\,\%$, so $\mathrm{VaR}_{0.95} = 100$.

$\mathrm{VaR}(A + B) = 100 > 0 + 0 = \mathrm{VaR}(A) + \mathrm{VaR}(B)$: diversifying *raised* the risk number. ES repairs this. For one bond, $\mathrm{ES}_{0.95} = \frac{1}{0.05}\int_{0.95}^{1} \mathrm{VaR}_u\,du = \frac{0.04 \times 100}{0.05} = 80$. For the pair, the loss is 100 with probability $2 \times 0.04 \times 0.96 = 7.68\,\%$ and 200 with probability $0.04^2 = 0.16\,\%$, so
$$
\mathrm{ES}_{0.95}(A + B) = \frac{(0.9984 - 0.95)\times 100 + 0.0016 \times 200}{0.05} = 103.2 \le 80 + 80.
$$
Subadditivity holds, as it must for any coherent measure.

**Backtesting (Kupiec, 1995).** Over $n$ days, count the exceptions $x$, the days with $L > \mathrm{VaR}_\alpha$. If the model is right, $x \sim \mathrm{Binomial}(n, p)$ with $p = 1 - \alpha$. The proportion-of-failures likelihood ratio
$$
\mathrm{LR}_{\text{POF}} = -2\ln\frac{(1-p)^{\,n-x}\,p^{\,x}}{(1 - x/n)^{\,n-x}\,(x/n)^{\,x}} \;\sim\; \chi^2_1 \quad \text{under } H_0
$$
rejects the model when the exception rate is too high *or* too low (too low means capital is being wasted). With $n = 250$ and $\alpha = 0.99$ you expect 2.5 exceptions; the 5 % rejection region is $x \ge 7$ (and $x = 0$, with $p$-value 0.025). Christoffersen's extension also tests that exceptions do not cluster: an exception today should not make one more likely tomorrow.

## Assumptions & Edge Cases

- **Square root of time fails** whenever returns are not i.i.d. normal. Positive autocorrelation (momentum, stale marks on illiquid assets) makes the true $h$-day VaR larger than $\sqrt{h}$ scaling; mean reversion makes it smaller; volatility clustering (GARCH) means the right multiplier depends on today's volatility level. For fat-tailed i.i.d. returns, the central limit theorem pulls the $h$-day sum *towards* the normal, so scaling a fat-tailed 1-day VaR by $\sqrt{h}$ overstates the 10-day tail. For option books the P&L is non-linear in the underlying ([[greeks]]), so no scaling rule holds: revalue at the horizon.
- **VaR is not subadditive** for discrete or heavy-tailed losses (the bond example, books of digitals or CDS). It *is* subadditive for jointly elliptical risk factors (e.g. multivariate normal) and linear positions, which is why the variance–covariance world never notices the problem.
- **VaR is a quantile, so it is blind beyond itself.** Two portfolios with the same VaR can have ES differing by a factor of ten. Selling far out-of-the-money options lowers VaR (premium income, small probability of any loss) while making the tail catastrophic.
- **Historical windows.** A one-year window at 99 % relies on the 2–3 worst observed days; the estimate jumps when one of them drops out of the window. Filtered historical simulation rescales past returns by current volatility to fix the regime problem.
- **Estimation error.** The sampling error of a 99 % quantile from 250 points is enormous; that of the ES is larger still, since it averages even fewer points. Reporting VaR to four significant figures is theatre.

## Worked Example

Simulate 2 000 daily returns from a Student-$t$ with $\nu = 3$ degrees of freedom, scaled to a 1 % daily standard deviation, then compute the 99 % VaR and ES three ways: a parametric normal fit, the historical quantile, and the exact values for the $t$ distribution that generated the data.

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

Reading the numbers: with the same standard deviation, the normal fit puts the 99 % VaR at $2.33\sigma \approx 2.1\,\%$, whereas the true fat-tailed quantile is $2.62\,\%$ and the true tail average is $4.04\,\%$ — almost twice what the normal predicts. The historical estimate lands between the two: close for VaR, still far off for ES, because 20 tail observations cannot pin down a $t_3$ tail. The Kupiec test rejects the normal model outright: 34 exceptions where 20 were expected.

The gap between the normal and the true ES is the story of 2008 in one line: models calibrated on variance placed the boundary of the tail roughly right and the *depth* of the tail completely wrong.

## Why It Matters in Quant Finance

- **Capital and limits.** Every trading desk runs against a VaR limit; the risk number decides how much a desk may hold, and regulatory market-risk capital is built from it.
- **Basel context.** The 1996 Market Risk Amendment to Basel I let banks use an internal 10-day, 99 % VaR, multiplied by at least 3, with the multiplier raised according to a 250-day backtest (the "traffic light": green up to 4 exceptions, yellow from 5 to 9, red at 10 or more). After 2008, Basel 2.5 added a *stressed VaR* computed on a crisis window, and the Fundamental Review of the Trading Book (FRTB, finalised in 2019) replaced VaR with a 97.5 % expected shortfall computed over liquidity horizons of 10 to 120 days — precisely because VaR is not coherent and says nothing about tail depth. FRTB still backtests with 97.5 % and 99 % VaR exceptions, because an ES exception is not directly observable.
- **ES is a conditional expectation.** $\mathrm{ES} = \mathbb{E}[L \mid L \ge \mathrm{VaR}]$ is conditioning on the tail event, see [[conditional-probability]]; the Euler decomposition $\mathrm{ES}(L) = \sum_i \mathbb{E}[L_i \mid L \ge \mathrm{VaR}_\alpha]$ attributes the tail to individual positions.
- **Option books.** Parametric VaR uses the delta and gamma of each position ([[greeks]]): the delta-normal VaR is $z_\alpha\sqrt{\delta^\top \Sigma\, \delta}$, the delta-gamma version adds the second-order term. Both break for large moves; Monte Carlo with full revaluation under the pricing model ([[black-scholes]] or better) is the honest alternative.
- **Factor VaR.** Mapping positions to a few factors by [[linear-regression]] (betas to indices, key-rate durations) turns a 5 000-instrument book into a 50-factor covariance matrix, which is what makes the variance–covariance approach feasible at all.
- **Fat tails and volatility.** Real daily returns are closer to $t_4$ than to normal, and volatility clusters. The practical fix is to scale historical returns by a GARCH or EWMA volatility estimate before taking the quantile.

## Common Mistakes

::: pitfall Reading VaR as the worst case
$\mathrm{VaR}_{0.99}$ is the *best* of the 1 % worst days, not the worst. The expected loss on a bad day is the ES, which with fat tails can be double the VaR.
:::

::: pitfall Scaling a fat-tailed or autocorrelated VaR by $\sqrt{h}$
The rule needs i.i.d. normal returns. Under positive autocorrelation it underestimates; under fat tails it overstates the long-horizon tail; under GARCH the multiplier depends on the current regime. Regulators accepted $\sqrt{10}$ for convenience, not because it is right.
:::

::: pitfall Trusting a 99 % quantile from 250 observations
The estimate hangs on 2–3 data points and its standard error is comparable to its value. Prefer a longer window with volatility scaling, or a parametric tail (Student-$t$, extreme value theory) fitted to the bulk of the data.
:::

::: pitfall Adding VaRs across desks
Because VaR is not subadditive, the sum of desk VaRs can be *smaller* than the firm-wide VaR for portfolios with concentrated jump risk. Aggregate at the level of the loss distribution, or use ES, which adds up conservatively.
:::

## 30-Second Revision

VaR at level $\alpha$ is the $\alpha$-quantile of the loss over a horizon: $\mu + \sigma z_\alpha$ in the normal case, otherwise the empirical or simulated quantile. It is not subadditive (two bonds with 4 % default probability: $\mathrm{VaR}_{0.95}$ is 0 for each, 100 together) and blind beyond the quantile; expected shortfall $\mathbb{E}[L \mid L \ge \mathrm{VaR}]$ fixes both and is what Basel (FRTB) now uses at 97.5 %. Scale by $\sqrt{h}$ only for i.i.d. normal returns. Backtest by counting exceptions: $\mathrm{Binomial}(n, 1-\alpha)$ under the null, Kupiec's likelihood-ratio test.

## Key Formulas

| Name | Formula |
|---|---|
| Definition | $\mathrm{VaR}_\alpha(L) = \inf\{\ell : \mathbb{P}(L \le \ell) \ge \alpha\}$ |
| Normal VaR | $\mu + \sigma z_\alpha$, with $z_{0.99} = 2.326$ |
| Normal ES | $\mu + \sigma\,\varphi(z_\alpha)/(1-\alpha) = \mu + 2.665\,\sigma$ at 99 % |
| Expected shortfall | $\mathrm{ES}_\alpha = \frac{1}{1-\alpha}\int_\alpha^1 \mathrm{VaR}_u\,du = \mathbb{E}[L \mid L \ge \mathrm{VaR}_\alpha]$ |
| Time scaling (i.i.d. normal) | $\mathrm{VaR}^{(h)} = \sqrt{h}\,\mathrm{VaR}^{(1)}$ |
| Kupiec test | $x \sim \mathrm{Bin}(n, 1-\alpha)$ under $H_0$; $\mathrm{LR}_{\text{POF}} \sim \chi^2_1$ |

## Interview Questions

::: question A portfolio's daily P&L is normal with mean zero and standard deviation 2 M. What are its 1-day and 10-day 99 % VaR?
::: hint
$z_{0.99} = 2.326$, and think about how variance grows with the horizon.
:::
::: answer
1-day VaR $= 2.326 \times 2 = 4.65$ M. Under i.i.d. normality the 10-day standard deviation is $\sqrt{10} \times 2$ M, so the 10-day VaR is $\sqrt{10} \times 4.65 = 14.7$ M. The follow-up is always "when is $\sqrt{10}$ wrong?": autocorrelated returns, volatility clustering, fat tails, non-linear positions, or a drift that matters at long horizons.
:::
:::

::: question Why is VaR not a coherent risk measure? Give a concrete example.
::: hint
Which of the four axioms fails? Build a portfolio where diversification looks bad.
:::
::: answer
Subadditivity fails. Two independent bonds, each losing 100 with probability 4 %: each alone has $\mathrm{VaR}_{0.95} = 0$ because a 4 % event sits inside the 5 % tail, but the pair loses at least 100 with probability $1 - 0.96^2 = 7.84\,\% > 5\,\%$, so $\mathrm{VaR}_{0.95} = 100 > 0 + 0$. Expected shortfall is subadditive: 80 for each bond, 103.2 for the pair.
:::
:::

::: question You backtest a 1-day 99 % VaR over 250 trading days and observe 6 exceptions. Is the model rejected? What does the regulator do?
::: hint
Expected exceptions are $250 \times 0.01 = 2.5$. Compute Kupiec's likelihood ratio and compare with $\chi^2_1$.
:::
::: answer
$\mathrm{LR}_{\text{POF}} = -2\big[244\ln 0.99 + 6\ln 0.01\big] + 2\big[244\ln 0.976 + 6\ln 0.024\big] \approx 3.56$, below the 5 % critical value 3.84 ($p \approx 0.06$): not rejected at 5 %, but only just; 7 exceptions would reject. In the Basel traffic-light scheme, 6 exceptions is the yellow zone: the capital multiplier is raised from 3 to 3.5, and the bank must explain the exceptions.
:::
:::

::: question Derive the ratio $\mathrm{ES}_\alpha / \mathrm{VaR}_\alpha$ for a normal loss and for a Student-$t$ loss as $\alpha \to 1$. What does the comparison tell you about model choice?
::: hint
For the normal use $\varphi(z)/(1 - \Phi(z)) \approx z$ for large $z$. For the $t_\nu$, the tail is a power law with index $\nu$.
:::
::: answer
Normal: $\mathrm{ES}/\mathrm{VaR} = \varphi(z_\alpha)/\big((1-\alpha) z_\alpha\big)$, and since $1 - \Phi(z) \sim \varphi(z)/z$ the ratio tends to 1: it is 1.15 at 99 % and 1.09 at 99.9 %. Student-$t_\nu$: the tail decays like $\ell^{-\nu}$, so beyond a high quantile the loss is approximately Pareto and $\mathrm{ES}/\mathrm{VaR} \to \nu/(\nu - 1)$, e.g. 1.5 for $\nu = 3$ (already 1.54 at 99 %) and 1.33 for $\nu = 4$. The ratio stays bounded away from 1, meaning the tail beyond VaR carries substantial extra loss no matter how far out you go. A normal model therefore understates ES much more than it understates VaR; this is exactly why regulators moved to ES and why the model for the tail matters more than the confidence level.
:::
:::
