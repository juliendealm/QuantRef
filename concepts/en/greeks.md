---
title: Option Greeks
subject: derivatives
summary: The sensitivities of an option price to spot, volatility, time and rates. Delta is the hedge ratio, gamma the convexity you own or owe, theta the rent you pay for it; a delta-hedged book's P&L is a bet on realised versus implied variance.
difficulty: 2
interview: 5
tags: [greeks, delta, gamma, vega, theta, hedging, options, risk]
prerequisites: [black-scholes]
related: [value-at-risk]
---

## Intuition

A price is one number. To manage a position you need to know how that number moves when the market moves, and that is what the Greeks are: the partial derivatives of the option value with respect to each input, i.e. the coefficients of a Taylor expansion of the price.

- **Delta** $\Delta$: how many shares the option behaves like. A call with $\Delta = 0.56$ gains about $0.56$ when the stock gains $1$. It is the hedge ratio: sell $0.56$ shares per call and you are locally immune to small moves.
- **Gamma** $\Gamma$: how fast delta changes. It is the *convexity* of the position. Long options have positive gamma: they get longer as the stock rises and shorter as it falls, which is the profitable way round. Short options owe that convexity.
- **Vega** $\nu$: exposure to implied volatility. Long options are long vega: the more the market expects the stock to move, the more the option is worth.
- **Theta** $\Theta$: time decay. The rent a long-option holder pays every day for the convexity. It is negative for most long positions.
- **Rho** $\rho$: rate sensitivity. Usually the least important for short-dated equity options, but it matters for long-dated and interest-rate products.

The central relationship is between gamma and theta. A delta-hedged long option earns $\tfrac12\Gamma\,(dS)^2$ from convexity on every move and pays $\Theta\,dt$ in decay. In the [[black-scholes]] model these balance exactly when the stock moves at the implied volatility. Move more, gamma wins; move less, theta wins. That is the whole business of volatility trading.

## Mathematical Formulation

With $V(t, S, \sigma, r)$ the option price, $T$ the time to expiry and $\varphi$ the standard normal density:

$$
\Delta = \frac{\partial V}{\partial S}, \qquad
\Gamma = \frac{\partial^2 V}{\partial S^2}, \qquad
\nu = \frac{\partial V}{\partial \sigma}, \qquad
\Theta = \frac{\partial V}{\partial t}, \qquad
\rho = \frac{\partial V}{\partial r}.
$$

::: formula Black–Scholes Greeks of a call
$$
\begin{aligned}
\Delta &= N(d_1), &
\Gamma &= \frac{\varphi(d_1)}{S\sigma\sqrt{T}}, &
\nu &= S\,\varphi(d_1)\sqrt{T}, \\
\Theta &= -\frac{S\,\varphi(d_1)\,\sigma}{2\sqrt{T}} - rKe^{-rT}N(d_2), &
\rho &= KTe^{-rT}N(d_2).
\end{aligned}
$$
:::

For the put with the same strike and expiry, parity $P = C - S + Ke^{-rT}$ gives $\Delta_P = N(d_1) - 1$, the **same** $\Gamma$ and $\nu$, $\Theta_P = -\dfrac{S\varphi(d_1)\sigma}{2\sqrt{T}} + rKe^{-rT}N(-d_2)$ and $\rho_P = -KTe^{-rT}N(-d_2)$.

Two identities worth knowing: $\nu = \sigma T S^2\,\Gamma$ (vega and gamma are proportional for a given expiry), and the Black–Scholes PDE read as a relation between Greeks:

::: formula Gamma–theta trade-off
$$
\Theta + \tfrac12\sigma^2 S^2\,\Gamma + rS\,\Delta - rV = 0
\qquad\Longrightarrow\qquad
\Theta \approx -\tfrac12\sigma^2 S^2\,\Gamma \quad \text{for a delta-hedged position when } r \approx 0.
$$
:::

::: formula Delta-hedging P&L
Hedging continuously at the implied volatility $\sigma_{\text{impl}}$ while the stock actually moves with volatility $\sigma_{\text{real}}$ earns, over $dt$,
$$
d\,\mathrm{P\&L} = \tfrac12\,\Gamma\,S^2\,\big(\sigma_{\text{real}}^2 - \sigma_{\text{impl}}^2\big)\,dt .
$$
:::

**Higher-order Greeks.** The most used second-order cross sensitivities are

$$
\text{vanna} = \frac{\partial^2 V}{\partial S\,\partial\sigma} = \frac{\partial\Delta}{\partial\sigma} = -\varphi(d_1)\,\frac{d_2}{\sigma}, \qquad
\text{volga} = \frac{\partial^2 V}{\partial\sigma^2} = \nu\,\frac{d_1 d_2}{\sigma}.
$$

Vanna says how the hedge changes when volatility moves; volga is the convexity in volatility that makes out-of-the-money options benefit from volatility of volatility. Charm ($\partial\Delta/\partial t$) and speed ($\partial\Gamma/\partial S$) also appear on desk reports.

**Desk units.** Nobody quotes raw derivatives. Delta is quoted in shares or in cash ($\Delta \cdot S$); gamma as the change in cash delta for a 1 % move ($\Gamma S^2/100$); vega per volatility point ($\nu/100$); theta per calendar day ($\Theta/365$).

## Derivation

All five closed forms follow from $C = S\,N(d_1) - Ke^{-rT}N(d_2)$ and one identity:

$$
S\,\varphi(d_1) = Ke^{-rT}\varphi(d_2).
$$

Proof: $\varphi(d_1)/\varphi(d_2) = e^{-(d_1^2 - d_2^2)/2} = e^{-(d_1 - d_2)(d_1 + d_2)/2}$; with $d_1 - d_2 = \sigma\sqrt{T}$ and $d_1 + d_2 = [2\ln(S/K) + 2rT]/(\sigma\sqrt{T})$ the exponent is $-\ln(S/K) - rT$, so the ratio is $Ke^{-rT}/S$.

**Delta.** $\partial_S C = N(d_1) + S\varphi(d_1)\,\partial_S d_1 - Ke^{-rT}\varphi(d_2)\,\partial_S d_2$. Since $\partial_S d_1 = \partial_S d_2 = 1/(S\sigma\sqrt{T})$, the identity makes the last two terms cancel: $\Delta = N(d_1)$.

**Gamma.** $\Gamma = \partial_S N(d_1) = \varphi(d_1)/(S\sigma\sqrt{T})$.

**Vega.** $\partial_\sigma C = S\varphi(d_1)\,\partial_\sigma d_1 - Ke^{-rT}\varphi(d_2)\,\partial_\sigma d_2 = S\varphi(d_1)\,(\partial_\sigma d_1 - \partial_\sigma d_2) = S\varphi(d_1)\sqrt{T}$, because $d_2 = d_1 - \sigma\sqrt{T}$.

**Theta and rho.** The same cancellation gives $\rho = KTe^{-rT}N(d_2)$. For theta it is quickest to use the PDE: $\Theta = rC - rS\Delta - \tfrac12\sigma^2S^2\Gamma = -rKe^{-rT}N(d_2) - \dfrac{S\varphi(d_1)\sigma}{2\sqrt{T}}$.

**The hedging P&L.** Hold the option and short $\Delta$ shares, financed at $r$. Over a small step, by [[ito-lemma|Itô's lemma]] with the *realised* move $dS$,

$$
d\Pi = \Theta\,dt + \tfrac12\Gamma\,(dS)^2 + (\text{financing}) .
$$

The model's PDE says $\Theta\,dt + \tfrac12\Gamma S^2\sigma_{\text{impl}}^2\,dt + (\text{financing}) = 0$: the position breaks even if the stock moves at implied volatility. Subtracting, and writing $(dS)^2 = S^2\sigma_{\text{real}}^2\,dt$ for the realised squared return,

$$
d\,\mathrm{P\&L} = \tfrac12\Gamma S^2\big(\sigma_{\text{real}}^2 - \sigma_{\text{impl}}^2\big)\,dt .
$$

Integrated to expiry, $\mathrm{P\&L} = \int_0^T \tfrac12\Gamma_t S_t^2\big(\sigma_{\text{real},t}^2 - \sigma_{\text{impl}}^2\big)\,dt$. The gamma sits inside the integral: the P&L is path-dependent, and realised variance only counts where the option has gamma, i.e. near the strike.

## Assumptions & Edge Cases

- **Model dependence.** The closed forms above are Black–Scholes Greeks and assume constant volatility. With a smile, the delta depends on how implied vol is assumed to move with spot: "sticky strike" gives $\Delta_{BS}$, "sticky delta" gives $\Delta_{BS} + \nu\,\partial\sigma_{\text{impl}}/\partial S$. Desks argue about this daily.
- **Near expiry, at the money.** $\Gamma$ and $\Theta$ blow up like $1/\sqrt{T}$: delta flips between 0 and 1 on tiny moves (pin risk). Vega goes to zero like $\sqrt{T}$.
- **Away from the money.** $\Gamma$ and $\nu$ vanish; the option becomes either a forward ($\Delta \to 1$) or nothing ($\Delta \to 0$).
- **Where the peaks are.** Gamma and vega are maximal near the at-the-money-forward strike; gamma peaks slightly below it and vega slightly above, because of the $\tfrac12\sigma^2 T$ shift inside $d_1$.
- **Theta can be positive.** A deep in-the-money European put earns theta (the term $rKe^{-rT}N(-d_2)$ dominates): you are owed $K$ and get closer to receiving it. Similarly for a call on a stock with a large dividend yield.
- **Additivity.** Greeks are linear in the position, so a book's Greeks are the sum of its positions'. That is why risk is aggregated and limited by Greek, but it only holds per underlying and, for vega, per expiry bucket.
- **The P&L formula is the gamma leg only.** It ignores discrete-hedging noise, transaction costs, and the vega P&L from a change in implied volatility while you hold the position.

## Worked Example

Six-month at-the-money call: $S = K = 100$, $T = 0.5$, $r = 2\,\%$, $\sigma = 25\,\%$.

$$
d_1 = \frac{0 + (0.02 + 0.03125)\times 0.5}{0.25\sqrt{0.5}} = \frac{0.02563}{0.17678} = 0.1450, \qquad d_2 = -0.0318, \qquad \varphi(d_1) = 0.3948 .
$$

- $\Delta = N(0.1450) = 0.558$: hedge 100 contracts on 100 shares each by shorting $5\,576$ shares.
- $\Gamma = 0.3948/(100 \times 0.25 \times 0.7071) = 0.0223$: a $1$ move changes delta by $0.022$, i.e. $223$ shares to trade on the same book.
- $\nu = 100 \times 0.3948 \times 0.7071 = 27.9$ per unit of $\sigma$, i.e. $0.279$ per volatility point.
- $\Theta = -6.98 - 0.97 = -7.94$ per year, i.e. $-0.0218$ per calendar day: the 100 contracts lose about $218$ a day if nothing moves.
- $\rho = 24.1$ per unit of $r$, i.e. $0.24$ per 100 bp.

The daily break-even move follows from the trade-off: with $\Theta_\gamma = -6.98$ the gamma part of theta, $\tfrac12\Gamma(\delta S)^2 = -\Theta_\gamma\,\delta t$ gives $\delta S = S\sigma\sqrt{\delta t} = 100 \times 0.25 \times \sqrt{1/365} = 1.31$. If the stock moves more than $1.31$ in a day, the long gamma pays for the theta.

The script computes the analytic Greeks, checks them against finite-difference bumps of the price, and verifies the PDE identity:

```python
import numpy as np
from scipy.stats import norm

def bs_call(S, K, T, r, sigma):
    d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    return S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)

S, K, T, r, sigma = 100.0, 100.0, 0.5, 0.02, 0.25
d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
d2 = d1 - sigma * np.sqrt(T)
phi = norm.pdf(d1)
analytic = {
    "delta": norm.cdf(d1),
    "gamma": phi / (S * sigma * np.sqrt(T)),
    "vega":  S * phi * np.sqrt(T),
    "theta": -S * phi * sigma / (2 * np.sqrt(T)) - r * K * np.exp(-r * T) * norm.cdf(d2),
    "rho":   K * T * np.exp(-r * T) * norm.cdf(d2),
}

f = lambda **kw: bs_call(**{"S": S, "K": K, "T": T, "r": r, "sigma": sigma, **kw})
h = 1e-3                                   # relative bump for S; absolute for the others
bump = {
    "delta": (f(S=S * (1 + h)) - f(S=S * (1 - h))) / (2 * S * h),
    "gamma": (f(S=S * (1 + h)) - 2 * f() + f(S=S * (1 - h))) / (S * h) ** 2,
    "vega":  (f(sigma=sigma + h) - f(sigma=sigma - h)) / (2 * h),
    "theta": -(f(T=T + h) - f(T=T - h)) / (2 * h),      # d/dt = -d/dT
    "rho":   (f(r=r + h) - f(r=r - h)) / (2 * h),
}

print(f"Call = {f():.4f}   (S={S:.0f}, K={K:.0f}, T={T}, r={r}, sigma={sigma})")
print(f"{'greek':<6}{'analytic':>12}{'bump':>12}{'abs diff':>11}")
for g in analytic:
    print(f"{g:<6}{analytic[g]:12.6f}{bump[g]:12.6f}{abs(analytic[g] - bump[g]):11.1e}")

a = analytic
pde = a["theta"] + 0.5 * sigma**2 * S**2 * a["gamma"] + r * S * a["delta"] - r * f()
print(f"\nBS PDE residual theta + 1/2 s^2 S^2 gamma + r S delta - r C = {pde:.2e}")
print(f"Gamma-theta trade-off: -1/2 s^2 S^2 gamma = {-0.5 * sigma**2 * S**2 * a['gamma']:.4f}, theta = {a['theta']:.4f}")
```

::: output
```
Call = 7.5168   (S=100, K=100, T=0.5, r=0.02, sigma=0.25)
greek     analytic        bump   abs diff
delta     0.557628    0.557627    6.8e-07
gamma     0.022332    0.022332    5.0e-08
vega     27.914655   27.914654    1.3e-06
theta    -7.943582   -7.943585    3.5e-06
rho      24.122954   24.122947    7.5e-06

BS PDE residual theta + 1/2 s^2 S^2 gamma + r S delta - r C = 0.00e+00
Gamma-theta trade-off: -1/2 s^2 S^2 gamma = -6.9787, theta = -7.9436
```
:::

The bumps agree with the closed forms to six decimals; the PDE residual is zero to machine precision. The gap between $-\tfrac12\sigma^2S^2\Gamma = -6.98$ and $\Theta = -7.94$ is the rate term $rS\Delta - rC = 0.02 \times (55.76 - 7.52) = 0.96$.

## Why It Matters in Quant Finance

- **Hedging is done in Greeks.** Delta is hedged with the underlying, gamma and vega with other options; a book is "flat" when its net Greeks are within limits, not when it has no positions.
- **Risk limits are Greek limits.** A desk gets a delta limit per underlying, a vega limit per expiry bucket, a gamma limit near expiries. Breaching one forces a hedge, whatever the trader's view.
- **P&L explain.** Each day's P&L is decomposed into $\Delta\,\delta S + \tfrac12\Gamma\,\delta S^2 + \nu\,\delta\sigma + \Theta\,\delta t + \text{unexplained}$. A large unexplained term means the model or the data is wrong.
- **Volatility trading is gamma trading.** The formula $\tfrac12\Gamma S^2(\sigma_{\text{real}}^2 - \sigma_{\text{impl}}^2)$ is the P&L of every delta-hedged option trade; variance swaps exist to remove the path dependence coming from $\Gamma_t$.
- **Delta–gamma VaR.** The change in a book's value is approximated by $\Delta\,\delta S + \tfrac12\Gamma\,\delta S^2 + \nu\,\delta\sigma$ inside [[value-at-risk]] engines that cannot reprice every option under every scenario.
- **Gamma is the Itô term.** The $\tfrac12\Gamma(dS)^2$ that drives everything above is the second-order term of [[ito-lemma|Itô's lemma]]; theta is what the [[black-scholes]] PDE says you must pay for it.

## Common Mistakes

::: pitfall Confusing theta per year and theta per day
The closed form gives $\Theta$ per year. Desks quote it per calendar day ($\Theta/365$) or per trading day ($\Theta/252$); a factor of 365 is easy to lose and turns a $-0.02$ daily decay into an absurd $-7.94$.
:::

::: pitfall Believing a delta-hedged position is riskless
Delta hedging removes the first-order exposure only. What remains is $\tfrac12\Gamma S^2(\sigma_{\text{real}}^2 - \sigma_{\text{impl}}^2)\,dt$ plus the vega exposure to changes in implied volatility. Short-gamma positions lose on every large move and are the classic source of blow-ups.
:::

::: pitfall Quoting vega in the wrong units
$\nu = 27.9$ from the formula means $27.9$ per unit of $\sigma$, i.e. per 100 volatility points. Per point it is $0.279$. Using the wrong one overstates a position's vega risk by a factor of 100.
:::

::: pitfall Netting Greeks across different underlyings or expiries
A long delta in one stock does not hedge a short delta in another; long vega in 2-year options does not hedge short vega in 1-month options, because implied vols of different expiries move differently. Aggregate Greeks only within the bucket where the risk factor is common.
:::

## 30-Second Revision

Greeks are the partial derivatives of the option price. Call: $\Delta = N(d_1)$, $\Gamma = \varphi(d_1)/(S\sigma\sqrt{T})$, $\nu = S\varphi(d_1)\sqrt{T}$, $\Theta = -S\varphi(d_1)\sigma/(2\sqrt{T}) - rKe^{-rT}N(d_2)$, $\rho = KTe^{-rT}N(d_2)$; the put shares $\Gamma$ and $\nu$ and has delta $N(d_1) - 1$. The PDE says $\Theta + \tfrac12\sigma^2S^2\Gamma + rS\Delta - rV = 0$, so long gamma costs theta. A delta-hedged position earns $\tfrac12\Gamma S^2(\sigma_{\text{real}}^2 - \sigma_{\text{impl}}^2)\,dt$: a bet on realised versus implied variance, weighted by where the gamma sits. Desks quote delta in cash, gamma per 1 %, vega per point, theta per day, and set limits on each.

## Key Formulas

| Name | Formula |
|---|---|
| Delta (call / put) | $N(d_1)$ / $N(d_1) - 1$ |
| Gamma | $\dfrac{\varphi(d_1)}{S\sigma\sqrt{T}}$ |
| Vega | $S\,\varphi(d_1)\sqrt{T} = \sigma T S^2\,\Gamma$ |
| Theta (call) | $-\dfrac{S\varphi(d_1)\sigma}{2\sqrt{T}} - rKe^{-rT}N(d_2)$ |
| Rho (call) | $KTe^{-rT}N(d_2)$ |
| Gamma–theta | $\Theta \approx -\tfrac12\sigma^2S^2\Gamma$ |
| Hedging P&L | $\tfrac12\Gamma S^2(\sigma_{\text{real}}^2 - \sigma_{\text{impl}}^2)\,dt$ |
| Vanna, volga | $-\varphi(d_1)\,d_2/\sigma$, $\nu\,d_1 d_2/\sigma$ |

## Interview Questions

::: question Is the delta of an at-the-money call equal to $0.5$? Justify.
::: hint
Look at the sign of $d_1$ when $S = K$.
:::
::: answer
Slightly above. With $S = K$, $d_1 = (r + \tfrac12\sigma^2)\sqrt{T}/\sigma > 0$, so $\Delta = N(d_1) > 0.5$; in the worked example it is $0.558$. Two effects push it up: the forward is above spot ($r > 0$), and the $\tfrac12\sigma^2$ term of the lognormal distribution. The delta is exactly $0.5$ at $S = Ke^{-(r + \sigma^2/2)T}$, a little below the forward. The at-the-money put has delta $0.558 - 1 = -0.442$; call and put deltas always sum to $1$ in absolute value.
:::
:::

::: question You are long 100 at-the-money calls (100 shares each) from the worked example, delta-hedged. The stock moves 2 % today; implied vol is 25 %. Roughly, what is your P&L?
::: hint
Compare the gamma gain $\tfrac12\Gamma(\delta S)^2$ with one day of theta, or compare $2\,\%$ with the daily break-even move $\sigma/\sqrt{252}$.
:::
::: answer
Per option: gamma gain $\tfrac12 \times 0.0223 \times 2^2 = 0.0446$; theta cost for one trading day $\approx \tfrac12\Gamma S^2\sigma^2/252 = \tfrac12 \times 0.0223 \times 10^4 \times 0.0625/252 = 0.0277$; net $+0.017$ per option, about $+170$ for the $10\,000$ underlying shares. Faster: the daily break-even move is $\sigma/\sqrt{252} = 1.57\,\%$; $2\,\%$ exceeds it, so long gamma wins, by $\tfrac12\Gamma S^2(0.02^2 - 0.0157^2) \approx 0.017$ per option.
:::
:::

::: question Show that vega and gamma are proportional for a single expiry, explain why the proportionality fails across expiries, and what that implies for a calendar spread.
::: hint
Divide the closed forms; the ratio only involves $S$, $\sigma$ and $T$.
:::
::: answer
$\nu/\Gamma = S\varphi(d_1)\sqrt{T} \cdot S\sigma\sqrt{T}/\varphi(d_1) = \sigma S^2 T$. For one expiry, a gamma-neutral book is vega-neutral and conversely. Across expiries the factor $T$ differs: a long-dated option carries a lot of vega per unit of gamma, a short-dated one a lot of gamma per unit of vega. A calendar spread (long the 1-year, short the 1-month, same strike) can therefore be long vega and short gamma at the same time: it profits if implied vol rises but loses if the stock moves a lot in the short term. There is no single vanilla trade that isolates "volatility".
:::
:::

::: question Derive the delta-hedging P&L formula and explain why a trader can lose money even though realised volatility over the life of the trade equals the implied volatility they paid.
::: hint
Where does the gamma sit in the integrated P&L? What if the stock is volatile far from the strike and quiet near it?
:::
::: answer
By Itô's lemma the hedged portfolio changes by $\Theta\,dt + \tfrac12\Gamma(dS)^2$ plus financing; the PDE says this is zero when $(dS)^2 = S^2\sigma_{\text{impl}}^2\,dt$; substituting the realised $(dS)^2 = S^2\sigma_{\text{real}}^2\,dt$ leaves $\tfrac12\Gamma S^2(\sigma_{\text{real}}^2 - \sigma_{\text{impl}}^2)\,dt$. Integrated: $\mathrm{P\&L} = \int_0^T \tfrac12\Gamma_t S_t^2(\sigma_{\text{real},t}^2 - \sigma_{\text{impl}}^2)\,dt$, with $\Gamma_t$ large near the strike and near zero far from it. Suppose the stock moves at 40 % while it is 30 % away from the strike ($\Gamma_t \approx 0$) and then sits still at 10 % near the strike ($\Gamma_t$ large), averaging 25 % overall. The integrand is negative where it matters and negligible where realised vol was high: the long-gamma trader loses although average realised vol matched implied. Variance swaps replicate a log contract whose dollar gamma $\Gamma S^2$ is constant, which removes the weighting and turns the P&L into a clean bet on average realised variance.
:::
:::
