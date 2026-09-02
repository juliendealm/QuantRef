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

An option is not priced by forecasting where the stock will go. It is priced by **replication**: if you can build a portfolio of stock and cash that reproduces the option's payoff in every scenario, the option must cost exactly what that portfolio costs, otherwise there is a free lunch.

Black and Scholes showed that when the stock follows a geometric Brownian motion with constant volatility and trading is continuous, such a portfolio exists. It holds $\Delta = \partial V/\partial S$ shares at every instant, rebalanced continuously. The expected return $\mu$ of the stock never enters: whatever the drift, the hedge cancels it. Only the volatility $\sigma$ matters, because it governs how much the hedge has to be adjusted.

Two equivalent views of the same fact:

1. **PDE view.** The hedged portfolio is riskless, so it must earn the risk-free rate $r$. That statement is a partial differential equation for $V(t, S)$.
2. **Probabilistic view.** Under an artificial "risk-neutral" probability $\mathbb{Q}$ in which the stock drifts at $r$, discounted prices are [[martingales]], and the option price is the discounted expected payoff.

The closed form is the solution of the PDE for a call payoff; everything else in the options world (the smile, the [[greeks]], implied volatility) is defined relative to it.

## Mathematical Formulation

**Assumptions.**

1. The stock follows $dS_t = \mu S_t\,dt + \sigma S_t\,dW_t$ with constant $\mu$ and $\sigma$ (lognormal returns, continuous paths).
2. A constant risk-free rate $r$, continuously compounded, at which one can borrow and lend freely.
3. No dividends during the option's life (a continuous dividend yield $q$ is an easy extension).
4. Frictionless markets: no transaction costs or taxes, continuous trading, unlimited short selling, infinitely divisible assets.
5. No arbitrage.
6. European exercise: payoff at $T$ only.

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

Parity is model-free (a long call plus a short put is a forward), which is why the put formula follows from the call formula with no new calculation.

::: formula Risk-neutral valuation
$$
V_t = e^{-r(T-t)}\,\mathbb{E}^{\mathbb{Q}}\big[\text{payoff}(S_T) \mid \mathcal{F}_t\big], \qquad dS_t = r S_t\,dt + \sigma S_t\,dW^{\mathbb{Q}}_t .
$$
:::

Reading the formula: $N(d_2) = \mathbb{Q}(S_T > K)$ is the risk-neutral probability of exercise, so $K e^{-rT} N(d_2)$ is the present value of what you expect to pay. $S\,N(d_1) = e^{-rT}\,\mathbb{E}^{\mathbb{Q}}[S_T \mathbf{1}_{S_T > K}]$ is the present value of what you expect to receive, and $N(d_1)$ is also the delta of the call.

With a continuous dividend yield $q$, replace $S$ by $S e^{-qT}$ everywhere and $r$ by $r - q$ inside $d_1$. Black's formula for options on futures is the case $q = r$.

## Derivation

**Delta-hedging argument (the PDE).** Let $V(t, S)$ be the option price, assumed smooth. Form the portfolio $\Pi = V - \Delta S$: long the option, short $\Delta$ shares. By [[ito-lemma|Itô's lemma]],

$$
dV = \Big(\partial_t V + \tfrac12\sigma^2 S^2\,\partial_{SS} V\Big)\,dt + \partial_S V\,dS_t ,
$$

so $d\Pi = dV - \Delta\,dS_t$. Choosing $\Delta = \partial_S V$ removes every $dS_t$ term:

$$
d\Pi = \Big(\partial_t V + \tfrac12\sigma^2 S^2\,\partial_{SS} V\Big)\,dt .
$$

The portfolio is now riskless over $dt$. By no-arbitrage it must earn the risk-free rate: $d\Pi = r\Pi\,dt = r\,(V - S\,\partial_S V)\,dt$. Equating the two expressions gives the Black–Scholes PDE. Note that $\mu$ disappeared when the $dS_t$ terms cancelled; this is the whole point.

(Strictly, one should show that the replicating portfolio is self-financing; the heuristic above yields the right equation and is what interviewers expect.)

**Risk-neutral argument (the expectation).** Girsanov's theorem says that under the measure $\mathbb{Q}$ defined by the exponential martingale with $\lambda = (\mu - r)/\sigma$, the process $W^{\mathbb{Q}}_t = W_t + \lambda t$ is a Brownian motion, and $dS_t = r S_t\,dt + \sigma S_t\,dW^{\mathbb{Q}}_t$. Then $e^{-rt} S_t$ is a $\mathbb{Q}$-martingale, and so is the discounted value of any self-financing portfolio; the option price is therefore $V_t = e^{-r(T-t)}\,\mathbb{E}^{\mathbb{Q}}[\text{payoff} \mid \mathcal{F}_t]$. The Feynman–Kac theorem states that this expectation solves the PDE above.

**Closed form.** Under $\mathbb{Q}$, $S_T = S\exp\big((r - \tfrac12\sigma^2)T + \sigma\sqrt{T}\,Z\big)$ with $Z \sim \mathcal{N}(0, 1)$. The call finishes in the money when $Z > -d_2$, since

$$
S_T > K \iff Z > \frac{\ln(K/S) - (r - \tfrac12\sigma^2)T}{\sigma\sqrt{T}} = -d_2 .
$$

Then

$$
C = e^{-rT}\int_{-d_2}^{\infty} \Big(S e^{(r - \frac12\sigma^2)T + \sigma\sqrt{T} z} - K\Big)\varphi(z)\,dz .
$$

The second term is $K e^{-rT}\,\mathbb{Q}(Z > -d_2) = K e^{-rT} N(d_2)$. For the first, complete the square: $e^{-\frac12\sigma^2 T + \sigma\sqrt{T}z}\,\varphi(z) = \varphi(z - \sigma\sqrt{T})$, so it equals $S\int_{-d_2}^{\infty}\varphi(z - \sigma\sqrt{T})\,dz = S\,N(d_2 + \sigma\sqrt{T}) = S\,N(d_1)$. The put follows from parity.

## Assumptions & Edge Cases

**Limits worth knowing.**

- $T \to 0$: $C \to (S - K)^+$, with $d_1, d_2 \to \pm\infty$ according to whether $S > K$.
- $\sigma \to 0$: $C \to (S - K e^{-rT})^+$, the value of a forward if positive: without uncertainty the option is a forward or nothing.
- $\sigma \to \infty$: $d_1 \to +\infty$, $d_2 \to -\infty$, $C \to S$: an option on something infinitely volatile is worth the stock.
- Deep in the money: $C \approx S - K e^{-rT}$; deep out of the money: $C \to 0$ faster than any power of $S$.
- At the money forward ($S = K e^{-rT}$): $C \approx 0.4\,S\,\sigma\sqrt{T}$, the trader's rule of thumb.

**Implied volatility and the smile.** Because $\partial C/\partial\sigma > 0$, the map $\sigma \mapsto C_{BS}(\sigma)$ is strictly increasing from $(S - Ke^{-rT})^+$ to $S$; for any market price in that range there is a unique $\sigma_{\text{impl}}$ that reproduces it. If the model were right, $\sigma_{\text{impl}}$ would be the same number for every strike and maturity. It is not: plotted against $K$ it gives a **smile** (in FX) or, since 1987 in equities, a **skew** with expensive low-strike puts; plotted against $T$ it gives a term structure. The smile is the market's measured disagreement with lognormality: fat tails, crash fear, the leverage effect. Yet implied volatility remains the universal quoting convention, precisely because everyone can invert the same formula.

**What breaks, and how badly.**

- **Discrete hedging.** Rebalancing $N$ times instead of continuously leaves a hedging error with zero mean and a standard deviation of order $\sigma\,\nu/\sqrt{N}$, where $\nu$ is the vega (Derman and Kamal's estimate is $\sqrt{\pi/4}\;\sigma\nu/\sqrt{N}$). Daily hedging of a 3-month option ($N \approx 63$) leaves an error of roughly 10 % of the premium.
- **Jumps.** A jump cannot be hedged with a position in the stock alone: the market is incomplete, the price is no longer unique, and out-of-the-money puts are systematically underpriced by the model, which is one reading of the skew.
- **Stochastic volatility.** With $\sigma$ random the hedge carries a residual vega exposure and the smile appears; models such as Heston add a second Brownian motion correlated with the stock.
- **Transaction costs.** Continuous rebalancing would cost infinitely much. Leland's adjustment replaces $\sigma^2$ by $\sigma^2\big(1 + \sqrt{2/\pi}\;k/(\sigma\sqrt{\delta t})\big)$ for a proportional cost $k$ and a rebalancing interval $\delta t$.
- **Rates and dividends.** Stochastic rates matter for long-dated options; discrete dividends need an adjusted spot. Both are routine extensions.
- **Early exercise.** The formula is for European options. An American put on a non-dividend stock is worth strictly more; an American call on a non-dividend stock is worth the same, because it is never optimal to exercise early.

## Worked Example

Price a one-year call with $S = 100$, $K = 105$, $r = 3\,\%$, $\sigma = 20\,\%$.

$$
d_1 = \frac{\ln(100/105) + (0.03 + 0.02)\times 1}{0.20} = \frac{-0.04879 + 0.05}{0.20} = 0.0061, \qquad d_2 = 0.0061 - 0.20 = -0.1939 .
$$

$N(d_1) = 0.5024$, $N(d_2) = 0.4231$, $K e^{-rT} = 105 \times 0.97045 = 101.90$, so

$$
C = 100 \times 0.5024 - 101.90 \times 0.4231 = 50.24 - 43.11 = 7.13, \qquad P = C - S + K e^{-rT} = 9.02 .
$$

The call is slightly out of the money, yet $N(d_2) = 42\,\%$ of risk-neutral paths still finish above $105$. The code below confirms the closed form by Monte Carlo under the same GBM, then inverts the formula to recover an implied volatility from a market quote:

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

The Monte Carlo estimate sits 1.2 standard errors from the closed form, as it should. A market quote of $8.00$ for this call is inconsistent with $\sigma = 20\,\%$: the market is implying $22.2\,\%$. Collecting that number for every strike and maturity is how the volatility surface is built. `brentq` works because the call price is monotone in $\sigma$, so the root is unique.

## Why It Matters in Quant Finance

- **It is the quoting convention.** Traders quote options in implied volatility, not in price, and describe the market by the vol surface $\sigma_{\text{impl}}(K, T)$. Every more sophisticated model is calibrated to that surface.
- **It defines the hedge.** The delta $N(d_1)$ and the other [[greeks]] are what a desk actually trades; the P&L of a hedged position is $\tfrac12\Gamma S^2(\sigma^2_{\text{real}} - \sigma^2_{\text{impl}})\,dt$, a bet on realised versus implied variance.
- **It is the template for everything after it.** Black-76 for futures and caps, Garman–Kohlhagen for FX, Merton's structural credit model (equity is a call on the firm's assets), local and stochastic volatility, jump diffusions: each is Black–Scholes with one assumption relaxed.
- **It is the concrete case of martingale pricing.** The change of measure, the [[martingales|martingale]] property of discounted prices and Feynman–Kac all appear here in the simplest non-trivial setting, built on [[brownian-motion]] and [[ito-lemma|Itô's lemma]].
- **It feeds risk systems.** Option books are revalued with the formula and its Greeks under thousands of scenarios to compute [[value-at-risk]].
- **It is the standard interview derivation.** Deriving the PDE from a hedge, stating the closed form and explaining why the smile exists is expected of anyone touching options.

## Common Mistakes

::: pitfall Plugging the expected return into the formula
$\mu$ does not appear because the hedge removes it. "Risk-neutral" does not mean investors are indifferent to risk; it means that the replication argument makes risk preferences irrelevant to the price.
:::

::: pitfall Confusing N(d1) and N(d2)
$N(d_2)$ is the risk-neutral probability that the option is exercised. $N(d_1)$ is the delta, and is *always larger* than $N(d_2)$; it is the exercise probability under the measure that uses the stock as numeraire. Reporting $N(d_1)$ as "the probability of finishing in the money" is a classic error.
:::

::: pitfall Mixing time units
$\sigma$ is annualised and $T$ is in years; the formula only ever sees $\sigma\sqrt{T}$ and $rT$. Feeding a daily volatility with a maturity in years, or a maturity in days with an annual $\sigma$, is wrong by a factor of $\sqrt{252}$.
:::

::: pitfall Reading the smile as a pricing error to be arbitraged
The smile is not a mistake by the market; it is the market pricing tails and crashes that the lognormal model cannot. Selling "expensive" out-of-the-money puts because their implied volatility is high is the trade that blows up.
:::

## 30-Second Revision

Under a lognormal stock with constant $\sigma$, continuous delta hedging makes the option riskless, so it earns $r$: $\partial_t V + \tfrac12\sigma^2 S^2 \partial_{SS}V + rS\,\partial_S V - rV = 0$. Equivalently, price $=$ discounted $\mathbb{Q}$-expectation with drift $r$. For a call, $C = S N(d_1) - K e^{-rT} N(d_2)$ with $d_{1,2} = [\ln(S/K) + (r \pm \tfrac12\sigma^2)T]/(\sigma\sqrt{T})$; the put comes from parity $C - P = S - K e^{-rT}$. $\mu$ never appears. Implied volatility inverts the formula; the smile shows the model is wrong, but the formula remains the quoting language.

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

## Interview Questions

::: question Why does the expected return $\mu$ of the stock not appear in the Black–Scholes formula?
::: hint
What happens to the $dS$ terms when you hold $\partial_S V$ shares against the option?
:::
::: answer
The replicating portfolio holds $\Delta = \partial_S V$ shares, and the $dS$ terms, the only place where $\mu$ appears, cancel exactly. The hedged position is riskless and must earn $r$, so the price depends only on $r$ and $\sigma$. Equivalently, under the risk-neutral measure the drift is replaced by $r$. Two investors who disagree about $\mu$ but agree on $\sigma$ agree on the option price.
:::
:::

::: question Give a quick approximation for an at-the-money call and derive it.
::: hint
Take $K = S e^{rT}$ so that $d_1 = -d_2 = \tfrac12\sigma\sqrt{T}$, and use $N(x) - N(-x) \approx 2x\,\varphi(0)$ for small $x$.
:::
::: answer
With $K e^{-rT} = S$, $C = S\big[N(\tfrac12\sigma\sqrt{T}) - N(-\tfrac12\sigma\sqrt{T})\big] \approx S\,\sigma\sqrt{T}\,\varphi(0) = S\sigma\sqrt{T}/\sqrt{2\pi} \approx 0.4\,S\sigma\sqrt{T}$. For $S = 100$, $\sigma = 20\,\%$, $T = 0.25$: $C \approx 0.4 \times 100 \times 0.2 \times 0.5 = 4.0$ (exact: $3.99$). The approximation is within 1 % as long as $\sigma\sqrt{T} \lesssim 0.5$.
:::
:::

::: question Interpret $N(d_1)$ and $N(d_2)$ probabilistically and explain why $N(d_1) > N(d_2)$.
::: hint
Write the call as $e^{-rT}\,\mathbb{E}^{\mathbb{Q}}[S_T\mathbf{1}_{S_T>K}] - Ke^{-rT}\,\mathbb{Q}(S_T > K)$ and ask which paths carry more weight in the first term.
:::
::: answer
$N(d_2) = \mathbb{Q}(S_T > K)$. In the first term the indicator is weighted by $S_T$, i.e. by the density of a measure $\mathbb{Q}^S$ with $d\mathbb{Q}^S/d\mathbb{Q} = S_T/(S e^{rT})$ (the stock as numeraire); under $\mathbb{Q}^S$ the log-stock drifts at $r + \tfrac12\sigma^2$ instead of $r - \tfrac12\sigma^2$, and $\mathbb{Q}^S(S_T > K) = N(d_1)$. High-$S_T$ paths get more weight, so the exercise probability under $\mathbb{Q}^S$ is higher: $N(d_1) > N(d_2)$, the two arguments differing by exactly $\sigma\sqrt{T}$. $N(d_1)$ is also $\partial C/\partial S$.
:::
:::

::: question Suppose volatility is stochastic but independent of the Brownian motion driving the stock. Show that the option price is an average of Black–Scholes prices and explain why this creates a smile but not a skew.
::: hint
Condition on the whole volatility path. What is the distribution of $\ln S_T$ given $\bar\sigma^2 = \tfrac1T\int_0^T\sigma_t^2\,dt$?
:::
::: answer
Given the volatility path, $\ln S_T$ is Gaussian with variance $\bar\sigma^2 T$, so the conditional price is $C_{BS}(\bar\sigma)$, and by the tower property $C = \mathbb{E}[C_{BS}(\bar\sigma)]$ (Hull–White mixing). The convexity of $C_{BS}$ in $\sigma$ is the volga, $\nu\,d_1 d_2/\sigma$. Near the money $d_1 d_2 < 0$: $C_{BS}$ is concave in $\bar\sigma$, the average price is below the price at the average volatility, and at-the-money implied vol is *below* $\sqrt{\mathbb{E}[\bar\sigma^2]}$. Far from the money $d_1 d_2 > 0$: $C_{BS}$ is convex and implied vol is pushed *up*. Result: a symmetric smile. Because the mixing is symmetric in $\ln(K/S)$ about the forward, it cannot produce a skew; a skew requires correlation between volatility and returns (the leverage effect, $\rho < 0$ in Heston) or asymmetric jumps.
:::
:::
