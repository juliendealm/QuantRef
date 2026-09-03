---
title: Mouvement brownien
subject: stochastic
summary: La limite en temps continu d'une marche aléatoire, à accroissements gaussiens indépendants, à trajectoires continues mais nulle part lisses, et de variation quadratique égale au temps écoulé. Le bruit qui pilote tout modèle de prix continu, et la raison pour laquelle la volatilité croît comme la racine carrée du temps.
difficulty: 3
interview: 4
tags: [stochastic, brownian-motion, wiener-process, random-walk, quadratic-variation, gbm]
prerequisites: [martingales]
related: [ito-lemma, black-scholes]
---

## Intuition

Prends une marche aléatoire à pile ou face et accélère-la : $n$ pas par unité de temps, chacun de taille $1/\sqrt{n}$ — la seule échelle qui maintienne la variance à $t$ quel que soit $n$, puisque après un temps $t$ il y a $nt$ pas de variance $1/n$. La limite est le **mouvement brownien** : une trajectoire continue qui reste, à toute échelle, une somme de petits chocs indépendants. Zoome dessus et elle ressemble à l'ensemble, sans tangente nulle part. Sur un petit intervalle $h$, elle bouge d'environ $\sqrt{h}$, bien plus que le $h$ d'une courbe lisse — c'est pourquoi $(dW)^2$ n'est pas négligeable et pourquoi le [[ito-lemma|calcul d'Itô]] remplace le calcul ordinaire.

::: viz brownian-motion Des trajectoires dans l'enveloppe en √t
La dispersion croît en √t, pas en t : l'enveloppe est une parabole couchée. Ajoute des trajectoires : environ 95 % restent à l'intérieur.
:::

## Formules clés

| Nom | Formule |
|---|---|
| Accroissements | $W_t - W_s \sim N(0, t - s)$, indépendants sur des intervalles disjoints |
| Covariance | $\mathrm{Cov}(W_s, W_t) = \min(s, t)$ |
| Marche aléatoire renormalisée | $S_{\lfloor nt \rfloor} / \sqrt{n} \xrightarrow{d} W_t$ |
| Variation quadratique | $\sum (\Delta W)^2 \to t$, soit $(dW_t)^2 = dt$ |
| Changement d'échelle | $c^{-1/2} W_{ct}$ est un mouvement brownien |
| Principe de réflexion | $\mathbb{P}(\max_{s \le t} W_s \ge a) = 2\big(1 - \Phi(a / \sqrt{t})\big)$ |
| Pont brownien | $W_s \mid W_t = x \sim N\big(\tfrac{s}{t}x,\ \tfrac{s(t - s)}{t}\big)$, $s \le t$ |
| Mouvement brownien géométrique | $S_t = S_0 e^{(\mu - \sigma^2/2)t + \sigma W_t}$, $\mathbb{E}[S_t] = S_0 e^{\mu t}$ |

## Erreurs fréquentes

::: pitfall Mettre à l'échelle en $t$ au lieu de $\sqrt{t}$
La volatilité sur un mois vaut $\sigma_{\text{annuelle}} \times \sqrt{1/12}$, pas $\sigma_{\text{annuelle}} / 12$. En code, simule les accroissements avec `rng.normal(0, np.sqrt(dt))`, pas `rng.normal(0, dt)` : le second argument de numpy est l'écart-type.
:::

::: pitfall Utiliser la règle de dérivation ordinaire sur $f(W_t)$
$d(W_t^2) \ne 2W_t\,dW_t$ ; le $dt$ manquant est la variation quadratique. Appliqué au mouvement brownien géométrique, l'oubli donne $\mathbb{E}[\log S_T] = \log S_0 + \mu T$ au lieu de $\log S_0 + (\mu - \sigma^2/2)T$.
:::

::: pitfall Confondre le taux de croissance moyen et le taux de croissance typique
$\mathbb{E}[S_t] = S_0 e^{\mu t}$, mais une trajectoire typique croît comme $S_0 e^{(\mu - \sigma^2/2)t}$. Avec $\sigma = 40\,\%$, l'écart est de $8\,\%$ par an, et les espérances à long horizon sont dominées par des issues rares et très grandes.
:::

::: pitfall Accroissements indépendants ne signifie pas valeurs indépendantes
$W_s$ et $W_t$ sont corrélés, avec $\mathrm{Corr} = \sqrt{s/t}$ ; seuls les accroissements sur des intervalles disjoints sont indépendants. Conditionner par $W_1 = x$ change la loi de $W_{1/2}$ en $N(x/2, 1/4)$.
:::

## Révision en 30 secondes

Mouvement brownien : $W_0 = 0$, accroissements gaussiens stationnaires indépendants $W_t - W_s \sim N(0, t - s)$, trajectoires continues. C'est la limite renormalisée en $1/\sqrt{n}$ de toute marche aléatoire à variance finie (Donsker), avec $\mathrm{Cov}(W_s, W_t) = \min(s, t)$. Les trajectoires sont nulle part dérivables et à variation infinie, mais leur variation quadratique vaut $[W]_t = t$ : $(dW)^2 = dt$, la racine du calcul d'Itô. Changement d'échelle $c^{-1/2} W_{ct}$, réflexion $\mathbb{P}(\max_{s \le t} W_s \ge a) = 2\,\mathbb{P}(W_t \ge a)$, propriété de Markov, et $W_t$, $W_t^2 - t$, $e^{\sigma W_t - \sigma^2 t/2}$ sont des martingales. Mouvement brownien géométrique $S_t = S_0 e^{(\mu - \sigma^2/2)t + \sigma W_t}$ : prix log-normaux, moyenne $S_0 e^{\mu t}$, taux de croissance typique $\mu - \sigma^2/2$.

## Formulation mathématique

::: formula Définition
Un mouvement brownien standard $(W_t)_{t \ge 0}$ est un processus tel que
1. $W_0 = 0$ ;
2. les accroissements sur des intervalles disjoints sont indépendants : pour $0 \le t_0 < t_1 < \cdots < t_n$, les variables $W_{t_i} - W_{t_{i-1}}$ sont indépendantes ;
3. les accroissements sont gaussiens et stationnaires : $W_t - W_s \sim N(0,\, t - s)$ pour $s \le t$ ;
4. les trajectoires $t \mapsto W_t$ sont continues presque sûrement.
:::

D'où $\mathbb{E}[W_t] = 0$, $\mathrm{Var}(W_t) = t$, et

::: formula Covariance
$$
\mathrm{Cov}(W_s, W_t) = \min(s, t), \qquad \mathrm{Corr}(W_s, W_t) = \sqrt{s/t} \quad \text{pour } s \le t.
$$
:::

De façon équivalente : le processus gaussien centré à trajectoires continues et de covariance $\min(s, t)$. Avec $\xi_i$ i.i.d. de moyenne $0$ et de variance $1$ et $S_k = \sum_{i \le k} \xi_i$ :

::: formula Principe d'invariance de Donsker
$$
W^{(n)}_t = \frac{S_{\lfloor nt \rfloor}}{\sqrt{n}}, \qquad W^{(n)} \;\underset{n \to \infty}{\Longrightarrow}\; W \ \text{ dans } D[0,T]
$$
La convergence est en loi sur l'espace des trajectoires $D[0,T]$ muni de la topologie de Skorokhod : c'est la loi de la trajectoire entière qui converge, pas seulement chaque marginale. La limite ne dépend pas de la loi de $\xi$, d'où « invariance ».
:::

- *Changement d'échelle et symétries.* Pour $c > 0$, $(c^{-1/2} W_{ct})_{t \ge 0}$ est un mouvement brownien. De même pour $-W_t$ (réflexion), $W_{t+s} - W_s$ (redémarrage en $s$) et $t\,W_{1/t}$ pour $t > 0$, prolongé par $0$ en $t = 0$ (inversion du temps ; la continuité à l'origine est la partie non triviale).
- *Variation quadratique*, pour des subdivisions $0 = t_0 < \cdots < t_n = t$ de pas $\max_i (t_i - t_{i-1}) \to 0$ :

::: formula Variation quadratique
$$
[W]_t = \lim \sum_{i} \big(W_{t_i} - W_{t_{i-1}}\big)^2 = t \quad (\text{dans } L^2), \qquad \text{alors que} \qquad \sum_{i} \big\lvert W_{t_i} - W_{t_{i-1}} \big\rvert \to \infty.
$$
En notation différentielle : $(dW_t)^2 = dt$, $dW_t\,dt = 0$, $(dt)^2 = 0$.
:::

- *Régularité.* Les trajectoires sont höldériennes de tout ordre $< 1/2$, nulle part dérivables, à variation infinie sur tout intervalle.
- *Principe de réflexion.* Avec $M_t = \max_{s \le t} W_s$ et $a > 0$, $\mathbb{P}(M_t \ge a) = 2\,\mathbb{P}(W_t \ge a) = 2\big(1 - \Phi(a/\sqrt{t})\big)$. Le temps de premier passage $\tau_a = \inf\{t : W_t = a\}$ est fini p.s. mais $\mathbb{E}[\tau_a] = \infty$.
- *Markov et martingale.* $W$ est un processus de Markov (fort), et $W_t$, $W_t^2 - t$, $\exp(\sigma W_t - \sigma^2 t/2)$ sont des [[martingales]]. Caractérisation de Lévy : toute martingale locale continue $M$ telle que $M_0 = 0$ et $[M]_t = t$ est un mouvement brownien.

::: formula Mouvement brownien géométrique
$$
S_t = S_0 \exp\!\Big(\big(\mu - \tfrac12 \sigma^2\big)t + \sigma W_t\Big), \qquad dS_t = \mu S_t\,dt + \sigma S_t\,dW_t,
$$
donc $\log(S_t / S_0) \sim N\big((\mu - \tfrac12\sigma^2)t,\ \sigma^2 t\big)$, $\mathbb{E}[S_t] = S_0 e^{\mu t}$, et la médiane vaut $S_0 e^{(\mu - \sigma^2/2)t}$.
:::

## Dérivation

**Pourquoi $\sqrt{n}$.** $W^{(n)}_t$ a pour variance $\lfloor nt \rfloor / n \to t$ ; renormaliser par $n^{-\alpha}$ annule la variance si $\alpha > 1/2$ et la fait diverger si $\alpha < 1/2$. Le théorème central limite donne $W^{(n)}_t \to N(0, t)$ pour chaque $t$, et les accroissements sur des intervalles disjoints sont des sommes sur des blocs disjoints de $\xi$, donc indépendants. Donsker ajoute la tension, qui fait passer des lois fini-dimensionnelles à la loi de la trajectoire.

**Covariance.** Pour $s \le t$, $\mathrm{Cov}(W_s, W_t) = \mathrm{Cov}\big(W_s,\, W_s + (W_t - W_s)\big) = \mathrm{Var}(W_s) = s$.

**Variation quadratique.** Avec $\Delta_i = W_{t_i} - W_{t_{i-1}} \sim N(0, \delta_i)$ indépendants, $\mathrm{Var}(\Delta_i^2) = 3\delta_i^2 - \delta_i^2 = 2\delta_i^2$, donc pour $Q_n = \sum_i \Delta_i^2$,
$$
\mathbb{E}[Q_n] = \sum_i \delta_i = t, \qquad \mathrm{Var}(Q_n) = 2\sum_i \delta_i^2 \le 2\,\max_i \delta_i \cdot t \xrightarrow[\text{pas} \to 0]{} 0,
$$
soit $Q_n \to t$ dans $L^2$. Pour la variation totale, $\sum_i \lvert \Delta_i \rvert \ge \sum_i \Delta_i^2 / \max_i \lvert \Delta_i \rvert$, dont le numérateur tend vers $t > 0$ et le dénominateur vers $0$ : infinie. Une fonction $C^1$ est l'inverse — variation finie, variation quadratique nulle.

**Non-dérivabilité, heuristiquement.** $(W_{t+h} - W_t)/h \sim N(0, 1/h)$, dont la dispersion $h^{-1/2}$ explose quand $h \to 0$. L'énoncé pour *tous* les $t$ simultanément est le théorème de Paley–Wiener–Zygmund.

**Principe de réflexion.** $\{M_t \ge a\} = \{\tau_a \le t\}$, et par la propriété de Markov forte la trajectoire après $\tau_a$ est un nouveau mouvement brownien issu de $a$, donc $\mathbb{P}(\tau_a \le t,\, W_t \ge a) = \mathbb{P}(\tau_a \le t,\, W_t \le a)$. Comme $\{W_t \ge a\} \subseteq \{\tau_a \le t\}$, en additionnant on obtient $\mathbb{P}(\tau_a \le t) = 2\,\mathbb{P}(W_t \ge a)$, d'où $\mathbb{P}(\tau_a < \infty) = 1$. En dérivant en $t$, la densité $\dfrac{a}{\sqrt{2\pi t^3}}\,e^{-a^2/(2t)}$, dont la queue en $t^{-3/2}$ rend $\mathbb{E}[\tau_a] = \infty$.

**Mouvement brownien géométrique.** La [[ito-lemma|formule d'Itô]] sur $\log S_t$ avec $(dS_t)^2 = \sigma^2 S_t^2\,dt$ :
$$
d\log S_t = \frac{dS_t}{S_t} - \frac{1}{2}\,\frac{(dS_t)^2}{S_t^2} = \big(\mu - \tfrac12 \sigma^2\big)\,dt + \sigma\,dW_t,
$$
et l'intégration donne la forme fermée. La moyenne découle de la martingale exponentielle : $\mathbb{E}[S_t] = S_0 e^{\mu t}\,\mathbb{E}\big[e^{\sigma W_t - \sigma^2 t/2}\big] = S_0 e^{\mu t}$.

## Hypothèses et cas limites

- **L'existence est un théorème.** Wiener (1923) ; les constructions standard passent par les théorèmes d'extension et de continuité de Kolmogorov, ou par la série de Lévy–Ciesielski.
- **Accroissements gaussiens : queues fines et pas de sauts.** Les rendements réels ont des queues épaisses, des sauts et des grappes de volatilité ; le mouvement brownien est la brique de base, pas le modèle. Extensions : volatilité stochastique, diffusions à sauts, processus de Lévy.
- **Continu mais pas dérivable.** $dW_t / dt$ n'existe pas en tant que fonction ; le « bruit blanc » n'est qu'un processus généralisé, et tout calcul avec $dW$ doit être celui d'Itô ([[ito-lemma]]) ou de Stratonovich.
- **La variation quadratique est une limite le long de subdivisions.** Dans $L^2$ pour tout pas $\to 0$, presque sûrement le long de subdivisions emboîtées (p. ex. dyadiques) ; prise sur *toutes* les subdivisions, la borne supérieure de $\sum \Delta_i^2$ est infinie.
- **Le modèle casse à l'échelle du tick.** La variance réalisée sur des rendements à très haute fréquence *augmente* avec la fréquence d'échantillonnage à cause du bruit de microstructure (rebond bid–ask, discrétisation des prix) — le contraire de $[W]_t = t$.
- **Mouvement brownien géométrique : bon signe, mauvaise queue.** Les prix restent positifs et les log-rendements sont additifs, mais un $\sigma$ constant et des log-rendements gaussiens i.i.d. sont empiriquement faux. La dérive $\mu$ gouverne $\mathbb{E}[S_t]$ alors qu'une trajectoire typique croît au taux $\mu - \sigma^2/2$ : si $\mu < \sigma^2/2$, alors $S_t \to 0$ presque sûrement, et lorsque $0 < \mu < \sigma^2/2$ cela se produit alors même que $\mathbb{E}[S_t] \to \infty$.
- **Plusieurs dimensions.** Des mouvements browniens corrélés se construisent comme $W = LZ$ avec $L$ un facteur de Cholesky de la matrice de corrélation et $Z$ des mouvements browniens indépendants ; alors $d\langle W^i, W^j \rangle_t = \rho_{ij}\,dt$.

## Exemple détaillé

Le code simule $20\,000$ trajectoires sur $[0, 2]$ et vérifie $\mathrm{Var}(W_t) = t$, $\mathrm{Cov}(W_{0{,}5}, W_{1{,}5}) = 0{,}5$ et $\mathbb{E}[e^{W_1 - 1/2}] = 1$. Il prend ensuite une *seule* trajectoire sur $[0, 1]$ faite de $10\,000$ accroissements fins et calcule, sur des grilles de $m = 10$, $100$, $1\,000$ et $10\,000$ pas, la variation totale et la variation quadratique. Les accroissements sur grille grossière sont des sommes d'accroissements fins, donc les quatre lignes décrivent la même trajectoire.

```python
import numpy as np

rng = np.random.default_rng(11)
n_paths, n_steps, T = 20_000, 400, 2.0
dt = T / n_steps
dW = rng.normal(0.0, np.sqrt(dt), size=(n_paths, n_steps))   # increments ~ N(0, dt)
W = np.hstack([np.zeros((n_paths, 1)), dW.cumsum(axis=1)])   # W_0 = 0

# 1. Gaussian marginals: E[W_t] = 0, Var(W_t) = t, Cov(W_s, W_t) = min(s, t)
for ti in (0.5, 1.0, 2.0):
    i = round(ti / dt)
    print(f"t={ti}: mean={W[:, i].mean():+.4f}  var={W[:, i].var():.4f}  (exact {ti})")
i_s, i_t = round(0.5 / dt), round(1.5 / dt)
print(f"Cov(W_0.5, W_1.5) = {np.mean(W[:, i_s] * W[:, i_t]):.4f}  (exact 0.5)")
print(f"E[exp(W_1 - 1/2)] = {np.exp(W[:, round(1 / dt)] - 0.5).mean():.4f}  (exact 1)")

# 2. Quadratic variation on ONE path over [0, 1], refining the grid
fine = rng.normal(0.0, np.sqrt(1 / 10_000), size=10_000)     # 10 000 fine increments
for m in (10, 100, 1_000, 10_000):
    inc = fine.reshape(m, -1).sum(axis=1)                    # same path on m steps
    print(f"m={m:>6}: sum|dW| = {np.abs(inc).sum():7.3f}   sum dW^2 = {(inc ** 2).sum():.4f}")
```

::: output
```
t=0.5: mean=+0.0051  var=0.5096  (exact 0.5)
t=1.0: mean=+0.0064  var=0.9998  (exact 1.0)
t=2.0: mean=+0.0140  var=2.0075  (exact 2.0)
Cov(W_0.5, W_1.5) = 0.5075  (exact 0.5)
E[exp(W_1 - 1/2)] = 1.0034  (exact 1)
m=    10: sum|dW| =   2.704   sum dW^2 = 1.1000
m=   100: sum|dW| =   7.808   sum dW^2 = 0.9361
m=  1000: sum|dW| =  25.263   sum dW^2 = 0.9901
m= 10000: sum|dW| =  79.326   sum dW^2 = 0.9891
```
:::

Variance et covariance concordent à l'erreur Monte Carlo près (environ $1\,\%$). Sur la trajectoire unique, la variation quadratique se stabilise près de $1$, avec un écart-type $\sqrt{2/m}$ — $0{,}45$ pour $m = 10$, $0{,}014$ pour $m = 10\,000$ — exactement la dispersion observée. La variation totale, elle, croît comme $\sqrt{2m/\pi}$ ($2{,}5$ ; $8{,}0$ ; $25{,}2$ ; $79{,}8$) : elle diverge quand la grille se raffine.

Analytiquement, prenons un mouvement brownien géométrique avec $\mu = 8\,\%$, $\sigma = 40\,\%$, $T = 10$ ans. Alors $\mu - \sigma^2/2 = 0$, donc le prix terminal médian vaut exactement $S_0$ et $\mathbb{P}(S_T < S_0) = 1/2$, tandis que $\mathbb{E}[S_T] = S_0 e^{0{,}8} \approx 2{,}23\,S_0$. La probabilité de battre la moyenne est $\mathbb{P}(\sigma W_T > \sigma^2 T / 2) = 1 - \Phi(0{,}632) \approx 0{,}26$ : la moyenne est portée par un quart des trajectoires. C'est le frein de volatilité (volatility drag).

## Pourquoi c'est important en finance quantitative

- **Le moteur de Black–Scholes.** Sous $\mathbb{Q}$, l'action est un mouvement brownien géométrique de dérive $r$ et un prix d'option est une intégrale gaussienne sur $W_T$ : toute formule de [[black-scholes]] est une propriété du mouvement brownien déguisée.
- **Le $(dW)^2 = dt$ d'Itô.** La correction $\tfrac12 f''(W_t)\,dt$ dans [[ito-lemma]] *est* la variation quadratique. Sans elle, pas de $-\sigma^2/2$, pas de compromis thêta–gamma, pas d'équation de Black–Scholes.
- **La règle en $\sqrt{t}$.** $\mathrm{Var}(W_t) = t$ : vol quotidienne $\times \sqrt{252}$ = vol annuelle, et une [[value-at-risk|VaR]] à 10 jours vaut $\sqrt{10}$ fois la VaR à 1 jour — exactement seulement sous des accroissements indépendants.
- **La variance réalisée est une variation quadratique.** $\sum_i r_i^2$ sur une journée estime $\int_0^1 \sigma_s^2\,ds$, ce que paient les swaps de variance, avec l'erreur d'échantillonnage $\sqrt{2/m}$ vue plus haut.
- **Structure de martingale.** $W$ est la [[martingales|martingale]] continue canonique ; sa martingale exponentielle est la densité de Girsanov qui transforme $\mathbb{P}$ en $\mathbb{Q}$, changeant la dérive de $\mu$ en $r$ sans toucher à $\sigma$.
- **Problèmes de premier passage.** Le principe de réflexion évalue les options à barrière et lookback, et donne la probabilité qu'un stop-loss soit touché avant l'échéance.
- **Simulation.** Le Monte Carlo discrétise $\Delta W = \sqrt{\Delta t}\,Z$ avec $Z \sim N(0, 1)$ ; les modèles d'espace d'état gaussiens comme le [[kalman-filter|filtre de Kalman]] en sont les cousins à temps discret.

## Questions d'entretien

::: question Calcule $\mathrm{Cov}(W_s, W_t)$ et $\mathrm{Corr}(W_s, W_t)$ pour $s < t$. Que vaut $\mathbb{E}[W_s W_t^2]$ ?
::: hint
Écris $W_t = W_s + (W_t - W_s)$ et utilise l'indépendance de l'accroissement par rapport à $W_s$.
:::
::: answer
$\mathrm{Cov}(W_s, W_t) = \mathrm{Var}(W_s) = s$ et $\mathrm{Corr} = s / \sqrt{s t} = \sqrt{s/t}$. Avec $\Delta = W_t - W_s$ : $\mathbb{E}[W_s (W_s + \Delta)^2] = \mathbb{E}[W_s^3] + 2\,\mathbb{E}[W_s^2]\,\mathbb{E}[\Delta] + \mathbb{E}[W_s]\,\mathbb{E}[\Delta^2] = 0$, puisque les moments impairs des gaussiennes centrées sont nuls.
:::
:::

::: question Sachant $W_1 = x$, quelle est la loi de $W_{1/2}$ ? Généralise à $W_s$ sachant $W_t$ pour $s < t$.
::: hint
$(W_s, W_t)$ est un vecteur gaussien ; utilise la formule de conditionnement gaussien, ou écris $W_s = \frac{s}{t} W_t + \big(W_s - \frac{s}{t} W_t\big)$ et vérifie que les deux morceaux sont décorrélés.
:::
::: answer
$\mathbb{E}[W_s \mid W_t] = \dfrac{\mathrm{Cov}(W_s, W_t)}{\mathrm{Var}(W_t)}\,W_t = \dfrac{s}{t}\,W_t$ et $\mathrm{Var}(W_s \mid W_t) = s - \dfrac{s^2}{t} = \dfrac{s(t - s)}{t}$, donc $W_{1/2} \mid W_1 = x \sim N(x/2,\ 1/4)$. C'est le pont brownien, l'outil pour compléter une trajectoire entre deux points observés (Monte Carlo pour les options à barrière, échantillonnage stratifié de $W_T$).
:::
:::

::: question Prouve que la variation quadratique du mouvement brownien sur $[0, t]$ vaut $t$ dans $L^2$, et explique en une phrase pourquoi cela impose un nouveau calcul différentiel.
::: hint
Calcule la moyenne et la variance de $\sum_i \Delta_i^2$ en utilisant $\mathbb{E}[Z^4] = 3$ pour une gaussienne standard $Z$.
:::
::: answer
Avec $\Delta_i \sim N(0, \delta_i)$ indépendants, $\mathbb{E}[\sum_i \Delta_i^2] = \sum_i \delta_i = t$ et $\mathrm{Var}(\sum_i \Delta_i^2) = \sum_i 2\delta_i^2 \le 2t \max_i \delta_i \to 0$, donc $\sum_i \Delta_i^2 \to t$ dans $L^2$. Parce que $(dW)^2 = dt$ est du premier ordre en $dt$, un développement de Taylor de $f(W_t)$ doit garder $\tfrac12 f''(W_t)(dW_t)^2 = \tfrac12 f''(W_t)\,dt$ — la formule d'Itô ; la règle de dérivation ordinaire le laisse tomber en silence.
:::
:::

::: question Établis $\mathbb{P}(\max_{s \le t} W_s \ge a)$ pour $a > 0$ par le principe de réflexion. Évalue-la pour $a = 1$, $t = 1$, et déduis-en si $\mathbb{E}[\tau_a]$ est fini.
::: hint
Sur $\{\tau_a \le t\}$, la trajectoire après $\tau_a$ est un nouveau mouvement brownien issu de $a$, donc symétrique autour de $a$.
:::
::: answer
$\{\max_{s \le t} W_s \ge a\} = \{\tau_a \le t\}$. Par la propriété de Markov forte et la symétrie, $\mathbb{P}(\tau_a \le t, W_t \ge a) = \mathbb{P}(\tau_a \le t, W_t \le a)$ ; comme $\{W_t \ge a\} \subseteq \{\tau_a \le t\}$, en additionnant on obtient $\mathbb{P}(\tau_a \le t) = 2\big(1 - \Phi(a/\sqrt{t})\big)$, soit $2(1 - \Phi(1)) \approx 0{,}317$ pour $a = t = 1$. En dérivant, $\tau_a$ a pour densité $\dfrac{a}{\sqrt{2\pi t^3}} e^{-a^2/(2t)} \sim t^{-3/2}$, donc $\mathbb{E}[\tau_a] = \infty$ : le niveau est atteint presque sûrement mais avec un temps d'attente espéré infini, le jumeau en temps continu du résultat sur la marche aléatoire dans [[martingales]]. Financièrement, un log-prix sans dérive touche une barrière $a$ avant $t$ avec probabilité $2\big(1 - \Phi(a/(\sigma\sqrt{t}))\big)$.
:::
:::
