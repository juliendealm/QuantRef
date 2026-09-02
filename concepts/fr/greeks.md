---
title: Les grecques
subject: derivatives
summary: Les sensibilités du prix d'une option au spot, à la volatilité, au temps et aux taux. Le delta est le ratio de couverture, le gamma la convexité que l'on détient ou que l'on doit, le thêta le loyer que l'on paie pour elle ; le P&L d'un livre couvert en delta est un pari sur la variance réalisée contre la variance implicite.
difficulty: 2
interview: 5
tags: [greeks, delta, gamma, vega, theta, hedging, options, risk]
prerequisites: [black-scholes]
related: [value-at-risk]
---

## Intuition

Un prix est un seul nombre. Pour gérer une position, il faut savoir comment ce nombre bouge quand le marché bouge, et c'est ce que sont les grecques : les dérivées partielles de la valeur de l'option par rapport à chaque paramètre, autrement dit les coefficients d'un développement de Taylor du prix.

- **Delta** $\Delta$ : à combien d'actions l'option ressemble. Un call de $\Delta = 0{,}56$ gagne environ $0{,}56$ quand l'action gagne $1$. C'est le ratio de couverture : on vend $0{,}56$ action par call et l'on est localement immunisé contre les petits mouvements.
- **Gamma** $\Gamma$ : la vitesse à laquelle le delta change. C'est la *convexité* de la position. Les options longues ont un gamma positif : elles s'allongent quand l'action monte et se raccourcissent quand elle baisse, ce qui est le sens profitable. Les options courtes doivent cette convexité.
- **Véga** $\nu$ : l'exposition à la volatilité implicite. Les options longues sont longues en véga : plus le marché s'attend à ce que l'action bouge, plus l'option vaut cher.
- **Thêta** $\Theta$ : l'érosion temporelle. Le loyer que paie chaque jour le détenteur d'une option longue pour la convexité. Il est négatif pour la plupart des positions longues.
- **Rhô** $\rho$ : la sensibilité aux taux. Généralement la moins importante pour les options courtes sur actions, mais elle compte pour les produits longs et les produits de taux.

La relation centrale est celle entre gamma et thêta. Une option longue couverte en delta gagne $\tfrac12\Gamma\,(dS)^2$ de convexité à chaque mouvement et paie $\Theta\,dt$ d'érosion. Dans le modèle de [[black-scholes]], les deux s'équilibrent exactement quand l'action bouge à la volatilité implicite. Elle bouge plus, le gamma gagne ; elle bouge moins, le thêta gagne. C'est tout le métier du trading de volatilité.

## Formulation mathématique

Avec $V(t, S, \sigma, r)$ le prix de l'option, $T$ le temps restant jusqu'à l'échéance et $\varphi$ la densité normale centrée réduite :

$$
\Delta = \frac{\partial V}{\partial S}, \qquad
\Gamma = \frac{\partial^2 V}{\partial S^2}, \qquad
\nu = \frac{\partial V}{\partial \sigma}, \qquad
\Theta = \frac{\partial V}{\partial t}, \qquad
\rho = \frac{\partial V}{\partial r}.
$$

::: formula Grecques de Black–Scholes pour un call
$$
\begin{aligned}
\Delta &= N(d_1), &
\Gamma &= \frac{\varphi(d_1)}{S\sigma\sqrt{T}}, &
\nu &= S\,\varphi(d_1)\sqrt{T}, \\
\Theta &= -\frac{S\,\varphi(d_1)\,\sigma}{2\sqrt{T}} - rKe^{-rT}N(d_2), &
\rho &= KTe^{-rT}N(d_2).
\end{aligned}
$$
:::

Pour le put de mêmes strike et échéance, la parité $P = C - S + Ke^{-rT}$ donne $\Delta_P = N(d_1) - 1$, les **mêmes** $\Gamma$ et $\nu$, $\Theta_P = -\dfrac{S\varphi(d_1)\sigma}{2\sqrt{T}} + rKe^{-rT}N(-d_2)$ et $\rho_P = -KTe^{-rT}N(-d_2)$.

Deux identités à connaître : $\nu = \sigma T S^2\,\Gamma$ (véga et gamma sont proportionnels pour une échéance donnée), et l'EDP de Black–Scholes lue comme une relation entre grecques :

::: formula Arbitrage gamma–thêta
$$
\Theta + \tfrac12\sigma^2 S^2\,\Gamma + rS\,\Delta - rV = 0
\qquad\Longrightarrow\qquad
\Theta \approx -\tfrac12\sigma^2 S^2\,\Gamma \quad \text{pour une position couverte en delta quand } r \approx 0.
$$
:::

::: formula P&L de la couverture en delta
Couvrir en continu à la volatilité implicite $\sigma_{\text{impl}}$ alors que l'action bouge en réalité à la volatilité $\sigma_{\text{real}}$ rapporte, sur $dt$,
$$
d\,\mathrm{P\&L} = \tfrac12\,\Gamma\,S^2\,\big(\sigma_{\text{real}}^2 - \sigma_{\text{impl}}^2\big)\,dt .
$$
:::

**Grecques d'ordre supérieur.** Les sensibilités croisées du second ordre les plus utilisées sont

$$
\text{vanna} = \frac{\partial^2 V}{\partial S\,\partial\sigma} = \frac{\partial\Delta}{\partial\sigma} = -\varphi(d_1)\,\frac{d_2}{\sigma}, \qquad
\text{volga} = \frac{\partial^2 V}{\partial\sigma^2} = \nu\,\frac{d_1 d_2}{\sigma}.
$$

Le vanna dit comment la couverture change quand la volatilité bouge ; le volga est la convexité en volatilité qui fait profiter les options en dehors de la monnaie de la volatilité de la volatilité. Le charm ($\partial\Delta/\partial t$) et le speed ($\partial\Gamma/\partial S$) figurent aussi sur les rapports de desk.

**Unités de desk.** Personne ne cote des dérivées brutes. Le delta se cote en actions ou en cash ($\Delta \cdot S$) ; le gamma comme la variation du delta cash pour un mouvement de 1 % ($\Gamma S^2/100$) ; le véga par point de volatilité ($\nu/100$) ; le thêta par jour calendaire ($\Theta/365$).

## Dérivation

Les cinq formes fermées découlent de $C = S\,N(d_1) - Ke^{-rT}N(d_2)$ et d'une identité :

$$
S\,\varphi(d_1) = Ke^{-rT}\varphi(d_2).
$$

Preuve : $\varphi(d_1)/\varphi(d_2) = e^{-(d_1^2 - d_2^2)/2} = e^{-(d_1 - d_2)(d_1 + d_2)/2}$ ; avec $d_1 - d_2 = \sigma\sqrt{T}$ et $d_1 + d_2 = [2\ln(S/K) + 2rT]/(\sigma\sqrt{T})$, l'exposant vaut $-\ln(S/K) - rT$, donc le rapport vaut $Ke^{-rT}/S$.

**Delta.** $\partial_S C = N(d_1) + S\varphi(d_1)\,\partial_S d_1 - Ke^{-rT}\varphi(d_2)\,\partial_S d_2$. Comme $\partial_S d_1 = \partial_S d_2 = 1/(S\sigma\sqrt{T})$, l'identité fait s'annuler les deux derniers termes : $\Delta = N(d_1)$.

**Gamma.** $\Gamma = \partial_S N(d_1) = \varphi(d_1)/(S\sigma\sqrt{T})$.

**Véga.** $\partial_\sigma C = S\varphi(d_1)\,\partial_\sigma d_1 - Ke^{-rT}\varphi(d_2)\,\partial_\sigma d_2 = S\varphi(d_1)\,(\partial_\sigma d_1 - \partial_\sigma d_2) = S\varphi(d_1)\sqrt{T}$, parce que $d_2 = d_1 - \sigma\sqrt{T}$.

**Thêta et rhô.** La même annulation donne $\rho = KTe^{-rT}N(d_2)$. Pour le thêta, le plus rapide est d'utiliser l'EDP : $\Theta = rC - rS\Delta - \tfrac12\sigma^2S^2\Gamma = -rKe^{-rT}N(d_2) - \dfrac{S\varphi(d_1)\sigma}{2\sqrt{T}}$.

**Le P&L de couverture.** On détient l'option et l'on vend $\Delta$ actions, financées au taux $r$. Sur un petit pas, par le [[ito-lemma|lemme d'Itô]] avec le mouvement *réalisé* $dS$,

$$
d\Pi = \Theta\,dt + \tfrac12\Gamma\,(dS)^2 + (\text{financement}) .
$$

L'EDP du modèle dit que $\Theta\,dt + \tfrac12\Gamma S^2\sigma_{\text{impl}}^2\,dt + (\text{financement}) = 0$ : la position est à l'équilibre si l'action bouge à la volatilité implicite. En soustrayant, et en écrivant $(dS)^2 = S^2\sigma_{\text{real}}^2\,dt$ pour le rendement quadratique réalisé,

$$
d\,\mathrm{P\&L} = \tfrac12\Gamma S^2\big(\sigma_{\text{real}}^2 - \sigma_{\text{impl}}^2\big)\,dt .
$$

Intégré jusqu'à l'échéance, $\mathrm{P\&L} = \int_0^T \tfrac12\Gamma_t S_t^2\big(\sigma_{\text{real},t}^2 - \sigma_{\text{impl}}^2\big)\,dt$. Le gamma est à l'intérieur de l'intégrale : le P&L dépend du chemin, et la variance réalisée ne compte que là où l'option a du gamma, c'est-à-dire près du strike.

## Hypothèses et cas limites

- **Dépendance au modèle.** Les formes fermées ci-dessus sont des grecques Black–Scholes et supposent une volatilité constante. Avec un smile, le delta dépend de la façon dont on suppose que la vol implicite bouge avec le spot : « sticky strike » donne $\Delta_{BS}$, « sticky delta » donne $\Delta_{BS} + \nu\,\partial\sigma_{\text{impl}}/\partial S$. Les desks en débattent tous les jours.
- **Près de l'échéance, à la monnaie.** $\Gamma$ et $\Theta$ explosent comme $1/\sqrt{T}$ : le delta bascule entre 0 et 1 sur de minuscules mouvements (pin risk). Le véga tend vers zéro comme $\sqrt{T}$.
- **Loin de la monnaie.** $\Gamma$ et $\nu$ s'annulent ; l'option devient soit un forward ($\Delta \to 1$), soit rien ($\Delta \to 0$).
- **Où sont les maxima.** Gamma et véga sont maximaux près du strike à la monnaie forward ; le gamma culmine légèrement en dessous et le véga légèrement au-dessus, à cause du décalage $\tfrac12\sigma^2 T$ dans $d_1$.
- **Le thêta peut être positif.** Un put européen très dans la monnaie gagne du thêta (le terme $rKe^{-rT}N(-d_2)$ domine) : on vous doit $K$ et vous vous rapprochez du moment de le recevoir. De même pour un call sur une action à fort taux de dividende.
- **Additivité.** Les grecques sont linéaires en la position, donc les grecques d'un livre sont la somme de celles de ses positions. C'est pourquoi le risque s'agrège et se limite par grecque, mais cela ne vaut que par sous-jacent et, pour le véga, par tranche d'échéance.
- **La formule de P&L n'est que la jambe gamma.** Elle ignore le bruit de couverture discrète, les coûts de transaction et le P&L de véga dû à un changement de volatilité implicite pendant que l'on tient la position.

## Exemple détaillé

Call à la monnaie à six mois : $S = K = 100$, $T = 0{,}5$, $r = 2\,\%$, $\sigma = 25\,\%$.

$$
d_1 = \frac{0 + (0{,}02 + 0{,}03125)\times 0{,}5}{0{,}25\sqrt{0{,}5}} = \frac{0{,}02563}{0{,}17678} = 0{,}1450, \qquad d_2 = -0{,}0318, \qquad \varphi(d_1) = 0{,}3948 .
$$

- $\Delta = N(0{,}1450) = 0{,}558$ : on couvre 100 contrats de 100 actions chacun en vendant $5\,576$ actions.
- $\Gamma = 0{,}3948/(100 \times 0{,}25 \times 0{,}7071) = 0{,}0223$ : un mouvement de $1$ change le delta de $0{,}022$, soit $223$ actions à traiter sur le même livre.
- $\nu = 100 \times 0{,}3948 \times 0{,}7071 = 27{,}9$ par unité de $\sigma$, soit $0{,}279$ par point de volatilité.
- $\Theta = -6{,}98 - 0{,}97 = -7{,}94$ par an, soit $-0{,}0218$ par jour calendaire : les 100 contrats perdent environ $218$ par jour si rien ne bouge.
- $\rho = 24{,}1$ par unité de $r$, soit $0{,}24$ pour 100 pb.

Le mouvement quotidien d'équilibre découle de l'arbitrage gamma–thêta : avec $\Theta_\gamma = -6{,}98$ la part gamma du thêta, $\tfrac12\Gamma(\delta S)^2 = -\Theta_\gamma\,\delta t$ donne $\delta S = S\sigma\sqrt{\delta t} = 100 \times 0{,}25 \times \sqrt{1/365} = 1{,}31$. Si l'action bouge de plus de $1{,}31$ dans la journée, le gamma long paie le thêta.

Le script calcule les grecques analytiques, les compare à des différences finies sur le prix et vérifie l'identité de l'EDP :

```python
import numpy as np
from scipy.stats import norm

def bs_call(S, K, T, r, sigma):
    d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    return S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)

S, K, T, r, sigma = 100.0, 100.0, 0.5, 0.02, 0.25
d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
d2 = d1 - sigma * np.sqrt(T)
phi = norm.pdf(d1)
analytic = {
    "delta": norm.cdf(d1),
    "gamma": phi / (S * sigma * np.sqrt(T)),
    "vega":  S * phi * np.sqrt(T),
    "theta": -S * phi * sigma / (2 * np.sqrt(T)) - r * K * np.exp(-r * T) * norm.cdf(d2),
    "rho":   K * T * np.exp(-r * T) * norm.cdf(d2),
}

f = lambda **kw: bs_call(**{"S": S, "K": K, "T": T, "r": r, "sigma": sigma, **kw})
h = 1e-3                                   # relative bump for S; absolute for the others
bump = {
    "delta": (f(S=S * (1 + h)) - f(S=S * (1 - h))) / (2 * S * h),
    "gamma": (f(S=S * (1 + h)) - 2 * f() + f(S=S * (1 - h))) / (S * h) ** 2,
    "vega":  (f(sigma=sigma + h) - f(sigma=sigma - h)) / (2 * h),
    "theta": -(f(T=T + h) - f(T=T - h)) / (2 * h),      # d/dt = -d/dT
    "rho":   (f(r=r + h) - f(r=r - h)) / (2 * h),
}

print(f"Call = {f():.4f}   (S={S:.0f}, K={K:.0f}, T={T}, r={r}, sigma={sigma})")
print(f"{'greek':<6}{'analytic':>12}{'bump':>12}{'abs diff':>11}")
for g in analytic:
    print(f"{g:<6}{analytic[g]:12.6f}{bump[g]:12.6f}{abs(analytic[g] - bump[g]):11.1e}")

a = analytic
pde = a["theta"] + 0.5 * sigma**2 * S**2 * a["gamma"] + r * S * a["delta"] - r * f()
print(f"\nBS PDE residual theta + 1/2 s^2 S^2 gamma + r S delta - r C = {pde:.2e}")
print(f"Gamma-theta trade-off: -1/2 s^2 S^2 gamma = {-0.5 * sigma**2 * S**2 * a['gamma']:.4f}, theta = {a['theta']:.4f}")
```

::: output
```
Call = 7.5168   (S=100, K=100, T=0.5, r=0.02, sigma=0.25)
greek     analytic        bump   abs diff
delta     0.557628    0.557627    6.8e-07
gamma     0.022332    0.022332    5.0e-08
vega     27.914655   27.914654    1.3e-06
theta    -7.943582   -7.943585    3.5e-06
rho      24.122954   24.122947    7.5e-06

BS PDE residual theta + 1/2 s^2 S^2 gamma + r S delta - r C = 0.00e+00
Gamma-theta trade-off: -1/2 s^2 S^2 gamma = -6.9787, theta = -7.9436
```
:::

Les différences finies concordent avec les formes fermées à six décimales ; le résidu de l'EDP est nul à la précision machine. L'écart entre $-\tfrac12\sigma^2S^2\Gamma = -6{,}98$ et $\Theta = -7{,}94$ est le terme de taux $rS\Delta - rC = 0{,}02 \times (55{,}76 - 7{,}52) = 0{,}96$.

## Pourquoi c'est important en finance quantitative

- **On couvre en grecques.** Le delta se couvre avec le sous-jacent, le gamma et le véga avec d'autres options ; un livre est « plat » quand ses grecques nettes sont dans les limites, pas quand il n'a aucune position.
- **Les limites de risque sont des limites en grecques.** Un desk reçoit une limite de delta par sous-jacent, une limite de véga par tranche d'échéance, une limite de gamma près des échéances. En dépasser une force une couverture, quelle que soit la vue du trader.
- **L'explication du P&L.** Le P&L de chaque journée se décompose en $\Delta\,\delta S + \tfrac12\Gamma\,\delta S^2 + \nu\,\delta\sigma + \Theta\,\delta t + \text{inexpliqué}$. Un terme inexpliqué important signifie que le modèle ou les données sont faux.
- **Trader la volatilité, c'est trader le gamma.** La formule $\tfrac12\Gamma S^2(\sigma_{\text{real}}^2 - \sigma_{\text{impl}}^2)$ est le P&L de tout trade d'option couvert en delta ; les swaps de variance existent pour supprimer la dépendance au chemin qui vient de $\Gamma_t$.
- **VaR delta–gamma.** La variation de valeur d'un livre est approchée par $\Delta\,\delta S + \tfrac12\Gamma\,\delta S^2 + \nu\,\delta\sigma$ dans les moteurs de [[value-at-risk]] qui ne peuvent pas réévaluer chaque option sous chaque scénario.
- **Le gamma est le terme d'Itô.** Le $\tfrac12\Gamma(dS)^2$ qui pilote tout ce qui précède est le terme du second ordre du [[ito-lemma|lemme d'Itô]] ; le thêta est ce que l'EDP de [[black-scholes]] dit qu'il faut payer pour lui.

## Erreurs fréquentes

::: pitfall Confondre thêta par an et thêta par jour
La forme fermée donne $\Theta$ par an. Les desks le cotent par jour calendaire ($\Theta/365$) ou par jour de bourse ($\Theta/252$) ; un facteur 365 se perd facilement et transforme une érosion quotidienne de $-0{,}02$ en un absurde $-7{,}94$.
:::

::: pitfall Croire qu'une position couverte en delta est sans risque
La couverture en delta ne supprime que l'exposition du premier ordre. Il reste $\tfrac12\Gamma S^2(\sigma_{\text{real}}^2 - \sigma_{\text{impl}}^2)\,dt$ plus l'exposition véga aux changements de volatilité implicite. Les positions courtes en gamma perdent à chaque grand mouvement et sont la source classique des explosions.
:::

::: pitfall Coter le véga dans la mauvaise unité
$\nu = 27{,}9$ issu de la formule signifie $27{,}9$ par unité de $\sigma$, c'est-à-dire pour 100 points de volatilité. Par point, c'est $0{,}279$. Utiliser la mauvaise unité surestime le risque véga d'une position d'un facteur 100.
:::

::: pitfall Compenser des grecques entre sous-jacents ou échéances différents
Un delta long sur une action ne couvre pas un delta court sur une autre ; un véga long sur des options à 2 ans ne couvre pas un véga court sur des options à 1 mois, parce que les vols implicites des différentes échéances bougent différemment. On n'agrège les grecques qu'à l'intérieur de la tranche où le facteur de risque est commun.
:::

## Révision en 30 secondes

Les grecques sont les dérivées partielles du prix de l'option. Call : $\Delta = N(d_1)$, $\Gamma = \varphi(d_1)/(S\sigma\sqrt{T})$, $\nu = S\varphi(d_1)\sqrt{T}$, $\Theta = -S\varphi(d_1)\sigma/(2\sqrt{T}) - rKe^{-rT}N(d_2)$, $\rho = KTe^{-rT}N(d_2)$ ; le put partage $\Gamma$ et $\nu$ et a pour delta $N(d_1) - 1$. L'EDP dit $\Theta + \tfrac12\sigma^2S^2\Gamma + rS\Delta - rV = 0$, donc le gamma long coûte du thêta. Une position couverte en delta gagne $\tfrac12\Gamma S^2(\sigma_{\text{real}}^2 - \sigma_{\text{impl}}^2)\,dt$ : un pari sur la variance réalisée contre l'implicite, pondéré par l'endroit où se trouve le gamma. Les desks cotent le delta en cash, le gamma pour 1 %, le véga par point, le thêta par jour, et fixent des limites sur chacun.

## Formules clés

| Nom | Formule |
|---|---|
| Delta (call / put) | $N(d_1)$ / $N(d_1) - 1$ |
| Gamma | $\dfrac{\varphi(d_1)}{S\sigma\sqrt{T}}$ |
| Véga | $S\,\varphi(d_1)\sqrt{T} = \sigma T S^2\,\Gamma$ |
| Thêta (call) | $-\dfrac{S\varphi(d_1)\sigma}{2\sqrt{T}} - rKe^{-rT}N(d_2)$ |
| Rhô (call) | $KTe^{-rT}N(d_2)$ |
| Gamma–thêta | $\Theta \approx -\tfrac12\sigma^2S^2\Gamma$ |
| P&L de couverture | $\tfrac12\Gamma S^2(\sigma_{\text{real}}^2 - \sigma_{\text{impl}}^2)\,dt$ |
| Vanna, volga | $-\varphi(d_1)\,d_2/\sigma$, $\nu\,d_1 d_2/\sigma$ |

## Questions d'entretien

::: question Le delta d'un call à la monnaie vaut-il $0{,}5$ ? Justifie.
::: hint
Regarde le signe de $d_1$ quand $S = K$.
:::
::: answer
Légèrement plus. Avec $S = K$, $d_1 = (r + \tfrac12\sigma^2)\sqrt{T}/\sigma > 0$, donc $\Delta = N(d_1) > 0{,}5$ ; dans l'exemple détaillé il vaut $0{,}558$. Deux effets le poussent vers le haut : le forward est au-dessus du spot ($r > 0$), et le terme $\tfrac12\sigma^2$ de la loi log-normale. Le delta vaut exactement $0{,}5$ en $S = Ke^{-(r + \sigma^2/2)T}$, un peu en dessous du forward. Le put à la monnaie a pour delta $0{,}558 - 1 = -0{,}442$ ; les deltas du call et du put somment toujours à $1$ en valeur absolue.
:::
:::

::: question Tu es long de 100 calls à la monnaie (100 actions chacun) de l'exemple détaillé, couvert en delta. L'action bouge de 2 % aujourd'hui ; la vol implicite est de 25 %. Grosso modo, quel est ton P&L ?
::: hint
Compare le gain de gamma $\tfrac12\Gamma(\delta S)^2$ à une journée de thêta, ou compare $2\,\%$ au mouvement quotidien d'équilibre $\sigma/\sqrt{252}$.
:::
::: answer
Par option : gain de gamma $\tfrac12 \times 0{,}0223 \times 2^2 = 0{,}0446$ ; coût de thêta pour un jour de bourse $\approx \tfrac12\Gamma S^2\sigma^2/252 = \tfrac12 \times 0{,}0223 \times 10^4 \times 0{,}0625/252 = 0{,}0277$ ; net $+0{,}017$ par option, soit environ $+170$ pour les $10\,000$ actions sous-jacentes. Plus vite : le mouvement quotidien d'équilibre est $\sigma/\sqrt{252} = 1{,}57\,\%$ ; $2\,\%$ le dépasse, donc le gamma long gagne, de $\tfrac12\Gamma S^2(0{,}02^2 - 0{,}0157^2) \approx 0{,}017$ par option.
:::
:::

::: question Montre que véga et gamma sont proportionnels pour une même échéance, explique pourquoi la proportionnalité échoue entre échéances, et ce que cela implique pour un calendar spread.
::: hint
Divise les formes fermées ; le rapport ne fait intervenir que $S$, $\sigma$ et $T$.
:::
::: answer
$\nu/\Gamma = S\varphi(d_1)\sqrt{T} \cdot S\sigma\sqrt{T}/\varphi(d_1) = \sigma S^2 T$. Pour une échéance, un livre gamma-neutre est véga-neutre et réciproquement. Entre échéances, le facteur $T$ diffère : une option longue porte beaucoup de véga par unité de gamma, une option courte beaucoup de gamma par unité de véga. Un calendar spread (long du 1 an, court du 1 mois, même strike) peut donc être long en véga et court en gamma en même temps : il gagne si la vol implicite monte mais perd si l'action bouge beaucoup à court terme. Aucun trade vanille unique n'isole « la volatilité ».
:::
:::

::: question Démontre la formule de P&L de la couverture en delta et explique pourquoi un trader peut perdre de l'argent alors que la volatilité réalisée sur la vie du trade est égale à la volatilité implicite qu'il a payée.
::: hint
Où se trouve le gamma dans le P&L intégré ? Que se passe-t-il si l'action est volatile loin du strike et calme près de lui ?
:::
::: answer
Par le lemme d'Itô, le portefeuille couvert varie de $\Theta\,dt + \tfrac12\Gamma(dS)^2$ plus le financement ; l'EDP dit que c'est nul quand $(dS)^2 = S^2\sigma_{\text{impl}}^2\,dt$ ; substituer le $(dS)^2 = S^2\sigma_{\text{real}}^2\,dt$ réalisé laisse $\tfrac12\Gamma S^2(\sigma_{\text{real}}^2 - \sigma_{\text{impl}}^2)\,dt$. Intégré : $\mathrm{P\&L} = \int_0^T \tfrac12\Gamma_t S_t^2(\sigma_{\text{real},t}^2 - \sigma_{\text{impl}}^2)\,dt$, avec $\Gamma_t$ grand près du strike et presque nul loin de lui. Suppose que l'action bouge à 40 % pendant qu'elle est à 30 % du strike ($\Gamma_t \approx 0$) puis reste immobile à 10 % près du strike ($\Gamma_t$ grand), pour une moyenne de 25 %. L'intégrande est négatif là où cela compte et négligeable là où la vol réalisée était élevée : le trader long en gamma perd bien que la vol réalisée moyenne ait égalé l'implicite. Les swaps de variance répliquent un contrat log dont le gamma en dollars $\Gamma S^2$ est constant, ce qui supprime la pondération et transforme le P&L en un pari propre sur la variance réalisée moyenne.
:::
:::
