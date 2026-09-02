---
title: Variance
subject: probability
summary: L'écart quadratique moyen à la moyenne — le moment centré d'ordre deux. C'est la brique de la covariance, de la corrélation, du risque de portefeuille et de toute méthode des moindres carrés, et la raison pour laquelle la diversification a un plancher.
difficulty: 1
interview: 4
tags: [variance, moments, covariance, portfolio, estimation]
prerequisites: [conditional-probability]
related: [volatility, linear-regression]
---

## Intuition

La moyenne dit où se situe une variable aléatoire ; la variance dit de combien elle s'en écarte d'habitude. On prend l'écart $X - \mu$, on l'élève au carré pour que les excursions positives et négatives comptent toutes les deux comme de la dispersion, et on fait la moyenne : c'est la variance.

Le carré n'est pas un choix arbitraire. Il rend la variance **additive** entre sources de hasard indépendantes, et il fait de la moyenne le point qui la minimise — $\mathbb{E}[(X-c)^2]$ est minimal en $c = \mu$. Ces deux propriétés expliquent pourquoi c'est la variance, et non l'écart absolu moyen pourtant plus naturel, qui se trouve sous les moindres carrés, l'optimisation de portefeuille et le théorème central limite.

Le prix du carré est un changement d'unité. Si $X$ est un rendement en pourcentage, $\operatorname{Var}(X)$ est en pourcentage au carré, ce que personne ne sait lire. La racine carrée donne l'**écart-type**, de retour dans les unités du rendement — et pour des rendements ce nombre a son propre nom, la [[volatility|volatilité]].

En finance, la variance est l'objet que l'on calcule ; la volatilité est l'objet que l'on cote.

## Formulation mathématique

::: formula Variance
$$
\operatorname{Var}(X) = \mathbb{E}\big[(X - \mu)^2\big] = \mathbb{E}[X^2] - \big(\mathbb{E}[X]\big)^2, \qquad \mu = \mathbb{E}[X],
$$
définie dès que $\mathbb{E}[X^2] < \infty$. L'écart-type vaut $\sigma = \sqrt{\operatorname{Var}(X)}$.
:::

Les transformations affines la remettent à l'échelle de façon quadratique et ignorent les translations :

$$
\operatorname{Var}(aX + b) = a^2 \operatorname{Var}(X).
$$

Pour deux variables, la **covariance** mesure le co-mouvement et la **corrélation** le normalise :

::: formula Covariance et corrélation
$$
\operatorname{Cov}(X, Y) = \mathbb{E}\big[(X - \mu_X)(Y - \mu_Y)\big] = \mathbb{E}[XY] - \mathbb{E}[X]\mathbb{E}[Y],
\qquad
\rho_{XY} = \frac{\operatorname{Cov}(X, Y)}{\sigma_X \sigma_Y} \in [-1, 1].
$$
:::

Variance d'une somme, en général et pour $n$ termes :

$$
\operatorname{Var}(X + Y) = \operatorname{Var}(X) + \operatorname{Var}(Y) + 2\operatorname{Cov}(X, Y),
\qquad
\operatorname{Var}\Big(\sum_i X_i\Big) = \sum_i \sum_j \operatorname{Cov}(X_i, X_j).
$$

L'indépendance donne $\operatorname{Cov}(X,Y) = 0$ donc l'additivité, mais **la non-corrélation suffit** : l'additivité ne demande que l'annulation de la covariance, pas l'indépendance complète.

Pour un portefeuille de poids $w \in \mathbb{R}^n$ et de matrice de covariance $\Sigma$ :

::: formula Variance de portefeuille
$$
\sigma_p^2 = w^\top \Sigma w = \sum_{i}\sum_{j} w_i w_j \sigma_i \sigma_j \rho_{ij},
$$
et pour deux actifs $\;\sigma_p^2 = w_1^2\sigma_1^2 + w_2^2\sigma_2^2 + 2w_1w_2\rho\,\sigma_1\sigma_2$.
:::

$\Sigma$ est symétrique semi-définie positive précisément parce que $w^\top \Sigma w$ est une variance et qu'une variance ne peut pas être négative.

Enfin, conditionner scinde la variance en deux morceaux :

::: formula Loi de la variance totale
$$
\operatorname{Var}(X) = \mathbb{E}\big[\operatorname{Var}(X \mid Y)\big] + \operatorname{Var}\big(\mathbb{E}[X \mid Y]\big).
$$
:::

## Dérivation

**La forme de calcul.** On développe le carré et on utilise la linéarité :

$$
\mathbb{E}[(X-\mu)^2] = \mathbb{E}[X^2 - 2\mu X + \mu^2] = \mathbb{E}[X^2] - 2\mu\,\mathbb{E}[X] + \mu^2 = \mathbb{E}[X^2] - \mu^2 .
$$

**La corrélation est bornée.** On applique Cauchy–Schwarz aux variables centrées : $|\mathbb{E}[(X-\mu_X)(Y-\mu_Y)]| \le \sigma_X \sigma_Y$, donc $|\rho| \le 1$, avec égalité exactement quand $Y = a + bX$ presque sûrement. La corrélation est donc une mesure de dépendance **linéaire**, et rien de plus.

**Diversification.** Prenons $n$ actifs de variance $\sigma^2$ chacun, toutes les paires ayant la même covariance $c = \rho\sigma^2$, détenus en poids égaux $w_i = 1/n$ :

$$
\sigma_p^2 = \frac{1}{n^2}\Big( n\sigma^2 + n(n-1)c \Big) = \frac{\sigma^2}{n} + \Big(1 - \frac{1}{n}\Big) c .
$$

Quand $n \to \infty$ le premier terme s'annule : le risque idiosyncratique est diversifiable. Le second tend vers $c = \rho\sigma^2$, donc la volatilité du portefeuille bute sur $\sigma\sqrt{\rho}$. **C'est la covariance qui fixe le plancher**, et aucune quantité de lignes ne l'enlève.

**Correction de Bessel.** Avec $\bar{X} = \frac1n\sum_i X_i$ sur un échantillon i.i.d.,

$$
\mathbb{E}\Big[\sum_i (X_i - \bar{X})^2\Big] = \mathbb{E}\Big[\sum_i (X_i-\mu)^2\Big] - n\,\mathbb{E}\big[(\bar{X}-\mu)^2\big] = n\sigma^2 - n\cdot\frac{\sigma^2}{n} = (n-1)\sigma^2 .
$$

Diviser par $n-1$ donne donc un estimateur sans biais : $s^2 = \frac{1}{n-1}\sum_i (X_i - \bar{X})^2$. L'intuition est que $\bar{X}$ a été ajustée sur les données elles-mêmes, si bien que les écarts autour d'elle sont systématiquement trop petits ; un degré de liberté a été dépensé.

**Loi de la variance totale.** En utilisant la propriété de tour (voir [[conditional-probability]]),

$$
\mathbb{E}[X^2] = \mathbb{E}\big[\mathbb{E}[X^2 \mid Y]\big] = \mathbb{E}\big[\operatorname{Var}(X\mid Y) + \mathbb{E}[X\mid Y]^2\big].
$$

On soustrait $\big(\mathbb{E}[X]\big)^2 = \big(\mathbb{E}[\mathbb{E}[X\mid Y]]\big)^2$ des deux côtés et le membre de droite devient $\mathbb{E}[\operatorname{Var}(X\mid Y)] + \operatorname{Var}(\mathbb{E}[X\mid Y])$.

Lecture financière : soit $Y$ le régime de marché. Variance totale = **variance moyenne intra-régime** + **variance des moyennes de régime**. Un mélange « calme/stressé » peut avoir une variance totale élevée même si chaque régime est individuellement tranquille, simplement parce que les deux moyennes diffèrent.

## Hypothèses et cas limites

- **Le moment d'ordre deux doit exister.** Une loi de Student à $\nu \le 2$ degrés de liberté, ou une Cauchy, a une variance infinie ou non définie. Les variances empiriques de telles données croissent avec la taille de l'échantillon au lieu de converger : tout chiffre de risque fondé sur la variance y est vide de sens.
- **Non corrélé est plus faible qu'indépendant.** Avec $X \sim \mathcal{N}(0,1)$ et $Y = X^2$, $\operatorname{Cov}(X,Y) = \mathbb{E}[X^3] = 0$ bien que $Y$ soit une fonction déterministe de $X$. La corrélation ne voit rien ; la dépendance est totale.
- **La forme de calcul est numériquement dangereuse.** $\mathbb{E}[X^2] - \mathbb{E}[X]^2$ soustrait deux grands nombres presque égaux dès que $\mu \gg \sigma$ (une série de prix, un niveau d'indice). L'erreur relative d'arrondi est amplifiée d'environ $(\mu/\sigma)^2$, et le résultat peut même sortir négatif. Il faut passer par un algorithme en deux passes ou la mise à jour de Welford sur données centrées ; `numpy.var` le fait déjà.
- **Les matrices de covariance empiriques sont mal conditionnées.** Avec $n$ actifs et $T$ observations, $\hat\Sigma$ est singulière dès que $T \le n$, et ses valeurs propres extrêmes sont fortement biaisées même pour $T$ valant quelques fois $n$. Les optimiseurs qui inversent $\hat\Sigma$ courent alors après le bruit, d'où l'existence des méthodes de shrinkage.
- **Les poids doivent être traités de façon cohérente.** $w^\top \Sigma w$ suppose $w$ fixe sur la période. Un portefeuille rebalancé, ou dont les poids dérivent, a une variance différente de celle que renvoie cette formule.

## Exemple détaillé

On simule trois actifs corrélés, on vérifie que la variance directe de la série du portefeuille et la forme quadratique $w^\top\Sigma w$ coïncident, puis on trace la courbe de diversification.

```python
import numpy as np

rng = np.random.default_rng(7)

# Three assets: annualised vols and a correlation matrix.
sig = np.array([0.20, 0.30, 0.15])
C = np.array([[1.0, 0.5, 0.2], [0.5, 1.0, 0.3], [0.2, 0.3, 1.0]])
Sigma = np.outer(sig, sig) * C
w = np.array([0.5, 0.2, 0.3])

# Simulate 200_000 joint return draws and build the portfolio series.
R = rng.multivariate_normal(np.zeros(3), Sigma, size=200_000)
rp = R @ w

print(f"direct   Var(w'R) = {rp.var(ddof=1):.6f}")
print(f"quadratic w'Sw    = {w @ Sigma @ w:.6f}")
print(f"sample    w'S_hat w = {w @ np.cov(R, rowvar=False) @ w:.6f}")

# Diversification: n equally weighted assets, each vol 20 %, pairwise corr 0.3.
s, rho = 0.20, 0.3
print("\n n    portfolio vol")
for n in (1, 2, 5, 10, 50):
    var_n = s**2 / n + (1 - 1 / n) * rho * s**2
    print(f"{n:3d}    {np.sqrt(var_n):.4f}")
print(f"  inf    {s * np.sqrt(rho):.4f}   (correlation floor)")
```

::: output
```
direct   Var(w'R) = 0.025057
quadratic w'Sw    = 0.025045
sample    w'S_hat w = 0.025057

 n    portfolio vol
  1    0.2000
  2    0.1612
  5    0.1327
 10    0.1217
 50    0.1121
  inf    0.1095   (correlation floor)
```
:::

Deux lectures. D'abord, $w^\top\Sigma w$ retrouve la variance empirique directe à la troisième décimale — c'est l'erreur d'échantillonnage, et non une erreur de modélisation, qui explique l'écart, et en injectant la covariance *empirique* on reproduit exactement le nombre direct, comme il se doit. Ensuite, la moitié de la diversification atteignable est déjà obtenue avec 2 lignes et l'essentiel avec 10 : passer de 10 à 50 lignes ne gagne que $0{,}0096$ de volatilité, tandis que le plancher de corrélation $\sigma\sqrt{\rho} = 0{,}20\sqrt{0{,}3} = 0{,}1095$ est inatteignable.

## Pourquoi c'est important en finance quantitative

- **Le risque se cote sous forme de variance.** Tout chiffre de risque part d'ici : la [[volatility|volatilité]] est $\sqrt{\operatorname{Var}}$ des rendements, la [[value-at-risk]] paramétrique vaut $\mu + \sigma z_\alpha$, et le véga des [[greeks]] est l'exposition à la variance que le marché price.
- **La construction de portefeuille est un problème de variance.** Markowitz minimise $w^\top\Sigma w$ sous contrainte de rendement cible ; la parité de risque égalise la contribution $w_i (\Sigma w)_i$ de chaque actif ; le budget de risque la décompose. Tout dépend de la qualité de $\hat\Sigma$.
- **Les moindres carrés sont une décomposition de variance.** Dans la [[linear-regression|régression linéaire]], le $R^2$ est la fraction de la variance de $y$ expliquée par l'ajustement, et les MCO sont exactement l'estimateur qui minimise la variance résiduelle.
- **Couvrir, c'est minimiser une variance.** Le ratio de couverture de variance minimale d'une exposition $Y$ par un instrument $X$ vaut $\beta = \operatorname{Cov}(X,Y)/\operatorname{Var}(X)$ — la même formule qu'une pente de régression, et ce n'est pas un hasard.
- **La loi de la variance totale est la décomposition par régime.** Séparer le risque réalisé en une part intra-régime et une part inter-régime, c'est ainsi que l'on distingue « le marché est nerveux » de « le marché s'est re-pricé ».

## Erreurs fréquentes

::: pitfall Calculer la variance par $\mathbb{E}[X^2] - \mathbb{E}[X]^2$ sur des niveaux bruts
Sur une série de moyenne $10^4$ et d'écart-type $1$, les deux termes coïncident sur huit chiffres significatifs alors que la double précision en offre environ seize — on perd la moitié de ses chiffres, et la simple précision n'en garderait aucun. Il faut centrer les données d'abord, ou utiliser l'algorithme en ligne de Welford. Une « variance négative » en production, c'est presque toujours ce bug.
:::

::: pitfall Lire une corrélation nulle comme une indépendance
La corrélation ne détecte que la partie linéaire d'une relation. Un livre d'options delta-couvert a par construction une corrélation quasi nulle avec le sous-jacent et reste pourtant entièrement un pari sur lui, via le gamma. Regarde les nuages de points, les corrélations de rang ou la dépendance de queue avant de conclure « aucune relation ».
:::

::: pitfall Croire qu'une variance sans biais donne une volatilité sans biais
$s^2$ est sans biais pour $\sigma^2$, mais $\sqrt{\cdot}$ est strictement concave, donc l'inégalité de Jensen donne $\mathbb{E}[s] < \sqrt{\mathbb{E}[s^2]} = \sigma$. L'estimateur usuel **sous**-estime la volatilité, d'environ $\sigma/(4n)$ pour $n$ modéré sous hypothèse normale. Le biais est petit devant le bruit de l'estimateur lui-même, mais le $n-1$ au dénominateur ne le corrige pas.
:::

::: pitfall Traiter la variance comme une mesure de risque complète
La variance est symétrique : une journée à $+10\%$ et une journée à $-10\%$ contribuent identiquement, alors qu'une seule des deux inquiète un risk manager. Elle suppose aussi un moment d'ordre deux fini, ce que les modèles à queues épaisses cassent délibérément. Associe-la à une mesure de baisse (semi-variance, expected shortfall) dès que le payoff est asymétrique — un livre d'options avant tout.
:::

## Révision en 30 secondes

$\operatorname{Var}(X) = \mathbb{E}[(X-\mu)^2] = \mathbb{E}[X^2] - \mu^2$ — numériquement, on utilise la première forme, jamais la seconde sur des niveaux bruts. $\operatorname{Var}(aX+b) = a^2\operatorname{Var}(X)$ ; les variances s'additionnent quand les covariances s'annulent, et la non-corrélation suffit. Le risque de portefeuille vaut $w^\top\Sigma w$ ; à $n$ poids égaux il vaut $\sigma^2/n + (1-1/n)\rho\sigma^2$, donc la diversification s'arrête à $\sigma\sqrt{\rho}$. La variance empirique divise par $n-1$ (un degré de liberté dépensé sur la moyenne), mais sa racine reste biaisée vers le bas. Loi de la variance totale : moyenne intra-groupe plus dispersion inter-groupes. La variance est symétrique et exige un moment d'ordre deux fini — jamais toute l'histoire du risque.

## Formules clés

| Nom | Formule |
|---|---|
| Définition | $\operatorname{Var}(X) = \mathbb{E}[(X-\mu)^2] = \mathbb{E}[X^2] - \mu^2$ |
| Application affine | $\operatorname{Var}(aX + b) = a^2\operatorname{Var}(X)$ |
| Somme | $\operatorname{Var}(X+Y) = \operatorname{Var}(X) + \operatorname{Var}(Y) + 2\operatorname{Cov}(X,Y)$ |
| Corrélation | $\rho_{XY} = \operatorname{Cov}(X,Y)/(\sigma_X\sigma_Y) \in [-1,1]$ |
| Portefeuille | $\sigma_p^2 = w^\top\Sigma w$ |
| Poids égaux | $\sigma_p^2 = \dfrac{\sigma^2}{n} + \Big(1-\dfrac1n\Big)\rho\sigma^2 \;\to\; \rho\sigma^2$ |
| Variance empirique | $s^2 = \dfrac{1}{n-1}\sum_i (X_i-\bar X)^2$ |
| Variance totale | $\operatorname{Var}(X) = \mathbb{E}[\operatorname{Var}(X\mid Y)] + \operatorname{Var}(\mathbb{E}[X\mid Y])$ |

## Questions d'entretien

::: question Deux actifs ont chacun une volatilité de 20 % et une corrélation de $0{,}5$. Quelle est la volatilité du portefeuille équipondéré ?
::: hint
Utilise $\sigma_p^2 = w_1^2\sigma_1^2 + w_2^2\sigma_2^2 + 2w_1w_2\rho\sigma_1\sigma_2$ avec $w_1 = w_2 = 1/2$.
:::
::: answer
$\sigma_p^2 = 0{,}25(0{,}04) + 0{,}25(0{,}04) + 2(0{,}25)(0{,}5)(0{,}04) = 0{,}01 + 0{,}01 + 0{,}01 = 0{,}03$, donc $\sigma_p = \sqrt{0{,}03} \approx 17{,}3\,\%$.

De façon équivalente, à volatilités égales la formule se réduit à $\sigma_p = \sigma\sqrt{(1+\rho)/2} = 0{,}20\sqrt{0{,}75}$. Vérification : $\rho = 1$ donne $20\,\%$ (aucune diversification), $\rho = -1$ donne $0$ (couverture parfaite).
:::
:::

::: question Pourquoi la variance empirique divise-t-elle par $n-1$ ? Et $s = \sqrt{s^2}$ est-il alors un estimateur sans biais de $\sigma$ ?
::: hint
Calcule $\mathbb{E}\big[\sum_i (X_i - \bar X)^2\big]$, puis demande-toi ce qu'une racine carrée fait à une espérance.
:::
::: answer
$\sum_i(X_i-\bar X)^2 = \sum_i (X_i-\mu)^2 - n(\bar X - \mu)^2$, dont l'espérance vaut $n\sigma^2 - n(\sigma^2/n) = (n-1)\sigma^2$. Les écarts sont mesurés autour d'une moyenne ajustée sur les mêmes données, donc trop petits d'exactement un degré de liberté ; diviser par $n-1$ rétablit l'absence de biais.

Non, $s$ n'est pas sans biais. La racine carrée est strictement concave, donc Jensen donne $\mathbb{E}[s] < \sqrt{\mathbb{E}[s^2]} = \sigma$ : la volatilité est systématiquement sous-estimée. Sous hypothèse normale la correction exacte est $\mathbb{E}[s] = c_4(n)\,\sigma$ avec $c_4(n) = \sqrt{2/(n-1)}\,\Gamma(n/2)/\Gamma((n-1)/2)$, soit environ $1 - 1/(4n)$. L'absence de biais ne survit pas à une transformation non linéaire.
:::
:::

::: question Tu détiens $n$ actifs équipondérés, chacun de volatilité $\sigma$ et de corrélation deux à deux $\rho > 0$. Quelle est la limite de la volatilité du portefeuille quand $n \to \infty$, et à quelle vitesse l'atteint-on ?
::: hint
Écris la double somme comme $n$ termes diagonaux plus $n(n-1)$ termes hors diagonale.
:::
::: answer
$\sigma_p^2 = \frac{1}{n^2}\big(n\sigma^2 + n(n-1)\rho\sigma^2\big) = \frac{\sigma^2}{n} + \big(1-\frac1n\big)\rho\sigma^2 \to \rho\sigma^2$, donc $\sigma_p \to \sigma\sqrt{\rho}$.

L'excès au-dessus du plancher vaut $\sigma^2(1-\rho)/n$, il décroît donc en $1/n$ en variance et à peu près en $1/\sqrt{n}$ en volatilité au début : avec $\sigma = 20\,\%$ et $\rho = 0{,}3$, le plancher est à $10{,}95\,\%$ et on atteint $12{,}2\,\%$ avec seulement 10 lignes. En pratique le gain de diversification est essentiellement épuisé vers 20–30 lignes ; au-delà on ne paie plus que des coûts de transaction. Si $\rho \le 0$ l'argument du plancher tombe — mais une matrice de corrélation dont toutes les paires valent $\rho$ n'est semi-définie positive que si $\rho \ge -1/(n-1)$, donc un grand portefeuille ne peut pas être uniformément négativement corrélé.
:::
:::

::: question Le rendement quotidien d'une action a une volatilité de 1 % en régime calme (probabilité 80 %) et de 3 % en régime stressé (probabilité 20 %). Le rendement moyen est nul en régime calme et de $-1\,\%$ en régime stressé. Quelle est la volatilité inconditionnelle, et que manque-t-on en ignorant les moyennes de régime ?
::: hint
Loi de la variance totale. Calcule séparément $\mathbb{E}[\operatorname{Var}(X\mid Y)]$ et $\operatorname{Var}(\mathbb{E}[X\mid Y])$.
:::
::: answer
Terme intra-régime : $0{,}8(0{,}01)^2 + 0{,}2(0{,}03)^2 = 0{,}00008 + 0{,}00018 = 0{,}00026$.

Terme inter-régimes : $\mathbb{E}[X] = 0{,}8(0) + 0{,}2(-0{,}01) = -0{,}002$, donc $\operatorname{Var}(\mathbb{E}[X\mid Y]) = 0{,}8(0 + 0{,}002)^2 + 0{,}2(-0{,}01 + 0{,}002)^2 = 0{,}0000032 + 0{,}0000128 = 0{,}000016$.

Total $= 0{,}000276$, soit $\sigma = 1{,}66\,\%$ par jour, contre $1{,}61\,\%$ si l'on ne gardait que la partie intra-régime. Ignorer la différence des moyennes sous-estime ici le risque d'environ 3 % — modeste, mais l'écart croît quadratiquement avec la distance entre les moyennes de régime, et c'est exactement le terme qu'un calcul naïf « moyenne des deux volatilités » laisse tomber. La même décomposition explique pourquoi un mélange de deux lois normales a des queues épaisses et un excès de kurtosis alors que chaque composante est gaussienne : la loi inconditionnelle n'est pas la loi moyenne.
:::
:::
