---
title: Bayes' Theorem
subject: probability
summary: How to reverse a conditional probability and update a belief when new evidence arrives. The rule behind every filter, every regime model, and every honest assessment of how much a "95 % accurate" signal is actually worth.
difficulty: 1
interview: 5
tags: [probability, bayes, updating, priors, base-rate]
prerequisites: [conditional-probability]
related: [conditional-probability, kalman-filter]
---

## Intuition

You usually know probabilities in the *forward* direction: in a bear regime, this signal fires 90 % of the time. You need the *reverse* direction: the signal just fired, so how likely is a bear regime? Bayes' theorem is the bridge, and the toll is the **base rate** — the probability of the hypothesis before you saw anything.

Think in odds: prior odds times the **likelihood ratio** gives posterior odds. Evidence never tells you what to believe, only how much to *move*. The move is multiplicative, so updates chain — today's posterior is tomorrow's prior, which is all a [[kalman-filter|Kalman filter]] or a regime-switching model does, tick after tick.

::: viz bayes-theorem A 99% accurate test on a rare disease
Keep sensitivity and specificity high and drag the prevalence down: false positives swamp true positives long before the test gets bad. The posterior is driven by the base rate.
:::

## Key Formulas

| Name | Formula |
|---|---|
| Bayes' theorem | $\mathbb{P}(A \mid B) = \dfrac{\mathbb{P}(B \mid A)\,\mathbb{P}(A)}{\mathbb{P}(B)}$ |
| Evidence | $\mathbb{P}(B) = \sum_j \mathbb{P}(B \mid A_j)\,\mathbb{P}(A_j)$ |
| Odds form | $\text{odds}(A \mid B) = LR \times \text{odds}(A)$, $LR = \dfrac{\mathbb{P}(B \mid A)}{\mathbb{P}(B \mid A^c)}$ |
| Log-odds | $\operatorname{logit}\mathbb{P}(A \mid B) = \operatorname{logit}\mathbb{P}(A) + \log LR$ |
| Continuous posterior | $\pi(\theta \mid x) \propto f(x \mid \theta)\,\pi(\theta)$ |
| Beta–Binomial | $\mathrm{Beta}(\alpha, \beta) \xrightarrow{k \text{ of } n} \mathrm{Beta}(\alpha + k, \beta + n - k)$, mean $\dfrac{\alpha + k}{\alpha + \beta + n}$ |

## Common Mistakes

::: pitfall Base-rate neglect
Reading "the test is 99 % accurate" as "a positive means 99 % sick". Sensitivity is $\mathbb{P}(+ \mid \text{sick})$; the posterior can be 17 % or 1 % depending on prevalence. Write the prior down first.
:::

::: pitfall Multiplying likelihood ratios of correlated evidence
Three indicators built from the same price series are not three independent confirmations. Their joint $LR$ is far smaller than the product of the individual ones; treating them as independent produces overconfident posteriors.
:::

::: pitfall A dogmatic prior
Setting $\mathbb{P}(\text{model is wrong}) = 0$ means no amount of losses can ever change your mind. A prior of 0 or 1 is not a belief, it is a refusal to learn.
:::

::: pitfall Confusing the likelihood with the posterior
Maximising $f(x \mid \theta)$ ignores the prior and can differ wildly from the posterior mean when data are scarce. With $n = 10$ trades the sample hit rate is not your best estimate of the true one.
:::

## 30-Second Revision

Bayes reverses conditioning: $\mathbb{P}(A \mid B) = \mathbb{P}(B \mid A)\mathbb{P}(A)/\mathbb{P}(B)$. In odds, posterior odds $=$ likelihood ratio $\times$ prior odds; independent evidence multiplies $LR$s. The base rate is what intuition forgets: a 99 %-sensitive test on a 1 % condition gives a 17 % posterior. Conjugate priors make updates closed-form, the posterior mean averaging prior and data with the prior worth $\alpha + \beta$ observations. Regime and Kalman filters repeat this every period.

## Mathematical Formulation

::: formula Bayes' theorem
$$
\mathbb{P}(A \mid B) = \frac{\mathbb{P}(B \mid A)\,\mathbb{P}(A)}{\mathbb{P}(B)}, \qquad \mathbb{P}(B) = \mathbb{P}(B \mid A)\,\mathbb{P}(A) + \mathbb{P}(B \mid A^c)\,\mathbb{P}(A^c).
$$
:::

With a partition $A_1, \dots, A_n$ (mutually exclusive hypotheses):

$$
\mathbb{P}(A_i \mid B) = \frac{\mathbb{P}(B \mid A_i)\,\mathbb{P}(A_i)}{\sum_{j=1}^{n} \mathbb{P}(B \mid A_j)\,\mathbb{P}(A_j)}.
$$

$\mathbb{P}(A)$ is the **prior**, $\mathbb{P}(B \mid A)$ the **likelihood**, $\mathbb{P}(B)$ the **evidence**, $\mathbb{P}(A \mid B)$ the **posterior**.

::: formula Odds form
$$
\underbrace{\frac{\mathbb{P}(A \mid B)}{\mathbb{P}(A^c \mid B)}}_{\text{posterior odds}}
= \underbrace{\frac{\mathbb{P}(B \mid A)}{\mathbb{P}(B \mid A^c)}}_{\text{likelihood ratio } LR}
\times
\underbrace{\frac{\mathbb{P}(A)}{\mathbb{P}(A^c)}}_{\text{prior odds}}
$$
:::

Logs turn the product into a sum: $\operatorname{logit}\mathbb{P}(A \mid B) = \operatorname{logit}\mathbb{P}(A) + \log LR$, where $\log LR$ is the **weight of evidence**.

::: formula Sequential updating
If pieces of evidence $B_1, \dots, B_k$ are conditionally independent given $A$ and given $A^c$,
$$
\text{odds}(A \mid B_1, \dots, B_k) = \text{odds}(A) \times \prod_{i=1}^{k} LR_i, \qquad LR_i = \frac{\mathbb{P}(B_i \mid A)}{\mathbb{P}(B_i \mid A^c)}.
$$
:::

For continuous $\theta$: $\pi(\theta \mid x) \propto f(x \mid \theta)\,\pi(\theta)$, normalised by the evidence $\int f(x \mid \theta')\pi(\theta')\,d\theta'$. A prior is **conjugate** when the posterior stays in the same family, reducing sequential updating to bookkeeping:

::: formula Beta–Binomial conjugacy
Prior $\theta \sim \mathrm{Beta}(\alpha, \beta)$ and $k$ successes in $n$ Bernoulli($\theta$) trials give
$$
\theta \mid k \sim \mathrm{Beta}(\alpha + k,\; \beta + n - k), \qquad
\mathbb{E}[\theta \mid k] = \frac{\alpha + k}{\alpha + \beta + n}
= \frac{\alpha + \beta}{\alpha + \beta + n}\cdot\frac{\alpha}{\alpha + \beta} + \frac{n}{\alpha + \beta + n}\cdot\frac{k}{n}.
$$
:::

The posterior mean averages prior mean and sample frequency, the prior worth $\alpha + \beta$ "pseudo-observations". Other classic pairs: Normal–Normal (the Kalman update), Gamma–Poisson.

## Derivation

Bayes' theorem is the [[conditional-probability|multiplication rule]] read in both directions: $\mathbb{P}(A \cap B) = \mathbb{P}(A \mid B)\,\mathbb{P}(B) = \mathbb{P}(B \mid A)\,\mathbb{P}(A)$, so divide by $\mathbb{P}(B) > 0$. Total probability expands the denominator over any partition.

**Odds form.** Write the theorem for $A$ and for $A^c$ and divide: $\mathbb{P}(B)$ cancels, leaving $\text{posterior odds} = LR \times \text{prior odds}$. You never need the evidence $\mathbb{P}(B)$.

**Sequential form.** Conditional independence gives $\mathbb{P}(B_1 \cap B_2 \mid A) = \mathbb{P}(B_1 \mid A)\,\mathbb{P}(B_2 \mid A)$, and likewise under $A^c$, so the joint ratio is $LR_1 LR_2$. Equivalently, update on $B_1$ and use the result as the prior for $B_2$ — same answer, which is what makes online filtering possible.

**Beta–Binomial.** The likelihood $\binom{n}{k}\theta^k(1-\theta)^{n-k}$ times the $\mathrm{Beta}(\alpha, \beta)$ density $\propto \theta^{\alpha-1}(1-\theta)^{\beta-1}$ gives $\propto \theta^{\alpha+k-1}(1-\theta)^{\beta+n-k-1}$, the kernel of $\mathrm{Beta}(\alpha+k, \beta+n-k)$; the constants disappear into the evidence.

## Assumptions & Edge Cases

- **The evidence must be possible.** $\mathbb{P}(B) > 0$, else the posterior is undefined.
- **Cromwell's rule.** A prior of exactly 0 or 1 never moves: $LR \times 0 = 0$. Keep a small mass on every hypothesis you might need to accept.
- **Conditional independence is a modelling assumption.** Multiplying $LR$s double-counts correlated evidence: two momentum signals from the same prices are not two witnesses.
- **The likelihood is not a probability in $\theta$.** $f(x \mid \theta)$ need not integrate to 1 in $\theta$; only the normalised product with the prior is a distribution.
- **$LR = 1$ means no information.** And a huge $LR$ against a tiny prior still gives a small posterior: $LR = 100$ with prior $10^{-4}$ gives posterior odds $10^{-2}$, about 1 %.
- **The posterior inherits the model's errors.** The theorem is exact; the likelihoods are not. A regime model with the wrong return distribution updates confidently in the wrong direction.

## Worked Example

A condition affects 1 % of the population; the test has 99 % sensitivity and a 5 % false-positive rate. What is $\mathbb{P}(\text{sick} \mid \text{positive})$?

$$
\mathbb{P}(\text{sick} \mid +) = \frac{0.99 \times 0.01}{0.99 \times 0.01 + 0.05 \times 0.99} = \frac{0.0099}{0.0594} \approx 0.167.
$$

In odds: prior odds $1/99 \approx 0.0101$, $LR = 0.99/0.05 = 19.8$, posterior odds $0.2$, i.e. $1/6$. A second independent positive multiplies by $19.8$ again: $3.96$, so $\mathbb{P} \approx 0.80$. Replace "sick" by "crash regime" and "test" by "signal fired" and this is every alerting system. The code adds a flat prior learning a coin with $\theta = 0.6$, one flip at a time.

```python
import numpy as np

# --- Base rate: a test with 99 % sensitivity and 5 % false-positive rate ---
prior, sens, fpr = 0.01, 0.99, 0.05
p_pos = sens * prior + fpr * (1 - prior)          # law of total probability
post = sens * prior / p_pos
print(f"P(positive)        = {p_pos:.4f}")
print(f"P(sick | positive) = {post:.4f}")

# --- Same update in odds form, applied twice for two independent positives ---
lr = sens / fpr
odds = prior / (1 - prior)
for k in (1, 2):
    odds *= lr
    print(f"after {k} positive(s): odds = {odds:.3f}, P = {odds / (1 + odds):.4f}")

# --- Sequential Beta-Binomial update on coin flips, true P(heads) = 0.6 ---
rng = np.random.default_rng(7)
flips = rng.random(50) < 0.6
a, b = 1.0, 1.0                                   # Beta(1, 1): flat prior
for n, x in enumerate(flips, 1):
    a, b = a + int(x), b + 1 - int(x)             # posterior after one more flip
    if n in (1, 5, 10, 25, 50):
        mean = a / (a + b)
        sd = np.sqrt(a * b / ((a + b) ** 2 * (a + b + 1)))
        print(f"n={n:2d}  Beta({a:2.0f},{b:2.0f})  mean={mean:.3f}  sd={sd:.3f}")
```

::: output
```
P(positive)        = 0.0594
P(sick | positive) = 0.1667
after 1 positive(s): odds = 0.200, P = 0.1667
after 2 positive(s): odds = 3.960, P = 0.7984
n= 1  Beta( 1, 2)  mean=0.333  sd=0.236
n= 5  Beta( 3, 4)  mean=0.429  sd=0.175
n=10  Beta( 5, 7)  mean=0.417  sd=0.137
n=25  Beta(15,12)  mean=0.556  sd=0.094
n=50  Beta(31,21)  mean=0.596  sd=0.067
```
:::

After 10 flips the posterior still sits at $0.42 \pm 0.14$ — a run of tails in a short sample dominates — and reaches $0.60 \pm 0.07$ by 50. The posterior standard deviation shrinks like $1/\sqrt{n}$: the Bayesian face of the law of large numbers.

## Why It Matters in Quant Finance

- **Signal reliability is a base-rate question.** An indicator firing before 90 % of crashes and in 5 % of normal months, crashes being 2 % of months, gives $\mathbb{P}(\text{crash} \mid \text{fired}) \approx 0.27$. The P&L sees precision, not hit rate.
- **Regime detection is sequential Bayes.** *Predict* (transition matrix on yesterday's posterior), then *update* (multiply by today's likelihood under each regime, renormalise): the Hamilton filter.
- **The [[kalman-filter|Kalman filter]] is Bayes with Gaussian conjugacy.** The Kalman gain is a precision-weighted average — Beta–Binomial in disguise.
- **Shrinkage.** Posterior means pull noisy estimates toward the prior: Black–Litterman blends equilibrium returns with views; a hit rate from 20 trades must be shrunk toward 50 %.
- **Backtest overfitting.** If 1 strategy in 100 has edge and a 5 %-level backtest passes 80 % of genuine ones, $\mathbb{P}(\text{genuine} \mid \text{passes}) \approx 0.14$ — false positives for the medical-test reason.
- **[[conditional-probability|Conditioning]]** is the wider subject; Bayes makes conditioning on *observations* computable.

## Interview Questions

::: question A condition affects 0.1 % of people. A test has 99 % sensitivity and a 1 % false-positive rate. You test positive: what is the probability you have the condition?
::: hint
Two ways to get a positive: sick and detected, healthy and false alarm.
:::
::: answer
$\mathbb{P}(\text{sick} \mid +) = \dfrac{0.99 \times 0.001}{0.99 \times 0.001 + 0.01 \times 0.999} = \dfrac{0.00099}{0.01098} \approx 0.090$ — about 9 %, because false alarms among the 99.9 % healthy outnumber true positives ten to one. In odds: $\frac{1}{999} \times 99 \approx 0.099$.
:::
:::

::: question A bag holds one fair coin and one two-headed coin. You draw one at random and flip three heads. What is the probability you hold the two-headed coin, and how does it evolve flip by flip?
::: hint
Prior odds are 1:1. Each head is twice as likely under the two-headed coin.
:::
::: answer
Likelihoods: $1$ for the two-headed coin, $(1/2)^3 = 1/8$ for the fair one. Posterior $= \dfrac{1 \cdot \frac12}{1 \cdot \frac12 + \frac18 \cdot \frac12} = \dfrac{8}{9} \approx 0.889$. Each head has $LR = 2$, so the odds go $1 \to 2 \to 4 \to 8$, i.e. $1/2 \to 2/3 \to 4/5 \to 8/9$. A single tail sends the odds to 0.
:::
:::

::: question A strategy won 12 of its first 20 trades. Your prior on hit rates is centred at 50 % with standard deviation 5 %. Give a Bayesian estimate of the true hit rate.
::: hint
Match a $\mathrm{Beta}(\alpha, \alpha)$ prior to mean $1/2$ and variance $1/(4(2\alpha + 1))$, then use conjugacy.
:::
::: answer
For $\mathrm{Beta}(\alpha, \alpha)$, variance $= \frac{1}{4(2\alpha + 1)} = 0.05^2$ gives $2\alpha + 1 = 100$, so $\alpha = \beta = 49.5$: the prior is worth 99 pseudo-trades. Posterior $\mathrm{Beta}(61.5, 57.5)$, mean $61.5/119 \approx 0.517$. The sample frequency $0.60$ gets weight $20/119 \approx 0.17$, the prior mean $0.83$. Twenty trades barely move a well-founded prior.
:::
:::

::: question In a two-regime model, yesterday's filtered probability of bear was 0.20. Bear stays bear with 0.90, bull switches to bear with 0.05, and today's return is 4 times more likely under bear. What is today's filtered probability of bear, and which step is Bayes?
::: hint
Propagate yesterday's posterior through the transition matrix, then update with the $LR$ in odds form.
:::
::: answer
Predict: $\mathbb{P}(\text{bear today} \mid r_{1:t-1}) = 0.20 \times 0.90 + 0.80 \times 0.05 = 0.22$ — total probability over yesterday's regime, not Bayes. Update: prior odds $0.22/0.78 \approx 0.282$ times $LR = 4$ gives posterior odds $\approx 1.128$, so $\mathbb{P}(\text{bear} \mid r_{1:t}) \approx 0.53$; that step is Bayes. Iterating predict–update is the Hamilton filter; with a Gaussian state it is the [[kalman-filter|Kalman filter]].
:::
:::
