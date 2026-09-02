---
title: Itô's Lemma
subject: stochastic
summary: The chain rule for functions of a diffusion. Because the square of a Brownian increment is of order dt rather than smaller, a second-order term survives that ordinary calculus would discard; it is the source of every drift correction in quant finance, from the log of a geometric Brownian motion to the Black–Scholes PDE.
difficulty: 3
interview: 5
tags: [stochastic-calculus, ito, sde, quadratic-variation, martingale]
prerequisites: [brownian-motion]
related: [black-scholes, martingales]
---

## Intuition

Ordinary calculus rests on one fact: along a smooth path, a small move $dx$ changes $f$ by $f'(x)\,dx$, and the second-order term $\tfrac12 f''(x)\,(dx)^2$ is negligible because $(dx)^2 \sim (dt)^2$ vanishes much faster than $dt$.

Brownian motion breaks this. Over a step of length $dt$ the increment $dW \sim \mathcal{N}(0, dt)$ has typical size $\sqrt{dt}$, so $(dW)^2$ is of order $dt$, the same order as the time step itself. Summing $(dW)^2$ over the $n$ steps covering $[0, T]$ does not give zero: it gives $T$. This is the quadratic variation of [[brownian-motion|Brownian motion]].

So the second-order Taylor term survives, and a function of Brownian motion picks up an extra drift $\tfrac12 f''(W_t)\,dt$. That is all Itô's lemma is: **Taylor to second order, replace $(dW)^2$ by $dt$, drop everything smaller.**

A concrete sign that ordinary calculus misses something: $W_t^2$ has expectation $t$, which grows, whereas "$d(W^2) = 2W\,dW$" would have zero drift. The growth is exactly the Itô term.

## Mathematical Formulation

The heuristic rules, valid inside any computation at order $dt$:

::: formula Itô multiplication table
$$
dt \cdot dt = 0, \qquad dt \cdot dW_t = 0, \qquad dW_t \cdot dW_t = dt .
$$
:::

Let $X_t$ be an Itô process, $dX_t = \mu_t\,dt + \sigma_t\,dW_t$ with $\mu_t, \sigma_t$ adapted, and let $f(t, x)$ be $C^1$ in $t$ and $C^2$ in $x$. Then:

::: formula Itô's lemma (one dimension)
$$
df(t, X_t) = \Big( \partial_t f + \mu_t\,\partial_x f + \tfrac12 \sigma_t^2\,\partial_{xx} f \Big)\,dt + \sigma_t\,\partial_x f\,dW_t ,
$$
all partial derivatives being evaluated at $(t, X_t)$.
:::

A compact way to remember it: $df = \partial_t f\,dt + \partial_x f\,dX_t + \tfrac12 \partial_{xx} f\,(dX_t)^2$, with $(dX_t)^2 = \sigma_t^2\,dt$ from the multiplication table.

The integral form is the rigorous statement: $f(T, X_T) = f(0, X_0) + \int_0^T (\cdots)\,dt + \int_0^T \sigma_t\,\partial_x f\,dW_t$, where the last term is an Itô integral, i.e. the integrand is evaluated at the left end of each time interval.

**Several dimensions.** For $X_t = (X^1_t, \dots, X^n_t)$ with $dX^i_t = \mu^i_t\,dt + \sum_j \sigma^{ij}_t\,dW^j_t$ and correlated Brownian motions $d\langle W^j, W^k \rangle_t = \rho_{jk}\,dt$:

::: formula Itô's lemma (multi-dimensional)
$$
df = \partial_t f\,dt + \sum_{i} \partial_i f\,dX^i_t + \tfrac12 \sum_{i,k} \partial_{ik} f\,d\langle X^i, X^k \rangle_t,
\qquad
d\langle X^i, X^k \rangle_t = \sum_{j,l} \sigma^{ij}_t \sigma^{kl}_t \rho_{jl}\,dt .
$$
:::

For two assets with volatilities $\sigma_1, \sigma_2$ and correlation $\rho$ the cross term is simply $d\langle X^1, X^2\rangle_t = \rho\,\sigma_1\sigma_2\,dt$.

**Product rule.** Taking $f(x, y) = xy$:

::: formula Itô product rule
$$
d(X_t Y_t) = X_t\,dY_t + Y_t\,dX_t + d\langle X, Y \rangle_t .
$$
:::

Ordinary calculus stops after two terms; the covariation $d\langle X, Y\rangle_t = \rho\,\sigma^X_t \sigma^Y_t\,dt$ is the Itô correction. It vanishes when one of the two processes has finite variation, for instance $Y_t = e^{-rt}$.

## Derivation

Fix a partition $0 = t_0 < t_1 < \dots < t_n = T$ with step $\Delta t$ and write $\Delta X_k = X_{t_{k+1}} - X_{t_k} = \mu\,\Delta t + \sigma\,\Delta W_k$. Taylor to second order:

$$
f(t_{k+1}, X_{t_{k+1}}) - f(t_k, X_{t_k}) = \partial_t f\,\Delta t + \partial_x f\,\Delta X_k + \tfrac12 \partial_{xx} f\,(\Delta X_k)^2 + \partial_{tx} f\,\Delta t\,\Delta X_k + \tfrac12 \partial_{tt} f\,(\Delta t)^2 + \cdots
$$

Expand $(\Delta X_k)^2 = \sigma^2 (\Delta W_k)^2 + 2\mu\sigma\,\Delta t\,\Delta W_k + \mu^2 (\Delta t)^2$ and sum over $k$. Three facts decide which sums survive as $\Delta t \to 0$:

1. $\sum_k (\Delta W_k)^2 \to T$ in $L^2$. Indeed $\mathbb{E}[(\Delta W_k)^2] = \Delta t$ and $\operatorname{Var}[(\Delta W_k)^2] = 2(\Delta t)^2$, so $\mathbb{E}\big[\sum_k (\Delta W_k)^2\big] = T$ and $\operatorname{Var}\big[\sum_k (\Delta W_k)^2\big] = 2T\,\Delta t \to 0$. This is the precise content of $(dW)^2 = dt$: not only in expectation, but with vanishing variance.
2. $\sum_k \Delta t\,\Delta W_k$ has mean $0$ and variance $n\,(\Delta t)^3 = T(\Delta t)^2 \to 0$: the mixed term $dt\,dW$ dies.
3. $\sum_k (\Delta t)^2 = T\,\Delta t \to 0$, and every higher-order term vanishes likewise.

Hence the only second-order survivor is $\tfrac12 \sigma^2\,\partial_{xx} f\,\Delta t$, and passing to the limit gives Itô's lemma. Written multiplicatively: $(dX)^2 = \sigma^2 dt$, $dt\,dX = 0$, $(dt)^2 = 0$, which is the multiplication table.

**Where the left end point enters.** The first-order sum $\sum_k \partial_x f(t_k, X_{t_k})\,\Delta W_k$ evaluates the integrand at the *start* of each interval. Its limit is the Itô integral $\int \partial_x f\,dW$, a martingale because each term is a fair bet given the past. Evaluating at the midpoint instead gives the Stratonovich integral, for which the ordinary chain rule holds and no correction appears: the correction has simply been absorbed into the integral. Finance uses Itô because a hedge chosen at $t_k$ can only use information available at $t_k$.

## Assumptions & Edge Cases

- **Smoothness.** $f$ must be $C^2$ in $x$. For $f(x) = |x|$, or for an option payoff $(x - K)^+$, the second derivative is a Dirac mass and Itô's lemma acquires a *local time* term (Tanaka's formula). This is why one applies Itô to the smooth *price* function $V(t, S)$, never directly to the payoff.
- **Continuity.** The formula as stated needs continuous paths. With jumps, $df$ gains a sum over jump times of $f(X_s) - f(X_{s-}) - \partial_x f(X_{s-})\,\Delta X_s$; the $dt$ part is unchanged.
- **Itô processes only.** Drift and volatility must be adapted and integrable ($\int_0^T \sigma_t^2\,dt < \infty$ almost surely); the SDE itself needs conditions (locally Lipschitz coefficients) to have a solution.
- **Degenerate volatility.** If $\sigma_t = 0$ the correction vanishes and Itô's lemma is the classical chain rule.
- **Cross terms.** $dt\,dW = 0$ kills the mixed derivative $\partial_{tx} f$; in several dimensions only correlated Brownian pairs contribute, through $\rho_{jk}$. Two independent Brownian motions have zero covariation.
- **Itô versus Stratonovich.** $\int_0^T W_t\,dW_t = \tfrac12 (W_T^2 - T)$ in the Itô sense but $\tfrac12 W_T^2$ in the Stratonovich sense. Always say which integral you mean: physics often uses Stratonovich, finance uses Itô.

## Worked Example

Three applications you should be able to do on a whiteboard.

**1. Log of a geometric Brownian motion.** With $dS_t = \mu S_t\,dt + \sigma S_t\,dW_t$ and $f(x) = \ln x$, $\partial_x f = 1/x$ and $\partial_{xx} f = -1/x^2$:

$$
d\ln S_t = \frac{1}{S_t}\,dS_t - \frac{1}{2 S_t^2}\,(dS_t)^2 = \Big(\mu - \tfrac12 \sigma^2\Big)\,dt + \sigma\,dW_t ,
$$

hence $S_T = S_0 \exp\big((\mu - \tfrac12\sigma^2)T + \sigma W_T\big)$. The $-\tfrac12\sigma^2$ is the "volatility drag": the median growth rate is below the mean growth rate $\mu$.

**2. $W_t^2 - t$ is a martingale.** With $f(x) = x^2$: $d(W_t^2) = 2W_t\,dW_t + dt$, so $W_t^2 - t = 2\int_0^t W_s\,dW_s$ is a stochastic integral, hence a [[martingales|martingale]].

**3. The exponential martingale.** With $f(t, x) = \exp(\lambda x - \tfrac12 \lambda^2 t)$: $\partial_t f = -\tfrac12\lambda^2 f$, $\partial_x f = \lambda f$, $\partial_{xx} f = \lambda^2 f$, so

$$
df = \Big(-\tfrac12\lambda^2 f + \tfrac12 \lambda^2 f\Big)\,dt + \lambda f\,dW_t = \lambda f\,dW_t .
$$

No $dt$ term: $M_t = e^{\lambda W_t - \lambda^2 t/2}$ is a martingale. It is the density used in Girsanov's theorem, and with $\lambda = \sigma$ it shows that the discounted stock $e^{-rt}S_t$ is a martingale exactly when $\mu = r$, the risk-neutral condition behind [[black-scholes]].

**Numerical check of application 2.** Simulate paths, form the left-point sum $2\sum_k W_{t_k}\,\Delta W_k$, and compare it with $W_T^2$ with and without the correction $T$:

```python
import numpy as np

rng = np.random.default_rng(7)
T, n_steps, n_paths = 1.0, 1_000, 10_000
dt = T / n_steps
dW = rng.normal(0.0, np.sqrt(dt), size=(n_paths, n_steps))
W = np.hstack([np.zeros((n_paths, 1)), np.cumsum(dW, axis=1)])   # W_0 = 0

lhs = W[:, -1] ** 2                            # W_T^2
stoch_int = np.sum(2 * W[:, :-1] * dW, axis=1) # 2 * int W dW, left-point (Ito) sum
ordinary = stoch_int                           # what dW^2 = 0 would predict
ito = stoch_int + T                            # Ito correction: int dt = T
qv = np.sum(dW**2, axis=1)                     # realised sum of (dW)^2

print("path    W_T^2   2*sum(W dW)   2*sum(W dW)+T   sum(dW)^2")
for i in range(4):
    print(f"{i:>4}  {lhs[i]:7.4f}   {ordinary[i]:11.4f}   {ito[i]:13.4f}   {qv[i]:9.4f}")
print()
print(f"mean |W_T^2 - 2 sum(W dW)|      = {np.mean(np.abs(lhs - ordinary)):.4f}  (ordinary calculus)")
print(f"mean |W_T^2 - 2 sum(W dW) - T|  = {np.mean(np.abs(lhs - ito)):.4f}  (Ito)")
print(f"mean sum(dW)^2 = {qv.mean():.4f}, std = {qv.std():.4f}  (theory: T = {T}, std = {np.sqrt(2 * T * dt):.4f})")
```

::: output
```
path    W_T^2   2*sum(W dW)   2*sum(W dW)+T   sum(dW)^2
   0   5.2243        4.3330          5.3330      0.8913
   1   0.0582       -0.9928          0.0072      1.0509
   2   0.1944       -0.8219          0.1781      1.0163
   3   0.5496       -0.4252          0.5748      0.9748

mean |W_T^2 - 2 sum(W dW)|      = 0.9999  (ordinary calculus)
mean |W_T^2 - 2 sum(W dW) - T|  = 0.0356  (Ito)
mean sum(dW)^2 = 0.9999, std = 0.0447  (theory: T = 1.0, std = 0.0447)
```
:::

Ordinary calculus misses by almost exactly $T = 1$ on every path. The Itô version is off only by $\sum_k (\Delta W_k)^2 - T$, whose standard deviation $\sqrt{2T\,\Delta t} \approx 0.045$ matches the last line. In fact the discrete identity $W_T^2 = \sum_k \big(2 W_{t_k}\Delta W_k + (\Delta W_k)^2\big)$ is exact; all the convergence happens in the quadratic-variation column.

## Why It Matters in Quant Finance

- **The Black–Scholes PDE is Itô plus a hedge.** Apply the lemma to the option price $V(t, S_t)$, short $\partial_S V$ shares, and the $dW$ term cancels; the surviving $dt$ term must earn the risk-free rate. See [[black-scholes]].
- **Gamma is the Itô term.** The correction $\tfrac12 \sigma^2 S^2\,\partial_{SS} V\,dt$ is the gamma P&L of a hedged option and the origin of the gamma–theta trade-off in [[greeks]].
- **Deciding what is a martingale.** $f(t, X_t)$ is a (local) martingale exactly when its $dt$ coefficient vanishes; this is how one checks that discounted prices are [[martingales]] under the pricing measure.
- **Change of measure.** The exponential martingale is the Radon–Nikodym density of Girsanov's theorem, which turns the real-world drift $\mu$ into the risk-free rate $r$.
- **Solving linear SDEs.** The product rule applied to $e^{\kappa t} X_t$ solves the Ornstein–Uhlenbeck process $dX_t = \kappa(\theta - X_t)\,dt + \sigma\,dW_t$, the workhorse of short-rate models and of the continuous-time [[kalman-filter|Kalman filter]].
- **Multi-asset and stochastic-volatility models.** Heston, basket options, quanto adjustments: all rely on the multi-dimensional lemma with correlation, and the covariation term is where the quanto drift $-\rho\,\sigma_S\sigma_{FX}$ comes from.

## Common Mistakes

::: pitfall Writing d ln S = dS / S
The correction $-\tfrac12\sigma^2\,dt$ is not small: at 30 % volatility over 10 years it subtracts $0.45$ from the log-return, so the median terminal price is $e^{-0.45} \approx 0.64$ times what the naive calculation predicts.
:::

::: pitfall Applying Itô's lemma to a payoff
$(S - K)^+$ is not twice differentiable at $K$. Apply the lemma to the smooth price function $V(t, S)$ and let the terminal condition carry the kink, or use Tanaka's formula with its local-time term.
:::

::: pitfall Dropping the correlation in the cross term
In two dimensions the second-order term contains $\partial_{12} f\,\rho\,\sigma_1\sigma_2\,dt$. Forgetting it is the standard error in exchange-option, quanto and basket calculations; it changes the drift of a ratio $S^1/S^2$ by $\sigma_2^2 - \rho\sigma_1\sigma_2$.
:::

::: pitfall Confusing the Itô and Stratonovich integrals
$\int_0^T W_t\,dW_t$ equals $\tfrac12(W_T^2 - T)$ under Itô and $\tfrac12 W_T^2$ under Stratonovich. Only the Itô version is a martingale, which is what non-anticipating hedging requires.
:::

## 30-Second Revision

Itô's lemma is the chain rule with one extra term: $df = \partial_t f\,dt + \partial_x f\,dX + \tfrac12 \partial_{xx} f\,(dX)^2$, where $(dW)^2 = dt$ and every other product vanishes. For $dX = \mu\,dt + \sigma\,dW$ the drift of $f$ is $\partial_t f + \mu\,\partial_x f + \tfrac12\sigma^2\,\partial_{xx} f$. Three outputs to know cold: $d\ln S = (\mu - \tfrac12\sigma^2)\,dt + \sigma\,dW$; $W_t^2 - t$ is a martingale; $e^{\lambda W_t - \lambda^2 t/2}$ is a martingale. In several dimensions cross terms carry $\rho\,\sigma_i\sigma_k\,dt$, and the product rule adds $d\langle X, Y\rangle$.

## Key Formulas

| Name | Formula |
|---|---|
| Multiplication table | $(dW)^2 = dt$, $dt\,dW = 0$, $(dt)^2 = 0$ |
| Itô's lemma | $df = \big(\partial_t f + \mu\,\partial_x f + \tfrac12\sigma^2\partial_{xx} f\big)dt + \sigma\,\partial_x f\,dW$ |
| Multi-dimensional | $df = \partial_t f\,dt + \sum_i \partial_i f\,dX^i + \tfrac12\sum_{i,k}\partial_{ik} f\,d\langle X^i, X^k\rangle$ |
| Product rule | $d(XY) = X\,dY + Y\,dX + d\langle X, Y\rangle$ |
| Log of a GBM | $d\ln S = (\mu - \tfrac12\sigma^2)\,dt + \sigma\,dW$ |
| Exponential martingale | $d\big(e^{\lambda W_t - \lambda^2 t/2}\big) = \lambda\,e^{\lambda W_t - \lambda^2 t/2}\,dW_t$ |

## Interview Questions

::: question Let $dS_t = \mu S_t\,dt + \sigma S_t\,dW_t$. Find the dynamics of $\ln S_t$ and deduce the distribution of $S_T$.
::: hint
Take $f(x) = \ln x$, so $f'' = -1/x^2$, and use $(dS_t)^2 = \sigma^2 S_t^2\,dt$.
:::
::: answer
$d\ln S_t = (\mu - \tfrac12\sigma^2)\,dt + \sigma\,dW_t$, so $\ln S_T \sim \mathcal{N}\big(\ln S_0 + (\mu - \tfrac12\sigma^2)T,\ \sigma^2 T\big)$: $S_T$ is lognormal, with median $S_0 e^{(\mu - \sigma^2/2)T}$ and mean $S_0 e^{\mu T}$. The gap between the two is the volatility drag.
:::
:::

::: question Compute $\int_0^T W_t\,dW_t$ and explain why the answer is not $\tfrac12 W_T^2$.
::: hint
Apply Itô's lemma to $W_t^2$ and isolate the stochastic integral.
:::
::: answer
$d(W_t^2) = 2W_t\,dW_t + dt$, hence $\int_0^T W_t\,dW_t = \tfrac12(W_T^2 - T)$. The extra $-T/2$ is half the quadratic variation. Sanity check: an Itô integral has zero mean, and indeed $\mathbb{E}[\tfrac12(W_T^2 - T)] = 0$, whereas $\mathbb{E}[\tfrac12 W_T^2] = T/2 \neq 0$.
:::
:::

::: question Use Itô's lemma to compute $\mathbb{E}[W_t^4]$.
::: hint
Take $f(x) = x^4$, take expectations, and use $\mathbb{E}[W_s^2] = s$.
:::
::: answer
$d(W_t^4) = 4W_t^3\,dW_t + 6W_t^2\,dt$. The stochastic integral has zero mean, so $\mathbb{E}[W_t^4] = 6\int_0^t \mathbb{E}[W_s^2]\,ds = 6\int_0^t s\,ds = 3t^2$. Consistent with the Gaussian kurtosis of 3: $\mathbb{E}[W_t^4] = 3\,(\mathbb{E}[W_t^2])^2$. The same method gives $\mathbb{E}[W_t^6] = 15t^3$.
:::
:::

::: question Two stocks follow $dS^i_t = \mu_i S^i_t\,dt + \sigma_i S^i_t\,dW^i_t$ with $d\langle W^1, W^2\rangle_t = \rho\,dt$. Find the dynamics of the ratio $Y_t = S^1_t/S^2_t$ and its volatility.
::: hint
Take $f(x, y) = x/y$; you need $\partial_{xy} f = -1/y^2$ and $\partial_{yy} f = 2x/y^3$, and the covariation $d\langle S^1, S^2\rangle_t = \rho\sigma_1\sigma_2 S^1_t S^2_t\,dt$.
:::
::: answer
$dY = \dfrac{dS^1}{S^2} - \dfrac{S^1}{(S^2)^2}\,dS^2 + \tfrac12\Big[2\cdot\big(-\tfrac{1}{(S^2)^2}\big)\,d\langle S^1, S^2\rangle + \tfrac{2S^1}{(S^2)^3}\,d\langle S^2\rangle\Big]$. With $d\langle S^2\rangle_t = \sigma_2^2 (S^2_t)^2\,dt$ this gives
$$
\frac{dY_t}{Y_t} = \big(\mu_1 - \mu_2 + \sigma_2^2 - \rho\sigma_1\sigma_2\big)\,dt + \sigma_1\,dW^1_t - \sigma_2\,dW^2_t .
$$
The volatility of $Y$ is $\sqrt{\sigma_1^2 + \sigma_2^2 - 2\rho\sigma_1\sigma_2}$, which is the volatility that enters Margrabe's exchange-option formula. The two extra drift terms $\sigma_2^2 - \rho\sigma_1\sigma_2$ are pure Itô corrections: the ordinary quotient rule would miss them.
:::
:::
