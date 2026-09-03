---
title: Filtre de Kalman
subject: filtering
summary: L'estimateur récursif optimal d'un état caché linéaire-gaussien à partir d'observations bruitées. Chaque pas mélange une prédiction du modèle et une nouvelle mesure, pondérées par un gain qui dit à laquelle se fier ; c'est une mise à jour bayésienne avec des gaussiennes, et des moindres carrés qui oublient.
difficulty: 4
interview: 3
tags: [filtering, kalman, state-space, bayesian, time-series, hedge-ratio]
prerequisites: [bayes-theorem, linear-regression]
related: [martingales]
---

## Intuition

Tu veux une quantité que tu ne peux pas observer — un prix juste, un ratio de couverture, un bêta — mais tu en reçois une lecture bruitée à chaque tick. Deux sources s'affrontent : ce que ton **modèle** dit qu'elle devrait valoir maintenant, sachant l'instant précédent, et ce que dit la **nouvelle observation**. Le filtre en prend une moyenne pondérée, et le poids — le gain de Kalman — est fixé par la source la moins incertaine. Modèle précis et mesures bruitées : gain petit, tu bouges à peine. Modèle vague et mesures propres : gain proche de 1, tu sautes sur la donnée.

::: viz kalman-filter Croire le modèle ou croire les données
Q et R sont ce que croit le filtre, pas ce qui a généré les données. Augmente R et l'estimation devient molle ; augmente Q et elle poursuit le bruit — le gain K résume tout l'arbitrage en un nombre.
:::

## Formules clés

| Nom | Formule |
|---|---|
| Prédiction | $\hat{\mathbf{x}}_{t \vert t-1} = \mathbf{F}\hat{\mathbf{x}}_{t-1 \vert t-1}$, $\mathbf{P}_{t \vert t-1} = \mathbf{F}\mathbf{P}_{t-1 \vert t-1}\mathbf{F}^\top + \mathbf{Q}$ |
| Gain | $\mathbf{K}_t = \mathbf{P}_{t \vert t-1}\mathbf{H}^\top(\mathbf{H}\mathbf{P}_{t \vert t-1}\mathbf{H}^\top + \mathbf{R})^{-1}$ |
| Mise à jour | $\hat{\mathbf{x}}_{t \vert t} = \hat{\mathbf{x}}_{t \vert t-1} + \mathbf{K}_t(\mathbf{y}_t - \mathbf{H}\hat{\mathbf{x}}_{t \vert t-1})$, $\mathbf{P}_{t \vert t} = (\mathbf{I} - \mathbf{K}_t\mathbf{H})\mathbf{P}_{t \vert t-1}$ |
| Mise à jour bayésienne scalaire | $m' = m + \frac{P}{P + r}(y - m)$, $1/P' = 1/P + 1/r$ |
| Régime permanent du niveau local | $(\bar P^{-})^2 - q\bar P^{-} - qr = 0$, $\bar K = \bar P^{-}/(\bar P^{-} + r)$ |
| Équivalence EWMA | $\hat x_t = (1 - \bar K)\hat x_{t-1} + \bar K y_t$ |

## Erreurs fréquentes

::: pitfall Régler $q$ et $r$ à la main jusqu'à ce que le graphique soit joli
Le graphique est toujours plus joli avec un $q$ plus petit (une courbe plus lisse), et le filtre traîne alors derrière chaque mouvement réel. Le rapport $q/r$ est un paramètre à estimer par la vraisemblance des innovations ou l'erreur hors échantillon.
:::

::: pitfall Utiliser le lisseur dans un backtest
$\hat{\mathbf{x}}_{t|T}$ utilise des observations futures. Un « ratio de couverture dynamique » lissé sur tout l'échantillon souffre de biais d'anticipation et aura l'air bien meilleur que tout ce qui est tradable.
:::

::: pitfall S'attendre à ce que le gain réagisse aux données
Avec des matrices de système constantes, $\mathbf{P}_t$ et $\mathbf{K}_t$ sont déterministes étant donné $\mathbf{Q}$, $\mathbf{R}$, $\mathbf{H}$ : ils convergent vers le même régime permanent quelles que soient les observations. Le filtre ne peut pas remarquer un changement du niveau de bruit si tu ne le modélises pas.
:::

::: pitfall Prendre l'estimation filtrée pour la vérité
$\hat{\mathbf{x}}_{t|t}$ vient avec $\mathbf{P}_{t|t}$. Un ratio de couverture de $0{,}8 \pm 0{,}3$ est une proposition de trading très différente de $0{,}8 \pm 0{,}02$.
:::

## Révision en 30 secondes

Espace-état : $\mathbf{x}_t = \mathbf{F}\mathbf{x}_{t-1} + \mathbf{w}_t$, $\mathbf{y}_t = \mathbf{H}\mathbf{x}_t + \mathbf{v}_t$. Prédiction : pousser moyenne et covariance à travers $\mathbf{F}$, ajouter $\mathbf{Q}$. Mise à jour : gain $\mathbf{K} = \mathbf{P}^{-}\mathbf{H}^\top(\mathbf{H}\mathbf{P}^{-}\mathbf{H}^\top + \mathbf{R})^{-1}$, nouvelle moyenne = prédiction + $\mathbf{K}$ × innovation, nouvelle covariance $(\mathbf{I} - \mathbf{K}\mathbf{H})\mathbf{P}^{-}$. C'est Bayes avec des gaussiennes (les précisions s'additionnent, les moyennes sont pondérées par les précisions) ; avec $\mathbf{Q} = \mathbf{0}$ ce sont des moindres carrés récursifs, avec $\mathbf{Q} > \mathbf{0}$ le filtre oublie. Niveau local scalaire : gain en régime permanent fixé par $q/r$, et le filtre est une moyenne mobile exponentielle de facteur $1 - \bar K$.

## Formulation mathématique

Un état caché $\mathbf{x}_t \in \mathbb{R}^m$ et des observations $\mathbf{y}_t \in \mathbb{R}^p$ :

::: formula Modèle espace-état linéaire-gaussien
$$
\begin{aligned}
\mathbf{x}_t &= \mathbf{F}\,\mathbf{x}_{t-1} + \mathbf{w}_t, & \mathbf{w}_t &\sim \mathcal{N}(\mathbf{0}, \mathbf{Q}) \quad \text{(transition)}\\
\mathbf{y}_t &= \mathbf{H}\,\mathbf{x}_t + \mathbf{v}_t, & \mathbf{v}_t &\sim \mathcal{N}(\mathbf{0}, \mathbf{R}) \quad \text{(observation)}
\end{aligned}
$$
avec $\mathbf{w}_t$ et $\mathbf{v}_t$ des bruits blancs indépendants et $\mathbf{x}_0 \sim \mathcal{N}(\hat{\mathbf{x}}_0, \mathbf{P}_0)$.
:::

On note $\hat{\mathbf{x}}_{t|s} = \mathbb{E}[\mathbf{x}_t \mid \mathbf{y}_{1:s}]$ et $\mathbf{P}_{t|s}$ la covariance de l'erreur $\mathbf{x}_t - \hat{\mathbf{x}}_{t|s}$.

::: formula Prédiction
$$
\hat{\mathbf{x}}_{t|t-1} = \mathbf{F}\,\hat{\mathbf{x}}_{t-1|t-1}, \qquad
\mathbf{P}_{t|t-1} = \mathbf{F}\,\mathbf{P}_{t-1|t-1}\,\mathbf{F}^\top + \mathbf{Q}.
$$
:::

::: formula Mise à jour avec le gain de Kalman
$$
\begin{aligned}
\boldsymbol\nu_t &= \mathbf{y}_t - \mathbf{H}\,\hat{\mathbf{x}}_{t|t-1} & &\text{innovation}\\
\mathbf{S}_t &= \mathbf{H}\,\mathbf{P}_{t|t-1}\,\mathbf{H}^\top + \mathbf{R} & &\text{covariance de l'innovation}\\
\mathbf{K}_t &= \mathbf{P}_{t|t-1}\,\mathbf{H}^\top\,\mathbf{S}_t^{-1} & &\text{gain de Kalman}\\
\hat{\mathbf{x}}_{t|t} &= \hat{\mathbf{x}}_{t|t-1} + \mathbf{K}_t\,\boldsymbol\nu_t\\
\mathbf{P}_{t|t} &= (\mathbf{I} - \mathbf{K}_t\mathbf{H})\,\mathbf{P}_{t|t-1}
\end{aligned}
$$
:::

**Modèle scalaire de niveau local**, le cheval de bataille : $x_t = x_{t-1} + w_t$ et $y_t = x_t + v_t$, avec $\operatorname{Var}(w_t) = q$ et $\operatorname{Var}(v_t) = r$. Alors

::: formula Niveau local : gain et régime permanent
$$
K_t = \frac{P_{t|t-1}}{P_{t|t-1} + r}, \qquad
\hat x_{t|t} = (1 - K_t)\,\hat x_{t|t-1} + K_t\,y_t,
$$
et en régime permanent, avec le rapport signal sur bruit $\lambda = q/r$,
$$
\bar P^{-} = \frac{q + \sqrt{q^2 + 4qr}}{2}, \qquad
\bar K = \frac{\bar P^{-}}{\bar P^{-} + r} = \frac{\lambda + \sqrt{\lambda^2 + 4\lambda}}{2 + \lambda + \sqrt{\lambda^2 + 4\lambda}}.
$$
:::

La valeur filtrée suit alors $\hat x_t = (1-\bar K)\,\hat x_{t-1} + \bar K\,y_t$ : une **moyenne mobile exponentielle** de facteur $1 - \bar K$ et de demi-vie $\ln 0{,}5 / \ln(1 - \bar K)$. Le lissage exponentiel est un filtre de Kalman qui a oublié sa condition initiale.

**Le gain comme poids de confiance.** $\mathbf{K}_t = \operatorname{Cov}(\mathbf{x}_t, \boldsymbol\nu_t)\operatorname{Var}(\boldsymbol\nu_t)^{-1}$ est le coefficient de régression de l'état sur l'innovation — le même $\operatorname{Cov}/\operatorname{Var}$ qu'une pente MCO en [[linear-regression|régression linéaire]]. Cas scalaire : $r \to 0$ donne $K \to 1$, $P_{t|t-1} \to 0$ donne $K \to 0$.

## Dérivation

En dimension un ; le cas matriciel est la même algèbre avec des transposées. Avant de voir $y_t$, l'a priori est $x_t \sim \mathcal{N}(m, P)$ avec $m = \hat x_{t|t-1}$, $P = P_{t|t-1}$, et la vraisemblance est $y_t \mid x_t \sim \mathcal{N}(x_t, r)$. [[bayes-theorem|Bayes]] donne
$$
p(x_t \mid y_t) \propto \exp\!\Big(-\frac{(x_t - m)^2}{2P}\Big)\exp\!\Big(-\frac{(y_t - x_t)^2}{2r}\Big).
$$
L'exposant est quadratique, donc l'a posteriori est gaussien ; le coefficient de $x_t^2$ vaut $-\tfrac12(1/P + 1/r)$, donc **les précisions s'additionnent**, et le coefficient de $x_t$ donne la moyenne pondérée par les précisions,
$$
m' = \frac{m/P + y_t/r}{1/P + 1/r} = m + \frac{P}{P + r}\,(y_t - m) = m + K\,(y_t - m),
\qquad
P' = \Big(\frac1P + \frac1r\Big)^{-1} = \frac{Pr}{P + r} = (1 - K)\,P.
$$
L'étape de prédiction est l'application linéaire : $x_{t-1} \sim \mathcal{N}(m', P')$ et $x_t = x_{t-1} + w_t$ donnent $x_t \sim \mathcal{N}(m', P' + q)$. L'estimation est la moyenne a posteriori exacte, d'où l'erreur quadratique moyenne minimale ; sans gaussianité elle reste le meilleur estimateur *linéaire*, comme dans Gauss–Markov.

**Moindres carrés récursifs.** Avec $q = 0$ et un a priori diffus $P_0 \to \infty$ : $P_{t|t} = r/t$, $K_t = 1/t$ et
$$
\hat x_t = \hat x_{t-1} + \frac1t\,(y_t - \hat x_{t-1}),
$$
la moyenne empirique courante. Tout filtre avec $\mathbf{Q} = \mathbf{0}$ est une régression par moindres carrés récursifs ; $\mathbf{Q} > \mathbf{0}$ ajoute de l'oubli, puisque la variance a priori est gonflée entre les observations.

**Régime permanent.** La variance de prédiction à un pas obéit à la récursion de Riccati $P^-_{t+1} = \dfrac{P^-_t\, r}{P^-_t + r} + q$, dont le point fixe $(P^-)^2 - qP^- - qr = 0$ a pour racine positive le $\bar P^{-}$ ci-dessus ; l'application étant croissante et concave, la récursion converge depuis n'importe quelle valeur initiale. Pour la variance filtrée, l'équation équivalente est $\bar P^{2} + q\bar P - qr = 0$, celle que résout le code ci-dessous.

**Innovations.** Sous le vrai modèle, les $\boldsymbol\nu_t$ sont gaussiennes, non corrélées dans le temps, de covariance $\mathbf{S}_t$. D'où $\mathbf{Q}$ et $\mathbf{R}$ par maximum de vraisemblance, la log-vraisemblance valant $-\tfrac12\sum_t \big[\ln\det \mathbf{S}_t + \boldsymbol\nu_t^\top\mathbf{S}_t^{-1}\boldsymbol\nu_t\big]$ à une constante près (*décomposition en erreurs de prédiction*) ; et d'où le diagnostic : des innovations autocorrélées signifient que le modèle est faux.

## Hypothèses et cas limites

- **Linéarité et gaussianité.** Une dynamique ou une observation non linéaire exige le filtre étendu (linéariser) ou unscented (points sigma) ; un bruit à queues lourdes (sauts, mauvais ticks) exige un filtre particulaire ou des innovations robustifiées, puisqu'une seule valeur aberrante déplace beaucoup un filtre gaussien.
- **Seul le rapport $\mathbf{Q}/\mathbf{R}$ compte pour l'estimation.** Multiplier $\mathbf{Q}$, $\mathbf{R}$ et $\mathbf{P}_0$ par la même constante laisse $\mathbf{K}_t$ inchangé et ne fait que remettre $\mathbf{P}$ à l'échelle ; ne multiplier que $\mathbf{Q}$ et $\mathbf{R}$ laisse le gain en régime permanent inchangé, mais pas le transitoire initial. Fixer ce rapport est tout l'art : trop de $q$ et le filtre court après le bruit, trop peu et il traîne derrière un état qui bouge.
- **Filtrage contre lissage.** $\hat{\mathbf{x}}_{t|t}$ n'utilise que les données jusqu'à $t$, donc temps réel et sans anticipation ; le lisseur de Rauch–Tung–Striebel $\hat{\mathbf{x}}_{t|T}$ utilise tout l'échantillon — bon pour l'historique, inutilisable pour trader.
- **Initialisation.** Le filtre oublie $\hat{\mathbf{x}}_0$ au rythme $1 - \bar K$ par pas, donc la condition initiale compte rarement après quelques demi-vies.
- **Numérique.** $(\mathbf{I} - \mathbf{K}\mathbf{H})\mathbf{P}$ peut perdre symétrie ou caractère défini positif ; la forme de Joseph $(\mathbf{I}-\mathbf{K}\mathbf{H})\mathbf{P}(\mathbf{I}-\mathbf{K}\mathbf{H})^\top + \mathbf{K}\mathbf{R}\mathbf{K}^\top$ ou un filtre en racine carrée est plus sûr.
- **Observabilité.** Si une direction de l'état n'affecte jamais $\mathbf{y}$, sa variance croît sans limite.

## Exemple détaillé

Un prix juste suit une marche aléatoire dont le pas quotidien a un écart-type de 0,05 ; les cotations portent un bruit de microstructure d'écart-type 0,5, dix fois plus grand.

```python
import numpy as np

rng = np.random.default_rng(11)
n, q, r = 500, 0.05**2, 0.5**2                       # steps, state noise var, obs noise var
x = 100 + np.cumsum(rng.normal(0, np.sqrt(q), n))    # latent fair price: random walk
y = x + rng.normal(0, np.sqrt(r), n)                 # noisy quotes

m, P = y[0], 1.0                                     # prior mean and variance
m_filt, K_hist = np.empty(n), np.empty(n)
for t in range(n):
    # predict: random walk, so the mean is unchanged and the variance grows by q
    m_pred, P_pred = m, P + q
    # update: blend prediction and observation with the Kalman gain
    K = P_pred / (P_pred + r)
    m = m_pred + K * (y[t] - m_pred)
    P = (1 - K) * P_pred
    m_filt[t], K_hist[t] = m, K

rmse_raw = np.sqrt(np.mean((y - x) ** 2))
rmse_kf = np.sqrt(np.mean((m_filt - x) ** 2))
# steady state: P solves P = (P + q) r / (P + q + r), i.e. P^2 + qP - qr = 0
P_ss = (-q + np.sqrt(q**2 + 4 * q * r)) / 2
K_ss = (P_ss + q) / (P_ss + q + r)
print(f"RMSE raw quotes vs fair price : {rmse_raw:.4f}")
print(f"RMSE Kalman filtered          : {rmse_kf:.4f}")
print(f"steady-state gain: analytic {K_ss:.4f}, filter at last step {K_hist[-1]:.4f}")
print(f"equivalent EWMA half-life: {np.log(0.5) / np.log(1 - K_ss):.1f} observations")
```

::: output
```
RMSE raw quotes vs fair price : 0.5157
RMSE Kalman filtered          : 0.1457
steady-state gain: analytic 0.0951, filter at last step 0.0951
equivalent EWMA half-life: 6.9 observations
```
:::

Le filtre divise l'erreur par 3,5. Avec $\lambda = q/r = 0{,}01$, le gain en régime permanent vaut $0{,}095$ : chaque cotation déplace l'estimation de 9,5 % de la surprise, une moyenne mobile exponentielle de demi-vie 7 observations, et le gain empirique a atteint la valeur analytique bien avant le pas 500. Pour sentir le compromis, change $q$ : à $q = r$ le gain vaut $0{,}62$ et le filtre suit les cotations presque une pour une ; à $q = 10^{-4}\,r$ il tombe à $0{,}01$ (demi-vie d'environ 70 cotations) et le filtre traîne derrière tout mouvement réel.

## Pourquoi c'est important en finance quantitative

- **Ratio de couverture dynamique.** Modélise $y_t = \beta_t x_t + \varepsilon_t$ avec $\beta_t = \beta_{t-1} + w_t$ : l'état est le ratio, $H_t = x_t$ varie dans le temps, et le ratio s'adapte aux changements structurels au lieu d'une pente fixe de [[linear-regression|régression linéaire]] sur une fenêtre périmée. L'innovation $\nu_t$ est le spread, et $\nu_t/\sqrt{S_t}$ un z-score naturel.
- **Prix juste latent.** Le rebond bid–ask, les cotations périmées et les transactions de petites quantités sont un bruit d'observation autour d'un prix efficient ; le modèle de niveau local en est l'estimation de microstructure la plus simple.
- **Bêta dynamique.** Traiter un bêta qui dérive comme un état en marche aléatoire donne une bande de confiance et une longueur de mémoire choisie par les données plutôt que par une fenêtre glissante arbitraire.
- **Tout facteur latent.** Modèles de structure par terme (niveau, pente, courbure), approximations de volatilité stochastique, nowcasting et combinaison de signaux tiennent tous en forme espace-état.
- **Lien avec les martingales.** $\{\boldsymbol\nu_t\}$ est une [[martingales|différence de martingale]] par rapport à l'historique des observations : un filtre correct ne laisse aucune structure prévisible dans ses surprises.

## Questions d'entretien

::: question Que représente le gain de Kalman, et que devient-il quand le bruit d'observation tend vers zéro, ou quand la variance de prédiction tend vers zéro ?
::: hint
Écris le gain scalaire $K = P/(P + r)$ et prends les limites.
:::
::: answer
Le gain est le poids donné à la nouvelle observation par rapport à la prédiction du modèle ; de façon équivalente, le coefficient de régression de l'état sur l'innovation, $\operatorname{Cov}(x, \nu)/\operatorname{Var}(\nu)$. Si $r \to 0$, l'observation est exacte et $K \to 1$ : l'estimation saute sur la donnée. Si $P \to 0$, la prédiction est exacte et $K \to 0$ : l'observation est ignorée. Entre les deux, la moyenne a posteriori est pondérée par les précisions.
:::
:::

::: question Montre qu'un modèle de niveau local avec $q = 0$ et un a priori diffus se réduit à la moyenne empirique courante.
::: hint
Avec $q = 0$, la variance prédite égale la variance filtrée précédente. Devine $P_{t|t} = r/t$ et vérifie par récurrence.
:::
::: answer
Avec $P_0 \to \infty$, une observation donne $K_1 = 1$, $\hat x_1 = y_1$, $P_{1|1} = r$. Si $P_{t-1|t-1} = r/(t-1)$ alors, puisque $q = 0$, $P_{t|t-1} = r/(t-1)$, $K_t = \frac{r/(t-1)}{r/(t-1) + r} = \frac1t$ et $P_{t|t} = (1 - 1/t)\,r/(t-1) = r/t$. La mise à jour $\hat x_t = \hat x_{t-1} + \frac1t(y_t - \hat x_{t-1})$ est la récursion de la moyenne empirique, de variance $r/t$. Donc $q = 0$ donne des moindres carrés récursifs ; $q > 0$ empêche le gain de tendre vers zéro — le facteur d'oubli.
:::
:::

::: question Dans le modèle de niveau local, pose $q = r$. Quel est le gain en régime permanent, et à quel lisseur exponentiel le filtre correspond-il ?
::: hint
Résous $(P^-)^2 - qP^- - qr = 0$ avec $q = r$, puis $\bar K = \bar P^-/(\bar P^- + r)$.
:::
::: answer
$\bar P^{-} = r\,(1 + \sqrt5)/2$, donc $\bar K = \frac{(1+\sqrt5)/2}{(1+\sqrt5)/2 + 1} = \frac{1 + \sqrt5}{3 + \sqrt5} = \frac{\sqrt5 - 1}{2} \approx 0{,}618$, le conjugué du nombre d'or. Le filtre est une moyenne mobile exponentielle $\hat x_t = 0{,}382\,\hat x_{t-1} + 0{,}618\,y_t$ de demi-vie inférieure à une observation : quand l'état bouge autant que le bruit, il y a peu à gagner à moyenner. Le gain ne dépend que de $\lambda = q/r$, et il faut $\lambda \approx 0{,}01$ pour une demi-vie de 7 observations.
:::
:::

::: question Construis un filtre de Kalman pour le ratio de couverture d'un pairs trade. Donne la forme espace-état, explique comment tu choisirais $q/r$, et ce qui se passe quand il est trop grand ou trop petit.
::: hint
La régression $y_t = \beta_t x_t + \varepsilon_t$ devient une équation d'observation avec un $H_t$ variable dans le temps.
:::
::: answer
État $\mathbf{x}_t = (\alpha_t, \beta_t)^\top$ en marche aléatoire, $\mathbf{F} = \mathbf{I}$, $\mathbf{Q} = \operatorname{diag}(q_\alpha, q_\beta)$ ; observation $y_t = \mathbf{H}_t\mathbf{x}_t + v_t$ avec $\mathbf{H}_t = (1, x_t)$, $\operatorname{Var}(v_t) = r$. La prédiction ajoute $\mathbf{Q}$ ; la mise à jour régresse la surprise $\nu_t = y_t - \hat\alpha - \hat\beta x_t$ sur l'état avec $\mathbf{K}_t = \mathbf{P}_{t|t-1}\mathbf{H}_t^\top / (\mathbf{H}_t\mathbf{P}_{t|t-1}\mathbf{H}_t^\top + r)$ — dépendant des données, puisque $\mathbf{H}_t$ porte $x_t$. Choisis $q/r$ en maximisant la vraisemblance des innovations sur une fenêtre d'apprentissage, puis vérifie que les innovations sont blanches hors échantillon. Trop grand : $\beta_t$ suit le bruit, $\nu_t$ est petit par construction et la stratégie trade chaque frémissement à perte. Trop petit : le filtre dégénère en MCO sur tout l'historique et le « spread » tend pendant des semaines. Le signal est $\nu_t/\sqrt{S_t}$, qui tient déjà compte de l'incertitude courante.
:::
:::
