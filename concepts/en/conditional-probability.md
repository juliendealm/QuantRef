---
title: Conditional Probability
subject: probability
summary: How the probability of an event changes once you know that another event has occurred. The single most-used idea in quant finance, because every price is a bet conditioned on the information available.
difficulty: 1
interview: 5
tags: [probability, conditioning, information, bayes]
prerequisites: []
related: [bayes-theorem, martingales]
---

## Intuition

Probability is always relative to what you know. Before any dice are rolled, the chance that two dice sum to 8 is $5/36$. Tell me the first die shows a 5, and that chance becomes $1/6$: the sample space has shrunk to the six rows where the first die is 5, and exactly one of them sums to 8.

Conditioning is nothing more than **restricting the sample space** to the outcomes compatible with what you learned, then renormalising. In finance, "what you know" at time $t$ is the information set $\mathcal{F}_t$: every fair price, forecast and risk number is $\mathbb{E}[X \mid \mathcal{F}_t]$, not $\mathbb{E}[X]$.

## Key Formulas

| Name | Formula |
|---|---|
| Definition | $\mathbb{P}(A \mid B) = \dfrac{\mathbb{P}(A \cap B)}{\mathbb{P}(B)}$ |
| Multiplication rule | $\mathbb{P}(A \cap B) = \mathbb{P}(A \mid B)\,\mathbb{P}(B)$ |
| Total probability | $\mathbb{P}(A) = \sum_i \mathbb{P}(A \mid B_i)\,\mathbb{P}(B_i)$ |
| Independence | $\mathbb{P}(A \mid B) = \mathbb{P}(A)$ |
| Tower property | $\mathbb{E}[\mathbb{E}[X \mid \mathcal{G}]] = \mathbb{E}[X]$ |

## Common Mistakes

::: pitfall Confusing $\mathbb{P}(A \mid B)$ with $\mathbb{P}(B \mid A)$
The "prosecutor's fallacy". $\mathbb{P}(\text{positive test} \mid \text{sick})$ can be 99 % while $\mathbb{P}(\text{sick} \mid \text{positive test})$ is 10 %. They are linked by Bayes' theorem, not equal.
:::

::: pitfall Forgetting to renormalise
After filtering to $B$, divide by $\mathbb{P}(B)$. Reporting $\mathbb{P}(A \cap B)$ as if it were $\mathbb{P}(A \mid B)$ understates every conditional probability.
:::

::: pitfall Treating "given" as symmetric in time
Conditioning on the future ($\mathbb{E}[X_t \mid \mathcal{F}_T]$ with $T > t$) is mathematically fine but is **look-ahead bias** in a backtest.
:::

## 30-Second Revision

Conditional probability = restrict to what you know, then renormalise: $\mathbb{P}(A \mid B) = \mathbb{P}(A \cap B)/\mathbb{P}(B)$. Chain it for joint probabilities, sum it over a partition for total probability, and remember the tower property for nested information. In finance every price is $\mathbb{E}^{\mathbb{Q}}[\cdot \mid \mathcal{F}_t]$; independence means conditioning changes nothing.

## Mathematical Formulation

::: formula Conditional probability
$$
\mathbb{P}(A \mid B) = \frac{\mathbb{P}(A \cap B)}{\mathbb{P}(B)}, \qquad \mathbb{P}(B) > 0
$$
:::

Rearranged: the **multiplication rule** $\mathbb{P}(A \cap B) = \mathbb{P}(A \mid B)\,\mathbb{P}(B)$, which chains to any number of events:

$$
\mathbb{P}(A_1 \cap A_2 \cap \cdots \cap A_n) = \mathbb{P}(A_1)\,\mathbb{P}(A_2 \mid A_1)\,\mathbb{P}(A_3 \mid A_1 \cap A_2)\cdots\mathbb{P}(A_n \mid A_1 \cap \cdots \cap A_{n-1}).
$$

::: formula Law of total probability
If $B_1, \dots, B_n$ partition the sample space,
$$
\mathbb{P}(A) = \sum_{i=1}^{n} \mathbb{P}(A \mid B_i)\,\mathbb{P}(B_i).
$$
:::

Two events are **independent** exactly when conditioning changes nothing: $\mathbb{P}(A \mid B) = \mathbb{P}(A)$, equivalently $\mathbb{P}(A \cap B) = \mathbb{P}(A)\mathbb{P}(B)$.

For random variables the same idea gives the **conditional expectation** $\mathbb{E}[X \mid Y]$, itself a random variable, with the **tower property**:

::: formula Tower property
$$
\mathbb{E}\big[\,\mathbb{E}[X \mid \mathcal{G}]\,\big] = \mathbb{E}[X], \qquad \text{and more generally} \qquad \mathbb{E}\big[\,\mathbb{E}[X \mid \mathcal{G}] \mid \mathcal{H}\,\big] = \mathbb{E}[X \mid \mathcal{H}] \text{ for } \mathcal{H} \subseteq \mathcal{G}.
$$
:::

## Derivation

On a finite $\Omega$, learning that $B$ occurred rules out every $\omega \notin B$; keep the relative weights of the survivors and rescale them to sum to 1:

$$
\mathbb{P}_B(\omega) = \frac{\mathbb{P}(\omega)}{\mathbb{P}(B)} \quad \text{for } \omega \in B, \qquad 0 \text{ otherwise}.
$$

Summing over $\omega \in A$ gives $\mathbb{P}_B(A) = \mathbb{P}(A \cap B)/\mathbb{P}(B)$ — the unique measure that assigns $B$ probability 1 and preserves the ratios $\mathbb{P}(\omega_1)/\mathbb{P}(\omega_2)$ inside $B$.

Total probability follows by writing $A = \bigcup_i (A \cap B_i)$ as a disjoint union and applying the multiplication rule to each piece.

## Assumptions & Edge Cases

- **Null conditioning event.** $\mathbb{P}(A \mid B)$ is undefined when $\mathbb{P}(B) = 0$. Conditioning on a continuous $Y = y$ needs densities or the measure-theoretic definition; naive use gives the Borel–Kolmogorov paradox.
- **Conditioning is not causation.** $\mathbb{P}(A \mid B)$ can be large because $B$ causes $A$, because $A$ causes $B$, or because both share a common driver.
- **Independence is not transitive.** $A \perp B$ and $B \perp C$ does not imply $A \perp C$; pairwise independence does not imply mutual independence.
- **Conditional independence can appear or vanish.** Two independent events can become dependent once you condition on a third (Berkson's paradox: among admitted students, talent and hard work look negatively correlated).

## Worked Example

Roll two fair dice. What is $\mathbb{P}(\text{sum} = 8 \mid \text{at least one die shows } 5)$?

The conditioning event has $11$ outcomes (six with the first die 5, six with the second, minus the double-counted $(5,5)$). The sum is 8 for $(5,3)$ and $(3,5)$, so the answer is $2/11 \approx 0.182$ — against $1/6$ when conditioning on "the *first* die shows 5". The wording of the information matters.

```python
import numpy as np

rng = np.random.default_rng(42)
n = 1_000_000
d1 = rng.integers(1, 7, n)
d2 = rng.integers(1, 7, n)
total = d1 + d2

# P(sum = 8 | first die = 5) — exact answer 1/6
first_is_5 = d1 == 5
p_cond = np.mean(total[first_is_5] == 8)

# P(sum = 8 | at least one die is 5) — exact answer 2/11
at_least_one_5 = (d1 == 5) | (d2 == 5)
p_cond2 = np.mean(total[at_least_one_5] == 8)

print(f"P(sum=8 | first=5)       = {p_cond:.4f}  (exact {1/6:.4f})")
print(f"P(sum=8 | at least one 5) = {p_cond2:.4f}  (exact {2/11:.4f})")
```

::: output
```
P(sum=8 | first=5)       = 0.1676  (exact 0.1667)
P(sum=8 | at least one 5) = 0.1821  (exact 0.1818)
```
:::

## Why It Matters in Quant Finance

- **Pricing is conditional expectation.** Under the risk-neutral measure the price of a payoff $H$ at $t$ is $e^{-r(T-t)}\,\mathbb{E}^{\mathbb{Q}}[H \mid \mathcal{F}_t]$; a [[martingales|martingale]] is defined entirely through such expectations. See [[black-scholes]].
- **Signals are conditional edges.** A signal is useful if $\mathbb{E}[r_{t+1} \mid \text{signal}_t] \neq \mathbb{E}[r_{t+1}]$; a backtest estimates exactly that conditional mean.
- **Risk is conditional.** Expected shortfall is $\mathbb{E}[L \mid L \ge \mathrm{VaR}]$ (see [[value-at-risk]]); stress tests are expectations given a scenario.
- **Bayesian updating** ([[bayes-theorem]]) is repeated conditioning as data arrive — what a [[kalman-filter|Kalman filter]] does every tick.

## Interview Questions

::: question You flip two fair coins. Given that at least one is heads, what is the probability both are heads?
::: hint
List the four equally likely outcomes and remove those incompatible with the information.
:::
::: answer
$\{HH, HT, TH\}$ has probability $3/4$ and $\{HH\}$ has $1/4$, so $\mathbb{P} = (1/4)/(3/4) = 1/3$, not $1/2$. The classic follow-up, "given the *first* coin is heads", gives $1/2$.
:::
:::

::: question A stock has a 60 % chance of going up on any day, and days are independent. Given it went up on at least 2 of the last 3 days, what is the probability it went up on all 3?
::: hint
Binomial counts: $\mathbb{P}(3 \text{ ups}) = 0.6^3$ and $\mathbb{P}(\text{exactly } 2) = 3 \cdot 0.6^2 \cdot 0.4$.
:::
::: answer
$\mathbb{P}(3) = 0.216$, $\mathbb{P}(2) = 0.432$. $\mathbb{P}(3 \mid \geq 2) = 0.216 / (0.216 + 0.432) = 1/3$.
:::
:::

::: question State the tower property and explain why it makes the discounted price of any claim a martingale under the pricing measure.
::: hint
Write the price at $t$ as a conditional expectation of the payoff and take another conditional expectation at $s < t$.
:::
::: answer
Tower property: $\mathbb{E}[\mathbb{E}[X \mid \mathcal{F}_t] \mid \mathcal{F}_s] = \mathbb{E}[X \mid \mathcal{F}_s]$ for $s \le t$. With $\tilde{V}_t = \mathbb{E}^{\mathbb{Q}}[\tilde{H} \mid \mathcal{F}_t]$ (discounted payoff $\tilde{H}$), $\mathbb{E}^{\mathbb{Q}}[\tilde{V}_t \mid \mathcal{F}_s] = \mathbb{E}^{\mathbb{Q}}[\tilde{H} \mid \mathcal{F}_s] = \tilde{V}_s$ — precisely the martingale property.
:::
:::

::: question Two events $A$ and $B$ are independent. Are they still independent conditional on a third event $C$? Give a counter-example from finance.
::: hint
Think of two independent signals and conditioning on their sum, or on a selection rule that used both.
:::
::: answer
Not in general. Let $A$ = "strategy 1 made money" and $B$ = "strategy 2 made money", independent, and condition on $C$ = "exactly one made money". Knowing $A$ occurred now implies $B$ did not: perfect negative dependence given $C$. This is collider bias — conditioning on a common consequence creates dependence. Berkson's paradox is the same mechanism with $C = A \cup B$. It shows up whenever you analyse a *selected* sample, e.g. funds that survived.
:::
:::
