---
title: Lemme d'Itô
subject: stochastic
summary: La règle de dérivation en chaîne pour les fonctions d'une diffusion. Comme le carré d'un accroissement brownien est d'ordre dt et non plus petit, un terme du second ordre survit là où le calcul ordinaire l'aurait négligé ; il est à l'origine de toutes les corrections de dérive en finance quantitative, du logarithme d'un mouvement brownien géométrique à l'EDP de Black–Scholes.
difficulty: 3
interview: 5
tags: [stochastic-calculus, ito, sde, quadratic-variation, martingale]
prerequisites: [brownian-motion]
related: [black-scholes, martingales]
---

## Intuition

Le calcul ordinaire jette le terme du second ordre $\tfrac12 f''(x)\,(dx)^2$ parce que $(dx)^2$ tend vers zéro bien plus vite que $dt$. Le mouvement brownien casse ce raisonnement : sur un pas $dt$, l'accroissement $dW \sim \mathcal{N}(0, dt)$ a une taille typique $\sqrt{dt}$, donc $(dW)^2$ est d'ordre $dt$, et le sommer sur $[0, T]$ donne $T$, pas zéro — la variation quadratique du [[brownian-motion|mouvement brownien]]. Le terme du second ordre survit donc, et une fonction du mouvement brownien acquiert une dérive supplémentaire $\tfrac12 f''(W_t)\,dt$. Le lemme d'Itô, ce n'est rien d'autre : **Taylor à l'ordre 2, remplacer $(dW)^2$ par $dt$, jeter tout ce qui est plus petit.**

::: viz ito-lemma D'où vient le −½σ²
Les deux courbes viennent de la même dérive μ. Augmente σ : la moyenne croît en μ alors que la trajectoire typique croît en μ − σ²/2, et l'écart est exactement la correction d'Itô.
:::

## Formules clés

| Nom | Formule |
|---|---|
| Table de multiplication | $(dW)^2 = dt$, $dt\,dW = 0$, $(dt)^2 = 0$ |
| Lemme d'Itô | $df = \big(\partial_t f + \mu\,\partial_x f + \tfrac12\sigma^2\partial_{xx} f\big)dt + \sigma\,\partial_x f\,dW$ |
| Multidimensionnel | $df = \partial_t f\,dt + \sum_i \partial_i f\,dX^i + \tfrac12\sum_{i,k}\partial_{ik} f\,d\langle X^i, X^k\rangle$ |
| Règle du produit | $d(XY) = X\,dY + Y\,dX + d\langle X, Y\rangle$ |
| Log d'un MBG | $d\ln S = (\mu - \tfrac12\sigma^2)\,dt + \sigma\,dW$ |
| Martingale exponentielle | $d\big(e^{\lambda W_t - \lambda^2 t/2}\big) = \lambda\,e^{\lambda W_t - \lambda^2 t/2}\,dW_t$ |

## Erreurs fréquentes

::: pitfall Écrire d ln S = dS / S
La correction $-\tfrac12\sigma^2\,dt$ n'est pas petite : à 30 % de volatilité sur 10 ans, elle retranche $0{,}45$ au log-rendement, si bien que le prix terminal médian vaut $e^{-0{,}45} \approx 0{,}64$ fois ce que prédit le calcul naïf.
:::

::: pitfall Appliquer le lemme d'Itô à un payoff
$(S - K)^+$ n'est pas deux fois dérivable en $K$. On applique le lemme à la fonction prix $V(t, S)$, régulière, et on laisse la condition terminale porter le coude ; ou bien on utilise la formule de Tanaka avec son terme de temps local.
:::

::: pitfall Oublier la corrélation dans le terme croisé
En dimension deux, le terme du second ordre contient $\partial_{12} f\,\rho\,\sigma_1\sigma_2\,dt$. L'oublier est l'erreur standard dans les calculs d'options d'échange, de quantos et de paniers ; oublier le seul terme croisé change la dérive d'un rapport $S^1/S^2$ de $\rho\sigma_1\sigma_2$, tandis qu'appliquer la règle du quotient ordinaire manque les deux corrections, $\sigma_2^2 - \rho\sigma_1\sigma_2$.
:::

::: pitfall Confondre les intégrales d'Itô et de Stratonovich
$\int_0^T W_t\,dW_t$ vaut $\tfrac12(W_T^2 - T)$ au sens d'Itô et $\tfrac12 W_T^2$ au sens de Stratonovich. Seule la version d'Itô est une martingale, ce qu'exige une couverture non anticipative.
:::

## Révision en 30 secondes

Le lemme d'Itô est la règle de dérivation en chaîne avec un terme de plus : $df = \partial_t f\,dt + \partial_x f\,dX + \tfrac12 \partial_{xx} f\,(dX)^2$, où $(dW)^2 = dt$ et tous les autres produits s'annulent. Pour $dX = \mu\,dt + \sigma\,dW$, la dérive de $f$ vaut $\partial_t f + \mu\,\partial_x f + \tfrac12\sigma^2\,\partial_{xx} f$. Trois résultats à connaître par cœur : $d\ln S = (\mu - \tfrac12\sigma^2)\,dt + \sigma\,dW$ ; $W_t^2 - t$ est une martingale ; $e^{\lambda W_t - \lambda^2 t/2}$ est une martingale. En plusieurs dimensions, les termes croisés portent $\rho\,\sigma_i\sigma_k\,dt$, et la règle du produit ajoute $d\langle X, Y\rangle$.

## Formulation mathématique

::: formula Table de multiplication d'Itô
$$
dt \cdot dt = 0, \qquad dt \cdot dW_t = 0, \qquad dW_t \cdot dW_t = dt .
$$
:::

Soit $X_t$ un processus d'Itô, $dX_t = \mu_t\,dt + \sigma_t\,dW_t$ avec $\mu_t, \sigma_t$ adaptés, et soit $f(t, x)$ de classe $C^1$ en $t$ et $C^2$ en $x$.

::: formula Lemme d'Itô (dimension un)
$$
df(t, X_t) = \Big( \partial_t f + \mu_t\,\partial_x f + \tfrac12 \sigma_t^2\,\partial_{xx} f \Big)\,dt + \sigma_t\,\partial_x f\,dW_t ,
$$
toutes les dérivées partielles étant évaluées en $(t, X_t)$.
:::

De façon compacte : $df = \partial_t f\,dt + \partial_x f\,dX_t + \tfrac12 \partial_{xx} f\,(dX_t)^2$, avec $(dX_t)^2 = \sigma_t^2\,dt$ d'après la table. L'énoncé rigoureux est la forme intégrale $f(T, X_T) = f(0, X_0) + \int_0^T (\cdots)\,dt + \int_0^T \sigma_t\,\partial_x f\,dW_t$, le dernier terme étant une intégrale d'Itô : l'intégrande est évalué à l'extrémité gauche de chaque intervalle.

Pour $X_t = (X^1_t, \dots, X^n_t)$ avec $dX^i_t = \mu^i_t\,dt + \sum_j \sigma^{ij}_t\,dW^j_t$ et $d\langle W^j, W^k \rangle_t = \rho_{jk}\,dt$ :

::: formula Lemme d'Itô (multidimensionnel)
$$
df = \partial_t f\,dt + \sum_{i} \partial_i f\,dX^i_t + \tfrac12 \sum_{i,k} \partial_{ik} f\,d\langle X^i, X^k \rangle_t,
\qquad
d\langle X^i, X^k \rangle_t = \sum_{j,l} \sigma^{ij}_t \sigma^{kl}_t \rho_{jl}\,dt .
$$
:::

Pour deux actifs de volatilités $\sigma_1, \sigma_2$ et de corrélation $\rho$, le terme croisé vaut $d\langle X^1, X^2\rangle_t = \rho\,\sigma_1\sigma_2\,dt$. En prenant $f(x, y) = xy$ :

::: formula Règle du produit d'Itô
$$
d(X_t Y_t) = X_t\,dY_t + Y_t\,dX_t + d\langle X, Y \rangle_t .
$$
:::

Le calcul ordinaire s'arrête après deux termes ; la covariation $d\langle X, Y\rangle_t = \rho\,\sigma^X_t \sigma^Y_t\,dt$ est la correction d'Itô, et elle disparaît quand l'un des processus est à variation finie, par exemple $Y_t = e^{-rt}$.

## Dérivation

Fixons une subdivision $0 = t_0 < \dots < t_n = T$ de pas $\Delta t$, avec $\Delta X_k = \mu\,\Delta t + \sigma\,\Delta W_k$. Taylor à l'ordre 2 :

$$
f(t_{k+1}, X_{t_{k+1}}) - f(t_k, X_{t_k}) = \partial_t f\,\Delta t + \partial_x f\,\Delta X_k + \tfrac12 \partial_{xx} f\,(\Delta X_k)^2 + \partial_{tx} f\,\Delta t\,\Delta X_k + \tfrac12 \partial_{tt} f\,(\Delta t)^2 + \cdots
$$

Développons $(\Delta X_k)^2 = \sigma^2 (\Delta W_k)^2 + 2\mu\sigma\,\Delta t\,\Delta W_k + \mu^2 (\Delta t)^2$ et sommons. Trois faits décident de ce qui survit quand $\Delta t \to 0$ :

1. $\sum_k (\Delta W_k)^2 \to T$ dans $L^2$ : $\mathbb{E}[(\Delta W_k)^2] = \Delta t$ et $\operatorname{Var}[(\Delta W_k)^2] = 2(\Delta t)^2$, donc la somme a pour moyenne $T$ et pour variance $2T\,\Delta t \to 0$. C'est le contenu précis de $(dW)^2 = dt$ — pas seulement en espérance, mais avec une variance qui s'annule.
2. $\sum_k \Delta t\,\Delta W_k$ est de moyenne $0$ et de variance $T(\Delta t)^2 \to 0$ : le terme mixte $dt\,dW$ meurt.
3. $\sum_k (\Delta t)^2 = T\,\Delta t \to 0$, et les termes d'ordre supérieur disparaissent de même.

Le seul survivant du second ordre est $\tfrac12 \sigma^2\,\partial_{xx} f\,\Delta t$, et le passage à la limite donne le lemme d'Itô ; sous forme multiplicative, $(dX)^2 = \sigma^2 dt$, $dt\,dX = 0$, $(dt)^2 = 0$.

**Où intervient l'extrémité gauche.** La somme du premier ordre $\sum_k \partial_x f(t_k, X_{t_k})\,\Delta W_k$ évalue l'intégrande au *début* de chaque intervalle, donc sa limite $\int \partial_x f\,dW$ est une martingale : chaque terme est un pari équitable sachant le passé. Évaluer au milieu donne l'intégrale de Stratonovich, pour laquelle la règle de dérivation ordinaire reste valable et la correction est absorbée dans l'intégrale. La finance utilise Itô parce qu'une couverture choisie en $t_k$ ne peut utiliser que l'information disponible en $t_k$.

## Hypothèses et cas limites

- **Régularité.** $f$ doit être $C^2$ en $x$. Pour $f(x) = |x|$, ou un payoff $(x - K)^+$, la dérivée seconde est une masse de Dirac et le lemme d'Itô acquiert un terme de *temps local* (formule de Tanaka) — d'où l'application d'Itô à la fonction prix $V(t, S)$, régulière, jamais au payoff.
- **Continuité.** La formule telle qu'énoncée exige des trajectoires continues. Avec des sauts, $df$ gagne une somme sur les instants de saut de $f(X_s) - f(X_{s-}) - \partial_x f(X_{s-})\,\Delta X_s$ ; la partie en $dt$ est inchangée.
- **Processus d'Itô seulement.** Dérive et volatilité doivent être adaptées et intégrables ($\int_0^T \sigma_t^2\,dt < \infty$ presque sûrement) ; l'EDS elle-même demande des coefficients localement lipschitziens pour avoir une solution.
- **Volatilité dégénérée.** Si $\sigma_t = 0$ la correction disparaît et le lemme d'Itô redevient la règle de dérivation classique.
- **Termes croisés.** $dt\,dW = 0$ tue la dérivée mixte $\partial_{tx} f$ ; en plusieurs dimensions seules les paires browniennes corrélées contribuent, via $\rho_{jk}$. Deux mouvements browniens indépendants ont une covariation nulle.
- **Itô contre Stratonovich.** $\int_0^T W_t\,dW_t = \tfrac12 (W_T^2 - T)$ au sens d'Itô mais $\tfrac12 W_T^2$ au sens de Stratonovich. Il faut toujours préciser de quelle intégrale on parle : la physique utilise souvent Stratonovich, la finance utilise Itô.

## Exemple détaillé

**1. Logarithme d'un mouvement brownien géométrique.** Avec $dS_t = \mu S_t\,dt + \sigma S_t\,dW_t$ et $f(x) = \ln x$ :

$$
d\ln S_t = \frac{1}{S_t}\,dS_t - \frac{1}{2 S_t^2}\,(dS_t)^2 = \Big(\mu - \tfrac12 \sigma^2\Big)\,dt + \sigma\,dW_t ,
$$

d'où $S_T = S_0 \exp\big((\mu - \tfrac12\sigma^2)T + \sigma W_T\big)$. Le $-\tfrac12\sigma^2$ est la traînée de volatilité : le taux de croissance médian est inférieur au taux moyen $\mu$.

**2. $W_t^2 - t$ est une martingale.** Avec $f(x) = x^2$ : $d(W_t^2) = 2W_t\,dW_t + dt$, donc $W_t^2 - t = 2\int_0^t W_s\,dW_s$ est une intégrale stochastique, donc une [[martingales|martingale]] locale — et une vraie martingale ici, puisque $\mathbb{E}\int_0^t W_s^2\,ds = t^2/2 < \infty$.

**3. La martingale exponentielle.** Avec $f(t, x) = \exp(\lambda x - \tfrac12 \lambda^2 t)$ : $\partial_t f = -\tfrac12\lambda^2 f$, $\partial_x f = \lambda f$, $\partial_{xx} f = \lambda^2 f$, donc

$$
df = \Big(-\tfrac12\lambda^2 f + \tfrac12 \lambda^2 f\Big)\,dt + \lambda f\,dW_t = \lambda f\,dW_t .
$$

Pas de terme en $dt$ : $M_t = e^{\lambda W_t - \lambda^2 t/2}$ est une martingale. C'est la densité du théorème de Girsanov, et avec $\lambda = \sigma$ elle montre que $e^{-rt}S_t$ est une martingale exactement quand $\mu = r$ — la condition risque-neutre derrière [[black-scholes]].

Numériquement pour l'application 2 : on forme la somme à gauche $2\sum_k W_{t_k}\,\Delta W_k$ et on la compare à $W_T^2$, avec et sans la correction $T$.

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

Le calcul ordinaire se trompe de presque exactement $T = 1$ sur chaque trajectoire. La version d'Itô ne s'écarte que de $\sum_k (\Delta W_k)^2 - T$, dont l'écart-type $\sqrt{2T\,\Delta t} \approx 0{,}045$ correspond à la dernière ligne. L'identité discrète $W_T^2 = \sum_k \big(2 W_{t_k}\Delta W_k + (\Delta W_k)^2\big)$ est exacte ; toute la convergence se joue dans la colonne de variation quadratique.

## Pourquoi c'est important en finance quantitative

- **L'EDP de Black–Scholes, c'est Itô plus une couverture.** On applique le lemme à $V(t, S_t)$, on vend $\partial_S V$ actions, et le terme en $dW$ s'annule ; le terme en $dt$ qui survit doit rapporter le taux sans risque. Voir [[black-scholes]].
- **Le gamma est le terme d'Itô.** La correction $\tfrac12 \sigma^2 S^2\,\partial_{SS} V\,dt$ est le P&L de gamma d'une option couverte et l'origine du compromis gamma–thêta dans [[greeks]].
- **Décider ce qui est une martingale.** $f(t, X_t)$ est une martingale (locale) exactement quand son coefficient en $dt$ s'annule ; c'est ainsi qu'on vérifie que les prix actualisés sont des [[martingales]] sous la mesure de pricing.
- **Changement de mesure.** La martingale exponentielle est la densité de Radon–Nikodym du théorème de Girsanov, qui transforme la dérive réelle $\mu$ en taux sans risque $r$.
- **Résoudre les EDS linéaires.** La règle du produit appliquée à $e^{\kappa t} X_t$ résout le processus d'Ornstein–Uhlenbeck $dX_t = \kappa(\theta - X_t)\,dt + \sigma\,dW_t$, cheval de bataille des modèles de taux court et du [[kalman-filter|filtre de Kalman]] en temps continu.
- **Modèles multi-actifs et à volatilité stochastique.** Heston, options sur panier, ajustements quanto reposent tous sur le lemme multidimensionnel, et le terme de covariation est l'origine de la dérive quanto $-\rho\,\sigma_S\sigma_{FX}$.

## Questions d'entretien

::: question Soit $dS_t = \mu S_t\,dt + \sigma S_t\,dW_t$. Trouve la dynamique de $\ln S_t$ et déduis-en la loi de $S_T$.
::: hint
Prends $f(x) = \ln x$, donc $f'' = -1/x^2$, et utilise $(dS_t)^2 = \sigma^2 S_t^2\,dt$.
:::
::: answer
$d\ln S_t = (\mu - \tfrac12\sigma^2)\,dt + \sigma\,dW_t$, donc $\ln S_T \sim \mathcal{N}\big(\ln S_0 + (\mu - \tfrac12\sigma^2)T,\ \sigma^2 T\big)$ : $S_T$ est log-normale, de médiane $S_0 e^{(\mu - \sigma^2/2)T}$ et de moyenne $S_0 e^{\mu T}$. L'écart entre les deux est la traînée de volatilité.
:::
:::

::: question Calcule $\int_0^T W_t\,dW_t$ et explique pourquoi la réponse n'est pas $\tfrac12 W_T^2$.
::: hint
Applique le lemme d'Itô à $W_t^2$ et isole l'intégrale stochastique.
:::
::: answer
$d(W_t^2) = 2W_t\,dW_t + dt$, donc $\int_0^T W_t\,dW_t = \tfrac12(W_T^2 - T)$. Le $-T/2$ supplémentaire est la moitié de la variation quadratique. Vérification : une intégrale d'Itô est de moyenne nulle, et en effet $\mathbb{E}[\tfrac12(W_T^2 - T)] = 0$, alors que $\mathbb{E}[\tfrac12 W_T^2] = T/2 \neq 0$.
:::
:::

::: question Utilise le lemme d'Itô pour calculer $\mathbb{E}[W_t^4]$.
::: hint
Prends $f(x) = x^4$, passe à l'espérance et utilise $\mathbb{E}[W_s^2] = s$.
:::
::: answer
$d(W_t^4) = 4W_t^3\,dW_t + 6W_t^2\,dt$. L'intégrale stochastique est de moyenne nulle, donc $\mathbb{E}[W_t^4] = 6\int_0^t \mathbb{E}[W_s^2]\,ds = 6\int_0^t s\,ds = 3t^2$. Cohérent avec le kurtosis gaussien de 3 : $\mathbb{E}[W_t^4] = 3\,(\mathbb{E}[W_t^2])^2$. La même méthode donne $\mathbb{E}[W_t^6] = 15t^3$.
:::
:::

::: question Deux actions suivent $dS^i_t = \mu_i S^i_t\,dt + \sigma_i S^i_t\,dW^i_t$ avec $d\langle W^1, W^2\rangle_t = \rho\,dt$. Trouve la dynamique du rapport $Y_t = S^1_t/S^2_t$ et sa volatilité.
::: hint
Prends $f(x, y) = x/y$ ; il te faut $\partial_{xy} f = -1/y^2$ et $\partial_{yy} f = 2x/y^3$, ainsi que la covariation $d\langle S^1, S^2\rangle_t = \rho\sigma_1\sigma_2 S^1_t S^2_t\,dt$.
:::
::: answer
$dY = \dfrac{dS^1}{S^2} - \dfrac{S^1}{(S^2)^2}\,dS^2 + \tfrac12\Big[2\cdot\big(-\tfrac{1}{(S^2)^2}\big)\,d\langle S^1, S^2\rangle + \tfrac{2S^1}{(S^2)^3}\,d\langle S^2\rangle\Big]$. Avec $d\langle S^2\rangle_t = \sigma_2^2 (S^2_t)^2\,dt$, on obtient
$$
\frac{dY_t}{Y_t} = \big(\mu_1 - \mu_2 + \sigma_2^2 - \rho\sigma_1\sigma_2\big)\,dt + \sigma_1\,dW^1_t - \sigma_2\,dW^2_t .
$$
La volatilité de $Y$ vaut $\sqrt{\sigma_1^2 + \sigma_2^2 - 2\rho\sigma_1\sigma_2}$, celle qui entre dans la formule de Margrabe pour l'option d'échange. Les deux termes de dérive supplémentaires $\sigma_2^2 - \rho\sigma_1\sigma_2$ sont de pures corrections d'Itô : la règle du quotient ordinaire les manquerait.
:::
:::
