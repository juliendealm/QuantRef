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

Les grecques sont les dérivées partielles du prix de l'option — les coefficients d'un développement de Taylor en chaque paramètre. Le **delta** dit à combien d'actions l'option ressemble, donc c'est le ratio de couverture ; le **gamma** dit à quelle vitesse le delta change, c'est la convexité que l'on détient quand on est long d'options et que l'on doit quand on est court ; le **véga** est l'exposition à la volatilité implicite, le **thêta** le loyer quotidien payé pour la convexité, le **rhô** la sensibilité aux taux. Le pivot est gamma contre thêta : une option longue couverte en delta gagne $\tfrac12\Gamma\,(dS)^2$ par mouvement et paie $\Theta\,dt$ d'érosion, et dans [[black-scholes]] les deux s'équilibrent exactement quand l'action bouge à la volatilité implicite. C'est tout le métier du trading de volatilité.

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

## Erreurs fréquentes

::: pitfall Confondre thêta par an et thêta par jour
La forme fermée donne $\Theta$ par an ; les desks le cotent par jour calendaire ($\Theta/365$) ou par jour de bourse ($\Theta/252$). Un facteur 365 perdu transforme une érosion quotidienne de $-0{,}02$ en un absurde $-7{,}94$.
:::

::: pitfall Croire qu'une position couverte en delta est sans risque
La couverture en delta ne supprime que l'exposition du premier ordre ; il reste $\tfrac12\Gamma S^2(\sigma_{\text{real}}^2 - \sigma_{\text{impl}}^2)\,dt$ plus l'exposition véga aux mouvements de vol implicite. Le gamma court perd à chaque grand mouvement : l'explosion classique.
:::

::: pitfall Coter le véga dans la mauvaise unité
$\nu = 27{,}9$ signifie $27{,}9$ par unité de $\sigma$, c'est-à-dire pour 100 points de volatilité ; par point, c'est $0{,}279$. La mauvaise unité surestime le risque véga d'un facteur 100.
:::

::: pitfall Compenser des grecques entre sous-jacents différents ou entre échéances différentes
Un delta long sur une action ne couvre pas un delta court sur une autre, et un véga long à 2 ans ne couvre pas un véga court à 1 mois : les vols implicites des différentes échéances bougent différemment. On n'agrège qu'à l'intérieur de la tranche où le facteur de risque est commun.
:::

## Révision en 30 secondes

Les grecques sont les dérivées partielles du prix de l'option. Call : $\Delta = N(d_1)$, $\Gamma = \varphi(d_1)/(S\sigma\sqrt{T})$, $\nu = S\varphi(d_1)\sqrt{T}$, $\Theta = -S\varphi(d_1)\sigma/(2\sqrt{T}) - rKe^{-rT}N(d_2)$, $\rho = KTe^{-rT}N(d_2)$ ; le put partage $\Gamma$ et $\nu$ et a pour delta $N(d_1) - 1$. L'EDP dit $\Theta + \tfrac12\sigma^2S^2\Gamma + rS\Delta - rV = 0$, donc le gamma long coûte du thêta. Une position couverte en delta gagne $\tfrac12\Gamma S^2(\sigma_{\text{real}}^2 - \sigma_{\text{impl}}^2)\,dt$ : un pari sur la variance réalisée contre l'implicite, pondéré par l'endroit où se trouve le gamma. Les desks cotent le delta en cash, le gamma pour 1 %, le véga par point, le thêta par jour.

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

La parité donne $\Delta_P = N(d_1) - 1$, les **mêmes** $\Gamma$ et $\nu$, $\Theta_P = -\dfrac{S\varphi(d_1)\sigma}{2\sqrt{T}} + rKe^{-rT}N(-d_2)$, $\rho_P = -KTe^{-rT}N(-d_2)$. Deux identités : $\nu = \sigma T S^2\,\Gamma$, et l'EDP lue entre grecques :

::: formula Compromis gamma–thêta
$$
\Theta + \tfrac12\sigma^2 S^2\,\Gamma + rS\,\Delta - rV = 0
\qquad\Longrightarrow\qquad
\Theta \approx -\tfrac12\sigma^2 S^2\,\Gamma \quad \text{pour une position couverte en delta quand } r \approx 0.
$$
:::

::: formula P&L de la couverture en delta
Couvrir en continu à la volatilité implicite $\sigma_{\text{impl}}$, en valorisant le livre à cette même $\sigma_{\text{impl}}$ supposée constante, alors que l'action bouge en réalité à la volatilité $\sigma_{\text{real}}$ rapporte, sur $dt$ (ici $\Gamma$ est le gamma Black-Scholes calculé à $\sigma_{\text{impl}}$),
$$
d\,\mathrm{P\&L} = \tfrac12\,\Gamma\,S^2\,\big(\sigma_{\text{real}}^2 - \sigma_{\text{impl}}^2\big)\,dt .
$$
:::

**Ordres supérieurs.** Les sensibilités croisées les plus utilisées sont

$$
\text{vanna} = \frac{\partial^2 V}{\partial S\,\partial\sigma} = \frac{\partial\Delta}{\partial\sigma} = -\varphi(d_1)\,\frac{d_2}{\sigma}, \qquad
\text{volga} = \frac{\partial^2 V}{\partial\sigma^2} = \nu\,\frac{d_1 d_2}{\sigma}.
$$

Le vanna dit comment la couverture bouge avec la volatilité ; le volga est la convexité qui fait profiter les options en dehors de la monnaie de la vol-de-vol. Le charm ($\partial\Delta/\partial t$) et le speed ($\partial\Gamma/\partial S$) figurent aussi sur les rapports de desk.

**Unités de desk.** Delta en actions ou en cash ($\Delta \cdot S$) ; gamma comme la variation du delta cash pour un mouvement de 1 % ($\Gamma S^2/100$) ; véga par point de volatilité ($\nu/100$) ; thêta par jour calendaire ($\Theta/365$).

## Dérivation

Les cinq formes fermées découlent de $C = S\,N(d_1) - Ke^{-rT}N(d_2)$ et d'une identité :

$$
S\,\varphi(d_1) = Ke^{-rT}\varphi(d_2).
$$

Preuve : $\varphi(d_1)/\varphi(d_2) = e^{-(d_1^2 - d_2^2)/2} = e^{-(d_1 - d_2)(d_1 + d_2)/2}$ ; avec $d_1 - d_2 = \sigma\sqrt{T}$ et $d_1 + d_2 = [2\ln(S/K) + 2rT]/(\sigma\sqrt{T})$, l'exposant vaut $-\ln(S/K) - rT$, donc le rapport vaut $Ke^{-rT}/S$.

**Delta.** $\partial_S C = N(d_1) + S\varphi(d_1)\,\partial_S d_1 - Ke^{-rT}\varphi(d_2)\,\partial_S d_2$ ; comme $\partial_S d_1 = \partial_S d_2 = 1/(S\sigma\sqrt{T})$, l'identité annule les deux derniers termes : $\Delta = N(d_1)$. Puis $\Gamma = \partial_S N(d_1) = \varphi(d_1)/(S\sigma\sqrt{T})$.

**Véga.** $\partial_\sigma C = S\varphi(d_1)\,(\partial_\sigma d_1 - \partial_\sigma d_2) = S\varphi(d_1)\sqrt{T}$, parce que $d_2 = d_1 - \sigma\sqrt{T}$.

**Thêta et rhô.** La même annulation donne $\rho = KTe^{-rT}N(d_2)$ ; pour le thêta, utiliser l'EDP : $\Theta = rC - rS\Delta - \tfrac12\sigma^2S^2\Gamma = -rKe^{-rT}N(d_2) - \dfrac{S\varphi(d_1)\sigma}{2\sqrt{T}}$.

**Le P&L de couverture.** On détient l'option, on vend $\Delta$ actions, on finance au taux $r$. Par le [[ito-lemma|lemme d'Itô]] avec le mouvement *réalisé* $dS$,

$$
d\Pi = \Theta\,dt + \tfrac12\Gamma\,(dS)^2 + (\text{financement}) .
$$

L'EDP dit que $\Theta\,dt + \tfrac12\Gamma S^2\sigma_{\text{impl}}^2\,dt + (\text{financement}) = 0$ : la position est à l'équilibre si l'action bouge à la volatilité implicite. En soustrayant, avec $(dS)^2 = S^2\sigma_{\text{real}}^2\,dt$,

$$
d\,\mathrm{P\&L} = \tfrac12\Gamma S^2\big(\sigma_{\text{real}}^2 - \sigma_{\text{impl}}^2\big)\,dt .
$$

En capitalisant chaque gain quotidien jusqu'à l'échéance au taux sans risque, $\mathrm{P\&L} = \int_0^T e^{r(T-t)}\,\tfrac12\Gamma_t S_t^2\big(\sigma_{\text{real},t}^2 - \sigma_{\text{impl}}^2\big)\,dt$. Le gamma est à l'intérieur de l'intégrale : le P&L dépend du chemin, et la variance réalisée ne compte que près du strike.

## Hypothèses et cas limites

- **Dépendance au modèle.** Ce sont des grecques Black–Scholes à volatilité constante. Avec un smile, le delta dépend de la façon dont on suppose que la vol implicite bouge avec le spot : « sticky strike » donne $\Delta_{BS}$, « sticky delta » $\Delta_{BS} + \nu\,\partial\sigma_{\text{impl}}/\partial S$.
- **Près de l'échéance, à la monnaie.** $\Gamma$ et $\Theta$ explosent comme $1/\sqrt{T}$ : le delta bascule entre 0 et 1 sur de minuscules mouvements (pin risk). Le véga tend vers zéro comme $\sqrt{T}$.
- **Loin de la monnaie.** $\Gamma$ et $\nu$ s'annulent ; l'option devient un forward ($\Delta \to 1$) ou rien ($\Delta \to 0$).
- **Où sont les maxima.** Les deux culminent près du forward $Ke^{-rT}$ mais pas ensemble : le gamma en $S = Ke^{-(r + \frac32\sigma^2)T}$, légèrement en dessous, le véga en $S = Ke^{(\frac12\sigma^2 - r)T}$, légèrement au-dessus. Les deux portent le même $\varphi(d_1)$ ; ce qui les sépare, c'est le $1/S$ supplémentaire du gamma face au $S$ supplémentaire du véga.
- **Le thêta peut être positif.** Un put européen très dans la monnaie gagne du thêta (le terme $rKe^{-rT}N(-d_2)$ domine) : on te doit $K$ et tu te rapproches du moment de le recevoir. De même pour un call sur une action à fort rendement.
- **Additivité.** Les grecques sont linéaires en la position, donc celles d'un livre sont la somme de celles de ses positions — mais seulement par sous-jacent et, pour le véga, par tranche d'échéance.
- **La formule de P&L n'est que la jambe gamma.** Elle ignore le bruit de couverture discrète, les coûts de transaction et le P&L de véga dû à un changement de volatilité implicite.

## Exemple détaillé

Call à la monnaie à six mois : $S = K = 100$, $T = 0{,}5$, $r = 2\,\%$, $\sigma = 25\,\%$.

$$
d_1 = \frac{0 + (0{,}02 + 0{,}03125)\times 0{,}5}{0{,}25\sqrt{0{,}5}} = \frac{0{,}02563}{0{,}17678} = 0{,}1450, \qquad d_2 = -0{,}0318, \qquad \varphi(d_1) = 0{,}3948 .
$$

- $\Delta = N(0{,}1450) = 0{,}558$ : on couvre 100 contrats de 100 actions chacun en vendant $5\,576$ actions.
- $\Gamma = 0{,}3948/(100 \times 0{,}25 \times 0{,}7071) = 0{,}0223$ : un mouvement de $1$ change le delta de $0{,}022$, soit $223$ actions sur le même livre.
- $\nu = 100 \times 0{,}3948 \times 0{,}7071 = 27{,}9$ par unité de $\sigma$, soit $0{,}279$ par point de volatilité.
- $\Theta = -6{,}98 - 0{,}97 = -7{,}94$ par an, soit $-0{,}0218$ par jour calendaire : les 100 contrats perdent environ $218$ par jour si rien ne bouge.
- $\rho = 24{,}1$ par unité de $r$, soit $0{,}24$ pour 100 pb.

Le mouvement quotidien d'équilibre découle du compromis : avec $\Theta_\gamma = -6{,}98$ la part gamma du thêta, $\tfrac12\Gamma(\delta S)^2 = -\Theta_\gamma\,\delta t$ donne $\delta S = S\sigma\sqrt{\delta t} = 100 \times 0{,}25 \times \sqrt{1/365} = 1{,}31$. Au-delà de $1{,}31$ dans la journée, le gamma long paie le thêta.

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

Les différences finies concordent avec les formes fermées à six décimales et le résidu de l'EDP est nul à la précision machine. L'écart entre $-\tfrac12\sigma^2S^2\Gamma = -6{,}98$ et $\Theta = -7{,}94$ est le terme de taux $rS\Delta - rC = 0{,}02 \times (55{,}76 - 7{,}52) = 0{,}96$.

## Pourquoi c'est important en finance quantitative

- **On couvre en grecques.** Le delta avec le sous-jacent, le gamma et le véga avec d'autres options ; un livre est « plat » quand ses grecques nettes sont dans les limites, pas quand il ne détient rien.
- **Les limites de risque sont des limites en grecques.** Delta par sous-jacent, véga par tranche d'échéance, gamma près des échéances ; en dépasser une force une couverture, quelle que soit la vue du trader.
- **L'explication du P&L.** Le P&L de chaque journée se décompose en $\Delta\,\delta S + \tfrac12\Gamma\,\delta S^2 + \nu\,\delta\sigma + \Theta\,\delta t + \text{inexpliqué}$ ; un terme inexpliqué important signifie que le modèle ou les données sont faux.
- **Trader la volatilité, c'est trader le gamma.** $\tfrac12\Gamma S^2(\sigma_{\text{real}}^2 - \sigma_{\text{impl}}^2)$ est le P&L de tout trade d'option couvert en delta ; les swaps de variance existent pour supprimer la dépendance au chemin due à $\Gamma_t$.
- **VaR delta–gamma.** $\Delta\,\delta S + \tfrac12\Gamma\,\delta S^2 + \nu\,\delta\sigma$ approche la variation d'un livre dans les moteurs de [[value-at-risk]] qui ne peuvent pas réévaluer chaque option par scénario.
- **Le gamma est le terme d'Itô.** Le $\tfrac12\Gamma(dS)^2$ ci-dessus est le terme du second ordre du [[ito-lemma|lemme d'Itô]] ; le thêta est ce que l'EDP de [[black-scholes]] dit qu'il faut payer pour lui.

## Questions d'entretien

::: question Le delta d'un call à la monnaie vaut-il $0{,}5$ ? Justifie.
::: hint
Regarde le signe de $d_1$ quand $S = K$.
:::
::: answer
Légèrement plus. Avec $S = K$, $d_1 = (r + \tfrac12\sigma^2)\sqrt{T}/\sigma > 0$, donc $\Delta = N(d_1) > 0{,}5$ — $0{,}558$ dans l'exemple détaillé. Deux effets le poussent vers le haut : le forward est au-dessus du spot ($r > 0$), et le terme $\tfrac12\sigma^2$ de la loi log-normale. Le delta vaut exactement $0{,}5$ en $S = Ke^{-(r + \sigma^2/2)T}$. Le put à la monnaie a pour delta $-0{,}442$ : les deltas du call et du put somment à $1$ en valeur absolue.
:::
:::

::: question Tu es long de 100 calls à la monnaie (100 actions chacun) de l'exemple détaillé, couvert en delta. L'action bouge de 2 % aujourd'hui ; la vol implicite est de 25 %. Grosso modo, quel est ton P&L ?
::: hint
Compare le gain de gamma $\tfrac12\Gamma(\delta S)^2$ à une journée de thêta, ou compare $2\,\%$ au mouvement quotidien d'équilibre $\sigma/\sqrt{252}$.
:::
::: answer
Par option : gain de gamma $\tfrac12 \times 0{,}0223 \times 2^2 = 0{,}0446$ ; thêta pour un jour de bourse $\approx \tfrac12\Gamma S^2\sigma^2/252 = \tfrac12 \times 0{,}0223 \times 10^4 \times 0{,}0625/252 = 0{,}0277$ ; net $+0{,}017$ par option, soit environ $+170$ sur les $10\,000$ actions. Plus vite : le mouvement d'équilibre est $\sigma/\sqrt{252} = 1{,}57\,\%$ et $2\,\%$ le dépasse, donc le gamma long gagne de $\tfrac12\Gamma S^2(0{,}02^2 - 0{,}0157^2) \approx 0{,}017$ par option.
:::
:::

::: question Montre que véga et gamma sont proportionnels pour une même échéance, explique pourquoi la proportionnalité échoue entre échéances, et ce que cela implique pour un calendar spread.
::: hint
Divise les formes fermées ; le rapport ne fait intervenir que $S$, $\sigma$ et $T$.
:::
::: answer
$\nu/\Gamma = S\varphi(d_1)\sqrt{T} \cdot S\sigma\sqrt{T}/\varphi(d_1) = \sigma S^2 T$. Pour une échéance, un livre gamma-neutre est véga-neutre et réciproquement. Entre échéances, $T$ diffère : une option longue porte beaucoup de véga par unité de gamma, une option courte l'inverse. Un calendar spread (long du 1 an, court du 1 mois, même strike) est alors long en véga et court en gamma à la fois : il gagne si la vol implicite monte, perd si l'action bouge beaucoup à court terme. Aucun trade vanille unique n'isole « la volatilité ».
:::
:::

::: question Démontre la formule de P&L de la couverture en delta et explique pourquoi un trader peut perdre de l'argent alors que la volatilité réalisée sur la vie du trade est égale à la volatilité implicite qu'il a payée.
::: hint
Où se trouve le gamma dans le P&L intégré ? Que se passe-t-il si l'action est volatile loin du strike et calme près de lui ?
:::
::: answer
Par Itô, le portefeuille couvert varie de $\Theta\,dt + \tfrac12\Gamma(dS)^2$ plus le financement ; l'EDP rend cela nul quand $(dS)^2 = S^2\sigma_{\text{impl}}^2\,dt$, donc le $(dS)^2 = S^2\sigma_{\text{real}}^2\,dt$ réalisé laisse $\tfrac12\Gamma S^2(\sigma_{\text{real}}^2 - \sigma_{\text{impl}}^2)\,dt$. Intégré, $\mathrm{P\&L} = \int_0^T \tfrac12\Gamma_t S_t^2(\sigma_{\text{real},t}^2 - \sigma_{\text{impl}}^2)\,dt$, avec $\Gamma_t$ grand près du strike et presque nul loin de lui. Si l'action bouge à 40 % pendant qu'elle est à 30 % du strike ($\Gamma_t \approx 0$) puis reste à 10 % près du strike ($\Gamma_t$ grand), pour une moyenne de 25 %, l'intégrande est négatif là où cela compte : le trader long en gamma perd bien que la vol réalisée moyenne ait égalé l'implicite. Les swaps de variance répliquent un contrat log dont le gamma en dollars $\Gamma S^2$ est constant, ce qui supprime la pondération.
:::
:::
