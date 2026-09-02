---
title: Régression linéaire
subject: statistics
summary: Ajuster y = Xβ + ε par les moindres carrés, c'est-à-dire projeter y sur l'espace engendré par les régresseurs. Les bêtas, les modèles factoriels, les ratios de couverture et la plupart des prétentions à l'« alpha » sont des régressions ; savoir exactement quand ses erreurs-types mentent est une compétence quant de base.
difficulty: 2
interview: 4
tags: [statistics, regression, ols, beta, factor-models, hypothesis-testing]
prerequisites: []
related: [kalman-filter, value-at-risk]
---

## Intuition

Empile les observations $y_i$ dans un vecteur $\mathbf{y} \in \mathbb{R}^n$ et les régresseurs dans les colonnes de $\mathbf{X}$. Tout vecteur ajusté $\mathbf{X}\boldsymbol\beta$ vit dans l'espace des colonnes de $\mathbf{X}$, un plan de dimension $k$ à l'intérieur de $\mathbb{R}^n$, et les moindres carrés choisissent le point de ce plan **le plus proche** de $\mathbf{y}$ : la projection orthogonale. Le résidu est perpendiculaire à chaque régresseur. Équations normales, forme fermée, $R^2$ — tout le reste est un corollaire de cet angle droit.

## Formules clés

| Nom | Formule |
|---|---|
| Estimateur MCO | $\hat{\boldsymbol\beta} = (\mathbf{X}^\top\mathbf{X})^{-1}\mathbf{X}^\top\mathbf{y}$ |
| Pente simple | $\hat\beta = \operatorname{Cov}(x,y)/\operatorname{Var}(x)$, $\hat\alpha = \bar y - \hat\beta\bar x$ |
| Matrice de projection | $\mathbf{P} = \mathbf{X}(\mathbf{X}^\top\mathbf{X})^{-1}\mathbf{X}^\top$ |
| Covariance de $\hat{\boldsymbol\beta}$ | $\sigma^2(\mathbf{X}^\top\mathbf{X})^{-1}$, avec $\hat\sigma^2 = \mathrm{RSS}/(n-k)$ |
| Erreur-type de la pente simple | $\hat\sigma \big/ \sqrt{\sum_i (x_i - \bar x)^2}$ |
| $R^2$ | $1 - \mathrm{RSS}/\mathrm{TSS}$ ; $\bar R^2 = 1 - (1-R^2)\frac{n-1}{n-k}$ |
| Covariance sandwich | $(\mathbf{X}^\top\mathbf{X})^{-1}\mathbf{X}^\top\boldsymbol\Omega\mathbf{X}(\mathbf{X}^\top\mathbf{X})^{-1}$ |

## Erreurs fréquentes

::: pitfall Régresser des prix au lieu de rendements
Deux marches aléatoires sans lien donnent un $R^2$ élevé et une statistique $t$ énorme : le résidu hérite d'une racine unitaire et les erreurs-types ne veulent rien dire. Utilise des rendements, ou teste d'abord la cointégration.
:::

::: pitfall Courir après le $R^2$
Ajouter un régresseur ne fait jamais baisser le $R^2$, donc la statistique récompense le surajustement. Une régression sur rendements quotidiens avec $R^2 = 0{,}02$ peut être un signal rentable ; une régression sur prix avec $R^2 = 0{,}98$ peut être du pur bruit.
:::

::: pitfall Erreurs-types classiques sur des données financières
Le clustering de volatilité (hétéroscédasticité) et les observations chevauchantes (autocorrélation) rendent $\sigma^2(\mathbf{X}^\top\mathbf{X})^{-1}$ faux, typiquement trop petit, donc les statistiques $t$ sont gonflées. Reporte par défaut White ou Newey–West.
:::

::: pitfall Confondre significativité et taille
Une statistique $t$ de 5 sur un coefficient de 0,001 dit que l'effet est estimé précisément, pas qu'il survit aux coûts. Inversement, un alpha avec $t = 1{,}8$ peut être économiquement énorme et rester non mesurable.
:::

## Révision en 30 secondes

Les MCO projettent $\mathbf{y}$ sur l'espace engendré par $\mathbf{X}$ : $\hat{\boldsymbol\beta} = (\mathbf{X}^\top\mathbf{X})^{-1}\mathbf{X}^\top\mathbf{y}$, résidus orthogonaux aux régresseurs, pente à un régresseur $\operatorname{Cov}(x,y)/\operatorname{Var}(x)$. Gauss–Markov (exogénéité plus erreurs sphériques) en fait le BLUE ; $\operatorname{Var}(\hat{\boldsymbol\beta}) = \sigma^2(\mathbf{X}^\top\mathbf{X})^{-1}$ et $t = \hat\beta/\operatorname{se}$. $R^2 = 1 - \mathrm{RSS}/\mathrm{TSS}$ augmente avec tout régresseur ajouté et ne veut rien dire sur des prix. Utilise des erreurs-types robustes (White / Newey–West), régresse des rendements et non des prix, et relève le seuil de $t$ quand beaucoup de facteurs ont été essayés.

## Formulation mathématique

Modèle : $\mathbf{y} = \mathbf{X}\boldsymbol\beta + \boldsymbol\varepsilon$, avec $\mathbf{X}$ une matrice $n \times k$ de rang plein dont la première colonne ne contient que des 1 (la constante).

::: formula Équations normales et estimateur MCO
$$
\mathbf{X}^\top\mathbf{X}\,\hat{\boldsymbol\beta} = \mathbf{X}^\top\mathbf{y}
\qquad\Longrightarrow\qquad
\hat{\boldsymbol\beta} = (\mathbf{X}^\top\mathbf{X})^{-1}\mathbf{X}^\top\mathbf{y}.
$$
Avec un seul régresseur, $\hat\beta = \dfrac{\operatorname{Cov}(x, y)}{\operatorname{Var}(x)}$ et $\hat\alpha = \bar y - \hat\beta\,\bar x$.
:::

::: formula Projection
$$
\hat{\mathbf{y}} = \mathbf{P}\mathbf{y}, \qquad \mathbf{P} = \mathbf{X}(\mathbf{X}^\top\mathbf{X})^{-1}\mathbf{X}^\top, \qquad \mathbf{P}^2 = \mathbf{P} = \mathbf{P}^\top, \qquad \mathbf{X}^\top(\mathbf{y} - \hat{\mathbf{y}}) = \mathbf{0}.
$$
:::

::: formula Covariance, erreurs-types, statistique t
$$
\operatorname{Var}(\hat{\boldsymbol\beta} \mid \mathbf{X}) = \sigma^2 (\mathbf{X}^\top\mathbf{X})^{-1}, \qquad
\hat\sigma^2 = \frac{\hat{\boldsymbol\varepsilon}^\top\hat{\boldsymbol\varepsilon}}{n - k}, \qquad
t_j = \frac{\hat\beta_j - \beta_j^{0}}{\operatorname{se}(\hat\beta_j)} \sim t_{n-k} \text{ sous } H_0 : \beta_j = \beta_j^{0}.
$$
Un seul régresseur : $\operatorname{se}(\hat\beta) = \hat\sigma \big/ \sqrt{\sum_i (x_i - \bar x)^2}$.
:::

::: formula Coefficient de détermination
$$
R^2 = 1 - \frac{\mathrm{RSS}}{\mathrm{TSS}} = 1 - \frac{\sum_i \hat\varepsilon_i^2}{\sum_i (y_i - \bar y)^2}, \qquad
\bar R^2 = 1 - (1 - R^2)\,\frac{n-1}{n-k}.
$$
Avec un régresseur, $R^2 = \operatorname{corr}(x, y)^2$.
:::

**Gauss–Markov.** (i) Linéarité dans les paramètres ; (ii) rang plein ; (iii) exogénéité stricte, $\mathbb{E}[\boldsymbol\varepsilon \mid \mathbf{X}] = \mathbf{0}$ ; (iv) erreurs sphériques, $\operatorname{Var}(\boldsymbol\varepsilon \mid \mathbf{X}) = \sigma^2\mathbf{I}$. Alors les MCO sont **BLUE**. La normalité n'est pas nécessaire pour cela, seulement pour des distributions $t$ et $F$ exactes à distance finie.

**Erreurs-types robustes.** Quand (iv) échoue, $\hat{\boldsymbol\beta}$ reste sans biais mais sa covariance devient le *sandwich* avec $\boldsymbol\Omega = \operatorname{Var}(\boldsymbol\varepsilon)$ : White place $\hat\varepsilon_i^2$ sur la diagonale (hétéroscédasticité), Newey–West ajoute les autocovariances des résidus jusqu'au retard $L$ avec les poids de Bartlett $1 - \ell/(L+1)$ (« HAC »). Les estimations ponctuelles sont intactes ; seules les statistiques $t$ sont réparées.

## Dérivation

On minimise $S(\boldsymbol\beta) = (\mathbf{y} - \mathbf{X}\boldsymbol\beta)^\top(\mathbf{y} - \mathbf{X}\boldsymbol\beta)$. Le gradient $\nabla S = -2\mathbf{X}^\top\mathbf{y} + 2\mathbf{X}^\top\mathbf{X}\boldsymbol\beta$ s'annule aux équations normales, et la hessienne $2\mathbf{X}^\top\mathbf{X}$ est définie positive sous rang plein, donc c'est l'unique minimum.

Elles disent $\mathbf{X}^\top(\mathbf{y} - \mathbf{X}\hat{\boldsymbol\beta}) = \mathbf{0}$ : le résidu est orthogonal à chaque colonne. Avec une constante, une colonne vaut $\mathbf{1}$, donc les résidus somment à zéro, et l'orthogonalité donne $\mathrm{TSS} = \mathrm{ESS} + \mathrm{RSS}$, d'où $R^2 \in [0, 1]$ ; sans constante cela échoue et $R^2$ peut être négatif.

En substituant $\mathbf{y} = \mathbf{X}\boldsymbol\beta + \boldsymbol\varepsilon$,
$$
\hat{\boldsymbol\beta} = \boldsymbol\beta + (\mathbf{X}^\top\mathbf{X})^{-1}\mathbf{X}^\top\boldsymbol\varepsilon,
$$
donc $\mathbb{E}[\hat{\boldsymbol\beta} \mid \mathbf{X}] = \boldsymbol\beta$ par exogénéité, et
$$
\operatorname{Var}(\hat{\boldsymbol\beta} \mid \mathbf{X}) = (\mathbf{X}^\top\mathbf{X})^{-1}\mathbf{X}^\top\,\operatorname{Var}(\boldsymbol\varepsilon)\,\mathbf{X}(\mathbf{X}^\top\mathbf{X})^{-1},
$$
qui se réduit à $\sigma^2(\mathbf{X}^\top\mathbf{X})^{-1}$ sous $\sigma^2\mathbf{I}$ et reste le sandwich sinon. Le diviseur $n - k$ rend $\hat\sigma^2$ sans biais puisque $\hat{\boldsymbol\varepsilon} = (\mathbf{I} - \mathbf{P})\boldsymbol\varepsilon$ et $\operatorname{tr}(\mathbf{I} - \mathbf{P}) = n - k$.

Avec $\mathbf{X} = [\mathbf{1}, \mathbf{x}]$, le système $2\times 2$ donne $\hat\beta = \sum_i(x_i - \bar x)(y_i - \bar y) \big/ \sum_i(x_i - \bar x)^2$ et l'élément $(2,2)$ vaut $\sigma^2/\sum_i(x_i - \bar x)^2$ : l'erreur-type décroît comme $1/\sqrt{n}$ et avec la dispersion du régresseur, donc un bêta se mesure plus précisément sur un marché volatil.

## Hypothèses et cas limites

- **L'exogénéité est l'hypothèse qui fait mal.** Variables omises, simultanéité et erreur de mesure sur $x$ biaisent toutes $\hat{\boldsymbol\beta}$, et aucune quantité de données ni aucune erreur-type robuste ne corrige un biais. L'erreur sur les variables rétrécit $\hat\beta$ vers zéro : un bêta contre un proxy bruité ressort trop petit.
- **Régresseurs non stationnaires.** Une marche aléatoire sur une marche aléatoire indépendante donne un $t$ « significatif » la plupart du temps et un $R^2$ qui ne tend pas vers zéro quand $n \to \infty$ (Granger et Newbold, 1974). Régresse des rendements, ou teste la cointégration.
- **Hétéroscédasticité et autocorrélation** ne biaisent pas $\hat{\boldsymbol\beta}$ mais rendent fausses les erreurs-types classiques, en général trop petites. Les rendements chevauchants sont autocorrélés *par construction* : Newey–West avec au moins autant de retards que le chevauchement.
- **La multicolinéarité** gonfle les erreurs-types sans biais : les coefficients changent de signe alors que l'ajustement reste bon. La ridge échange un peu de biais contre beaucoup de variance.
- **Les valeurs extrêmes** ont un levier $h_{ii} = 1/n + (x_i - \bar x)^2 / \sum_j (x_j - \bar x)^2$ : un seul jour de krach peut fixer le bêta à lui seul.
- **Le sens n'est pas symétrique.** $y$ sur $x$ donne la pente $\rho\,\sigma_y/\sigma_x$ ; $x$ sur $y$ donne $\rho\,\sigma_x/\sigma_y$, dont l'inverse est une droite différente sauf si $\lvert\rho\rvert = 1$. Décide quelle jambe est couverte, ou utilise les moindres carrés totaux.

## Exemple détaillé

Le bêta de marché d'une action sur un an de rendements quotidiens, avec rien d'autre que les équations normales, vérifié avec `np.polyfit`. Vrai $\beta = 1{,}3$, vrai alpha quotidien $0{,}0002$.

```python
import numpy as np
from scipy import stats

rng = np.random.default_rng(3)
n = 250                                             # one year of daily returns
r_m = rng.normal(0.0004, 0.010, n)                  # market excess returns
r_s = 0.0002 + 1.3 * r_m + rng.normal(0, 0.015, n)  # stock: true alpha 0.0002, beta 1.3

# OLS via the normal equations (X'X) b = X'y
X = np.column_stack([np.ones(n), r_m])
b = np.linalg.solve(X.T @ X, X.T @ r_s)
resid = r_s - X @ b
dof = n - X.shape[1]
s2 = resid @ resid / dof                            # unbiased residual variance
se = np.sqrt(np.diag(s2 * np.linalg.inv(X.T @ X)))
t = b / se
p = 2 * stats.t.sf(np.abs(t), dof)
r2 = 1 - resid @ resid / np.sum((r_s - r_s.mean()) ** 2)

print(f"alpha = {b[0]:+.5f}   se = {se[0]:.5f}   t = {t[0]:5.2f}   p = {p[0]:.3f}")
print(f"beta  = {b[1]:+.4f}    se = {se[1]:.4f}    t = {t[1]:5.2f}   p = {p[1]:.1e}")
print(f"R^2   = {r2:.3f}")
print(f"cov/var check: beta = {np.cov(r_s, r_m)[0, 1] / np.var(r_m, ddof=1):.4f}")
slope, intercept = np.polyfit(r_m, r_s, 1)
print(f"np.polyfit:    beta = {slope:.4f}, alpha = {intercept:+.5f}")
```

::: output
```
alpha = +0.00172   se = 0.00094   t =  1.83   p = 0.069
beta  = +1.3292    se = 0.0923    t = 14.40   p = 1.5e-34
R^2   = 0.455
cov/var check: beta = 1.3292
np.polyfit:    beta = 1.3292, alpha = +0.00172
```
:::

Le bêta ressort à $1{,}33 \pm 0{,}09$, ce qui couvre confortablement le vrai $1{,}3$. L'alpha de 17 points de base par jour a l'air impressionnant (plus de 40 % annualisés), pourtant $t = 1{,}83$ : non significatif à 5 %, avec la vraie valeur $0{,}0002$ bien à l'intérieur de deux erreurs-types. C'est « l'alpha est difficile à mesurer » en chiffres — un an de données quotidiennes ne distingue pas un alpha annuel de 5 % de zéro. Le $R^2$ de 0,455 est typique d'une action seule contre le marché ; le reste est idiosyncratique, et un $R^2$ modeste n'est pas le signe d'une mauvaise régression.

## Pourquoi c'est important en finance quantitative

- **Bêta et CAPM.** $r_i - r_f = \alpha_i + \beta_i (r_m - r_f) + \varepsilon_i$ : $\beta$ tarifie le risque systématique, $\alpha$ est la compétence revendiquée, et $\alpha = 0$ est un test $t$ avec toutes les réserves ci-dessus.
- **Modèles factoriels.** Fama–French et tous les modèles de risque commerciaux sont des régressions des rendements sur des rendements de facteurs ; la variance résiduelle est le « risque spécifique » qui alimente un modèle de [[value-at-risk|VaR]].
- **Ratios de couverture.** Une couverture de variance minimale *est* un coefficient de régression. Pour un pairs trade, Engle–Granger régresse les *log-prix* puis teste la stationnarité du résidu (ADF) ; sans cette étape, la régression sur les prix est fallacieuse.
- **Bêtas variables dans le temps.** Quand le coefficient dérive, fais de $\beta_t$ un état et filtre-le : le [[kalman-filter|filtre de Kalman]] est une régression par moindres carrés récursifs avec oubli.
- **Tests multiples.** Passe au crible 300 facteurs à 5 % et 15 auront l'air « significatifs » par chance. Harvey, Liu et Zhu (2016) plaident pour un seuil de $t$ de 3 plutôt que 2 ; un $R^2$ dans l'échantillon est la façon standard dont un backtest ment.
- **Recherche de signaux.** Une régression prédictive de $r_{t+1}$ sur $s_t$ a un $R^2$ de 1 % les bons jours. La question est de savoir si la pente est stable hors échantillon.

## Questions d'entretien

::: question Montre qu'avec un régresseur et une constante, la pente MCO vaut $\operatorname{Cov}(x,y)/\operatorname{Var}(x)$ et que les résidus somment à zéro.
::: hint
Écris les deux équations normales, une par colonne de $\mathbf{X} = [\mathbf{1}, \mathbf{x}]$.
:::
::: answer
La première est $\mathbf{1}^\top(\mathbf{y} - \hat\alpha\mathbf{1} - \hat\beta\mathbf{x}) = 0$, c'est-à-dire $\sum_i \hat\varepsilon_i = 0$ et $\hat\alpha = \bar y - \hat\beta\bar x$. En substituant dans la seconde, $\mathbf{x}^\top(\mathbf{y} - \hat\alpha\mathbf{1} - \hat\beta\mathbf{x}) = 0$, on obtient $\sum_i x_i(y_i - \bar y) = \hat\beta\sum_i x_i(x_i - \bar x)$, et comme $\sum_i \bar x (y_i - \bar y) = 0 = \sum_i \bar x(x_i - \bar x)$, cela donne $\hat\beta = \sum_i (x_i - \bar x)(y_i - \bar y)/\sum_i (x_i - \bar x)^2$.
:::
:::

::: question Une régression de bêta sur 250 rendements quotidiens donne $\hat\beta = 1{,}2$ avec une erreur-type de 0,15. Est-il significativement différent de 1 ? Combien d'observations ramèneraient l'erreur-type à 0,05 ?
::: hint
La statistique de test est $(\hat\beta - 1)/\operatorname{se}$ ; l'erreur-type décroît comme $1/\sqrt{n}$.
:::
::: answer
$t = (1{,}2 - 1)/0{,}15 = 1{,}33$, sous la valeur critique $1{,}97$ ($t_{248}$ à 5 %) : pas significativement différent de 1, avec un intervalle à 95 % $1{,}2 \pm 1{,}97 \times 0{,}15 = [0{,}90, 1{,}50]$. Diviser l'erreur-type par 3 exige 9 fois plus de données, soit environ 2 250 jours ou 9 ans — et d'ici là le bêta a changé. D'où le rétrécissement vers 1 (Vasicek/Bloomberg) ou le filtrage.
:::
:::

::: question Tu régresses le prix de l'action A sur celui de l'action B et tu obtiens $R^2 = 0{,}95$ avec $t = 40$. Un collègue en conclut que la paire est une excellente couverture. Que lui réponds-tu ?
::: hint
Quel est le comportement temporel des prix, et à quoi ressemble le résidu si les deux n'ont aucun lien ?
:::
::: answer
Très probablement une régression fallacieuse : les prix sont proches de marches aléatoires, et deux marches indépendantes donnent couramment un $R^2$ proche de 1 avec des $t$ énormes, parce que le résidu est lui-même une marche aléatoire alors que les erreurs-types le supposent stationnaire. Vérifie (a) en régressant des rendements sur des rendements — le $t$ s'effondre si la paire n'a aucun lien — et (b) s'il te faut un ratio en niveau de prix, en testant la stationnarité du résidu (ADF), c'est-à-dire la cointégration. Même alors le sens compte et le ratio dérive, ce qui plaide pour un ratio [[kalman-filter|filtré par Kalman]].
:::
:::

::: question Tu passes au crible 200 signaux et tu en trouves 12 avec $\lvert t \rvert > 2$ dans l'échantillon. Combien en attends-tu par hasard ? Quel seuil utiliserais-tu, et pourquoi le $R^2$ dans l'échantillon est-il optimiste même pour un vrai signal ?
::: hint
Test bilatéral à 5 % sous l'hypothèse nulle ; Bonferroni ; et réfléchis à ce que mesure $R^2$ quand les coefficients ont été choisis sur les mêmes données.
:::
::: answer
Sous l'hypothèse nulle, chaque signal passe avec probabilité 5 %, donc 10 sur 200 sont attendus : 12 n'a rien de remarquable. Bonferroni teste chacun à $0{,}05/200 = 0{,}00025$, soit $\lvert t\rvert > 3{,}7$ ; Harvey, Liu et Zhu recommandent $t > 3$ pour un nouveau facteur ; une procédure de contrôle du taux de fausses découvertes est le compromis moderne. Même pour un signal authentique, le $R^2$ dans l'échantillon est biaisé vers le haut : avec $k$ colonnes dans $\mathbf{X}$ (constante incluse) et aucune relation réelle, $\mathbb{E}[R^2] = (k-1)/(n-1)$, et tout $R^2$ ajusté contient cet « ajustement au bruit ». Le $R^2$ hors échantillon peut être négatif ; c'est ce chiffre-là qu'il faut reporter.
:::
:::
