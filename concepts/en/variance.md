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

The mean tells you where a random variable sits; the variance tells you how far it usually strays. Take the deviation $X - \mu$, square it so positive and negative excursions both count as spread, and average.

Squaring is not arbitrary: it makes variance **additive** across independent sources of randomness, and makes the mean the point minimising it. That is why variance, not mean absolute deviation, sits under least squares, portfolio optimisation and the central limit theorem. Its square root, the **standard deviation**, is back in return units — for returns, [[volatility]]. You compute the variance and quote the volatility.

::: viz variance Variance as an average of squares
Drag any point. Each square is one squared deviation, so a single far point dominates the total — the mean and the variance both have no resistance to outliers.
:::

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

## Common Mistakes

::: pitfall Computing variance as $\mathbb{E}[X^2] - \mathbb{E}[X]^2$ on raw levels
On a series with mean $10^4$ and standard deviation $1$, the two terms agree to eight significant figures while double precision has about sixteen — you keep half your digits, single precision none. Centre first, or use Welford. A "negative variance" in production is almost always this bug.
:::

::: pitfall Reading zero correlation as independence
Correlation detects only the linear part of a relationship. A delta-hedged option book has near-zero correlation with the underlying by construction, yet is entirely a bet on it through gamma. Check scatterplots, rank correlations or tail dependence first.
:::

::: pitfall Assuming an unbiased variance gives an unbiased volatility
$s^2$ is unbiased for $\sigma^2$, but $\sqrt{\cdot}$ is strictly concave, so Jensen gives $\mathbb{E}[s] < \sqrt{\mathbb{E}[s^2]} = \sigma$: the usual estimator **under**states volatility, by about $\sigma/(4n)$ under normality. The $n-1$ does not fix it.
:::

::: pitfall Treating variance as a complete risk measure
A $+10\%$ day and a $-10\%$ day contribute identically, though only one worries a risk manager. It also assumes a finite second moment, which fat-tailed models deliberately break. Pair it with a downside measure (semi-variance, expected shortfall) whenever the payoff is asymmetric.
:::

## 30-Second Revision

$\operatorname{Var}(X) = \mathbb{E}[(X-\mu)^2] = \mathbb{E}[X^2] - \mu^2$ — use the first form numerically, never the second on raw levels. $\operatorname{Var}(aX+b) = a^2\operatorname{Var}(X)$; variances add when covariances vanish. Portfolio risk is $w^\top\Sigma w$; with $n$ equal weights, $\sigma^2/n + (1-1/n)\rho\sigma^2$, so diversification stops at $\sigma\sqrt{\rho}$. Sample variance divides by $n-1$, but its square root is still biased low. Total variance: within-group average plus between-group spread. Variance is symmetric and needs a finite second moment — never the whole risk story.

## Mathematical Formulation

::: formula Variance
$$
\operatorname{Var}(X) = \mathbb{E}\big[(X - \mu)^2\big] = \mathbb{E}[X^2] - \big(\mathbb{E}[X]\big)^2, \qquad \mu = \mathbb{E}[X],
$$
defined whenever $\mathbb{E}[X^2] < \infty$. The standard deviation is $\sigma = \sqrt{\operatorname{Var}(X)}$.
:::

Affine maps rescale it quadratically and ignore shifts:

$$
\operatorname{Var}(aX + b) = a^2 \operatorname{Var}(X).
$$

**Covariance** measures co-movement, **correlation** normalises it:

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

Independence gives $\operatorname{Cov}(X,Y) = 0$ and hence additivity, but **uncorrelatedness alone is enough**: additivity needs only the covariance to vanish.

For a portfolio with weights $w \in \mathbb{R}^n$ and covariance matrix $\Sigma$:

::: formula Portfolio variance
$$
\sigma_p^2 = w^\top \Sigma w = \sum_{i}\sum_{j} w_i w_j \sigma_i \sigma_j \rho_{ij},
$$
and for two assets $\;\sigma_p^2 = w_1^2\sigma_1^2 + w_2^2\sigma_2^2 + 2w_1w_2\rho\,\sigma_1\sigma_2$.
:::

$\Sigma$ is symmetric positive semi-definite precisely because $w^\top \Sigma w$ is a variance. Conditioning splits variance in two:

::: formula Law of total variance
$$
\operatorname{Var}(X) = \mathbb{E}\big[\operatorname{Var}(X \mid Y)\big] + \operatorname{Var}\big(\mathbb{E}[X \mid Y]\big).
$$
:::

## Derivation

**Computational form.** Expand the square and use linearity:

$$
\mathbb{E}[(X-\mu)^2] = \mathbb{E}[X^2 - 2\mu X + \mu^2] = \mathbb{E}[X^2] - 2\mu\,\mathbb{E}[X] + \mu^2 = \mathbb{E}[X^2] - \mu^2 .
$$

**Correlation is bounded.** Cauchy–Schwarz on the centred variables gives $|\mathbb{E}[(X-\mu_X)(Y-\mu_Y)]| \le \sigma_X \sigma_Y$, so $|\rho| \le 1$, with equality exactly when $Y = a + bX$ almost surely. Correlation measures **linear** dependence and nothing more.

**Diversification.** Take $n$ assets of variance $\sigma^2$, all pairs sharing covariance $c = \rho\sigma^2$, in equal weights $w_i = 1/n$:

$$
\sigma_p^2 = \frac{1}{n^2}\Big( n\sigma^2 + n(n-1)c \Big) = \frac{\sigma^2}{n} + \Big(1 - \frac{1}{n}\Big) c .
$$

As $n \to \infty$ the first term vanishes — idiosyncratic risk is diversifiable — while the second tends to $\rho\sigma^2$, so portfolio volatility bottoms out at $\sigma\sqrt{\rho}$. **Covariance sets the floor**, and no amount of names removes it.

**Bessel's correction.** With $\bar{X} = \frac1n\sum_i X_i$ from an i.i.d. sample,

$$
\mathbb{E}\Big[\sum_i (X_i - \bar{X})^2\Big] = \mathbb{E}\Big[\sum_i (X_i-\mu)^2\Big] - n\,\mathbb{E}\big[(\bar{X}-\mu)^2\big] = n\sigma^2 - n\cdot\frac{\sigma^2}{n} = (n-1)\sigma^2 .
$$

Dividing by $n-1$ gives the unbiased $s^2 = \frac{1}{n-1}\sum_i (X_i - \bar{X})^2$: $\bar{X}$ was fitted to the data, so deviations around it are systematically too small — one degree of freedom spent.

**Law of total variance.** Using the tower property (see [[conditional-probability]]),

$$
\mathbb{E}[X^2] = \mathbb{E}\big[\mathbb{E}[X^2 \mid Y]\big] = \mathbb{E}\big[\operatorname{Var}(X\mid Y) + \mathbb{E}[X\mid Y]^2\big].
$$

Subtract $\big(\mathbb{E}[X]\big)^2 = \big(\mathbb{E}[\mathbb{E}[X\mid Y]]\big)^2$ from both sides and the right-hand side becomes $\mathbb{E}[\operatorname{Var}(X\mid Y)] + \operatorname{Var}(\mathbb{E}[X\mid Y])$.

With $Y$ the market regime: total variance = **average within-regime variance** + **variance of the regime means**. A calm/stressed mixture can have large total variance even if each regime is quiet, simply because the means differ.

## Assumptions & Edge Cases

- **The second moment must exist.** A Student-$t$ with $\nu \le 2$, or a Cauchy, has infinite or undefined variance; sample variances grow with sample size instead of converging, so every variance-based risk number is meaningless there.
- **Uncorrelated is weaker than independent.** With $X \sim \mathcal{N}(0,1)$ and $Y = X^2$, $\operatorname{Cov}(X,Y) = \mathbb{E}[X^3] = 0$ although $Y$ is a deterministic function of $X$.
- **The computational form is numerically dangerous.** $\mathbb{E}[X^2] - \mathbb{E}[X]^2$ subtracts two nearly equal large numbers when $\mu \gg \sigma$; the relative rounding error is amplified by roughly $(\mu/\sigma)^2$ and the result can come out negative. Use two passes or Welford on centred data, as `numpy.var` does.
- **Sample covariance matrices are ill-conditioned.** $\hat\Sigma$ is singular whenever $T \le n$, and its extreme eigenvalues are badly biased even for $T$ a few times $n$. Optimisers inverting it chase noise — hence shrinkage.
- **Weights must be treated consistently.** $w^\top \Sigma w$ assumes $w$ fixed over the period; a rebalanced or drifting portfolio has a different variance.

## Worked Example

Three correlated assets: check that the direct variance of the portfolio series and $w^\top\Sigma w$ agree, then trace the diversification curve.

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

$w^\top\Sigma w$ matches the direct sample variance to three significant figures — sampling error, not modelling error, explains the gap, and the *sample* covariance reproduces the direct number exactly, as it must. And half the achievable diversification is gone after 2 names, almost all after 10: 10 to 50 names buys $0.0096$ of volatility, while the floor $\sigma\sqrt{\rho} = 0.20\sqrt{0.3} = 0.1095$ is untouchable.

## Why It Matters in Quant Finance

- **Risk is quoted as a variance.** [[volatility]] is $\sqrt{\operatorname{Var}}$ of returns, parametric [[value-at-risk]] is $\mu + \sigma z_\alpha$, vega in [[greeks]] is exposure to priced volatility, and a delta-hedged book is exposed to *realised* variance.
- **Portfolio construction is a variance problem.** Markowitz minimises $w^\top\Sigma w$ under a return target; risk parity equalises each contribution $w_i (\Sigma w)_i$. All live or die on the quality of $\hat\Sigma$.
- **Least squares is variance decomposition.** In [[linear-regression]], $R^2$ is the fraction of the variance of $y$ explained, and OLS minimises residual variance.
- **Hedging is variance minimisation.** The minimum-variance hedge ratio is $\beta = \operatorname{Cov}(X,Y)/\operatorname{Var}(X)$ — the regression slope, and no coincidence.
- **The law of total variance is the regime decomposition.** It separates "the market is jumpy" from "the market has re-priced".

## Interview Questions

::: question Two assets each have volatility 20 % and correlation $0.5$. What is the volatility of the equally weighted portfolio?
::: hint
Use $\sigma_p^2 = w_1^2\sigma_1^2 + w_2^2\sigma_2^2 + 2w_1w_2\rho\sigma_1\sigma_2$ with $w_1 = w_2 = 1/2$.
:::
::: answer
$\sigma_p^2 = 0.25(0.04) + 0.25(0.04) + 2(0.25)(0.5)(0.04) = 0.01 + 0.01 + 0.01 = 0.03$, so $\sigma_p = \sqrt{0.03} \approx 17.3\%$. With equal vols the formula collapses to $\sigma_p = \sigma\sqrt{(1+\rho)/2} = 0.20\sqrt{0.75}$; $\rho = 1$ gives $20\%$ (no diversification), $\rho = -1$ gives $0$ (perfect hedge).
:::
:::

::: question Why does the sample variance divide by $n-1$? And is $s = \sqrt{s^2}$ then an unbiased estimator of $\sigma$?
::: hint
Compute $\mathbb{E}\big[\sum_i (X_i - \bar X)^2\big]$, then think about what a square root does to an expectation.
:::
::: answer
$\sum_i(X_i-\bar X)^2 = \sum_i (X_i-\mu)^2 - n(\bar X - \mu)^2$, whose expectation is $n\sigma^2 - n(\sigma^2/n) = (n-1)\sigma^2$. Deviations are measured around a mean fitted to the same data, so they are too small by one degree of freedom.

No, $s$ is not unbiased: the square root is concave, so Jensen gives $\mathbb{E}[s] < \sqrt{\mathbb{E}[s^2]} = \sigma$. Under normality $\mathbb{E}[s] = c_4(n)\,\sigma$ with $c_4(n) = \sqrt{2/(n-1)}\,\Gamma(n/2)/\Gamma((n-1)/2)$, roughly $1 - 1/(4n)$. Unbiasedness does not survive a non-linear transformation.
:::
:::

::: question You hold $n$ equally weighted assets, each with volatility $\sigma$ and pairwise correlation $\rho > 0$. What is the limit of portfolio volatility as $n \to \infty$, and how fast do you get there?
::: hint
Write the double sum as $n$ diagonal terms plus $n(n-1)$ off-diagonal ones.
:::
::: answer
$\sigma_p^2 = \frac{1}{n^2}\big(n\sigma^2 + n(n-1)\rho\sigma^2\big) = \frac{\sigma^2}{n} + \big(1-\frac1n\big)\rho\sigma^2 \to \rho\sigma^2$, so $\sigma_p \to \sigma\sqrt{\rho}$.

The excess over the floor is $\sigma^2(1-\rho)/n$, decaying like $1/n$ in variance: with $\sigma = 20\%$, $\rho = 0.3$, the floor is $10.95\%$ and 10 names already reach $12.2\%$. The gain is essentially exhausted by 20–30 names; beyond that you only pay transaction costs. If $\rho \le 0$ the floor argument fails — but an equicorrelation matrix is positive semi-definite only for $\rho \ge -1/(n-1)$, so a large book cannot be uniformly negatively correlated.
:::
:::

::: question A stock's daily return has volatility 1 % in a calm regime (probability 80 %) and 3 % in a stressed one (20 %), with mean $0$ and $-1\%$ respectively. What is the unconditional volatility, and what do you miss by ignoring the regime means?
::: hint
Law of total variance. Compute $\mathbb{E}[\operatorname{Var}(X\mid Y)]$ and $\operatorname{Var}(\mathbb{E}[X\mid Y])$ separately.
:::
::: answer
Within-regime term: $0.8(0.01)^2 + 0.2(0.03)^2 = 0.00008 + 0.00018 = 0.00026$.

Between-regime term: $\mathbb{E}[X] = 0.8(0) + 0.2(-0.01) = -0.002$, so $\operatorname{Var}(\mathbb{E}[X\mid Y]) = 0.8(0 + 0.002)^2 + 0.2(-0.01 + 0.002)^2 = 0.0000032 + 0.0000128 = 0.000016$.

Total $= 0.000276$, so $\sigma = 1.66\%$ per day, against $1.61\%$ keeping only the within-regime part. Ignoring the difference in means understates risk by about 3 % here — modest, but it grows quadratically with the spread between regime means, and it is exactly what a naive "average the two vols" drops. The same decomposition explains why a mixture of two normals has fat tails while each component is Gaussian: the unconditional distribution is not the average distribution.
:::
:::
