---
title: Volatility
subject: risk
summary: The standard deviation of returns, quoted annualised. The single number that drives option prices, risk limits and position sizing — clustered, mean-reverting, hard to observe and noisy to estimate.
difficulty: 2
interview: 5
tags: [volatility, realised-volatility, implied-volatility, ewma, garch, annualisation]
prerequisites: [variance]
related: [black-scholes, greeks, value-at-risk]
---

## Intuition

Volatility is the standard deviation of returns: the square root of the [[variance]], put back into return units so it can be read. "This stock has a 20 % vol" means that over one year, under a normal-ish model, its return will land within $\pm 20\%$ of its mean about two thirds of the time.

Three things make volatility more subtle than a textbook standard deviation.

**It is quoted annualised, whatever the sampling frequency.** Daily returns of $1\%$ are never described that way; they become "16 % vol", because $0.01\sqrt{252} \approx 0.159$. Annualisation is a convention that lets a one-day risk number, a one-month option and a five-year swaption be compared on one axis.

**It is not constant.** Calm weeks follow calm weeks and violent days cluster together. Volatility is the one feature of returns that is genuinely forecastable — daily returns are essentially unpredictable, but tomorrow's volatility is well predicted by today's.

**It is never observed.** You observe returns; volatility is a parameter of the distribution they were drawn from. Everything below is an attempt to estimate it: from past returns (realised), from a model (EWMA, GARCH), or from option prices (implied).

## Mathematical Formulation

Write $S_t$ for the price and $r_t = \ln(S_t/S_{t-1})$ for the log return over one period.

::: formula Volatility and annualisation
$$
\sigma_{\text{period}} = \sqrt{\operatorname{Var}(r_t)}, \qquad
\sigma_{\text{ann}} = \sigma_{\text{period}}\sqrt{N},
$$
with $N$ periods per year: $N = 252$ for daily data, $52$ weekly, $12$ monthly.
:::

**Log versus simple returns.** Simple returns compound multiplicatively, $1 + R_{0,h} = \prod_{t=1}^h (1+R_t)$, so they do not add. Log returns add exactly: $r_{0,h} = \sum_{t=1}^h r_t$. Since variance is additive over independent summands, the aggregation and scaling rules below are statements about **log** returns. For small moves $r_t \approx R_t$ and the distinction is second order, but over long horizons or with large moves it is not.

::: formula Square-root-of-time rule
If returns are i.i.d. (any distribution with finite variance), then $\operatorname{Var}(r_{0,h}) = h\,\sigma^2$ and
$$
\sigma_h = \sigma\sqrt{h}.
$$
With autocorrelations $\rho_k = \operatorname{Corr}(r_t, r_{t+k})$ the exact result is
$$
\sigma_h^2 = \sigma^2\Big(h + 2\sum_{k=1}^{h-1}(h-k)\rho_k\Big).
$$
:::

Positive autocorrelation (trending) makes the true $\sigma_h$ larger than $\sigma\sqrt{h}$; negative autocorrelation (mean reversion, bid–ask bounce) makes it smaller. Only i.i.d.-ness makes the correction vanish.

**Realised volatility.** The plain close-to-close estimator over $n$ days:

$$
\hat\sigma^2 = \frac{1}{n-1}\sum_{t=1}^{n} (r_t - \bar{r})^2 ,
$$

often with $\bar{r}$ forced to $0$, since over short windows the mean is smaller than its own estimation error.

**Range estimators** use the intraday high $H$, low $L$, open $O$ and close $C$, which carry more information than the close alone:

::: formula Parkinson and Garman–Klass
$$
\hat\sigma^2_{\text{P}} = \frac{1}{4\ln 2}\Big(\ln\frac{H}{L}\Big)^2,
\qquad
\hat\sigma^2_{\text{GK}} = \frac12\Big(\ln\frac{H}{L}\Big)^2 - (2\ln 2 - 1)\Big(\ln\frac{C}{O}\Big)^2 .
$$
:::

Both are unbiased for a driftless geometric [[brownian-motion]]. Parkinson has roughly $5\times$ the efficiency of the close-to-close estimator (one day of ranges is worth about five days of closes), Garman–Klass roughly $7\times$.

**Conditional-variance models.** Let $\sigma_t^2$ be the variance of $r_t$ given information up to $t-1$:

::: formula EWMA and GARCH(1,1)
$$
\text{EWMA: } \sigma_t^2 = \lambda\,\sigma_{t-1}^2 + (1-\lambda)\,r_{t-1}^2, \qquad \lambda = 0.94 \text{ (RiskMetrics, daily)},
$$
$$
\text{GARCH(1,1): } \sigma_t^2 = \omega + \alpha\,r_{t-1}^2 + \beta\,\sigma_{t-1}^2,
\qquad
\sigma_\infty^2 = \frac{\omega}{1 - \alpha - \beta}\ \ (\alpha + \beta < 1).
$$
:::

$\alpha + \beta$ is the **persistence**: the fraction of a variance shock that survives one day. Typical equity estimates are $\alpha \approx 0.05$–$0.10$, $\beta \approx 0.88$–$0.92$, so $\alpha + \beta \approx 0.95$–$0.99$ and shocks decay with a half-life of weeks. EWMA is exactly the boundary case $\omega = 0$, $\alpha + \beta = 1$: infinite persistence, no long-run level to revert to. For $\lambda = 0.94$ the half-life is $\ln(0.5)/\ln(0.94) \approx 11$ days.

## Derivation

**Why $\sqrt{h}$.** For log returns $r_{0,h} = \sum_{t=1}^{h} r_t$, so by the variance-of-a-sum formula,
$$
\operatorname{Var}(r_{0,h}) = \sum_{t}\operatorname{Var}(r_t) + 2\sum_{t<u}\operatorname{Cov}(r_t, r_u).
$$
If the returns are uncorrelated with common variance $\sigma^2$, the second sum vanishes and the first is $h\sigma^2$. Note what is *not* required: neither normality nor independence, only zero autocorrelation and a constant variance. Counting the pairs at each lag ($h - k$ pairs at lag $k$) gives the general formula above.

Scaling from days to a year is the same statement with $h = N$; the widespread $\sqrt{252}$ simply counts trading days.

**Volatility clustering does not break $\sqrt{h}$ directly.** If $\sigma_t$ varies but returns stay uncorrelated, $\operatorname{Var}(r_{0,h}) = \sum_t \mathbb{E}[\sigma_t^2]$ still holds — the rule is fine for *unconditional* variance. What clustering breaks is the use of the rule on a *conditional* estimate: scaling today's elevated $\sigma_t$ by $\sqrt{10}$ ignores mean reversion and overstates the ten-day risk. The GARCH forecast makes this explicit: the $k$-step-ahead conditional variance is
$$
\mathbb{E}[\sigma_{t+k}^2 \mid \mathcal{F}_t] = \sigma_\infty^2 + (\alpha+\beta)^{k-1}\big(\sigma_{t+1}^2 - \sigma_\infty^2\big), \qquad k \ge 1,
$$
which pulls back towards $\sigma_\infty^2$ at rate $\alpha + \beta$. Only when $\alpha + \beta = 1$ (EWMA) is the flat $\sqrt{h}$ extrapolation self-consistent.

**How noisy is a volatility estimate?** For $n$ i.i.d. normal returns, $(n-1)\hat\sigma^2/\sigma^2 \sim \chi^2_{n-1}$, so $\operatorname{Var}(\hat\sigma^2) = 2\sigma^4/(n-1)$. The delta method with $g(x) = \sqrt{x}$, $g'(\sigma^2) = 1/(2\sigma)$, gives

::: formula Standard error of a volatility estimate
$$
\operatorname{sd}(\hat\sigma) \approx \frac{\sigma}{\sqrt{2n}}, \qquad \text{relative error } \frac{\operatorname{sd}(\hat\sigma)}{\sigma} \approx \frac{1}{\sqrt{2n}} .
$$
:::

Set the relative error to $10\%$: $n = 1/(2 \cdot 0.01) = 50$ days. For $1\%$ you need $n = 5000$ days, about twenty years — during which the volatility has certainly changed. This is the central tension of volatility estimation: a long window is precise about a parameter that no longer applies, a short window is timely and noisy. A one-month (21-day) realised vol carries a $\pm 15\%$ relative standard error; a $22\%$ print is not distinguishable from a $19\%$ one.

## Assumptions & Edge Cases

- **Range estimators miss overnight gaps.** Parkinson and Garman–Klass measure the intraday session only. For an equity that gaps on earnings, they can badly understate true close-to-close risk. They also assume zero drift and continuous observation: with a strong trend they are biased, and discrete sampling means the observed high and low are inside the true ones, biasing them **down** (roughly $-1\%$ to $-3\%$ for liquid names, much worse for thin ones).
- **Zero-mean shortcut.** Setting $\bar{r} = 0$ is a bias–variance trade. Over a 21-day window the mean's estimation error dominates the drift itself, so the constrained estimator is usually better; over multi-year windows, subtract the mean.
- **Non-synchronous and stale prices.** Illiquid assets show artificially low volatility and low correlation because prices do not update. The bid–ask bounce does the opposite at high frequency, creating negative autocorrelation and inflating high-frequency realised variance — the reason microstructure-noise-robust estimators exist.
- **$\alpha + \beta \ge 1$.** The GARCH unconditional variance $\omega/(1-\alpha-\beta)$ only exists when $\alpha + \beta < 1$. Estimated persistence very close to $1$ is common and often signals an unmodelled structural break rather than a genuine unit root in variance.
- **Vol of what?** Volatility of price returns, of a spread, of a yield (basis-point vol) and of a futures roll-adjusted series are different numbers. Quoting a vol without saying which series it came from is as incomplete as quoting a VaR without a horizon.

## Worked Example

Simulate a GARCH(1,1) return series where the true conditional volatility is known, then compare a 21-day rolling window against an EWMA. Both are strict forecasts: each estimate of $\sigma_t$ uses returns up to $t-1$ only.

```python
import numpy as np

rng = np.random.default_rng(11)
n = 4000
omega, alpha, beta = 2.0e-6, 0.08, 0.90   # long-run var = omega/(1-a-b)

# Simulate GARCH(1,1): r_t = sigma_t z_t, sigma_t known before r_t.
r = np.zeros(n)
s2 = np.zeros(n)
s2[0] = omega / (1 - alpha - beta)
z = rng.standard_normal(n)
for t in range(n):
    if t > 0:
        s2[t] = omega + alpha * r[t - 1] ** 2 + beta * s2[t - 1]
    r[t] = np.sqrt(s2[t]) * z[t]
true_vol = np.sqrt(s2)

# Forecast sigma_t using information up to t-1 only.
win = 21
roll = np.full(n, np.nan)
for t in range(win, n):
    roll[t] = r[t - win:t].std(ddof=1)

lam = 0.94
ewma = np.zeros(n)
ewma[0] = s2[0]
for t in range(1, n):
    ewma[t] = lam * ewma[t - 1] + (1 - lam) * r[t - 1] ** 2
ewma = np.sqrt(ewma)

m = ~np.isnan(roll)
rmse = lambda x: np.sqrt(np.mean((x[m] - true_vol[m]) ** 2))
print(f"long-run vol (annualised)  = {np.sqrt(omega / (1 - alpha - beta) * 252):.4f}")
print(f"realised   vol (annualised) = {r.std(ddof=1) * np.sqrt(252):.4f}")
print(f"RMSE 21-day rolling (daily) = {rmse(roll):.6f}")
print(f"RMSE EWMA lambda=0.94       = {rmse(ewma):.6f}")
print(f"persistence alpha+beta      = {alpha + beta:.2f}")
```

::: output
```
long-run vol (annualised)  = 0.1587
realised   vol (annualised) = 0.1563
RMSE 21-day rolling (daily) = 0.001141
RMSE EWMA lambda=0.94       = 0.000660
persistence alpha+beta      = 0.98
```
:::

The EWMA's error is about $42\%$ smaller than the rolling window's. Two reasons: the rolling window weights a 21-day-old return exactly as much as yesterday's, and it drops observations abruptly, so a single large move enters, sits flat for 21 days, then falls out and creates a phantom drop in the estimate. The EWMA decays smoothly with an $11$-day half-life and reacts immediately. Note also that the realised unconditional volatility ($15.6\%$) sits close to but not on the model's long-run level ($15.9\%$): even 4000 days leave sampling error, consistent with the $1/\sqrt{2n} \approx 1.1\%$ relative standard error.

## Why It Matters in Quant Finance

- **It is the only free parameter in [[black-scholes]].** Spot, strike, expiry and rates are observable; volatility is not. Option pricing is therefore *entirely* a volatility forecasting problem, and quoting a price in vol units rather than currency is the market's way of stripping out everything else.
- **Implied volatility is a price, not a forecast.** Inverting [[black-scholes]] for the $\sigma$ that reproduces a market price gives the implied vol. It systematically exceeds subsequent realised volatility — the **variance risk premium**, roughly 1–3 vol points on index options — because option sellers demand compensation for being short gamma into crashes. Implied also varies with strike and expiry (the smile), which is a direct statement that the constant-vol model is wrong.
- **Volatility is tradable in its own right.** A delta-hedged option's P&L is $\tfrac12 \sum \Gamma S^2(r_t^2 - \sigma_{\text{impl}}^2 \Delta t)$ — realised variance against implied variance (see [[greeks]]). A **variance swap** pays $N(\sigma_R^2 - K^2)$ and is the natural instrument, because *variance*, not volatility, is what a static portfolio of options weighted $1/K^2$ plus a dynamic delta hedge replicates exactly (the log-contract argument). A volatility swap pays $\sqrt{\text{variance}}$, a concave function, so it requires a convexity adjustment and cannot be statically replicated — this is why the market quotes variance swaps and adjusts to get vol swaps.
- **Risk limits and sizing.** Volatility is the $\sigma$ in parametric [[value-at-risk]], the scaling factor in vol-targeted strategies ($w_t \propto 1/\hat\sigma_t$), and the denominator of every Sharpe ratio.
- **The stylised facts drive model choice.** Volatility **clusters** (large moves follow large moves — this is what GARCH captures); returns have **fat tails** even after conditioning; the **leverage effect** means negative returns raise future volatility more than positive ones of the same size (hence asymmetric models like GJR-GARCH and the equity skew); and volatility **mean-reverts**. Above all, volatility is far more forecastable than returns: an $R^2$ near $0$ for return prediction is normal, while $0.3$–$0.5$ for next-day variance is routine when the target is a realised-variance proxy built from intraday data. Against the squared daily return as target the $R^2$ is under $0.05$, because that target is itself a very noisy proxy.

## Common Mistakes

::: pitfall Scaling a conditional volatility by $\sqrt{h}$
The rule needs i.i.d. returns. Applied to a *current* GARCH or EWMA estimate during a stress episode it ignores mean reversion and overstates the 10-day number; applied in a calm period it understates it. Use $\mathbb{E}[\sigma_{t+k}^2\mid\mathcal{F}_t] = \sigma_\infty^2 + (\alpha+\beta)^{k-1}(\sigma_{t+1}^2 - \sigma_\infty^2)$ and sum over $k$, not a flat $\sqrt{10}$.
:::

::: pitfall Annualising simple returns as if they added
Only log returns aggregate additively. Building a monthly volatility by scaling daily *simple* returns by $\sqrt{21}$ mixes an additive rule with a multiplicative quantity. The error is second order for small moves and material for a volatile asset (crypto, single-name options) over long horizons.
:::

::: pitfall Reading a change in a volatility estimate as a change in volatility
With a 21-day window the relative standard error is $1/\sqrt{42} \approx 15\%$. Realised vol moving from $18\%$ to $22\%$ is well within noise — before calling a regime change, ask whether the move exceeds roughly $2\hat\sigma/\sqrt{n}$: comparing two independent windows doubles the variance of the difference, so the bar is $\sqrt{2}$ times one estimate's standard error, not one.
:::

::: pitfall Comparing implied and realised volatility carelessly
They must be matched in horizon and, more subtly, implied vol is a risk-neutral expectation of *variance* under a different measure. A 30-day implied of $20\%$ against a trailing 30-day realised of $16\%$ is not a mispricing: it is the variance risk premium plus the fact that one is forward-looking and the other backward-looking.
:::

::: pitfall Trusting range estimators on gapping assets
Parkinson and Garman–Klass see only the intraday session. On a name that gaps overnight — earnings, biotech readouts, anything with scheduled news — they can materially understate risk while looking impressively precise.
:::

## 30-Second Revision

Volatility is $\sqrt{\operatorname{Var}(r)}$, quoted annualised: $\sigma_{\text{ann}} = \sigma_{\text{daily}}\sqrt{252}$. Log returns because they add. The $\sqrt{h}$ rule needs uncorrelated returns with constant variance — the exact version carries $2\sum_k (h-k)\rho_k$. Estimate it from closes, from ranges (Parkinson $\approx 5\times$ more efficient but blind to gaps), or from a model: EWMA $\sigma_t^2 = \lambda\sigma_{t-1}^2 + (1-\lambda)r_{t-1}^2$ with $\lambda = 0.94$, or GARCH(1,1) with long-run variance $\omega/(1-\alpha-\beta)$ and persistence $\alpha+\beta$. Stylised facts: clustering, fat tails, leverage effect, mean reversion, and vol is far more forecastable than returns. Implied vol is the market's price in vol units and exceeds realised by the variance risk premium. Estimates are noisy: relative error $\approx 1/\sqrt{2n}$, so $10\%$ accuracy needs 50 observations.

## Key Formulas

| Name | Formula |
|---|---|
| Annualisation | $\sigma_{\text{ann}} = \sigma_{\text{period}}\sqrt{N}$, $N = 252$ daily |
| Square root of time | $\sigma_h = \sigma\sqrt{h}$ (i.i.d. returns) |
| With autocorrelation | $\sigma_h^2 = \sigma^2\big(h + 2\sum_{k=1}^{h-1}(h-k)\rho_k\big)$ |
| Close-to-close | $\hat\sigma^2 = \frac{1}{n-1}\sum_t (r_t - \bar r)^2$ |
| Parkinson | $\hat\sigma_{\text{P}}^2 = \frac{1}{4\ln 2}\big(\ln (H/L)\big)^2$ |
| Garman–Klass | $\hat\sigma_{\text{GK}}^2 = \frac12\big(\ln (H/L)\big)^2 - (2\ln 2 - 1)\big(\ln (C/O)\big)^2$ |
| EWMA | $\sigma_t^2 = \lambda\sigma_{t-1}^2 + (1-\lambda)r_{t-1}^2$, $\lambda = 0.94$ |
| GARCH(1,1) | $\sigma_t^2 = \omega + \alpha r_{t-1}^2 + \beta\sigma_{t-1}^2$, $\sigma_\infty^2 = \omega/(1-\alpha-\beta)$ |
| Estimation noise | $\operatorname{sd}(\hat\sigma)/\sigma \approx 1/\sqrt{2n}$ |

## Interview Questions

::: question Daily returns have a standard deviation of $1.2\%$. What is the annualised volatility, and what did you assume?
::: hint
Multiply by $\sqrt{N}$ with $N$ trading days.
:::
::: answer
$0.012\sqrt{252} = 0.012 \times 15.87 \approx 19.0\%$.

Assumptions: returns are uncorrelated across days with constant variance (i.i.d. is sufficient but stronger than needed), log returns so that they aggregate additively, and $252$ trading days per year — a calendar-day convention ($\sqrt{365}$) would give $22.9\%$, so the convention must be stated. Note the useful mental shortcut: $\sqrt{252} \approx 16$, so daily vol $\times 16 =$ annual vol, and a $16\%$ annual vol is a $1\%$ daily move.
:::
:::

::: question Why does the market quote variance swaps rather than volatility swaps?
::: hint
Which of variance and volatility is a linear function of the payoff you can build from a static option portfolio?
:::
::: answer
Realised **variance** has an exact static replication: a portfolio of European options across all strikes weighted $1/K^2$ (a log contract), plus a dynamic delta hedge in the underlying, reproduces $\sum r_t^2$ model-independently — no volatility model required. That makes the variance swap strike a genuine no-arbitrage quantity, the price of the replicating option strip.

Volatility is $\sqrt{\text{variance}}$, a strictly concave function, so by Jensen $\mathbb{E}[\sqrt{V}] < \sqrt{\mathbb{E}[V]}$: the vol swap strike is below the variance swap strike by a **convexity adjustment** that depends on the volatility-of-volatility, i.e. on a model. Dealers therefore quote and hedge variance and derive vol swaps from it. The same convexity is why a variance swap has a much fatter payoff in a crash: it is long vol-of-vol.
:::
:::

::: question You have 60 days of returns and estimate an annualised volatility of $25\%$. Give a rough confidence interval, and say what happens if you use 250 days instead.
::: hint
Use $\operatorname{sd}(\hat\sigma) \approx \sigma/\sqrt{2n}$.
:::
::: answer
Relative standard error $= 1/\sqrt{2 \times 60} = 1/\sqrt{120} \approx 9.1\%$, so $\operatorname{sd}(\hat\sigma) \approx 0.091 \times 25\% = 2.3$ vol points. A rough $95\%$ interval is $25\% \pm 4.6\%$, i.e. roughly $20\%$ to $30\%$ — a wide band around what looks like a precise number.

With 250 days the relative error falls to $1/\sqrt{500} \approx 4.5\%$, giving $\pm 2.2$ points. But the trade-off bites: a 250-day window averages over a year in which the true volatility has almost certainly moved, so what you have gained in statistical precision you have lost in relevance. The interval is also only valid under normality and constant variance; with fat tails and clustering, the effective sample size is smaller than $n$ and the true interval is wider.
:::
:::

::: question A trader says: "Realised vol is 15 %, the one-month option is implied at 19 %, so I should sell the option." What is wrong with that reasoning?
::: hint
Think about what the 4-point gap compensates, and about the shape of the P&L of the resulting position.
:::
::: answer
Three problems.

**The gap is expected.** Implied vol exceeds subsequent realised vol on average — the variance risk premium, historically 1–3 points on equity indices and larger on the wings. It is compensation for a risk, not a free lunch: the short-vol seller is short gamma and loses badly exactly when markets crash and their other positions do too. Harvesting it is a legitimate strategy with a known and unpleasant payoff profile (small steady gains, occasional very large losses), not an arbitrage.

**Backward versus forward.** Trailing realised vol is a noisy estimate of the *past*; implied is a risk-neutral expectation over the *next* month. With a $\pm 15\%$ relative standard error at 21 days, a $15\%$ print is barely distinguishable from $17\%$. And if there is a known event in the window (earnings, a central-bank meeting), forward realised vol should be higher than trailing.

**Which implied?** A single number hides the smile. The $19\%$ is at one strike; a delta-hedged short position's P&L is $\tfrac12\sum \Gamma S^2 (r_t^2 - \sigma_{\text{impl}}^2\Delta t)$, weighted by gamma, so it depends on *where* the underlying spends its time, not just on average realised variance. Selling a $19\%$ option and realising $16\%$ can still lose money if the moves happen where the gamma is concentrated.
:::
:::
