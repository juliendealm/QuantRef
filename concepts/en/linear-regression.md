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

Stack the observations $y_i$ into a vector $\mathbf{y} \in \mathbb{R}^n$ and the regressors into the columns of $\mathbf{X}$. Any fitted vector $\mathbf{X}\boldsymbol\beta$ lives in the column space of $\mathbf{X}$, a $k$-dimensional plane inside $\mathbb{R}^n$, and least squares picks the point of that plane **closest** to $\mathbf{y}$: the orthogonal projection. The residual is perpendicular to every regressor. Normal equations, closed form, $R^2$ — everything else is a corollary of that right angle.

::: viz linear-regression Least squares, and its leverage problem
Drag a point and watch the residuals. A point far out in x moves the whole line on its own — that is leverage, and R² can stay high while the fit becomes meaningless.
:::

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

## Common Mistakes

::: pitfall Regressing prices instead of returns
Two unrelated random walks give a high $R^2$ and a huge $t$-statistic: the residual inherits a unit root and the standard errors mean nothing. Use returns, or test for cointegration first.
:::

::: pitfall Chasing $R^2$
Adding a regressor never lowers $R^2$, so the statistic rewards overfitting. A daily-return regression with $R^2 = 0.02$ can be a profitable signal; a price regression with $R^2 = 0.98$ can be pure noise.
:::

::: pitfall Classic standard errors on financial data
Volatility clustering (heteroskedasticity) and overlapping observations (autocorrelation) make $\sigma^2(\mathbf{X}^\top\mathbf{X})^{-1}$ wrong, typically too small, so $t$-statistics are inflated. Report White or Newey–West by default.
:::

::: pitfall Confusing significance with size
A $t$-statistic of 5 on a coefficient of 0.001 says the effect is precisely estimated, not that it survives costs. Conversely, an alpha with $t = 1.8$ can be economically huge and still unmeasurable.
:::

## 30-Second Revision

OLS projects $\mathbf{y}$ onto the span of $\mathbf{X}$: $\hat{\boldsymbol\beta} = (\mathbf{X}^\top\mathbf{X})^{-1}\mathbf{X}^\top\mathbf{y}$, residuals orthogonal to the regressors, single-regressor slope $\operatorname{Cov}(x,y)/\operatorname{Var}(x)$. Gauss–Markov (exogeneity plus spherical errors) makes it BLUE; $\operatorname{Var}(\hat{\boldsymbol\beta}) = \sigma^2(\mathbf{X}^\top\mathbf{X})^{-1}$ and $t = \hat\beta/\operatorname{se}$. $R^2 = 1 - \mathrm{RSS}/\mathrm{TSS}$ rises with any added regressor and is meaningless on prices. Use robust (White / Newey–West) standard errors, regress returns not prices, and raise the $t$ hurdle when many factors were tried.

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

**Gauss–Markov.** (i) Linearity in the parameters; (ii) full rank; (iii) strict exogeneity, $\mathbb{E}[\boldsymbol\varepsilon \mid \mathbf{X}] = \mathbf{0}$; (iv) spherical errors, $\operatorname{Var}(\boldsymbol\varepsilon \mid \mathbf{X}) = \sigma^2\mathbf{I}$. Then OLS is **BLUE**. Normality is not needed for that, only for exact finite-sample $t$ and $F$ distributions.

**Robust standard errors.** When (iv) fails, $\hat{\boldsymbol\beta}$ stays unbiased but its covariance becomes the *sandwich* with $\boldsymbol\Omega = \operatorname{Var}(\boldsymbol\varepsilon)$: White puts $\hat\varepsilon_i^2$ on the diagonal (heteroskedasticity), Newey–West adds residual autocovariances to lag $L$ with Bartlett weights $1 - \ell/(L+1)$ ("HAC"). Point estimates are untouched; only the $t$-statistics are repaired.

## Derivation

Minimise $S(\boldsymbol\beta) = (\mathbf{y} - \mathbf{X}\boldsymbol\beta)^\top(\mathbf{y} - \mathbf{X}\boldsymbol\beta)$. The gradient $\nabla S = -2\mathbf{X}^\top\mathbf{y} + 2\mathbf{X}^\top\mathbf{X}\boldsymbol\beta$ vanishes at the normal equations, and the Hessian $2\mathbf{X}^\top\mathbf{X}$ is positive definite under full rank, so that is the unique minimum.

They say $\mathbf{X}^\top(\mathbf{y} - \mathbf{X}\hat{\boldsymbol\beta}) = \mathbf{0}$: the residual is orthogonal to each column. With an intercept one column is $\mathbf{1}$, so residuals sum to zero, and orthogonality gives $\mathrm{TSS} = \mathrm{ESS} + \mathrm{RSS}$, hence $R^2 \in [0, 1]$; without an intercept that fails and $R^2$ can be negative.

Substituting $\mathbf{y} = \mathbf{X}\boldsymbol\beta + \boldsymbol\varepsilon$,
$$
\hat{\boldsymbol\beta} = \boldsymbol\beta + (\mathbf{X}^\top\mathbf{X})^{-1}\mathbf{X}^\top\boldsymbol\varepsilon,
$$
so $\mathbb{E}[\hat{\boldsymbol\beta} \mid \mathbf{X}] = \boldsymbol\beta$ by exogeneity, and
$$
\operatorname{Var}(\hat{\boldsymbol\beta} \mid \mathbf{X}) = (\mathbf{X}^\top\mathbf{X})^{-1}\mathbf{X}^\top\,\operatorname{Var}(\boldsymbol\varepsilon)\,\mathbf{X}(\mathbf{X}^\top\mathbf{X})^{-1},
$$
which collapses to $\sigma^2(\mathbf{X}^\top\mathbf{X})^{-1}$ under $\sigma^2\mathbf{I}$ and is the sandwich otherwise. The divisor $n - k$ makes $\hat\sigma^2$ unbiased since $\hat{\boldsymbol\varepsilon} = (\mathbf{I} - \mathbf{P})\boldsymbol\varepsilon$ and $\operatorname{tr}(\mathbf{I} - \mathbf{P}) = n - k$.

With $\mathbf{X} = [\mathbf{1}, \mathbf{x}]$ the $2\times 2$ system gives $\hat\beta = \sum_i(x_i - \bar x)(y_i - \bar y) \big/ \sum_i(x_i - \bar x)^2$ and $(2,2)$ entry $\sigma^2/\sum_i(x_i - \bar x)^2$: the standard error shrinks like $1/\sqrt{n}$ and with the spread of the regressor, so a beta is measured more precisely in volatile markets.

## Assumptions & Edge Cases

- **Exogeneity is the assumption that bites.** Omitted variables, simultaneity and measurement error in $x$ all bias $\hat{\boldsymbol\beta}$, and no amount of data or robust standard errors fixes bias. Errors-in-variables shrinks $\hat\beta$ towards zero: a beta against a noisy proxy comes out too small.
- **Non-stationary regressors.** One random walk on an independent random walk gives a "significant" $t$ most of the time and an $R^2$ that does not vanish as $n \to \infty$ (Granger and Newbold, 1974). Regress returns, or test for cointegration.
- **Heteroskedasticity and autocorrelation** do not bias $\hat{\boldsymbol\beta}$ but make classic standard errors wrong, usually too small. Overlapping returns are autocorrelated *by construction*: use Newey–West with at least as many lags as the overlap.
- **Multicollinearity** inflates standard errors without bias: coefficients flip sign while the fit stays fine. Ridge trades a little bias for a lot of variance.
- **Outliers** have leverage $h_{ii} = 1/n + (x_i - \bar x)^2 / \sum_j (x_j - \bar x)^2$: one crash day can set the beta by itself.
- **Direction is not symmetric.** $y$ on $x$ gives slope $\rho\,\sigma_y/\sigma_x$; $x$ on $y$ gives $\rho\,\sigma_x/\sigma_y$, whose reciprocal is a different line unless $\lvert\rho\rvert = 1$. Decide which leg is hedged, or use total least squares.

## Worked Example

A stock's market beta from one year of daily returns, using nothing but the normal equations, checked against `np.polyfit`. True $\beta = 1.3$, true daily alpha $0.0002$.

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

The beta comes out at $1.33 \pm 0.09$, comfortably covering the true $1.3$. The alpha of 17 basis points per day looks impressive (over 40 % annualised) yet $t = 1.83$: not significant at 5 %, with the true $0.0002$ well inside two standard errors. That is "alpha is hard to measure" in numbers — one year of daily data cannot tell a 5 % annual alpha from zero. The $R^2$ of 0.455 is typical for a single stock against the market; the rest is idiosyncratic, and a modest $R^2$ is not the sign of a bad regression.

## Why It Matters in Quant Finance

- **Beta and the CAPM.** $r_i - r_f = \alpha_i + \beta_i (r_m - r_f) + \varepsilon_i$: $\beta$ prices systematic risk, $\alpha$ is the claimed skill, and $\alpha = 0$ is a $t$-test with all the caveats above.
- **Factor models.** Fama–French and every commercial risk model are regressions of returns on factor returns; the residual variance is the "specific risk" feeding a [[value-at-risk]] model.
- **Hedge ratios.** A minimum-variance hedge *is* a regression coefficient. For a pairs trade, Engle–Granger regresses *log prices* then tests the residual for stationarity (ADF); without that step the price regression is spurious.
- **Time-varying betas.** When the coefficient drifts, make $\beta_t$ a state and filter it: the [[kalman-filter]] is recursive least squares with forgetting.
- **Multiple testing.** Screen 300 factors at 5 % and 15 look "significant" by luck. Harvey, Liu and Zhu (2016) argue for a $t$ hurdle of 3 rather than 2; an in-sample $R^2$ is the standard way a backtest lies.
- **Signal research.** A forecasting regression of $r_{t+1}$ on $s_t$ has an $R^2$ of 1 % on a good day. The question is whether the slope is stable out of sample.

## Interview Questions

::: question Show that with one regressor and an intercept, the OLS slope is $\operatorname{Cov}(x,y)/\operatorname{Var}(x)$ and the residuals sum to zero.
::: hint
Write the two normal equations, one per column of $\mathbf{X} = [\mathbf{1}, \mathbf{x}]$.
:::
::: answer
The first is $\mathbf{1}^\top(\mathbf{y} - \hat\alpha\mathbf{1} - \hat\beta\mathbf{x}) = 0$, i.e. $\sum_i \hat\varepsilon_i = 0$ and $\hat\alpha = \bar y - \hat\beta\bar x$. Substituting into the second, $\mathbf{x}^\top(\mathbf{y} - \hat\alpha\mathbf{1} - \hat\beta\mathbf{x}) = 0$, gives $\sum_i x_i(y_i - \bar y) = \hat\beta\sum_i x_i(x_i - \bar x)$, and since $\sum_i \bar x (y_i - \bar y) = 0 = \sum_i \bar x(x_i - \bar x)$, this is $\hat\beta = \sum_i (x_i - \bar x)(y_i - \bar y)/\sum_i (x_i - \bar x)^2$.
:::
:::

::: question A beta regression on 250 daily returns gives $\hat\beta = 1.2$ with standard error 0.15. Is it significantly different from 1? How many observations would bring the standard error down to 0.05?
::: hint
The test statistic is $(\hat\beta - 1)/\operatorname{se}$; the standard error scales like $1/\sqrt{n}$.
:::
::: answer
$t = (1.2 - 1)/0.15 = 1.33$, below the critical value $1.97$ ($t_{248}$ at 5 %): not significantly different from 1, with a 95 % interval $1.2 \pm 1.97 \times 0.15 = [0.90, 1.50]$. Dividing the standard error by 3 needs 9 times the data, about 2 250 days or 9 years — by which time the beta has changed. Hence shrinkage towards 1 (Vasicek/Bloomberg) or filtering.
:::
:::

::: question You regress the price of stock A on the price of stock B and get $R^2 = 0.95$ with $t = 40$. A colleague concludes the pair is an excellent hedge. What do you say?
::: hint
What is the time-series behaviour of prices, and what does the residual look like if the two are not related?
:::
::: answer
Very likely a spurious regression: prices are close to random walks, and two independent ones routinely give $R^2$ near 1 with enormous $t$, because the residual is itself a random walk while the standard errors assume it is stationary. Check by (a) regressing returns on returns — the $t$ collapses if the pair is unrelated — and (b) if you need a price-level ratio, testing the residual for stationarity (ADF), i.e. cointegration. Even then the direction matters and the ratio drifts, which argues for a [[kalman-filter|Kalman-filtered]] ratio.
:::
:::

::: question You screen 200 signals and find 12 with $\lvert t \rvert > 2$ in sample. How many are expected by chance? What hurdle would you use, and why is in-sample $R^2$ optimistic even for a true signal?
::: hint
Two-sided 5 % test under the null; Bonferroni; and think about what $R^2$ measures when the coefficients were chosen on the same data.
:::
::: answer
Under the null each signal passes with probability 5 %, so 10 of 200 are expected: 12 is unremarkable. Bonferroni tests each at $0.05/200 = 0.00025$, i.e. $\lvert t\rvert > 3.7$; Harvey, Liu and Zhu recommend $t > 3$ for a new factor; a false-discovery-rate procedure is the modern compromise. Even for a genuine signal, in-sample $R^2$ is biased upwards: with $k$ columns in $\mathbf{X}$ (intercept included) and no true relation, $\mathbb{E}[R^2] = (k-1)/(n-1)$, and any fitted $R^2$ contains this "fit to noise". Out-of-sample $R^2$ can be negative; that is the number to report.
:::
:::
