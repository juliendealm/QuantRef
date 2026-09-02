---
title: Linear Regression
subject: statistics
summary: Fitting y = Xβ + ε by least squares, i.e. projecting y onto the span of the regressors. Betas, factor models, hedge ratios and most "alpha" claims are regressions, so knowing exactly when its standard errors lie is a core quant skill.
difficulty: 2
interview: 4
tags: [statistics, regression, ols, beta, factor-models, hypothesis-testing]
prerequisites: []
related: [kalman-filter, value-at-risk]
---

## Intuition

You have a cloud of points $(x_i, y_i)$ — say the daily returns of a stock against the market — and you want the straight line that explains $y$ by $x$ as well as possible. "As well as possible" in least squares means: choose the line so that the sum of squared vertical distances from the points to the line is as small as it can be.

Geometrically, stack the $y_i$ into a vector $\mathbf{y} \in \mathbb{R}^n$ and the regressors into the columns of a matrix $\mathbf{X}$. Any fitted vector $\mathbf{X}\boldsymbol\beta$ lives in the column space of $\mathbf{X}$, a $k$-dimensional plane inside $\mathbb{R}^n$. Least squares picks the point of that plane **closest** to $\mathbf{y}$: the orthogonal projection. The residual $\mathbf{y} - \hat{\mathbf{y}}$ is perpendicular to every regressor. Everything else — normal equations, closed form, $R^2$ — is a corollary of that right angle.

The statistics come in when we ask how much the fitted line would move if we drew another sample. Standard errors answer that question, and they are only trustworthy under assumptions that financial data routinely violate.

## Mathematical Formulation

Model: $\mathbf{y} = \mathbf{X}\boldsymbol\beta + \boldsymbol\varepsilon$, with $\mathbf{X}$ an $n \times k$ matrix of full column rank whose first column is all ones (the intercept).

::: formula Normal equations and OLS estimator
$$
\mathbf{X}^\top\mathbf{X}\,\hat{\boldsymbol\beta} = \mathbf{X}^\top\mathbf{y}
\qquad\Longrightarrow\qquad
\hat{\boldsymbol\beta} = (\mathbf{X}^\top\mathbf{X})^{-1}\mathbf{X}^\top\mathbf{y}.
$$
With a single regressor, $\hat\beta = \dfrac{\operatorname{Cov}(x, y)}{\operatorname{Var}(x)}$ and $\hat\alpha = \bar y - \hat\beta\,\bar x$.
:::

::: formula Projection
$$
\hat{\mathbf{y}} = \mathbf{P}\mathbf{y}, \qquad \mathbf{P} = \mathbf{X}(\mathbf{X}^\top\mathbf{X})^{-1}\mathbf{X}^\top, \qquad \mathbf{P}^2 = \mathbf{P} = \mathbf{P}^\top, \qquad \mathbf{X}^\top(\mathbf{y} - \hat{\mathbf{y}}) = \mathbf{0}.
$$
:::

**Gauss–Markov assumptions.** (i) Linearity in the parameters; (ii) $\mathbf{X}$ of full rank (no perfect collinearity); (iii) strict exogeneity, $\mathbb{E}[\boldsymbol\varepsilon \mid \mathbf{X}] = \mathbf{0}$; (iv) spherical errors, $\operatorname{Var}(\boldsymbol\varepsilon \mid \mathbf{X}) = \sigma^2\mathbf{I}$ (homoskedastic and uncorrelated). Under (i)–(iv), OLS is **BLUE**: the best (minimum-variance) linear unbiased estimator. Normality of the errors is *not* needed for that; it is needed for the $t$ and $F$ statistics to have exact finite-sample distributions (asymptotically they hold without it).

::: formula Covariance, standard errors, t-statistic
$$
\operatorname{Var}(\hat{\boldsymbol\beta} \mid \mathbf{X}) = \sigma^2 (\mathbf{X}^\top\mathbf{X})^{-1}, \qquad
\hat\sigma^2 = \frac{\hat{\boldsymbol\varepsilon}^\top\hat{\boldsymbol\varepsilon}}{n - k}, \qquad
t_j = \frac{\hat\beta_j - \beta_j^{0}}{\operatorname{se}(\hat\beta_j)} \sim t_{n-k} \text{ under } H_0 : \beta_j = \beta_j^{0}.
$$
Single regressor: $\operatorname{se}(\hat\beta) = \hat\sigma \big/ \sqrt{\sum_i (x_i - \bar x)^2}$.
:::

::: formula Coefficient of determination
$$
R^2 = 1 - \frac{\mathrm{RSS}}{\mathrm{TSS}} = 1 - \frac{\sum_i \hat\varepsilon_i^2}{\sum_i (y_i - \bar y)^2}, \qquad
\bar R^2 = 1 - (1 - R^2)\,\frac{n-1}{n-k}.
$$
With one regressor, $R^2 = \operatorname{corr}(x, y)^2$.
:::

**Robust standard errors.** When (iv) fails, $\hat{\boldsymbol\beta}$ stays unbiased but its covariance becomes the *sandwich* $(\mathbf{X}^\top\mathbf{X})^{-1}\,\mathbf{X}^\top\boldsymbol\Omega\mathbf{X}\,(\mathbf{X}^\top\mathbf{X})^{-1}$ with $\boldsymbol\Omega = \operatorname{Var}(\boldsymbol\varepsilon)$. White's estimator puts the squared residuals $\hat\varepsilon_i^2$ on the diagonal of $\boldsymbol\Omega$ (heteroskedasticity); Newey–West adds the residual autocovariances up to lag $L$ with Bartlett weights $1 - \ell/(L+1)$ (heteroskedasticity *and* autocorrelation, "HAC"). Both leave the point estimates untouched: they only repair the $t$-statistics, which is usually what was wrong.

## Derivation

Minimise $S(\boldsymbol\beta) = (\mathbf{y} - \mathbf{X}\boldsymbol\beta)^\top(\mathbf{y} - \mathbf{X}\boldsymbol\beta) = \mathbf{y}^\top\mathbf{y} - 2\boldsymbol\beta^\top\mathbf{X}^\top\mathbf{y} + \boldsymbol\beta^\top\mathbf{X}^\top\mathbf{X}\boldsymbol\beta$. The gradient is $\nabla S = -2\mathbf{X}^\top\mathbf{y} + 2\mathbf{X}^\top\mathbf{X}\boldsymbol\beta$; setting it to zero gives the normal equations, and the Hessian $2\mathbf{X}^\top\mathbf{X}$ is positive definite under full rank, so the solution is the unique minimum.

The normal equations say $\mathbf{X}^\top(\mathbf{y} - \mathbf{X}\hat{\boldsymbol\beta}) = \mathbf{0}$: the residual is orthogonal to each column of $\mathbf{X}$. With an intercept, one column is $\mathbf{1}$, so the residuals sum to zero and $\hat{\mathbf{y}}$ has the same mean as $\mathbf{y}$. That orthogonality gives the Pythagorean decomposition $\mathrm{TSS} = \mathrm{ESS} + \mathrm{RSS}$, hence $R^2 \in [0, 1]$; without an intercept the decomposition fails and $R^2$ can be negative or meaningless.

**Unbiasedness and variance.** Substituting $\mathbf{y} = \mathbf{X}\boldsymbol\beta + \boldsymbol\varepsilon$,
$$
\hat{\boldsymbol\beta} = \boldsymbol\beta + (\mathbf{X}^\top\mathbf{X})^{-1}\mathbf{X}^\top\boldsymbol\varepsilon,
$$
so $\mathbb{E}[\hat{\boldsymbol\beta} \mid \mathbf{X}] = \boldsymbol\beta$ by exogeneity, and
$$
\operatorname{Var}(\hat{\boldsymbol\beta} \mid \mathbf{X}) = (\mathbf{X}^\top\mathbf{X})^{-1}\mathbf{X}^\top\,\operatorname{Var}(\boldsymbol\varepsilon)\,\mathbf{X}(\mathbf{X}^\top\mathbf{X})^{-1},
$$
which collapses to $\sigma^2(\mathbf{X}^\top\mathbf{X})^{-1}$ when $\operatorname{Var}(\boldsymbol\varepsilon) = \sigma^2\mathbf{I}$ and is the sandwich otherwise. The divisor $n - k$ in $\hat\sigma^2$ makes it unbiased because $\hat{\boldsymbol\varepsilon} = (\mathbf{I} - \mathbf{P})\boldsymbol\varepsilon$ and $\operatorname{tr}(\mathbf{I} - \mathbf{P}) = n - k$.

**Single regressor.** With $\mathbf{X} = [\mathbf{1}, \mathbf{x}]$ the $2\times 2$ system solves to $\hat\beta = \sum_i(x_i - \bar x)(y_i - \bar y) \big/ \sum_i(x_i - \bar x)^2 = \operatorname{Cov}(x,y)/\operatorname{Var}(x)$, and the $(2,2)$ entry of $\sigma^2(\mathbf{X}^\top\mathbf{X})^{-1}$ is $\sigma^2/\sum_i(x_i - \bar x)^2$. The standard error shrinks like $1/\sqrt{n}$ and with the spread of the regressor: a beta is measured more precisely in volatile markets.

## Assumptions & Edge Cases

- **Exogeneity is the assumption that bites.** Omitted variables correlated with the regressors, simultaneity (does order flow cause returns or the reverse?) and measurement error in $x$ all bias $\hat{\boldsymbol\beta}$, and no amount of data or robust standard errors fixes bias. Errors-in-variables specifically shrinks $\hat\beta$ towards zero (attenuation): a beta estimated against a noisy factor proxy comes out too small.
- **Non-stationary regressors.** Regressing one random walk on an independent random walk gives a "significant" $t$-statistic most of the time and an $R^2$ that does not vanish as $n \to \infty$ (Granger and Newbold, 1974). Prices are close to random walks; returns are not. Regress returns on returns, or test for cointegration when you genuinely need levels.
- **Heteroskedasticity and autocorrelation** do not bias $\hat{\boldsymbol\beta}$ but make the classic standard errors wrong — with volatility clustering, usually too small. Overlapping returns (12-month returns sampled monthly) are autocorrelated *by construction*; use Newey–West with at least as many lags as the overlap.
- **Multicollinearity** inflates standard errors without biasing anything: individual coefficients become unstable in sign while the overall fit stays fine. Ridge regression trades a little bias for a lot of variance.
- **Outliers** have leverage $h_{ii} = 1/n + (x_i - \bar x)^2 / \sum_j (x_j - \bar x)^2$, increasing in the squared distance from the mean: one crash day can set the beta by itself. Winsorise, or at least look at the leverage.
- **Regression direction is not symmetric.** Regressing $y$ on $x$ gives slope $\rho\,\sigma_y/\sigma_x$; regressing $x$ on $y$ gives $\rho\,\sigma_x/\sigma_y$, whose reciprocal $\sigma_y/(\rho\,\sigma_x)$ is a different line unless $\lvert\rho\rvert = 1$. For a hedge ratio, decide which leg is being hedged, or use total least squares.

## Worked Example

Estimate a stock's market beta from one year of daily returns using nothing but the normal equations, then verify against `np.polyfit`. The data are simulated with a true $\beta = 1.3$ and a true daily alpha of $0.0002$.

```python
import numpy as np
from scipy import stats

rng = np.random.default_rng(3)
n = 250                                             # one year of daily returns
r_m = rng.normal(0.0004, 0.010, n)                  # market excess returns
r_s = 0.0002 + 1.3 * r_m + rng.normal(0, 0.015, n)  # stock: true alpha 0.0002, beta 1.3

# OLS via the normal equations (X'X) b = X'y
X = np.column_stack([np.ones(n), r_m])
b = np.linalg.solve(X.T @ X, X.T @ r_s)
resid = r_s - X @ b
dof = n - X.shape[1]
s2 = resid @ resid / dof                            # unbiased residual variance
se = np.sqrt(np.diag(s2 * np.linalg.inv(X.T @ X)))
t = b / se
p = 2 * stats.t.sf(np.abs(t), dof)
r2 = 1 - resid @ resid / np.sum((r_s - r_s.mean()) ** 2)

print(f"alpha = {b[0]:+.5f}   se = {se[0]:.5f}   t = {t[0]:5.2f}   p = {p[0]:.3f}")
print(f"beta  = {b[1]:+.4f}    se = {se[1]:.4f}    t = {t[1]:5.2f}   p = {p[1]:.1e}")
print(f"R^2   = {r2:.3f}")
print(f"cov/var check: beta = {np.cov(r_s, r_m)[0, 1] / np.var(r_m, ddof=1):.4f}")
slope, intercept = np.polyfit(r_m, r_s, 1)
print(f"np.polyfit:    beta = {slope:.4f}, alpha = {intercept:+.5f}")
```

::: output
```
alpha = +0.00172   se = 0.00094   t =  1.83   p = 0.069
beta  = +1.3292    se = 0.0923    t = 14.40   p = 1.5e-34
R^2   = 0.455
cov/var check: beta = 1.3292
np.polyfit:    beta = 1.3292, alpha = +0.00172
```
:::

Three lessons in five lines. The beta comes out as $1.33 \pm 0.09$, comfortably covering the true $1.3$. The alpha estimate of 17 basis points per day looks impressive (over 40 % annualised) yet its $t$-statistic is 1.83: not significant at 5 %, and the true value $0.0002$ sits well inside two standard errors — this is what "alpha is hard to measure" means numerically: one year of daily data cannot tell a 5 % annual alpha from zero. The $R^2$ of 0.455 is typical for a single stock against the market; the other half of the variance is idiosyncratic, and a modest $R^2$ is not the sign of a bad regression.

## Why It Matters in Quant Finance

- **Beta and the CAPM.** $r_i - r_f = \alpha_i + \beta_i (r_m - r_f) + \varepsilon_i$ is the first regression every quant runs: $\beta$ prices systematic risk, $\alpha$ is the claimed skill, and the test of $\alpha = 0$ is a $t$-test with all the caveats above.
- **Factor models.** Fama–French and every commercial multi-factor risk model are multiple regressions of returns on factor returns. The residual variance is the "specific risk" that feeds a [[value-at-risk]] model, and the betas map thousands of positions onto a small factor covariance matrix.
- **Hedge ratios.** The number of units of $B$ needed to hedge a position in $A$ is the slope of $r_A$ on $r_B$: a minimum-variance hedge *is* a regression coefficient. For a pairs trade, the Engle–Granger recipe regresses *log prices* and then tests the residual for stationarity (ADF test); without that second step, the regression on prices is spurious.
- **Time-varying betas.** When the coefficient itself drifts, the natural extension is to make $\beta_t$ a state and filter it: the [[kalman-filter]] is recursive least squares with forgetting, and its steady-state gain tells you how much history it effectively uses.
- **Multiple testing in factor research.** Screen 300 candidate factors at the 5 % level and 15 will look "significant" by luck alone. Harvey, Liu and Zhu (2016) argue for a $t$-statistic hurdle of 3 rather than 2 for a newly proposed factor; Bonferroni-type corrections and out-of-sample validation are the everyday defences against data snooping, and an in-sample $R^2$ is the standard way a backtest lies.
- **Signal research.** A forecasting regression of $r_{t+1}$ on a signal $s_t$ has an $R^2$ of 1 % on a good day. That is normal; the question is whether the slope is stable out of sample, not whether the $R^2$ is high.

## Common Mistakes

::: pitfall Regressing prices instead of returns
Two unrelated random walks give a high $R^2$ and a huge $t$-statistic. Prices are non-stationary; the residual inherits a unit root and the standard errors mean nothing. Use returns, or test for cointegration first.
:::

::: pitfall Chasing $R^2$
Adding a regressor never lowers $R^2$, so the statistic rewards overfitting. A daily-return regression with $R^2 = 0.02$ can be a profitable signal; a price regression with $R^2 = 0.98$ can be pure noise. Use $\bar R^2$, information criteria and, above all, out-of-sample fit.
:::

::: pitfall Classic standard errors on financial data
Volatility clustering (heteroskedasticity) and overlapping observations (autocorrelation) make $\sigma^2(\mathbf{X}^\top\mathbf{X})^{-1}$ wrong, typically too small, so $t$-statistics are inflated. Report White or Newey–West standard errors by default.
:::

::: pitfall Confusing significance with size
A $t$-statistic of 5 on a coefficient of 0.001 says the effect is precisely estimated, not that it is large enough to trade after costs. Conversely, an alpha with $t = 1.8$ can be economically huge and still unmeasurable.
:::

## 30-Second Revision

OLS projects $\mathbf{y}$ onto the span of $\mathbf{X}$: $\hat{\boldsymbol\beta} = (\mathbf{X}^\top\mathbf{X})^{-1}\mathbf{X}^\top\mathbf{y}$, residuals orthogonal to the regressors, single-regressor slope $\operatorname{Cov}(x,y)/\operatorname{Var}(x)$. Gauss–Markov (exogeneity plus spherical errors) makes it BLUE; $\operatorname{Var}(\hat{\boldsymbol\beta}) = \sigma^2(\mathbf{X}^\top\mathbf{X})^{-1}$ and $t = \hat\beta/\operatorname{se}$. $R^2 = 1 - \mathrm{RSS}/\mathrm{TSS}$ rises with any added regressor and is meaningless on prices. Use robust (White / Newey–West) standard errors, regress returns not prices, and raise the $t$ hurdle when many factors were tried.

## Key Formulas

| Name | Formula |
|---|---|
| OLS estimator | $\hat{\boldsymbol\beta} = (\mathbf{X}^\top\mathbf{X})^{-1}\mathbf{X}^\top\mathbf{y}$ |
| Simple slope | $\hat\beta = \operatorname{Cov}(x,y)/\operatorname{Var}(x)$, $\hat\alpha = \bar y - \hat\beta\bar x$ |
| Projection matrix | $\mathbf{P} = \mathbf{X}(\mathbf{X}^\top\mathbf{X})^{-1}\mathbf{X}^\top$ |
| Covariance of $\hat{\boldsymbol\beta}$ | $\sigma^2(\mathbf{X}^\top\mathbf{X})^{-1}$, with $\hat\sigma^2 = \mathrm{RSS}/(n-k)$ |
| Simple slope s.e. | $\hat\sigma \big/ \sqrt{\sum_i (x_i - \bar x)^2}$ |
| $R^2$ | $1 - \mathrm{RSS}/\mathrm{TSS}$; $\bar R^2 = 1 - (1-R^2)\frac{n-1}{n-k}$ |
| Sandwich covariance | $(\mathbf{X}^\top\mathbf{X})^{-1}\mathbf{X}^\top\boldsymbol\Omega\mathbf{X}(\mathbf{X}^\top\mathbf{X})^{-1}$ |

## Interview Questions

::: question Show that with one regressor and an intercept, the OLS slope is $\operatorname{Cov}(x,y)/\operatorname{Var}(x)$ and the residuals sum to zero.
::: hint
Write the two normal equations, one per column of $\mathbf{X} = [\mathbf{1}, \mathbf{x}]$.
:::
::: answer
The first normal equation is $\mathbf{1}^\top(\mathbf{y} - \hat\alpha\mathbf{1} - \hat\beta\mathbf{x}) = 0$, i.e. $\sum_i \hat\varepsilon_i = 0$ and $\hat\alpha = \bar y - \hat\beta\bar x$. Substituting into the second, $\mathbf{x}^\top(\mathbf{y} - \hat\alpha\mathbf{1} - \hat\beta\mathbf{x}) = 0$, gives $\sum_i x_i(y_i - \bar y) = \hat\beta\sum_i x_i(x_i - \bar x)$, and since $\sum_i \bar x (y_i - \bar y) = 0 = \sum_i \bar x(x_i - \bar x)$, this is $\hat\beta = \sum_i (x_i - \bar x)(y_i - \bar y)/\sum_i (x_i - \bar x)^2$.
:::
:::

::: question A beta regression on 250 daily returns gives $\hat\beta = 1.2$ with standard error 0.15. Is the beta significantly different from 1? How many observations would you need to bring the standard error down to 0.05?
::: hint
The test statistic is $(\hat\beta - 1)/\operatorname{se}$; the standard error scales like $1/\sqrt{n}$.
:::
::: answer
$t = (1.2 - 1)/0.15 = 1.33$, well below the critical value $1.97$ ($t_{248}$ at 5 %): not significantly different from 1. The 95 % interval is $1.2 \pm 1.97 \times 0.15 = [0.90, 1.50]$. Dividing the standard error by 3 requires 9 times the data, about 2 250 days or 9 years — by which time the beta will have changed. This is why betas are shrunk towards 1 (Vasicek/Bloomberg adjustment) or filtered rather than estimated on a short window.
:::
:::

::: question You regress the price of stock A on the price of stock B and obtain $R^2 = 0.95$ with $t = 40$ on the slope. A colleague concludes the pair is an excellent hedge. What do you say?
::: hint
What is the time-series behaviour of prices, and what does the residual look like if the two are not related?
:::
::: answer
Prices are close to random walks, so this is very likely a spurious regression: two independent random walks routinely give $R^2$ near 1 and enormous $t$-statistics, because the residual is itself a random walk and the classic standard errors assume it is stationary. The right checks are (a) regress returns on returns — the $t$-statistic will collapse if the pair is unrelated — and (b) if you need a price-level hedge ratio, test the residual of the price regression for stationarity (ADF), i.e. test for cointegration. Only a cointegrated pair has a meaningful price-level hedge ratio, and even then the regression direction matters and the ratio drifts, which argues for a [[kalman-filter|Kalman-filtered]] ratio.
:::
:::

::: question You screen 200 candidate signals and find 12 with $\lvert t \rvert > 2$ in sample. How many would you expect by chance? What hurdle would you use, and why is in-sample $R^2$ optimistic even for a true signal?
::: hint
Two-sided 5 % test under the null; Bonferroni; and think about what $R^2$ measures when the coefficients were chosen on the same data.
:::
::: answer
Under the null of no predictability, each signal passes with probability 5 %, so 10 of 200 are expected by chance; 12 is unremarkable. A Bonferroni correction tests each at $0.05/200 = 0.00025$, i.e. $\lvert t\rvert > 3.7$; Harvey, Liu and Zhu's recommended hurdle for a new factor is $t > 3$; and a false-discovery-rate procedure is the modern compromise. Even for a genuine signal, in-sample $R^2$ is biased upwards because the coefficients were optimised on the same data: with $k$ columns in $\mathbf{X}$ (intercept included) and no true relation, $\mathbb{E}[R^2] = (k-1)/(n-1)$, and any fitted $R^2$ includes this "fit to noise" component. Out-of-sample $R^2$ can be negative for a signal that looked fine in sample; that is the number to report.
:::
:::
