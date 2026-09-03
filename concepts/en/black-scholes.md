---
title: Black–Scholes Model
subject: derivatives
summary: The benchmark model for European options. A lognormal stock hedged continuously gives a PDE, a closed-form price with d1 and d2 and, through implied volatility, the language every options desk speaks even where the model is known to fail.
difficulty: 3
interview: 5
tags: [black-scholes, options, pde, risk-neutral, implied-volatility, delta-hedging]
prerequisites: [ito-lemma, martingales]
related: [greeks, brownian-motion]
---

## Intuition

An option is priced by **replication**, not by forecasting the stock: a portfolio of stock and cash reproducing the payoff in every scenario must cost exactly what the option costs, or there is a free lunch. Under geometric Brownian motion with constant volatility and continuous trading that portfolio exists — hold $\Delta = \partial V/\partial S$ shares, rebalanced continuously. The drift $\mu$ cancels; only $\sigma$ matters, since it sets how much the hedge moves. Equivalently: the hedged portfolio is riskless so it earns $r$ (a PDE), or discounted prices are [[martingales]] under a risk-neutral $\mathbb{Q}$.

::: viz black-scholes Price against payoff
The orange curve is the price now, the grey kink the payoff at expiry. Drag maturity toward zero and the smooth curve collapses onto the kink — time value is the whole distance between them.
:::

## Key Formulas

| Name | Formula |
|---|---|
| PDE | $\partial_t V + \tfrac12\sigma^2 S^2\partial_{SS}V + rS\,\partial_S V - rV = 0$ |
| Call | $C = S\,N(d_1) - Ke^{-rT}N(d_2)$ |
| Put | $P = Ke^{-rT}N(-d_2) - S\,N(-d_1)$ |
| $d_1$, $d_2$ | $d_1 = \dfrac{\ln(S/K) + (r + \tfrac12\sigma^2)T}{\sigma\sqrt{T}}$, $d_2 = d_1 - \sigma\sqrt{T}$ |
| Put–call parity | $C - P = S - Ke^{-rT}$ |
| Risk-neutral price | $V_t = e^{-r(T-t)}\,\mathbb{E}^{\mathbb{Q}}[\text{payoff} \mid \mathcal{F}_t]$ |
| ATM rule of thumb | $C \approx 0.4\,S\,\sigma\sqrt{T}$ |

## Common Mistakes

::: pitfall Plugging the expected return into the formula
$\mu$ does not appear because the hedge removes it. "Risk-neutral" does not mean investors are indifferent to risk; it means replication makes risk preferences irrelevant to the price.
:::

::: pitfall Confusing N(d1) and N(d2)
$N(d_2)$ is the risk-neutral exercise probability. $N(d_1)$ is the delta, *always larger*: the exercise probability under the stock-numeraire measure. Calling it "the probability of finishing in the money" is a classic error.
:::

::: pitfall Mixing time units
The formula only ever sees $\sigma\sqrt{T}$ and $rT$, with $\sigma$ annualised and $T$ in years. Mixing a daily $\sigma$ with a maturity in years is wrong by a factor of $\sqrt{252}$.
:::

::: pitfall Reading the smile as a pricing error to be arbitraged
The smile is not a market error; it prices tails and crashes that the lognormal model cannot. Selling "expensive" out-of-the-money puts on that basis is the trade that blows up.
:::

## 30-Second Revision

Continuous delta hedging of a lognormal stock makes the option riskless, so it earns $r$: $\partial_t V + \tfrac12\sigma^2 S^2 \partial_{SS}V + rS\,\partial_S V - rV = 0$; equivalently, price $=$ discounted $\mathbb{Q}$-expectation with drift $r$. For a call, $C = S N(d_1) - K e^{-rT} N(d_2)$, $d_{1,2} = [\ln(S/K) + (r \pm \tfrac12\sigma^2)T]/(\sigma\sqrt{T})$; the put comes from parity $C - P = S - K e^{-rT}$. $\mu$ never appears. Implied volatility inverts the formula; the smile shows the model is wrong, but it stays the quoting language.

## Mathematical Formulation

**Assumptions.** $dS_t = \mu S_t\,dt + \sigma S_t\,dW_t$, constant $\mu$, $\sigma$ and continuously compounded $r$; no dividends (a yield $q$ is an easy extension); frictionless markets; no arbitrage; European exercise.

::: formula Black–Scholes PDE
$$
\partial_t V + \tfrac12 \sigma^2 S^2\,\partial_{SS} V + r S\,\partial_S V - r V = 0, \qquad V(T, S) = \text{payoff}(S).
$$
:::

::: formula Call and put prices
$$
\begin{aligned}
C &= S\,N(d_1) - K e^{-rT} N(d_2), \\
P &= K e^{-rT} N(-d_2) - S\,N(-d_1), \\
d_1 &= \frac{\ln(S/K) + (r + \tfrac12\sigma^2)T}{\sigma\sqrt{T}}, \qquad d_2 = d_1 - \sigma\sqrt{T},
\end{aligned}
$$
with $N$ the standard normal CDF and $T$ the time to expiry.
:::

::: formula Put–call parity
$$
C - P = S - K e^{-rT}.
$$
:::

Parity is model-free (long call plus short put is a forward), so the put needs no new calculation.

::: formula Risk-neutral valuation
$$
V_t = e^{-r(T-t)}\,\mathbb{E}^{\mathbb{Q}}\big[\text{payoff}(S_T) \mid \mathcal{F}_t\big], \qquad dS_t = r S_t\,dt + \sigma S_t\,dW^{\mathbb{Q}}_t .
$$
:::

$N(d_2) = \mathbb{Q}(S_T > K)$ is the exercise probability, so $K e^{-rT} N(d_2)$ is the present value of what you pay; $S\,N(d_1) = e^{-rT}\,\mathbb{E}^{\mathbb{Q}}[S_T \mathbf{1}_{S_T > K}]$ is what you receive, and $N(d_1)$ is the delta.

With a continuous dividend yield $q$, the call is $C = S e^{-qT} N(d_1) - K e^{-rT} N(d_2)$ with $d_1 = \dfrac{\ln(S/K) + (r - q + \tfrac12\sigma^2)T}{\sigma\sqrt{T}}$. Discount the spot by $e^{-qT}$ **or** carry it at $r - q$ inside $d_1$ — the two are the same recipe written twice, so applying both double-counts the dividend. Black's formula for options on futures is the case $q = r$.

## Derivation

**Delta hedging (the PDE).** With $\Pi = V - \Delta S$, [[ito-lemma|Itô's lemma]] gives

$$
dV = \Big(\partial_t V + \tfrac12\sigma^2 S^2\,\partial_{SS} V\Big)\,dt + \partial_S V\,dS_t ,
$$

so $d\Pi = dV - \Delta\,dS_t$, and $\Delta = \partial_S V$ removes every $dS_t$ term:

$$
d\Pi = \Big(\partial_t V + \tfrac12\sigma^2 S^2\,\partial_{SS} V\Big)\,dt .
$$

Riskless over $dt$, it must earn $r$: $d\Pi = r\Pi\,dt = r\,(V - S\,\partial_S V)\,dt$. Equating gives the PDE. $\mu$ left with the $dS_t$ terms; that is the point. (Strictly, one also checks the portfolio is self-financing.)

**Risk-neutral argument.** Girsanov with $\lambda = (\mu - r)/\sigma$ makes $W^{\mathbb{Q}}_t = W_t + \lambda t$ Brownian and $dS_t = r S_t\,dt + \sigma S_t\,dW^{\mathbb{Q}}_t$. Then $e^{-rt} S_t$ and any discounted self-financing portfolio are $\mathbb{Q}$-martingales, so $V_t = e^{-r(T-t)}\,\mathbb{E}^{\mathbb{Q}}[\text{payoff} \mid \mathcal{F}_t]$; Feynman–Kac says this solves the PDE.

**Closed form.** Under $\mathbb{Q}$, $S_T = S\exp\big((r - \tfrac12\sigma^2)T + \sigma\sqrt{T}\,Z\big)$, $Z \sim \mathcal{N}(0, 1)$, and

$$
S_T > K \iff Z > \frac{\ln(K/S) - (r - \tfrac12\sigma^2)T}{\sigma\sqrt{T}} = -d_2 ,
$$

so

$$
C = e^{-rT}\int_{-d_2}^{\infty} \Big(S e^{(r - \frac12\sigma^2)T + \sigma\sqrt{T} z} - K\Big)\varphi(z)\,dz .
$$

The second term is $K e^{-rT}\,\mathbb{Q}(Z > -d_2) = K e^{-rT} N(d_2)$. For the first, complete the square: $e^{-\frac12\sigma^2 T + \sigma\sqrt{T}z}\,\varphi(z) = \varphi(z - \sigma\sqrt{T})$, giving $S\,N(d_2 + \sigma\sqrt{T}) = S\,N(d_1)$. The put follows from parity.

## Assumptions & Edge Cases

- **Limits.** $T \to 0$: $C \to (S - K)^+$. $\sigma \to 0$: $C \to (S - K e^{-rT})^+$, a forward or nothing. $\sigma \to \infty$: $C \to S$. Deep in the money $C \approx S - K e^{-rT}$; deep out, $C \to 0$ faster than any power of $S$. At the money forward, $C \approx 0.4\,S\,\sigma\sqrt{T}$.
- **Implied volatility.** $\partial C/\partial\sigma > 0$, so $C_{BS}(\sigma)$ rises strictly from $(S - Ke^{-rT})^+$ to $S$: every price in that range has a unique $\sigma_{\text{impl}}$. The model wants one number for all $K$, $T$; the market gives a **smile** (FX) or an equity **skew** with expensive low-strike puts.
- **Discrete hedging.** $N$ rebalancings leave a zero-mean error of size $\sqrt{\pi/4}\;\sigma\nu/\sqrt{N}$ (Derman–Kamal): about 10 % of the premium for daily hedging of a 3-month option ($N \approx 63$).
- **Jumps.** Unhedgeable with the stock alone: incomplete market, no unique price, out-of-the-money puts underpriced — one reading of the skew.
- **Stochastic volatility.** A residual vega and a smile; Heston adds a correlated second Brownian motion.
- **Transaction costs.** Leland replaces $\sigma^2$ by $\sigma^2\big(1 + \sqrt{2/\pi}\;k/(\sigma\sqrt{\delta t})\big)$ for proportional cost $k$ and interval $\delta t$.
- **Rates, dividends, early exercise.** Stochastic rates matter when dated long, discrete dividends need an adjusted spot. An American put on a non-dividend stock is worth strictly more, an American call the same: early exercise is never optimal.

## Worked Example

One-year call, $S = 100$, $K = 105$, $r = 3\,\%$, $\sigma = 20\,\%$:

$$
d_1 = \frac{\ln(100/105) + (0.03 + 0.02)\times 1}{0.20} = \frac{-0.04879 + 0.05}{0.20} = 0.0060, \qquad d_2 = 0.0060 - 0.20 = -0.1940 .
$$

$N(d_1) = 0.5024$, $N(d_2) = 0.4231$, $K e^{-rT} = 105 \times 0.97045 = 101.90$, so

$$
C = 100 \times 0.5024 - 101.90 \times 0.4231 = 50.24 - 43.11 = 7.13, \qquad P = C - S + K e^{-rT} = 9.02 .
$$

The call is out of the money, yet $N(d_2) = 42\,\%$ of risk-neutral paths finish above $105$. The code checks this by Monte Carlo, then inverts the formula on a market quote:

```python
import numpy as np
from scipy.stats import norm
from scipy.optimize import brentq

def bs_call(S, K, T, r, sigma):
    d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    return S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)

S0, K, T, r, sigma = 100.0, 105.0, 1.0, 0.03, 0.20
analytic = bs_call(S0, K, T, r, sigma)

# Monte Carlo under the risk-neutral GBM: S_T = S0 exp((r - sigma^2/2) T + sigma sqrt(T) Z)
rng = np.random.default_rng(2024)
n = 1_000_000
Z = rng.standard_normal(n)
ST = S0 * np.exp((r - 0.5 * sigma**2) * T + sigma * np.sqrt(T) * Z)
disc_payoff = np.exp(-r * T) * np.maximum(ST - K, 0.0)
mc, se = disc_payoff.mean(), disc_payoff.std(ddof=1) / np.sqrt(n)

print(f"Black-Scholes call : {analytic:.4f}")
print(f"Monte Carlo call   : {mc:.4f}  (std error {se:.4f})")

# Put from put-call parity, then implied vol backed out of a market quote
put = analytic - S0 + K * np.exp(-r * T)
print(f"Put via parity     : {put:.4f}")
market_price = 8.00
iv = brentq(lambda s: bs_call(S0, K, T, r, s) - market_price, 1e-6, 5.0)
print(f"Implied vol of a call quoted at {market_price:.2f} : {iv:.4%}")
print(f"Check: bs_call at implied vol = {bs_call(S0, K, T, r, iv):.4f}")
```

::: output
```
Black-Scholes call : 7.1281
Monte Carlo call   : 7.1427  (std error 0.0126)
Put via parity     : 9.0248
Implied vol of a call quoted at 8.00 : 22.1859%
Check: bs_call at implied vol = 8.0000
```
:::

Monte Carlo sits 1.2 standard errors from the closed form. A quote of $8.00$ implies $22.2\,\%$, not $20\,\%$; collecting that number for every strike and maturity builds the volatility surface. `brentq` works because the price is monotone in $\sigma$.

## Why It Matters in Quant Finance

- **The quoting convention.** Options quote in implied volatility; every richer model is calibrated to the surface $\sigma_{\text{impl}}(K, T)$.
- **The hedge.** $N(d_1)$ and the other [[greeks]] are what a desk trades; a hedged position earns $\tfrac12\Gamma S^2(\sigma^2_{\text{real}} - \sigma^2_{\text{impl}})\,dt$, a bet on realised versus implied variance.
- **The template.** Black-76, Garman–Kohlhagen, Merton's credit model, local and stochastic volatility, jump diffusions: each relaxes one assumption.
- **Martingale pricing made concrete.** Change of measure, [[martingales|martingale]] discounted prices and Feynman–Kac, on [[brownian-motion]] and [[ito-lemma|Itô's lemma]].
- **Risk systems.** Option books are revalued with the formula and its Greeks under thousands of scenarios for [[value-at-risk]].
- **The standard interview derivation:** the PDE from a hedge, the closed form, why the smile exists.

## Interview Questions

::: question Why does the expected return $\mu$ of the stock not appear in the Black–Scholes formula?
::: hint
What happens to the $dS$ terms when you hold $\partial_S V$ shares against the option?
:::
::: answer
The portfolio holds $\Delta = \partial_S V$ shares and the $dS$ terms — the only place $\mu$ appears — cancel exactly. The hedged position is riskless and must earn $r$, so the price depends only on $r$ and $\sigma$; equivalently the risk-neutral drift is $r$. Two investors who disagree about $\mu$ but agree on $\sigma$ agree on the price.
:::
:::

::: question Give a quick approximation for an at-the-money call and derive it.
::: hint
Take $K = S e^{rT}$ so that $d_1 = -d_2 = \tfrac12\sigma\sqrt{T}$, and use $N(x) - N(-x) \approx 2x\,\varphi(0)$ for small $x$.
:::
::: answer
With $K e^{-rT} = S$, $C = S\big[N(\tfrac12\sigma\sqrt{T}) - N(-\tfrac12\sigma\sqrt{T})\big] \approx S\,\sigma\sqrt{T}\,\varphi(0) = S\sigma\sqrt{T}/\sqrt{2\pi} \approx 0.4\,S\sigma\sqrt{T}$. For $S = 100$, $\sigma = 20\,\%$, $T = 0.25$: $C \approx 4.0$ (exact $3.99$), within 1 % while $\sigma\sqrt{T} \lesssim 0.5$.
:::
:::

::: question Interpret $N(d_1)$ and $N(d_2)$ probabilistically and explain why $N(d_1) > N(d_2)$.
::: hint
Write the call as $e^{-rT}\,\mathbb{E}^{\mathbb{Q}}[S_T\mathbf{1}_{S_T>K}] - Ke^{-rT}\,\mathbb{Q}(S_T > K)$ and ask which paths carry more weight in the first term.
:::
::: answer
$N(d_2) = \mathbb{Q}(S_T > K)$. In the first term the indicator is weighted by $S_T$, the density of $\mathbb{Q}^S$ with $d\mathbb{Q}^S/d\mathbb{Q} = S_T/(S e^{rT})$ (stock as numeraire); under $\mathbb{Q}^S$ the log-stock drifts at $r + \tfrac12\sigma^2$ and $\mathbb{Q}^S(S_T > K) = N(d_1)$. High-$S_T$ paths weigh more, so $N(d_1) > N(d_2)$, the arguments differing by $\sigma\sqrt{T}$. $N(d_1)$ is also $\partial C/\partial S$.
:::
:::

::: question Suppose volatility is stochastic but independent of the Brownian motion driving the stock. Show that the option price is an average of Black–Scholes prices and explain why this creates a smile but not a skew.
::: hint
Condition on the whole volatility path. What is the distribution of $\ln S_T$ given $\bar\sigma^2 = \tfrac1T\int_0^T\sigma_t^2\,dt$?
:::
::: answer
Given the path, $\ln S_T$ is Gaussian with variance $\bar\sigma^2 T$, so the conditional price is $C_{BS}(\bar\sigma)$ and by the tower property $C = \mathbb{E}[C_{BS}(\bar\sigma)]$ (Hull–White mixing). Convexity in $\sigma$ is the volga, $\nu\,d_1 d_2/\sigma$. Near the money $d_1 d_2 < 0$, $C_{BS}$ is concave, so ATM implied vol is *below* $\sqrt{\mathbb{E}[\bar\sigma^2]}$; far from the money $d_1 d_2 > 0$ and implied vol is pushed *up*: a symmetric smile. The mixing is symmetric in $\ln(K/S)$ about the forward, so no skew; that needs correlation between volatility and returns ($\rho < 0$ in Heston) or asymmetric jumps.
:::
:::
