---
title: Variance
subject: probability
summary: The expected squared deviation from the mean — the second central moment. It is the building block of covariance, correlation, portfolio risk and every least-squares method, and the reason diversification has a floor.
difficulty: 1
interview: 4
tags: [variance, moments, covariance, portfolio, estimation]
prerequisites: [conditional-probability]
related: [volatility, linear-regression]
---

## Intuition

The mean tells you where a random variable sits; the variance tells you how far it usually strays. Take the deviation $X - \mu$, square it so that positive and negative excursions both count as "spread", and average: that is the variance.

Squaring is not an arbitrary choice. It makes the variance **additive** across independent sources of randomness, and it makes the mean the point that minimises it — $\mathbb{E}[(X-c)^2]$ is smallest at $c = \mu$. Those two properties are why variance, and not the more natural-looking mean absolute deviation, sits underneath least squares, portfolio optimisation and the central limit theorem.

The price of squaring is a change of units. If $X$ is a return in per cent, $\operatorname{Var}(X)$ is in per cent squared, which nobody can read. Taking the square root gives the **standard deviation**, back in return units — and for returns that number has a name of its own, [[volatility]].

In finance, variance is the object you actually compute; volatility is the object you quote.

## Mathematical Formulation

::: formula Variance
$$
\operatorname{Var}(X) = \mathbb{E}\big[(X - \mu)^2\big] = \mathbb{E}[X^2] - \big(\mathbb{E}[X]\big)^2, \qquad \mu = \mathbb{E}[X],
$$
defined whenever $\mathbb{E}[X^2] < \infty$. The standard deviation is $\sigma = \sqrt{\operatorname{Var}(X)}$.
:::

Affine transformations rescale it quadratically and ignore shifts:

$$
\operatorname{Var}(aX + b) = a^2 \operatorname{Var}(X).
$$

For two variables, **covariance** measures co-movement and **correlation** normalises it:

::: formula Covariance and correlation
$$
\operatorname{Cov}(X, Y) = \mathbb{E}\big[(X - \mu_X)(Y - \mu_Y)\big] = \mathbb{E}[XY] - \mathbb{E}[X]\mathbb{E}[Y],
\qquad
\rho_{XY} = \frac{\operatorname{Cov}(X, Y)}{\sigma_X \sigma_Y} \in [-1, 1].
$$
:::

Variance of a sum, in general and for $n$ terms:

$$
\operatorname{Var}(X + Y) = \operatorname{Var}(X) + \operatorname{Var}(Y) + 2\operatorname{Cov}(X, Y),
\qquad
\operatorname{Var}\Big(\sum_i X_i\Big) = \sum_i \sum_j \operatorname{Cov}(X_i, X_j).
$$

Independence gives $\operatorname{Cov}(X,Y) = 0$ and hence additivity, but **uncorrelatedness alone is enough** for the variance formula: additivity needs only the covariance to vanish, not full independence.

For a portfolio with weights $w \in \mathbb{R}^n$ and covariance matrix $\Sigma$:

::: formula Portfolio variance
$$
\sigma_p^2 = w^\top \Sigma w = \sum_{i}\sum_{j} w_i w_j \sigma_i \sigma_j \rho_{ij},
$$
and for two assets $\;\sigma_p^2 = w_1^2\sigma_1^2 + w_2^2\sigma_2^2 + 2w_1w_2\rho\,\sigma_1\sigma_2$.
:::

$\Sigma$ is symmetric positive semi-definite precisely because $w^\top \Sigma w$ is a variance and variances cannot be negative.

Finally, conditioning splits variance into two pieces:

::: formula Law of total variance
$$
\operatorname{Var}(X) = \mathbb{E}\big[\operatorname{Var}(X \mid Y)\big] + \operatorname{Var}\big(\mathbb{E}[X \mid Y]\big).
$$
:::

## Derivation

**The computational form.** Expand the square and use linearity:

$$
\mathbb{E}[(X-\mu)^2] = \mathbb{E}[X^2 - 2\mu X + \mu^2] = \mathbb{E}[X^2] - 2\mu\,\mathbb{E}[X] + \mu^2 = \mathbb{E}[X^2] - \mu^2 .
$$

**Correlation is bounded.** Apply Cauchy–Schwarz to the centred variables: $|\mathbb{E}[(X-\mu_X)(Y-\mu_Y)]| \le \sigma_X \sigma_Y$, so $|\rho| \le 1$, with equality exactly when $Y = a + bX$ almost surely. Correlation is therefore a measure of **linear** dependence and nothing more.

**Diversification.** Take $n$ assets, each with variance $\sigma^2$, all pairs having the same covariance $c = \rho\sigma^2$, held in equal weights $w_i = 1/n$:

$$
\sigma_p^2 = \frac{1}{n^2}\Big( n\sigma^2 + n(n-1)c \Big) = \frac{\sigma^2}{n} + \Big(1 - \frac{1}{n}\Big) c .
$$

As $n \to \infty$ the first term vanishes: idiosyncratic risk is diversifiable. The second tends to $c = \rho\sigma^2$, so portfolio volatility bottoms out at $\sigma\sqrt{\rho}$. **Covariance sets the floor**, and no amount of names removes it.

**Bessel's correction.** With $\bar{X} = \frac1n\sum_i X_i$ from an i.i.d. sample,

$$
\mathbb{E}\Big[\sum_i (X_i - \bar{X})^2\Big] = \mathbb{E}\Big[\sum_i (X_i-\mu)^2\Big] - n\,\mathbb{E}\big[(\bar{X}-\mu)^2\big] = n\sigma^2 - n\cdot\frac{\sigma^2}{n} = (n-1)\sigma^2 .
$$

Dividing by $n-1$ therefore gives an unbiased estimator: $s^2 = \frac{1}{n-1}\sum_i (X_i - \bar{X})^2$. The intuition is that $\bar{X}$ has been fitted to the data, so the deviations around it are systematically too small; one degree of freedom has been spent.

**Law of total variance.** Using the tower property (see [[conditional-probability]]),

$$
\mathbb{E}[X^2] = \mathbb{E}\big[\mathbb{E}[X^2 \mid Y]\big] = \mathbb{E}\big[\operatorname{Var}(X\mid Y) + \mathbb{E}[X\mid Y]^2\big].
$$

Subtract $\big(\mathbb{E}[X]\big)^2 = \big(\mathbb{E}[\mathbb{E}[X\mid Y]]\big)^2$ from both sides and the right-hand side becomes $\mathbb{E}[\operatorname{Var}(X\mid Y)] + \operatorname{Var}(\mathbb{E}[X\mid Y])$.

Read it in finance: let $Y$ be the market regime. Total variance = **average within-regime variance** + **variance of the regime means**. A "calm/stressed" mixture can have a large total variance even if each regime is individually quiet, simply because the two means differ.

## Assumptions & Edge Cases

- **The second moment must exist.** A Student-$t$ with $\nu \le 2$ degrees of freedom, or a Cauchy, has infinite or undefined variance. Sample variances of such data grow with the sample size instead of converging, so every variance-based risk number is meaningless there.
- **Uncorrelated is weaker than independent.** With $X \sim \mathcal{N}(0,1)$ and $Y = X^2$, $\operatorname{Cov}(X,Y) = \mathbb{E}[X^3] = 0$ although $Y$ is a deterministic function of $X$. Correlation sees nothing; dependence is total.
- **The computational form is numerically dangerous.** $\mathbb{E}[X^2] - \mathbb{E}[X]^2$ subtracts two nearly equal large numbers when $\mu \gg \sigma$ (a price series, an index level). The relative rounding error is amplified by roughly $(\mu/\sigma)^2$, and the result can even come out negative. Use a two-pass or Welford update on centred data; `numpy.var` already does.
- **Sample covariance matrices are ill-conditioned.** With $n$ assets and $T$ observations, $\hat\Sigma$ is singular whenever $T \le n$, and its extreme eigenvalues are badly biased even for $T$ a few times $n$. Optimisers that invert $\hat\Sigma$ then chase noise, which is why shrinkage exists.
- **Weights must be treated consistently.** $w^\top \Sigma w$ assumes $w$ is fixed over the period. A rebalanced or drifting portfolio has a different variance from the one this formula returns.

## Worked Example

Simulate three correlated assets, check that the direct variance of the portfolio series and the quadratic form $w^\top\Sigma w$ agree, then trace the diversification curve.

```python
import numpy as np

rng = np.random.default_rng(7)

# Three assets: annualised vols and a correlation matrix.
sig = np.array([0.20, 0.30, 0.15])
C = np.array([[1.0, 0.5, 0.2], [0.5, 1.0, 0.3], [0.2, 0.3, 1.0]])
Sigma = np.outer(sig, sig) * C
w = np.array([0.5, 0.2, 0.3])

# Simulate 200_000 joint return draws and build the portfolio series.
R = rng.multivariate_normal(np.zeros(3), Sigma, size=200_000)
rp = R @ w

print(f"direct   Var(w'R) = {rp.var(ddof=1):.6f}")
print(f"quadratic w'Sw    = {w @ Sigma @ w:.6f}")
print(f"sample    w'S_hat w = {w @ np.cov(R, rowvar=False) @ w:.6f}")

# Diversification: n equally weighted assets, each vol 20 %, pairwise corr 0.3.
s, rho = 0.20, 0.3
print("\n n    portfolio vol")
for n in (1, 2, 5, 10, 50):
    var_n = s**2 / n + (1 - 1 / n) * rho * s**2
    print(f"{n:3d}    {np.sqrt(var_n):.4f}")
print(f"  inf    {s * np.sqrt(rho):.4f}   (correlation floor)")
```

::: output
```
direct   Var(w'R) = 0.025057
quadratic w'Sw    = 0.025045
sample    w'S_hat w = 0.025057

 n    portfolio vol
  1    0.2000
  2    0.1612
  5    0.1327
 10    0.1217
 50    0.1121
  inf    0.1095   (correlation floor)
```
:::

Two readings. First, $w^\top\Sigma w$ matches the direct sample variance to three significant figures — the sampling error, not a modelling error, explains the gap, and plugging in the *sample* covariance reproduces the direct number exactly, as it must. Second, in variance terms half of the achievable diversification is gone after 2 names and almost all of it after 10: going from 10 to 50 names buys $0.0096$ of volatility, while the correlation floor $\sigma\sqrt{\rho} = 0.20\sqrt{0.3} = 0.1095$ is untouchable.

## Why It Matters in Quant Finance

- **Risk is quoted as a variance.** Every risk number starts here: [[volatility]] is $\sqrt{\operatorname{Var}}$ of returns, parametric [[value-at-risk]] is $\mu + \sigma z_\alpha$, and vega in [[greeks]] is exposure to the volatility the market is pricing, while a delta-hedged book is exposed to the *variance* it realises.
- **Portfolio construction is a variance problem.** Markowitz minimises $w^\top\Sigma w$ subject to a return target; risk parity equalises each asset's contribution $w_i (\Sigma w)_i$ to it; risk budgeting decomposes it. All of them live or die on the quality of $\hat\Sigma$.
- **Least squares is variance decomposition.** In [[linear-regression]], $R^2$ is the fraction of the variance of $y$ explained by the fit, and OLS is exactly the estimator that minimises residual variance.
- **Hedging is variance minimisation.** The minimum-variance hedge ratio of an exposure $Y$ with an instrument $X$ is $\beta = \operatorname{Cov}(X,Y)/\operatorname{Var}(X)$ — the same formula as a regression slope, and no coincidence.
- **The law of total variance is the regime decomposition.** Splitting realised risk into within-regime and across-regime pieces is how one separates "the market is jumpy" from "the market has re-priced".

## Common Mistakes

::: pitfall Computing variance as $\mathbb{E}[X^2] - \mathbb{E}[X]^2$ on raw levels
On a series with mean $10^4$ and standard deviation $1$, the two terms agree to eight significant figures and double precision has about sixteen — you keep half your digits, and single precision would keep none. Centre the data first, or use Welford's online algorithm. A "negative variance" in production is almost always this bug.
:::

::: pitfall Reading zero correlation as independence
Correlation only detects the linear part of a relationship. A delta-hedged option book has near-zero correlation with the underlying by construction and is nonetheless entirely a bet on it, through gamma. Check scatterplots, rank correlations or tail dependence before concluding "no relationship".
:::

::: pitfall Assuming an unbiased variance gives an unbiased volatility
$s^2$ is unbiased for $\sigma^2$, but $\sqrt{\cdot}$ is strictly concave, so Jensen's inequality gives $\mathbb{E}[s] < \sqrt{\mathbb{E}[s^2]} = \sigma$. The usual estimator **under**states volatility, by about $\sigma/(4n)$ for moderate $n$ under normality. The bias is small next to the estimator's own noise, but the $n-1$ in the denominator does not fix it.
:::

::: pitfall Treating variance as a complete risk measure
Variance is symmetric: a $+10\%$ day and a $-10\%$ day contribute identically, though only one of them worries a risk manager. It also assumes a finite second moment, which fat-tailed models deliberately break. Pair it with a downside measure (semi-variance, expected shortfall) whenever the payoff is asymmetric — an option book above all.
:::

## 30-Second Revision

$\operatorname{Var}(X) = \mathbb{E}[(X-\mu)^2] = \mathbb{E}[X^2] - \mu^2$ — use the first form numerically, never the second on raw levels. $\operatorname{Var}(aX+b) = a^2\operatorname{Var}(X)$; variances add when covariances vanish, and uncorrelated is enough. Portfolio risk is $w^\top\Sigma w$; with $n$ equal weights it is $\sigma^2/n + (1-1/n)\rho\sigma^2$, so diversification stops at $\sigma\sqrt{\rho}$. Sample variance divides by $n-1$ (one degree of freedom spent on the mean), but its square root is still biased low. Law of total variance: within-group average plus between-group spread. Variance is symmetric and needs a finite second moment — never the whole risk story.

## Key Formulas

| Name | Formula |
|---|---|
| Definition | $\operatorname{Var}(X) = \mathbb{E}[(X-\mu)^2] = \mathbb{E}[X^2] - \mu^2$ |
| Affine map | $\operatorname{Var}(aX + b) = a^2\operatorname{Var}(X)$ |
| Sum | $\operatorname{Var}(X+Y) = \operatorname{Var}(X) + \operatorname{Var}(Y) + 2\operatorname{Cov}(X,Y)$ |
| Correlation | $\rho_{XY} = \operatorname{Cov}(X,Y)/(\sigma_X\sigma_Y) \in [-1,1]$ |
| Portfolio | $\sigma_p^2 = w^\top\Sigma w$ |
| Equal weights | $\sigma_p^2 = \dfrac{\sigma^2}{n} + \Big(1-\dfrac1n\Big)\rho\sigma^2 \;\to\; \rho\sigma^2$ |
| Sample variance | $s^2 = \dfrac{1}{n-1}\sum_i (X_i-\bar X)^2$ |
| Total variance | $\operatorname{Var}(X) = \mathbb{E}[\operatorname{Var}(X\mid Y)] + \operatorname{Var}(\mathbb{E}[X\mid Y])$ |

## Interview Questions

::: question Two assets each have volatility 20 % and correlation $0.5$. What is the volatility of the equally weighted portfolio?
::: hint
Use $\sigma_p^2 = w_1^2\sigma_1^2 + w_2^2\sigma_2^2 + 2w_1w_2\rho\sigma_1\sigma_2$ with $w_1 = w_2 = 1/2$.
:::
::: answer
$\sigma_p^2 = 0.25(0.04) + 0.25(0.04) + 2(0.25)(0.5)(0.04) = 0.01 + 0.01 + 0.01 = 0.03$, so $\sigma_p = \sqrt{0.03} \approx 17.3\%$.

Equivalently, with equal vols the formula collapses to $\sigma_p = \sigma\sqrt{(1+\rho)/2} = 0.20\sqrt{0.75}$. The check: $\rho = 1$ gives $20\%$ (no diversification), $\rho = -1$ gives $0$ (perfect hedge).
:::
:::

::: question Why does the sample variance divide by $n-1$? And is $s = \sqrt{s^2}$ then an unbiased estimator of $\sigma$?
::: hint
Compute $\mathbb{E}\big[\sum_i (X_i - \bar X)^2\big]$, then think about what a square root does to an expectation.
:::
::: answer
$\sum_i(X_i-\bar X)^2 = \sum_i (X_i-\mu)^2 - n(\bar X - \mu)^2$, whose expectation is $n\sigma^2 - n(\sigma^2/n) = (n-1)\sigma^2$. Deviations are measured around a mean fitted to the same data, so they are too small by exactly one degree of freedom; dividing by $n-1$ restores unbiasedness.

No, $s$ is not unbiased. The square root is strictly concave, so Jensen gives $\mathbb{E}[s] < \sqrt{\mathbb{E}[s^2]} = \sigma$: volatility is systematically underestimated. Under normality the exact correction is $\mathbb{E}[s] = c_4(n)\,\sigma$ with $c_4(n) = \sqrt{2/(n-1)}\,\Gamma(n/2)/\Gamma((n-1)/2)$, roughly $1 - 1/(4n)$. Unbiasedness does not survive a non-linear transformation.
:::
:::

::: question You hold $n$ equally weighted assets, each with volatility $\sigma$ and pairwise correlation $\rho > 0$. What is the limit of the portfolio volatility as $n \to \infty$, and how fast do you get there?
::: hint
Write the double sum as $n$ diagonal terms plus $n(n-1)$ off-diagonal ones.
:::
::: answer
$\sigma_p^2 = \frac{1}{n^2}\big(n\sigma^2 + n(n-1)\rho\sigma^2\big) = \frac{\sigma^2}{n} + \big(1-\frac1n\big)\rho\sigma^2 \to \rho\sigma^2$, so $\sigma_p \to \sigma\sqrt{\rho}$.

The excess over the floor is $\sigma^2(1-\rho)/n$, i.e. it decays like $1/n$ in variance and like $1/\sqrt{n}$ near the start in volatility: with $\sigma = 20\%$, $\rho = 0.3$, the floor is $10.95\%$ and you reach $12.2\%$ with just 10 names. Practically, the diversification gain is essentially exhausted by 20–30 names; beyond that you are only paying transaction costs. If $\rho \le 0$ the floor argument fails — but a correlation matrix with all pairs equal to $\rho$ is only positive semi-definite for $\rho \ge -1/(n-1)$, so a large book cannot be uniformly negatively correlated.
:::
:::

::: question A stock's daily return has volatility 1 % in a calm regime (probability 80 %) and 3 % in a stressed regime (probability 20 %). The mean return is $0$ in the calm regime and $-1\%$ in the stressed one. What is the unconditional volatility, and what would you be missing if you ignored the regime means?
::: hint
Law of total variance. Compute $\mathbb{E}[\operatorname{Var}(X\mid Y)]$ and $\operatorname{Var}(\mathbb{E}[X\mid Y])$ separately.
:::
::: answer
Within-regime term: $0.8(0.01)^2 + 0.2(0.03)^2 = 0.00008 + 0.00018 = 0.00026$.

Between-regime term: $\mathbb{E}[X] = 0.8(0) + 0.2(-0.01) = -0.002$, so $\operatorname{Var}(\mathbb{E}[X\mid Y]) = 0.8(0 + 0.002)^2 + 0.2(-0.01 + 0.002)^2 = 0.0000032 + 0.0000128 = 0.000016$.

Total $= 0.000276$, so $\sigma = 1.66\%$ per day, against $1.61\%$ if you kept only the within-regime part. Ignoring the difference in means understates risk by about 3 % here — modest, but it grows quadratically with the spread between regime means, and it is exactly the term that a naive "average the two vols" calculation drops. The same decomposition explains why a mixture of two normals has fat tails and excess kurtosis while each component is Gaussian: the unconditional distribution is not the average distribution.
:::
:::
