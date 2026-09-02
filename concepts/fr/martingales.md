---
title: Martingales
subject: probability
summary: Un processus dont la meilleure prévision, sachant tout ce qu'on connaît aujourd'hui, est sa valeur actuelle, la forme mathématique d'un jeu équitable. Les prix actualisés sont des martingales sous la mesure de pricing, et c'est pourquoi tout prix de dérivé est une espérance conditionnelle.
difficulty: 3
interview: 5
tags: [probability, martingale, filtration, optional-stopping, risk-neutral]
prerequisites: [conditional-probability]
related: [brownian-motion, black-scholes]
---

## Intuition

Une martingale est un jeu équitable. Quoi qu'il se soit passé jusqu'ici, ta fortune espérée après le prochain tour est égale à ta fortune actuelle. Pas « le jeu a une moyenne nulle dans l'ensemble », mais conditionnellement à toute l'histoire : aucun motif du passé ne dit de quel côté penche le prochain pas.

La conséquence qui compte est un énoncé d'absence de repas gratuit : aucune stratégie de mise qui choisit son enjeu à partir du seul passé ne peut transformer une martingale en jeu à espérance positive, du moins pas en temps borné et à crédit borné. C'est le contenu mathématique de « on ne bat pas un jeu équitable » et, après changement de mesure, de « on ne gagne pas d'argent sans risque sur un marché sans arbitrage ».

En finance, le jeu équitable n'est pas le prix de l'action sous les probabilités réelles (les actions rémunèrent une prime de risque), mais le prix *actualisé* sous la mesure *risque-neutre* $\mathbb{Q}$. Tout le pricing de dérivés tient dans l'énoncé « les prix actualisés sont des $\mathbb{Q}$-martingales » plus la propriété de tour de l'[[conditional-probability|espérance conditionnelle]].

## Formulation mathématique

Une **filtration** $(\mathcal{F}_t)_{t \ge 0}$ est une famille croissante de tribus, $\mathcal{F}_s \subseteq \mathcal{F}_t$ pour $s \le t$ : l'information disponible à l'instant $t$. Un processus $X$ est **adapté** si $X_t$ est $\mathcal{F}_t$-mesurable, c'est-à-dire si sa valeur en $t$ est connue en $t$.

::: formula Martingale
Un processus adapté $(M_t)$ avec $\mathbb{E}|M_t| < \infty$ est une martingale par rapport à $(\mathcal{F}_t, \mathbb{P})$ si
$$
\mathbb{E}[M_t \mid \mathcal{F}_s] = M_s \quad \text{pour tout } s \le t.
$$
C'est une **sous-martingale** si $\mathbb{E}[M_t \mid \mathcal{F}_s] \ge M_s$ et une **sur-martingale** si $\mathbb{E}[M_t \mid \mathcal{F}_s] \le M_s$.
:::

En prenant l'espérance et en utilisant la propriété de tour, $\mathbb{E}[M_t] = \mathbb{E}[M_0]$ pour tout $t$. Une sous-martingale dérive vers le haut en moyenne, une sur-martingale vers le bas (la fortune d'un joueur au casino est une sur-martingale ; celle du casino est une sous-martingale). En temps discret, la condition se réduit à un pas : $\mathbb{E}[M_{n+1} \mid \mathcal{F}_n] = M_n$.

**Exemples.** Soit $\xi_i$ i.i.d. avec $\mathbb{P}(\xi_i = \pm 1) = 1/2$, $S_n = \sum_{i \le n} \xi_i$, et $W$ un [[brownian-motion|mouvement brownien]] muni de sa filtration naturelle.

| Processus | Type |
|---|---|
| $S_n$ (marche aléatoire symétrique) | martingale |
| $S_n^2 - n$ | martingale |
| $S_n$ avec $\mathbb{P}(\xi_i = 1) = p > 1/2$ | sous-martingale |
| $W_t$ | martingale |
| $W_t^2 - t$ | martingale |
| $\exp(\sigma W_t - \tfrac12 \sigma^2 t)$ | martingale |
| $M_t = \mathbb{E}[X \mid \mathcal{F}_t]$, $X$ intégrable | martingale (Doob) |
| $G_n = \sum_{k \le n} H_k (M_k - M_{k-1})$, $H$ prévisible et borné | martingale (transformée) |
| $\varphi(M_t)$ avec $\varphi$ convexe, p. ex. $\lvert M_t \rvert$, $M_t^2$ | sous-martingale (Jensen) |

« Prévisible » signifie que $H_k$ est $\mathcal{F}_{k-1}$-mesurable : la mise est choisie avant que le résultat ne soit révélé. La transformée $G_n$ est le P&L de la stratégie qui détient $H_k$ unités pendant la $k$-ième période.

::: formula Théorème d'arrêt optionnel
Soit $M$ une martingale et $\tau$ un temps d'arrêt, c'est-à-dire $\{\tau \le n\} \in \mathcal{F}_n$ pour tout $n$. Alors $\mathbb{E}[M_\tau] = \mathbb{E}[M_0]$ dès que l'une des conditions suivantes est vérifiée :
1. $\tau \le N$ presque sûrement pour une constante $N$ (horizon borné) ;
2. $\tau < \infty$ p.s. et $\lvert M_{n \wedge \tau} \rvert \le K$ pour tout $n$ (processus arrêté borné) ;
3. $\mathbb{E}[\tau] < \infty$ et $\mathbb{E}\big[\lvert M_{n+1} - M_n \rvert \,\big|\, \mathcal{F}_n\big] \le c$ (accroissements bornés).
:::

Le processus arrêté $M_{n \wedge \tau}$ est *toujours* une martingale ; ce qui peut échouer sans l'une de ces conditions, c'est le passage à la limite $n \to \infty$. Même énoncé en temps continu avec des trajectoires continues à droite.

::: formula Théorème fondamental de l'évaluation des actifs
Un marché de numéraire $B_t$ (p. ex. $B_t = e^{rt}$) est sans arbitrage si et seulement s'il existe une mesure $\mathbb{Q}$ équivalente à $\mathbb{P}$ sous laquelle tout prix actualisé d'actif négocié $S_t / B_t$ est une $\mathbb{Q}$-martingale. Alors, pour tout flux atteignable $H$ payé en $T$,
$$
V_t = B_t\, \mathbb{E}^{\mathbb{Q}}\!\left[\frac{H}{B_T} \,\middle|\, \mathcal{F}_t\right].
$$
Le marché est complet (tout flux est réplicable) si et seulement si $\mathbb{Q}$ est unique.
:::

## Dérivation

**$W_t^2 - t$ est une martingale.** Pour $s \le t$, on écrit $W_t = W_s + (W_t - W_s)$ ; l'accroissement est indépendant de $\mathcal{F}_s$, de moyenne $0$ et de variance $t - s$ :
$$
\mathbb{E}[W_t^2 \mid \mathcal{F}_s] = W_s^2 + 2W_s\,\mathbb{E}[W_t - W_s] + \mathbb{E}[(W_t - W_s)^2] = W_s^2 + (t - s),
$$
donc $\mathbb{E}[W_t^2 - t \mid \mathcal{F}_s] = W_s^2 - s$. Le même calcul avec $\mathbb{E}[\xi^2] = 1$ donne $S_n^2 - n$.

**Martingale exponentielle.** La fonction génératrice des moments gaussienne donne $\mathbb{E}[e^{\sigma(W_t - W_s)}] = e^{\sigma^2(t - s)/2}$, d'où
$$
\mathbb{E}\big[e^{\sigma W_t - \sigma^2 t/2} \,\big|\, \mathcal{F}_s\big] = e^{\sigma W_s - \sigma^2 t/2}\,\mathbb{E}\big[e^{\sigma (W_t - W_s)}\big] = e^{\sigma W_s - \sigma^2 s/2}.
$$

**Martingale de Doob.** Soit $M_t = \mathbb{E}[X \mid \mathcal{F}_t]$ avec $\mathbb{E}\lvert X \rvert < \infty$. Pour $s \le t$, la propriété de tour donne $\mathbb{E}[M_t \mid \mathcal{F}_s] = \mathbb{E}\big[\mathbb{E}[X \mid \mathcal{F}_t] \mid \mathcal{F}_s\big] = \mathbb{E}[X \mid \mathcal{F}_s] = M_s$, et $\mathbb{E}\lvert M_t \rvert \le \mathbb{E}\lvert X \rvert$. C'est le processus des prévisions successives de $X$ : les prévisions d'une quantité fixe forment un jeu équitable.

**Transformée de martingale et arrêt optionnel.** Avec $H$ prévisible et borné, $\mathbb{E}[G_{n+1} - G_n \mid \mathcal{F}_n] = H_{n+1}\,\mathbb{E}[M_{n+1} - M_n \mid \mathcal{F}_n] = 0$, car $H_{n+1}$ est connu à l'instant $n$ et sort de l'espérance conditionnelle. Or
$$
M_{n \wedge \tau} = M_0 + \sum_{k=1}^{n} \mathbf{1}_{\{\tau \ge k\}}\,(M_k - M_{k-1}), \qquad \{\tau \ge k\} = \{\tau \le k-1\}^c \in \mathcal{F}_{k-1},
$$
donc le processus arrêté est une transformée de martingale avec $H_k = \mathbf{1}_{\{\tau \ge k\}} \in \{0, 1\}$ et $\mathbb{E}[M_{n \wedge \tau}] = \mathbb{E}[M_0]$ pour tout $n$. Si $\tau \le N$, on prend $n = N$ : c'est la condition 1. Les conditions 2 et 3 sont exactement ce dont la convergence dominée a besoin pour passer de $\mathbb{E}[M_{n \wedge \tau}]$ à $\mathbb{E}[M_\tau]$ quand $n \to \infty$.

**Pourquoi une mesure martingale exclut l'arbitrage.** Une stratégie autofinancée détenant $H_k$ unités de l'actif pendant la $k$-ième période a une richesse actualisée $\tilde{V}_n = V_0 + \sum_{k \le n} H_k(\tilde{S}_k - \tilde{S}_{k-1})$, transformée de martingale de $\tilde{S} = S/B$. Si $\tilde{S}$ est une $\mathbb{Q}$-martingale et $H$ est admissible, $\mathbb{E}^{\mathbb{Q}}[\tilde{V}_T] = V_0$. Un arbitrage aurait $V_0 = 0$, $\tilde{V}_T \ge 0$ et $\mathbb{P}(\tilde{V}_T > 0) > 0$ ; comme $\mathbb{Q} \sim \mathbb{P}$, la dernière inégalité vaut aussi sous $\mathbb{Q}$, donc $\mathbb{E}^{\mathbb{Q}}[\tilde{V}_T] > 0 = V_0$, contradiction. C'est le sens facile du théorème ; la réciproque (l'absence d'arbitrage implique l'existence d'une $\mathbb{Q}$) est un argument d'hyperplan séparateur. La formule de prix est alors la martingale de Doob : si $H$ est répliqué à partir du coût initial $V_0$, la richesse actualisée de réplication est une $\mathbb{Q}$-martingale qui termine en $\tilde{H}$, donc $\tilde{V}_t = \mathbb{E}^{\mathbb{Q}}[\tilde{H} \mid \mathcal{F}_t]$.

## Hypothèses et cas limites

- **L'intégrabilité fait partie de la définition.** Une marche aléatoire à pas de Cauchy est symétrique mais n'a pas de moyenne, donc ce n'est pas une martingale.
- **Martingale par rapport à quoi ?** La propriété dépend de la filtration *et* de la mesure. Sous $\mathbb{P}$, l'action actualisée est une sous-martingale quand $\mu > r$ ; sous $\mathbb{Q}$, c'est une martingale ; le prix non actualisé $S_t$ est une $\mathbb{Q}$-sous-martingale de dérive $r$. Agrandir la filtration (un initié avec $\mathcal{G}_t \supsetneq \mathcal{F}_t$) peut détruire la propriété.
- **Martingale n'est ni « accroissements indépendants » ni « Markov ».** $\int_0^t H_s\,dW_s$ avec $H$ adapté est une martingale à accroissements dépendants ; un processus de Markov avec dérive n'est pas une martingale.
- **L'arrêt optionnel échoue sans ses conditions.** La stratégie de doublement a des mises non bornées et une richesse arrêtée non bornée inférieurement ; le premier temps d'atteinte $\tau_1$ de $+1$ par la marche symétrique est fini p.s. mais $\mathbb{E}[S_{\tau_1}] = 1 \ne 0$, parce que $\mathbb{E}[\tau_1] = \infty$.
- **Martingales locales.** Les intégrales stochastiques ne sont en général que des martingales *locales* (martingales jusqu'à une suite de temps d'arrêt). Une martingale locale stricte peut avoir une espérance décroissante, le modèle mathématique d'une bulle de prix. $\exp(\sigma W_t - \sigma^2 t/2)$ est une vraie martingale pour $\sigma$ constant (critère de Novikov), ce qui rend légitime le changement de mesure de Girsanov dans [[black-scholes]].
- **Technicités du temps continu.** Les trajectoires sont continues à droite avec limites à gauche et la filtration satisfait les conditions habituelles ; sans cela, temps d'arrêt et arrêt optionnel se comportent mal.
- **Les images convexes sont des sous-martingales.** Par Jensen, $\varphi(M_t)$ est une sous-martingale pour $\varphi$ convexe quand elle est intégrable : $\lvert M_t \rvert$, $M_t^2$, $e^{M_t}$. C'est pourquoi $W_t^2$ a besoin du compensateur $-t$.

## Exemple détaillé

La stratégie de mise par doublement (dite « martingale »). On lance une pièce équilibrée, on mise 1, on double la mise après chaque perte, on s'arrête à la première victoire. Si la première victoire arrive au tour $\tau$, on a perdu $1 + 2 + \cdots + 2^{\tau - 2} = 2^{\tau - 1} - 1$ et on gagne $2^{\tau - 1}$ : net $+1$. Comme $\mathbb{P}(\tau = k) = 2^{-k}$, $\tau < \infty$ p.s. et $\mathbb{E}[\tau] = 2$. La richesse arrêtée vaut donc $W_\tau = 1$ presque sûrement alors que $W_0 = 0$ : « un profit certain tiré d'un jeu équitable ».

La richesse $W_n = \sum_{k \le n} H_k \xi_k$ avec $H_k = 2^{k-1}\mathbf{1}_{\{\tau \ge k\}}$ *est* une martingale (mises prévisibles), donc le piège est dans l'arrêt optionnel : $\mathbb{E}[\tau] = 2 < \infty$ mais les accroissements $2^{k-1}$ ne sont pas bornés (la condition 3 échoue), et $W_{n \wedge \tau}$ n'est pas bornée inférieurement (la condition 2 échoue). Les mathématiques sont justes ; la stratégie exige un crédit illimité.

Imposons un horizon borné $N$, ce qui revient à une ligne de crédit de $2^N - 1$. Alors la condition 1 est vérifiée et $\mathbb{E}[W_{\tau \wedge N}] = 0$. Directement :
$$
\mathbb{E}[W_{\tau \wedge N}] = (1 - 2^{-N}) \cdot 1 + 2^{-N} \cdot \big(-(2^N - 1)\big) = 1 - 2^{-N} - 1 + 2^{-N} = 0.
$$
Avec $N = 10$ : on gagne $1$ avec probabilité $0{,}999$, on perd $1\,023$ avec probabilité $0{,}001$. Moyenne nulle, médiane $+1$, et une queue gauche épaisse, la signature exacte d'une stratégie vendeuse de volatilité.

```python
import numpy as np

rng = np.random.default_rng(3)
n_paths, horizon = 200_000, 10
steps = rng.choice([-1, 1], size=(n_paths, horizon))      # fair +-1 coin flips

# Doubling strategy: stake 2^k on round k until the first win, then stop.
# The stake is fixed *before* the flip (predictable), so the wealth is a
# martingale transform of the random walk S_n = sum of steps.
wealth = np.zeros(n_paths)
stake = np.ones(n_paths)
alive = np.ones(n_paths, dtype=bool)                      # not stopped yet
means = []
for k in range(horizon):
    wealth[alive] += (stake * steps[:, k])[alive]
    alive &= steps[:, k] != 1                             # a win stops the play
    stake = np.where(alive, 2 * stake, stake)
    means.append(wealth.mean())

se = wealth.std() / np.sqrt(n_paths)
print("E[wealth_n], n = 1..10:", np.round(means, 3))
print(f"P(stopped with a win) = {np.mean(~alive):.4f}  (exact {1 - 2**-horizon:.4f})")
print(f"mean wealth at stop   = {wealth.mean():+.4f} +- {se:.4f}  (martingale: 0)")
print(f"median wealth at stop = {np.median(wealth):+.0f},  worst = {wealth.min():.0f}  (exact {-(2**horizon - 1)})")

# The random walk itself: E[S_n] = 0 and E[S_n^2] = n
S = steps.cumsum(axis=1)
print(f"E[S_10] = {S[:, -1].mean():+.4f},  E[S_10^2] = {np.mean(S[:, -1] ** 2):.3f}  (exact 10)")
```

::: output
```
E[wealth_n], n = 1..10: [ 0.001  0.006 -0.003 -0.009 -0.018  0.004 -0.017  0.012  0.012  0.053]
P(stopped with a win) = 0.9991  (exact 0.9990)
mean wealth at stop   = +0.0528 +- 0.0696  (martingale: 0)
median wealth at stop = +1,  worst = -1023  (exact -1023)
E[S_10] = +0.0026,  E[S_10^2] = 10.009  (exact 10)
```
:::

La richesse moyenne reste à zéro à chaque instant intermédiaire (le processus arrêté est une martingale tout du long), la probabilité de gain correspond à $1 - 2^{-10}$, et la moyenne à l'arrêt est nulle à une erreur standard près. Cette erreur standard est grande ($0{,}07$ avec $200\,000$ trajectoires) parce que la richesse arrêtée a un écart-type d'environ $32$ : toute la variance est logée dans la perte de $1\,023$ qui arrive une fois sur mille.

## Pourquoi c'est important en finance quantitative

- **Pricing risque-neutre.** [[black-scholes]], c'est le théorème fondamental avec $\tilde{S}_t = S_0\exp(\sigma W^{\mathbb{Q}}_t - \sigma^2 t/2)$, la martingale exponentielle. Tout prix de dérivé vaut $B_t\,\mathbb{E}^{\mathbb{Q}}[H/B_T \mid \mathcal{F}_t]$, et le portefeuille delta-couvert est la transformée de martingale de réplication.
- **Marchés efficients.** Le « properly anticipated prices fluctuate randomly » de Samuelson : sous la mesure de pricing, les prix actualisés sont des martingales ; sous $\mathbb{P}$, l'écart à une martingale est la prime de risque. Les tests de prévisibilité des rendements testent la propriété de différence de martingale $\mathbb{E}[r_{t+1} \mid \mathcal{F}_t] = \text{const}$.
- **Les stratégies de trading sont des transformées de martingale.** P&L $= \sum_k H_k\,\Delta S_k$ avec $H$ prévisible. Si $\Delta S$ est une différence de martingale, aucun $H$ prévisible borné n'a de P&L espéré positif : pas d'avantage de timing sans information hors de $\mathcal{F}_t$.
- **Le [[brownian-motion|mouvement brownien]]** est la martingale continue canonique, et la caractérisation de Lévy dit que toute martingale continue de variation quadratique $t$ *est* un mouvement brownien. Les intégrales stochastiques sont des martingales locales, et la [[ito-lemma|formule d'Itô]] est l'outil pour trouver le compensateur qui fait de $f(W_t)$ une martingale.
- **Filtrage.** Les innovations $y_t - \mathbb{E}[y_t \mid \mathcal{F}_{t-1}]$ d'un [[kalman-filter|filtre de Kalman]] forment une suite de différences de martingale, et l'estimation filtrée d'une quantité fixe est une martingale de Doob.
- **Bornes de drawdown.** L'inégalité maximale de Doob, $\mathbb{P}(\max_{s \le t} M_s \ge \lambda) \le \mathbb{E}[M_t^+]/\lambda$, borne la probabilité qu'un jeu équitable atteigne un jour un niveau, donc la probabilité de toucher un stop-loss avant $t$.

## Erreurs fréquentes

::: pitfall Appliquer l'arrêt optionnel sans vérifier une condition
« $\tau$ est fini p.s., donc $\mathbb{E}[M_\tau] = M_0$. » Faux : la stratégie de doublement et le premier temps d'atteinte de $+1$ ont tous deux $\tau < \infty$ p.s. et $\mathbb{E}[M_\tau] \ne M_0$. Vérifie un horizon borné, un processus arrêté borné, ou $\mathbb{E}[\tau]$ fini avec accroissements bornés.
:::

::: pitfall Croire que le prix de l'action est une martingale
Sous $\mathbb{Q}$, c'est $S_t/B_t$ qui est une martingale, pas $S_t$ : $\mathbb{E}^{\mathbb{Q}}[S_T \mid \mathcal{F}_t] = S_t e^{r(T-t)}$. Sous $\mathbb{P}$, aucun des deux ne l'est ; la dérive excédentaire $\mu - r$ est la prime de risque.
:::

::: pitfall Oublier la filtration
$\mathbb{E}[M_t \mid \mathcal{F}_s] = M_s$ est un énoncé sur un ensemble d'information précis. Le même processus peut ne plus être une martingale pour la filtration plus grande d'un initié, et une moyenne constante $\mathbb{E}[M_t] = \mathbb{E}[M_0]$ ne suffit pas à faire d'un processus une martingale.
:::

::: pitfall Confondre martingale locale et vraie martingale
Écrire « $\int H\,dW$ est une martingale, donc son espérance est nulle » sans condition d'intégrabilité telle que $\mathbb{E}\int_0^t H_s^2\,ds < \infty$. Les martingales locales strictes existent et vérifient $\mathbb{E}[M_t] < M_0$.
:::

## Révision en 30 secondes

Martingale : adaptée, intégrable, $\mathbb{E}[M_t \mid \mathcal{F}_s] = M_s$ ; sous $\ge$, sur $\le$. Exemples : marche aléatoire symétrique, $S_n^2 - n$, $W_t$, $W_t^2 - t$, $e^{\sigma W_t - \sigma^2 t/2}$, et $\mathbb{E}[X \mid \mathcal{F}_t]$ (Doob, par la propriété de tour). Des mises prévisibles donnent une transformée de martingale, encore une martingale : aucune stratégie ne bat un jeu équitable. L'arrêt optionnel $\mathbb{E}[M_\tau] = \mathbb{E}[M_0]$ exige un horizon borné, un processus arrêté borné, ou $\mathbb{E}[\tau]$ fini avec accroissements bornés ; la stratégie de doublement est ce qui arrive sans. Théorème fondamental : absence d'arbitrage $\iff$ les prix actualisés sont des martingales sous une $\mathbb{Q} \sim \mathbb{P}$, d'où $V_t = B_t\,\mathbb{E}^{\mathbb{Q}}[H/B_T \mid \mathcal{F}_t]$.

## Formules clés

| Nom | Formule |
|---|---|
| Martingale | $\mathbb{E}[M_t \mid \mathcal{F}_s] = M_s$, $s \le t$ |
| Moyenne constante | $\mathbb{E}[M_t] = \mathbb{E}[M_0]$ |
| Carré compensé | $W_t^2 - t$, $S_n^2 - n$ |
| Martingale exponentielle | $\exp(\sigma W_t - \tfrac12 \sigma^2 t)$ |
| Martingale de Doob | $M_t = \mathbb{E}[X \mid \mathcal{F}_t]$ |
| Transformée de martingale | $G_n = \sum_{k \le n} H_k (M_k - M_{k-1})$, $H$ prévisible |
| Arrêt optionnel | $\mathbb{E}[M_\tau] = \mathbb{E}[M_0]$ sous une condition d'arrêt |
| Prix risque-neutre | $V_t = B_t\,\mathbb{E}^{\mathbb{Q}}[H / B_T \mid \mathcal{F}_t]$ |

## Questions d'entretien

::: question Soit $S_n$ une marche aléatoire symétrique. $S_n^2$ est-elle une martingale ? Trouve une fonction $f(n)$ telle que $S_n^2 - f(n)$ en soit une.
::: hint
Calcule $\mathbb{E}[S_{n+1}^2 \mid \mathcal{F}_n]$ en utilisant $S_{n+1} = S_n + \xi_{n+1}$.
:::
::: answer
$\mathbb{E}[S_{n+1}^2 \mid \mathcal{F}_n] = S_n^2 + 2S_n\,\mathbb{E}[\xi_{n+1}] + \mathbb{E}[\xi_{n+1}^2] = S_n^2 + 1 > S_n^2$, donc $S_n^2$ est une sous-martingale stricte (Jensen avec $x \mapsto x^2$). En retirant la dérive, $S_n^2 - n$ est une martingale. L'analogue continu est $W_t^2 - t$ ; le « $-n$ » est la variation quadratique de la marche.
:::
:::

::: question Un joueur part de $x$ et mise $1$ sur une pièce équilibrée jusqu'à ce que sa fortune atteigne $0$ ou $N$. Quelle est la probabilité d'atteindre $N$, et le nombre espéré de mises ? Justifie chaque usage de l'arrêt optionnel.
::: hint
Applique l'arrêt optionnel à $S_n$ et à $S_n^2 - n$. La fortune arrêtée vit dans $[0, N]$.
:::
::: answer
Soit $\tau$ le temps de sortie. $\tau < \infty$ p.s. et $\mathbb{E}[\tau] < \infty$ : tout bloc de $N$ piles consécutifs termine le jeu, et le nombre de blocs nécessaires est géométrique. La marche arrêtée est bornée par $N$, donc la condition 2 donne $\mathbb{E}[S_\tau] = x$, soit $N p_N + 0 \cdot (1 - p_N) = x$ et $p_N = x/N$. Pour $S_n^2 - n$, le processus arrêté n'est pas borné (à cause du $-n$), mais $\mathbb{E}[\tau] < \infty$ et les accroissements $\lvert 2 S_n \xi_{n+1} \rvert \le 2N$ sont bornés avant $\tau$, donc la condition 3 s'applique : $\mathbb{E}[S_\tau^2] - \mathbb{E}[\tau] = x^2$, d'où $\mathbb{E}[\tau] = N^2 \cdot x/N - x^2 = x(N - x)$. De $x = 50$ à $N = 100$ : $2\,500$ mises en moyenne.
:::
:::

::: question Montre que $M_t = \exp(\sigma W_t - \sigma^2 t/2)$ est une martingale. Où apparaît-elle dans le modèle de Black–Scholes ?
::: hint
Découpe $W_t = W_s + (W_t - W_s)$ et utilise la fonction génératrice des moments d'une gaussienne, $\mathbb{E}[e^{\lambda Z}] = e^{\lambda^2/2}$ pour $Z \sim N(0, 1)$.
:::
::: answer
$\mathbb{E}[M_t \mid \mathcal{F}_s] = e^{\sigma W_s - \sigma^2 t/2}\,\mathbb{E}[e^{\sigma(W_t - W_s)}] = e^{\sigma W_s - \sigma^2 t/2}\,e^{\sigma^2 (t-s)/2} = M_s$, et $\mathbb{E}[M_t] = 1 < \infty$. Sous $\mathbb{Q}$, $S_t = S_0\,e^{(r - \sigma^2/2)t + \sigma W^{\mathbb{Q}}_t}$, donc $e^{-rt} S_t = S_0 M_t$ : l'action actualisée est exactement cette martingale, ce qui est la condition du théorème fondamental dans [[black-scholes]]. Le même processus avec $\sigma$ remplacé par $-\lambda$ (moins le prix de marché du risque) est la densité $d\mathbb{Q}/d\mathbb{P}$ sur $\mathcal{F}_t$ dans le théorème de Girsanov.
:::
:::

::: question Soit $\tau_1$ le premier instant où la marche aléatoire symétrique atteint $+1$ ; on sait que $\tau_1 < \infty$ presque sûrement. Prouve que $\mathbb{E}[\tau_1] = \infty$ en utilisant seulement l'arrêt optionnel, et relie cela à la stratégie de doublement.
::: hint
Suppose $\mathbb{E}[\tau_1] < \infty$ et demande-toi quelle condition d'arrêt optionnel serait alors vérifiée.
:::
::: answer
Supposons $\mathbb{E}[\tau_1] < \infty$. Les accroissements de $S_n$ sont bornés par $1$, donc la condition 3 s'applique et donne $\mathbb{E}[S_{\tau_1}] = S_0 = 0$. Mais $S_{\tau_1} = 1$ presque sûrement, donc $\mathbb{E}[S_{\tau_1}] = 1$ : contradiction. Donc $\mathbb{E}[\tau_1] = \infty$. La stratégie « miser $1$ à chaque tour et s'arrêter dès qu'on est à $+1$ » est un gain certain de durée espérée infinie, avec des drawdowns non bornés en chemin : par la formule de la ruine du joueur, $\mathbb{P}(\text{drawdown} \ge k \text{ avant le gain}) = 1/(k+1)$, dont la somme diverge. La stratégie de doublement échange le temps d'attente infini contre un besoin de crédit infini ($\mathbb{E}[\tau] = 2$, mises non bornées). Dans les deux cas, un jeu équitable ne se bat pas en temps fini *et* à capital fini, ce que la condition d'admissibilité (richesse bornée inférieurement) impose dans le théorème fondamental.
:::
:::
