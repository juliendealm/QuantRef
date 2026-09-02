---
title: Kalman Filter
subject: filtering
summary: The optimal recursive estimator of a hidden linear-Gaussian state from noisy observations. Each step blends a model prediction with a new measurement, weighted by a gain that says which one to trust; it is Bayesian updating with Gaussians, and least squares that forgets.
difficulty: 4
interview: 3
tags: [filtering, kalman, state-space, bayesian, time-series, hedge-ratio]
prerequisites: [bayes-theorem, linear-regression]
related: [martingales]
---

## Intuition

You want to know a quantity you cannot observe directly — a fair price, a hedge ratio, a beta — but you receive a noisy reading of it every tick. Two sources of information compete: what your **model** says the quantity should be now, given where it was a moment ago, and what the **new observation** says. The Kalman filter takes a weighted average of the two, and the weight — the Kalman gain — is set by which source is currently less uncertain.

If the model is precise and the measurements are noisy, the gain is small: you barely move on each new reading. If the model is vague and the measurements clean, the gain is close to 1: you jump to the data. The filter tracks not only the estimate but also its uncertainty, so the gain adapts by itself. After many observations of a stable quantity the uncertainty shrinks and the filter becomes hard to move; when the hidden state is allowed to wander, uncertainty grows between observations and the filter stays responsive.

In one sentence: a Kalman filter is [[bayes-theorem|Bayes' rule]] applied over and over with Gaussian distributions, where today's prior is yesterday's posterior pushed through the dynamics.

## Mathematical Formulation

**State-space model.** A hidden state $\mathbf{x}_t \in \mathbb{R}^m$ and observations $\mathbf{y}_t \in \mathbb{R}^p$:

::: formula Linear-Gaussian state-space model
$$
\begin{aligned}
\mathbf{x}_t &= \mathbf{F}\,\mathbf{x}_{t-1} + \mathbf{w}_t, & \mathbf{w}_t &\sim \mathcal{N}(\mathbf{0}, \mathbf{Q}) \quad \text{(transition)}\\
\mathbf{y}_t &= \mathbf{H}\,\mathbf{x}_t + \mathbf{v}_t, & \mathbf{v}_t &\sim \mathcal{N}(\mathbf{0}, \mathbf{R}) \quad \text{(observation)}
\end{aligned}
$$
with $\mathbf{w}_t$ and $\mathbf{v}_t$ independent white noises and $\mathbf{x}_0 \sim \mathcal{N}(\hat{\mathbf{x}}_0, \mathbf{P}_0)$.
:::

Write $\hat{\mathbf{x}}_{t|s} = \mathbb{E}[\mathbf{x}_t \mid \mathbf{y}_{1:s}]$ and $\mathbf{P}_{t|s}$ for the covariance of the error $\mathbf{x}_t - \hat{\mathbf{x}}_{t|s}$.

::: formula Predict
$$
\hat{\mathbf{x}}_{t|t-1} = \mathbf{F}\,\hat{\mathbf{x}}_{t-1|t-1}, \qquad
\mathbf{P}_{t|t-1} = \mathbf{F}\,\mathbf{P}_{t-1|t-1}\,\mathbf{F}^\top + \mathbf{Q}.
$$
:::

::: formula Update with the Kalman gain
$$
\begin{aligned}
\boldsymbol\nu_t &= \mathbf{y}_t - \mathbf{H}\,\hat{\mathbf{x}}_{t|t-1} & &\text{innovation}\\
\mathbf{S}_t &= \mathbf{H}\,\mathbf{P}_{t|t-1}\,\mathbf{H}^\top + \mathbf{R} & &\text{innovation covariance}\\
\mathbf{K}_t &= \mathbf{P}_{t|t-1}\,\mathbf{H}^\top\,\mathbf{S}_t^{-1} & &\text{Kalman gain}\\
\hat{\mathbf{x}}_{t|t} &= \hat{\mathbf{x}}_{t|t-1} + \mathbf{K}_t\,\boldsymbol\nu_t\\
\mathbf{P}_{t|t} &= (\mathbf{I} - \mathbf{K}_t\mathbf{H})\,\mathbf{P}_{t|t-1}
\end{aligned}
$$
:::

**Scalar local-level model**, the workhorse: $x_t = x_{t-1} + w_t$ and $y_t = x_t + v_t$, with $\operatorname{Var}(w_t) = q$ and $\operatorname{Var}(v_t) = r$. Then

::: formula Local level: gain and steady state
$$
K_t = \frac{P_{t|t-1}}{P_{t|t-1} + r}, \qquad
\hat x_{t|t} = (1 - K_t)\,\hat x_{t|t-1} + K_t\,y_t,
$$
and in steady state, with signal-to-noise ratio $\lambda = q/r$,
$$
\bar P^{-} = \frac{q + \sqrt{q^2 + 4qr}}{2}, \qquad
\bar K = \frac{\bar P^{-}}{\bar P^{-} + r} = \frac{\lambda + \sqrt{\lambda^2 + 4\lambda}}{2 + \lambda + \sqrt{\lambda^2 + 4\lambda}}.
$$
:::

In steady state the filtered value follows $\hat x_t = (1-\bar K)\,\hat x_{t-1} + \bar K\,y_t$: an **exponentially weighted moving average** with decay $1 - \bar K$ and half-life $\ln 0.5 / \ln(1 - \bar K)$. Exponential smoothing is a Kalman filter that has forgotten its initial condition.

**The gain as a trust weight.** $\mathbf{K}_t = \operatorname{Cov}(\mathbf{x}_t, \boldsymbol\nu_t)\operatorname{Var}(\boldsymbol\nu_t)^{-1}$ is the regression coefficient of the state on the innovation — the same $\operatorname{Cov}/\operatorname{Var}$ as an OLS slope in [[linear-regression]]. In the scalar case, $r \to 0$ gives $K \to 1$ (the observation is exact, trust it completely) and $P_{t|t-1} \to 0$ gives $K \to 0$ (the prediction is exact, ignore the observation). Everything in between is a precision-weighted compromise.

## Derivation

Do it in one dimension; the matrix case is the same algebra with transposes. Before seeing $y_t$ the state has prior $x_t \sim \mathcal{N}(m, P)$, where $m = \hat x_{t|t-1}$ and $P = P_{t|t-1}$. The observation likelihood is $y_t \mid x_t \sim \mathcal{N}(x_t, r)$. Bayes' theorem gives
$$
p(x_t \mid y_t) \propto \exp\!\Big(-\frac{(x_t - m)^2}{2P}\Big)\exp\!\Big(-\frac{(y_t - x_t)^2}{2r}\Big).
$$
The exponent is quadratic in $x_t$, so the posterior is Gaussian. Collecting terms, the coefficient of $x_t^2$ is $-\tfrac12(1/P + 1/r)$, so the posterior precision is $1/P + 1/r$: **precisions add**. The coefficient of $x_t$ gives the posterior mean as the precision-weighted average of prior mean and observation,
$$
m' = \frac{m/P + y_t/r}{1/P + 1/r} = m + \frac{P}{P + r}\,(y_t - m) = m + K\,(y_t - m),
\qquad
P' = \Big(\frac1P + \frac1r\Big)^{-1} = \frac{Pr}{P + r} = (1 - K)\,P.
$$
That is the update step. The predict step is just the linear map: if $x_{t-1} \sim \mathcal{N}(m', P')$ and $x_t = x_{t-1} + w_t$, then $x_t \sim \mathcal{N}(m', P' + q)$ before the next observation. The estimate is therefore the exact posterior mean, hence the minimum-mean-square-error estimator; without Gaussianity the same recursion is still the best *linear* estimator, by the same argument as Gauss–Markov.

**Recursive least squares.** Take $q = 0$ (the state is a constant) and a diffuse prior $P_0 \to \infty$. Then $P_{t|t} = r/t$, $K_t = 1/t$ and
$$
\hat x_t = \hat x_{t-1} + \frac1t\,(y_t - \hat x_{t-1}),
$$
which is the running sample mean — the OLS estimate of a constant, computed recursively. Any Kalman filter with $\mathbf{Q} = \mathbf{0}$ is recursive least squares; $\mathbf{Q} > \mathbf{0}$ adds forgetting, because the prior variance is inflated between observations so that old data never fully dominate new data.

**Steady state.** In the local-level model the one-step-ahead variance obeys the Riccati recursion $P^-_{t+1} = \dfrac{P^-_t\, r}{P^-_t + r} + q$. A fixed point satisfies $(P^-)^2 - qP^- - qr = 0$, whose positive root is $\bar P^{-}$ above; the recursion converges to it from any starting value because the map is increasing and concave. The equivalent equation for the filtered variance is $\bar P^{2} + q\bar P - qr = 0$, which is the one solved in the code below.

**Innovations.** Under the true model the innovations $\boldsymbol\nu_t$ are Gaussian, serially uncorrelated, with covariance $\mathbf{S}_t$. This is how $\mathbf{Q}$ and $\mathbf{R}$ are estimated by maximum likelihood (the log-likelihood is $-\tfrac12\sum_t \big[\ln\det \mathbf{S}_t + \boldsymbol\nu_t^\top\mathbf{S}_t^{-1}\boldsymbol\nu_t\big]$ up to a constant, the *prediction-error decomposition*), and it is how a filter is diagnosed: autocorrelated innovations mean the model is wrong.

## Assumptions & Edge Cases

- **Linearity and Gaussianity.** Non-linear dynamics or observation (an option price as a function of a latent volatility) need the extended Kalman filter (linearise) or the unscented one (sigma points); heavy-tailed noise (jumps, bad ticks) needs a particle filter or at least robustified innovations, because a single outlier moves a Gaussian filter a lot.
- **Only the ratio $\mathbf{Q}/\mathbf{R}$ matters for the estimate.** Scaling $\mathbf{Q}$, $\mathbf{R}$ and $\mathbf{P}_0$ by the same constant leaves $\mathbf{K}_t$ unchanged and merely rescales $\mathbf{P}$; scaling $\mathbf{Q}$ and $\mathbf{R}$ alone leaves the steady-state gain unchanged but not the early transient. Setting that ratio is the whole art: too much $q$ and the filter chases noise, too little and it lags a moving state. Estimate it by maximum likelihood on the innovations or by out-of-sample forecast error, not by eye.
- **Filtering versus smoothing.** $\hat{\mathbf{x}}_{t|t}$ uses data up to $t$ only, so it is usable in real time and has no look-ahead. The Rauch–Tung–Striebel smoother $\hat{\mathbf{x}}_{t|T}$ uses the whole sample: better for historical analysis, unusable for trading.
- **Initialisation.** With a diffuse prior ($\mathbf{P}_0$ huge) the first steps are dominated by the data; the filter forgets $\hat{\mathbf{x}}_0$ at rate $1 - \bar K$ per step anyway, so the initial condition rarely matters after a burn-in of a few half-lives.
- **Numerics.** $(\mathbf{I} - \mathbf{K}\mathbf{H})\mathbf{P}$ can lose symmetry or positive definiteness in floating point; the Joseph form $(\mathbf{I}-\mathbf{K}\mathbf{H})\mathbf{P}(\mathbf{I}-\mathbf{K}\mathbf{H})^\top + \mathbf{K}\mathbf{R}\mathbf{K}^\top$ or a square-root filter is safer for multi-dimensional states.
- **Observability.** If some direction of the state never affects $\mathbf{y}$, its variance grows without bound: the filter cannot learn what it cannot see.

## Worked Example

A fair price follows a random walk with daily step standard deviation 0.05; the quotes we observe carry microstructure noise with standard deviation 0.5, ten times larger. Filter the quotes with the local-level model and compare with the hidden truth.

```python
import numpy as np

rng = np.random.default_rng(11)
n, q, r = 500, 0.05**2, 0.5**2                       # steps, state noise var, obs noise var
x = 100 + np.cumsum(rng.normal(0, np.sqrt(q), n))    # latent fair price: random walk
y = x + rng.normal(0, np.sqrt(r), n)                 # noisy quotes

m, P = y[0], 1.0                                     # prior mean and variance
m_filt, K_hist = np.empty(n), np.empty(n)
for t in range(n):
    # predict: random walk, so the mean is unchanged and the variance grows by q
    m_pred, P_pred = m, P + q
    # update: blend prediction and observation with the Kalman gain
    K = P_pred / (P_pred + r)
    m = m_pred + K * (y[t] - m_pred)
    P = (1 - K) * P_pred
    m_filt[t], K_hist[t] = m, K

rmse_raw = np.sqrt(np.mean((y - x) ** 2))
rmse_kf = np.sqrt(np.mean((m_filt - x) ** 2))
# steady state: P solves P = (P + q) r / (P + q + r), i.e. P^2 + qP - qr = 0
P_ss = (-q + np.sqrt(q**2 + 4 * q * r)) / 2
K_ss = (P_ss + q) / (P_ss + q + r)
print(f"RMSE raw quotes vs fair price : {rmse_raw:.4f}")
print(f"RMSE Kalman filtered          : {rmse_kf:.4f}")
print(f"steady-state gain: analytic {K_ss:.4f}, filter at last step {K_hist[-1]:.4f}")
print(f"equivalent EWMA half-life: {np.log(0.5) / np.log(1 - K_ss):.1f} observations")
```

::: output
```
RMSE raw quotes vs fair price : 0.5157
RMSE Kalman filtered          : 0.1457
steady-state gain: analytic 0.0951, filter at last step 0.0951
equivalent EWMA half-life: 6.9 observations
```
:::

The filter cuts the error by a factor of 3.5. With $\lambda = q/r = 0.01$ the steady-state gain is $0.095$: each new quote moves the estimate by 9.5 % of the surprise, and the filter is exactly an EWMA with a 7-observation half-life. The empirical gain reached the analytic value long before step 500. To feel the trade-off, change $q$: at $q = r$ the gain is $0.62$ and the filter follows the quotes almost one for one; at $q = 10^{-4}\,r$ the gain drops to $0.01$ (half-life about 70 quotes) and the filter lags any genuine move in the fair price.

## Why It Matters in Quant Finance

- **Dynamic hedge ratio for pairs trading.** Model $y_t = \beta_t x_t + \varepsilon_t$ with $\beta_t = \beta_{t-1} + w_t$: the state is the hedge ratio, the observation matrix $H_t = x_t$ is time-varying, and the filter produces a ratio that adapts to structural change instead of the fixed [[linear-regression]] slope estimated over a stale window. The innovation $\nu_t$ is the spread itself, and its standardised value $\nu_t/\sqrt{S_t}$ is a natural z-score for entries and exits.
- **Latent fair price from noisy quotes.** Bid–ask bounce, stale quotes and odd-lot prints are observation noise around an efficient price. The local-level model above is the simplest of the microstructure models used to estimate that price and its volatility from tick data.
- **Dynamic beta.** The market beta of a stock or a fund drifts; treating it as a random-walk state gives a time-varying beta with a confidence band, and a memory length chosen by the data rather than by an arbitrary rolling window.
- **Everything with a latent factor.** Term-structure models (latent level, slope and curvature), stochastic-volatility approximations, nowcasting, and signal combination — the filter is the optimal way to merge several noisy estimates of the same thing — all sit in state-space form.
- **Martingale link.** The innovation sequence $\{\boldsymbol\nu_t\}$ is a [[martingales|martingale difference]] with respect to the observation history: a correct filter leaves no predictable structure in its surprises, which is the practical test of whether the model is adequate.

## Common Mistakes

::: pitfall Tuning $q$ and $r$ by hand until the plot looks nice
The picture always looks nicer with a smaller $q$ (a smoother line), and the filter then lags every genuine move. The ratio $q/r$ is a parameter to be estimated from the innovation likelihood or from out-of-sample error, exactly like any other model parameter.
:::

::: pitfall Using the smoother in a backtest
$\hat{\mathbf{x}}_{t|T}$ uses future observations. A "dynamic hedge ratio" smoothed over the whole sample has look-ahead bias and will look far better than anything tradable.
:::

::: pitfall Expecting the gain to react to the data
With constant system matrices, $\mathbf{P}_t$ and $\mathbf{K}_t$ are deterministic given $\mathbf{Q}$, $\mathbf{R}$, $\mathbf{H}$: they converge to the same steady state whatever the observations. The filter cannot notice that the noise level changed unless you model it (time-varying $\mathbf{R}$, a regime-switching model).
:::

::: pitfall Treating the filtered estimate as the truth
$\hat{\mathbf{x}}_{t|t}$ comes with $\mathbf{P}_{t|t}$. A hedge ratio of $0.8 \pm 0.3$ is a very different trading proposition from $0.8 \pm 0.02$.
:::

## 30-Second Revision

State-space: $\mathbf{x}_t = \mathbf{F}\mathbf{x}_{t-1} + \mathbf{w}_t$, $\mathbf{y}_t = \mathbf{H}\mathbf{x}_t + \mathbf{v}_t$. Predict: push mean and covariance through $\mathbf{F}$, add $\mathbf{Q}$. Update: gain $\mathbf{K} = \mathbf{P}^{-}\mathbf{H}^\top(\mathbf{H}\mathbf{P}^{-}\mathbf{H}^\top + \mathbf{R})^{-1}$, new mean = prediction + $\mathbf{K}$ × innovation, new covariance $(\mathbf{I} - \mathbf{K}\mathbf{H})\mathbf{P}^{-}$. It is Bayes with Gaussians (precisions add, means are precision-weighted); with $\mathbf{Q} = \mathbf{0}$ it is recursive least squares, with $\mathbf{Q} > \mathbf{0}$ it forgets. Scalar local level: steady-state gain fixed by $q/r$, and the filter is an EWMA with decay $1 - \bar K$.

## Key Formulas

| Name | Formula |
|---|---|
| Predict | $\hat{\mathbf{x}}_{t \vert t-1} = \mathbf{F}\hat{\mathbf{x}}_{t-1 \vert t-1}$, $\mathbf{P}_{t \vert t-1} = \mathbf{F}\mathbf{P}_{t-1 \vert t-1}\mathbf{F}^\top + \mathbf{Q}$ |
| Gain | $\mathbf{K}_t = \mathbf{P}_{t \vert t-1}\mathbf{H}^\top(\mathbf{H}\mathbf{P}_{t \vert t-1}\mathbf{H}^\top + \mathbf{R})^{-1}$ |
| Update | $\hat{\mathbf{x}}_{t \vert t} = \hat{\mathbf{x}}_{t \vert t-1} + \mathbf{K}_t(\mathbf{y}_t - \mathbf{H}\hat{\mathbf{x}}_{t \vert t-1})$, $\mathbf{P}_{t \vert t} = (\mathbf{I} - \mathbf{K}_t\mathbf{H})\mathbf{P}_{t \vert t-1}$ |
| Scalar Bayes update | $m' = m + \frac{P}{P + r}(y - m)$, $1/P' = 1/P + 1/r$ |
| Local-level steady state | $(\bar P^{-})^2 - q\bar P^{-} - qr = 0$, $\bar K = \bar P^{-}/(\bar P^{-} + r)$ |
| EWMA equivalence | $\hat x_t = (1 - \bar K)\hat x_{t-1} + \bar K y_t$ |

## Interview Questions

::: question What does the Kalman gain represent, and what happens to it when the observation noise goes to zero, or when the prediction variance goes to zero?
::: hint
Write the scalar gain $K = P/(P + r)$ and take the limits.
:::
::: answer
The gain is the weight given to the new observation relative to the model prediction; equivalently, the regression coefficient of the state on the innovation, $\operatorname{Cov}(x, \nu)/\operatorname{Var}(\nu)$. If $r \to 0$ the observation is exact and $K \to 1$: the estimate jumps to the data. If $P \to 0$ the prediction is exact and $K \to 0$: the observation is ignored. In between, the posterior mean is the precision-weighted average of the two.
:::
:::

::: question Show that a local-level model with $q = 0$ and a diffuse prior reduces to the running sample mean.
::: hint
With $q = 0$ the predicted variance equals the previous filtered variance. Guess $P_{t|t} = r/t$ and verify by induction.
:::
::: answer
Start with $P_0 \to \infty$; after one observation $K_1 = 1$, $\hat x_1 = y_1$ and $P_{1|1} = r$. If $P_{t-1|t-1} = r/(t-1)$ then, since $q = 0$, $P_{t|t-1} = r/(t-1)$, $K_t = \frac{r/(t-1)}{r/(t-1) + r} = \frac1t$, and $P_{t|t} = (1 - 1/t)\,r/(t-1) = r/t$. The update $\hat x_t = \hat x_{t-1} + \frac1t(y_t - \hat x_{t-1})$ is exactly the recursion for the sample mean, and $r/t$ is its variance. The filter with $q = 0$ is recursive least squares; $q > 0$ stops the gain from decaying to zero, which is the forgetting factor.
:::
:::

::: question In the local-level model, set $q = r$. What is the steady-state gain, and to which exponential smoother does the filter correspond?
::: hint
Solve $(P^-)^2 - qP^- - qr = 0$ with $q = r$, then $\bar K = \bar P^-/(\bar P^- + r)$.
:::
::: answer
With $q = r$: $\bar P^{-} = r\,(1 + \sqrt5)/2$, so $\bar K = \frac{(1+\sqrt5)/2}{(1+\sqrt5)/2 + 1} = \frac{1 + \sqrt5}{3 + \sqrt5} = \frac{\sqrt5 - 1}{2} \approx 0.618$, the golden-ratio conjugate. The filter is an EWMA $\hat x_t = 0.382\,\hat x_{t-1} + 0.618\,y_t$ with a half-life below one observation: when the state moves as much as the noise, there is little to gain from averaging and the filter essentially follows the data. The general rule is that the gain depends only on $\lambda = q/r$, and it takes $\lambda \approx 0.01$ to get a 7-observation half-life.
:::
:::

::: question Set up a Kalman filter for the hedge ratio of a pairs trade. Give the state-space form, say how you would choose $q/r$, and explain what goes wrong when it is too large or too small.
::: hint
The regression $y_t = \beta_t x_t + \varepsilon_t$ becomes an observation equation with a time-varying $H_t$.
:::
::: answer
State $\beta_t$ (possibly with an intercept, $\mathbf{x}_t = (\alpha_t, \beta_t)^\top$) following a random walk, $\mathbf{F} = \mathbf{I}$, $\mathbf{Q} = \operatorname{diag}(q_\alpha, q_\beta)$; observation $y_t = \mathbf{H}_t\mathbf{x}_t + v_t$ with $\mathbf{H}_t = (1, x_t)$ and $\operatorname{Var}(v_t) = r$. Predict leaves the mean unchanged and adds $\mathbf{Q}$; the update regresses the surprise $\nu_t = y_t - \hat\alpha - \hat\beta x_t$ onto the state with gain $\mathbf{K}_t = \mathbf{P}_{t|t-1}\mathbf{H}_t^\top / (\mathbf{H}_t\mathbf{P}_{t|t-1}\mathbf{H}_t^\top + r)$; note that because $\mathbf{H}_t$ depends on $x_t$, the gain is now data-dependent. Choose $q/r$ by maximising the innovation likelihood over a training window, then check that innovations are white out of sample. Too large a $q$: $\beta_t$ tracks noise, the spread $\nu_t$ is small by construction and the strategy trades every wiggle at a loss after costs. Too small a $q$: the filter degenerates to OLS on the whole history, $\beta_t$ lags a genuine change in the relationship and the "spread" trends for weeks. The trading signal is the standardised innovation $\nu_t/\sqrt{S_t}$, which already accounts for the current uncertainty in the ratio.
:::
:::
