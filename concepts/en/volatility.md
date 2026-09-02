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

Volatility is the standard deviation of returns: the square root of the [[variance]], back in return units. "This stock has a 20 % vol" means its yearly return lands within $\pm 20\%$ of its mean about two thirds of the time. Three things make it subtler than a textbook standard deviation. It is **quoted annualised** whatever the sampling frequency — $1\%$ daily becomes "16 % vol", since $0.01\sqrt{252} \approx 0.159$. It is **not constant**: calm and violent days cluster, which makes volatility genuinely forecastable where returns are not. And it is **never observed**, only estimated — from past returns, from a model, or from option prices.

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

## Common Mistakes

::: pitfall Scaling a conditional volatility by $\sqrt{h}$
The rule needs i.i.d. returns. On a *current* GARCH or EWMA estimate it ignores mean reversion: it overstates the 10-day number in stress and understates it in calm. Use $\mathbb{E}[\sigma_{t+k}^2\mid\mathcal{F}_t] = \sigma_\infty^2 + (\alpha+\beta)^{k-1}(\sigma_{t+1}^2 - \sigma_\infty^2)$ and sum over $k$, not a flat $\sqrt{10}$.
:::

::: pitfall Annualising simple returns as if they added
Only log returns aggregate additively. Scaling daily *simple* returns by $\sqrt{21}$ mixes an additive rule with a multiplicative quantity — second order for small moves, material for a volatile asset over long horizons.
:::

::: pitfall Reading a change in a volatility estimate as a change in volatility
With a 21-day window the relative standard error is $1/\sqrt{42} \approx 15\%$, so $18\%$ to $22\%$ is well within noise. Comparing two independent windows doubles the variance of the difference, so the bar is $2\hat\sigma/\sqrt{n}$ — $\sqrt{2}$ times one estimate's standard error, not one.
:::

::: pitfall Comparing implied and realised volatility carelessly
Match them in horizon, and remember implied vol is a risk-neutral expectation of *variance* under a different measure. A 30-day implied of $20\%$ against a trailing 30-day realised of $16\%$ is not a mispricing: it is the variance risk premium plus forward-looking against backward-looking.
:::

::: pitfall Trusting range estimators on gapping assets
Parkinson and Garman–Klass see only the intraday session. On a name that gaps overnight — earnings, biotech readouts, scheduled news — they understate risk while looking impressively precise.
:::

## 30-Second Revision

Volatility is $\sqrt{\operatorname{Var}(r)}$, quoted annualised: $\sigma_{\text{ann}} = \sigma_{\text{daily}}\sqrt{252}$. Log returns, because they add. The $\sqrt{h}$ rule needs uncorrelated returns with constant variance — exactly, $2\sum_k (h-k)\rho_k$ corrects it. Estimate from closes, from ranges (Parkinson $\approx 5\times$ more efficient but blind to gaps), or from a model: EWMA $\sigma_t^2 = \lambda\sigma_{t-1}^2 + (1-\lambda)r_{t-1}^2$ with $\lambda = 0.94$, or GARCH(1,1) with long-run variance $\omega/(1-\alpha-\beta)$ and persistence $\alpha+\beta$. Stylised facts: clustering, fat tails, leverage effect, mean reversion. Implied vol is a price and exceeds realised by the variance risk premium. Estimates are noisy: relative error $\approx 1/\sqrt{2n}$, so $10\%$ accuracy needs 50 observations.

## Mathematical Formulation

With $S_t$ the price and $r_t = \ln(S_t/S_{t-1})$ the log return over one period:

::: formula Volatility and annualisation
$$
\sigma_{\text{period}} = \sqrt{\operatorname{Var}(r_t)}, \qquad
\sigma_{\text{ann}} = \sigma_{\text{period}}\sqrt{N},
$$
with $N$ periods per year: $N = 252$ for daily data, $52$ weekly, $12$ monthly.
:::

**Log versus simple returns.** Simple returns compound, $1 + R_{0,h} = \prod_{t=1}^h (1+R_t)$, so they do not add; log returns do, $r_{0,h} = \sum_{t=1}^h r_t$. Variance being additive over independent summands, every scaling rule below concerns **log** returns. For small moves $r_t \approx R_t$; over long horizons, not.

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

Positive autocorrelation (trending) makes $\sigma_h$ larger than $\sigma\sqrt{h}$; negative (mean reversion, bid–ask bounce) smaller.

**Realised volatility.** The close-to-close estimator over $n$ days,

$$
\hat\sigma^2 = \frac{1}{n-1}\sum_{t=1}^{n} (r_t - \bar{r})^2 ,
$$

often with $\bar{r}$ forced to $0$: over short windows the mean is smaller than its own estimation error. **Range estimators** use the intraday high $H$, low $L$, open $O$ and close $C$, which carry more information than the close alone:

::: formula Parkinson and Garman–Klass
$$
\hat\sigma^2_{\text{P}} = \frac{1}{4\ln 2}\Big(\ln\frac{H}{L}\Big)^2,
\qquad
\hat\sigma^2_{\text{GK}} = \frac12\Big(\ln\frac{H}{L}\Big)^2 - (2\ln 2 - 1)\Big(\ln\frac{C}{O}\Big)^2 .
$$
:::

Both are unbiased for a driftless geometric [[brownian-motion]]; Parkinson is roughly $5\times$ as efficient as close-to-close, Garman–Klass $7\times$.

**Conditional-variance models.** With $\sigma_t^2$ the variance of $r_t$ given information up to $t-1$:

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

$\alpha + \beta$ is the **persistence**, the fraction of a variance shock surviving one day. Typical equity estimates $\alpha \approx 0.05$–$0.10$, $\beta \approx 0.88$–$0.92$ give $\alpha + \beta \approx 0.95$–$0.99$: shocks decay over weeks. EWMA is the boundary case $\omega = 0$, $\alpha + \beta = 1$ — infinite persistence, no long-run level; for $\lambda = 0.94$ the half-life is $\ln(0.5)/\ln(0.94) \approx 11$ days.

## Derivation

**Why $\sqrt{h}$.** For log returns $r_{0,h} = \sum_{t=1}^{h} r_t$, so
$$
\operatorname{Var}(r_{0,h}) = \sum_{t}\operatorname{Var}(r_t) + 2\sum_{t<u}\operatorname{Cov}(r_t, r_u).
$$
With uncorrelated returns of common variance $\sigma^2$ the second sum vanishes and the first is $h\sigma^2$. What is *not* required: normality or independence — only zero autocorrelation and constant variance. Counting $h - k$ pairs at lag $k$ gives the general formula; days to a year is the same with $h = N$.

**Clustering does not break $\sqrt{h}$ directly.** If $\sigma_t$ varies but returns stay uncorrelated, $\operatorname{Var}(r_{0,h}) = \sum_t \mathbb{E}[\sigma_t^2]$ still holds for the *unconditional* variance. What clustering breaks is applying the rule to a *conditional* estimate: scaling today's elevated $\sigma_t$ by $\sqrt{10}$ ignores mean reversion. The GARCH forecast makes it explicit:
$$
\mathbb{E}[\sigma_{t+k}^2 \mid \mathcal{F}_t] = \sigma_\infty^2 + (\alpha+\beta)^{k-1}\big(\sigma_{t+1}^2 - \sigma_\infty^2\big), \qquad k \ge 1,
$$
which pulls back to $\sigma_\infty^2$ at rate $\alpha + \beta$. Only when $\alpha + \beta = 1$ (EWMA) is a flat $\sqrt{h}$ extrapolation self-consistent.

**How noisy is an estimate?** For $n$ i.i.d. normal returns, $(n-1)\hat\sigma^2/\sigma^2 \sim \chi^2_{n-1}$, so $\operatorname{Var}(\hat\sigma^2) = 2\sigma^4/(n-1)$; the delta method with $g(x) = \sqrt{x}$, $g'(\sigma^2) = 1/(2\sigma)$, gives

::: formula Standard error of a volatility estimate
$$
\operatorname{sd}(\hat\sigma) \approx \frac{\sigma}{\sqrt{2n}}, \qquad \text{relative error } \frac{\operatorname{sd}(\hat\sigma)}{\sigma} \approx \frac{1}{\sqrt{2n}} .
$$
:::

A $10\%$ relative error needs $n = 1/(2 \cdot 0.01) = 50$ days; $1\%$ needs $n = 5000$, twenty years, during which volatility has certainly changed. Hence the central tension: a long window is precise about a parameter that no longer applies, a short one is timely and noisy. A 21-day realised vol carries a $\pm 15\%$ relative standard error, so a $22\%$ print is not distinguishable from $19\%$.

## Assumptions & Edge Cases

- **Range estimators miss overnight gaps.** They measure the intraday session only, so a name that gaps on earnings is badly understated. They also assume zero drift and continuous observation: a strong trend biases them, and discrete sampling puts the observed high and low inside the true ones, biasing them **down** ($-1\%$ to $-3\%$ for liquid names, worse for thin ones).
- **Zero-mean shortcut.** Setting $\bar{r} = 0$ is a bias–variance trade. Over 21 days the mean's estimation error dominates the drift, so the constrained estimator wins; over multi-year windows, subtract the mean.
- **Non-synchronous and stale prices.** Illiquid assets show artificially low volatility and correlation because prices do not update. The bid–ask bounce does the opposite at high frequency, creating negative autocorrelation and inflating realised variance — hence microstructure-noise-robust estimators.
- **$\alpha + \beta \ge 1$.** The GARCH unconditional variance $\omega/(1-\alpha-\beta)$ exists only when $\alpha + \beta < 1$. Estimated persistence very close to $1$ is common and usually signals an unmodelled structural break, not a unit root in variance.
- **Vol of what?** Price returns, a spread, a yield (basis-point vol) and a roll-adjusted futures series give different numbers. Quoting a vol without naming the series is as incomplete as a VaR without a horizon.

## Worked Example

Simulate a GARCH(1,1) series where the true conditional volatility is known, then compare a 21-day rolling window with an EWMA. Both are strict forecasts: each $\sigma_t$ uses returns up to $t-1$ only.

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

The EWMA's error is about $42\%$ smaller: the rolling window weights a 21-day-old return as much as yesterday's and drops observations abruptly, so one large move enters, sits flat for 21 days, then falls out and creates a phantom drop, while the EWMA decays smoothly with an $11$-day half-life. Realised unconditional volatility ($15.6\%$) sits near but not on the long-run level ($15.9\%$): even 4000 days leave sampling error, consistent with $1/\sqrt{2n} \approx 1.1\%$.

## Why It Matters in Quant Finance

- **The only free parameter in [[black-scholes]].** Spot, strike, expiry and rates are observable; volatility is not, so option pricing is *entirely* a volatility forecasting problem and quoting in vol units strips out everything else.
- **Implied volatility is a price, not a forecast.** It systematically exceeds subsequent realised volatility — the **variance risk premium**, roughly 1–3 vol points on index options — because sellers demand compensation for being short gamma into crashes. That it varies with strike and expiry (the smile) says the constant-vol model is wrong.
- **Volatility is tradable.** A delta-hedged option's P&L is $\tfrac12 \sum \Gamma S^2(r_t^2 - \sigma_{\text{impl}}^2 \Delta t)$, realised against implied variance (see [[greeks]]). A **variance swap** pays $N(\sigma_R^2 - K^2)$: *variance*, not volatility, is what options weighted $1/K^2$ plus a dynamic delta hedge replicate exactly (the log-contract argument). A volatility swap pays $\sqrt{\text{variance}}$, concave, so it needs a convexity adjustment and no static replication exists.
- **Risk limits and sizing.** Volatility is the $\sigma$ in parametric [[value-at-risk]], the scaling in vol-targeted strategies ($w_t \propto 1/\hat\sigma_t$), and the denominator of every Sharpe ratio.
- **The stylised facts drive model choice.** Volatility **clusters** (what GARCH captures); returns have **fat tails** even after conditioning; the **leverage effect** means negative returns raise future volatility more than positive ones (hence GJR-GARCH and the equity skew); and volatility **mean-reverts**. It is far more forecastable than returns: $R^2$ near $0$ is normal for returns, while $0.3$–$0.5$ for next-day variance is routine *when the target is a realised-variance proxy built from intraday data*. Against the squared daily return the $R^2$ is under $0.05$, that target being itself very noisy.

## Interview Questions

::: question Daily returns have a standard deviation of $1.2\%$. What is the annualised volatility, and what did you assume?
::: hint
Multiply by $\sqrt{N}$ with $N$ trading days.
:::
::: answer
$0.012\sqrt{252} = 0.012 \times 15.87 \approx 19.0\%$. Assumed: returns uncorrelated with constant variance (i.i.d. is sufficient but stronger than needed), log returns so they add, and $252$ trading days — a calendar convention ($\sqrt{365}$) gives $22.9\%$, so state it. Shortcut: $\sqrt{252} \approx 16$, so daily vol $\times 16 =$ annual vol, and $16\%$ annual is a $1\%$ daily move.
:::
:::

::: question Why does the market quote variance swaps rather than volatility swaps?
::: hint
Which of variance and volatility is a linear function of the payoff you can build from a static option portfolio?
:::
::: answer
Realised **variance** has an exact static replication: options across all strikes weighted $1/K^2$ (a log contract) plus a dynamic delta hedge reproduce $\sum r_t^2$ model-independently, so the variance swap strike is a genuine no-arbitrage quantity — the price of the replicating strip. Volatility is $\sqrt{\text{variance}}$, strictly concave, so by Jensen $\mathbb{E}[\sqrt{V}] < \sqrt{\mathbb{E}[V]}$: the vol swap strike sits below by a **convexity adjustment** depending on vol-of-vol, i.e. on a model. Dealers quote and hedge variance and derive vol swaps from it. The same convexity is why a variance swap pays far more in a crash: it is long vol-of-vol.
:::
:::

::: question You have 60 days of returns and estimate an annualised volatility of $25\%$. Give a rough confidence interval, and say what happens if you use 250 days instead.
::: hint
Use $\operatorname{sd}(\hat\sigma) \approx \sigma/\sqrt{2n}$.
:::
::: answer
Relative standard error $= 1/\sqrt{120} \approx 9.1\%$, so $\operatorname{sd}(\hat\sigma) \approx 2.3$ vol points and a rough $95\%$ interval is $25\% \pm 4.6\%$: roughly $20\%$ to $30\%$, a wide band around what looks precise. With 250 days the relative error falls to $1/\sqrt{500} \approx 4.5\%$, i.e. $\pm 2.2$ points — but that window averages over a year in which the true volatility has almost certainly moved, so precision is bought with relevance. It also assumes normality and constant variance; with fat tails and clustering the effective sample is smaller than $n$ and the interval wider.
:::
:::

::: question A trader says: "Realised vol is 15 %, the one-month option is implied at 19 %, so I should sell the option." What is wrong with that reasoning?
::: hint
Think about what the 4-point gap compensates, and about the shape of the P&L of the resulting position.
:::
::: answer
**The gap is expected.** Implied exceeds subsequent realised on average — the variance risk premium, 1–3 points on equity indices, more on the wings. It pays for a risk: the seller is short gamma and loses exactly when markets crash and their other positions do too. Small steady gains, occasional very large losses; not an arbitrage.

**Backward versus forward.** Trailing realised vol estimates the *past*, noisily; implied is a risk-neutral expectation over the *next* month. At 21 days a $15\%$ print is barely distinguishable from $17\%$, and a known event in the window should raise forward realised vol.

**Which implied?** One number hides the smile. The delta-hedged short P&L is $\tfrac12\sum \Gamma S^2 (r_t^2 - \sigma_{\text{impl}}^2\Delta t)$, weighted by gamma, so it depends on *where* the underlying spends its time: selling at $19\%$ and realising $16\%$ can still lose.
:::
:::
