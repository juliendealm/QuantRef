---
title: Modèle de Black–Scholes
subject: derivatives
summary: Le modèle de référence pour les options européennes. Une action log-normale couverte en continu donne une EDP, un prix fermé avec d1 et d2 et, via la volatilité implicite, le langage que parle tout desk d'options même là où le modèle est connu pour échouer.
difficulty: 3
interview: 5
tags: [black-scholes, options, pde, risk-neutral, implied-volatility, delta-hedging]
prerequisites: [ito-lemma, martingales]
related: [greeks, brownian-motion]
---

## Intuition

Une option se valorise par **réplication**, non en prévoyant l'action : un portefeuille d'actions et de cash qui reproduit le payoff dans tous les scénarios doit coûter exactement ce que coûte l'option, sinon il y a un déjeuner gratuit. Sous un mouvement brownien géométrique à volatilité constante et avec du trading continu, ce portefeuille existe — il détient $\Delta = \partial V/\partial S$ actions, rééquilibrées en continu. La dérive $\mu$ s'annule ; seule $\sigma$ compte, car elle fixe l'ampleur des ajustements. De façon équivalente : le portefeuille couvert est sans risque donc il rapporte $r$ (une EDP), ou les prix actualisés sont des [[martingales]] sous une probabilité risque-neutre $\mathbb{Q}$.

::: viz black-scholes Le prix face au payoff
La courbe orange est le prix aujourd'hui, la ligne brisée grise le payoff à maturité. Amène la maturité vers zéro et la courbe lisse s'écrase sur le coude — la valeur temps, c'est exactement l'écart entre les deux.
:::

## Formules clés

| Nom | Formule |
|---|---|
| EDP | $\partial_t V + \tfrac12\sigma^2 S^2\partial_{SS}V + rS\,\partial_S V - rV = 0$ |
| Call | $C = S\,N(d_1) - Ke^{-rT}N(d_2)$ |
| Put | $P = Ke^{-rT}N(-d_2) - S\,N(-d_1)$ |
| $d_1$, $d_2$ | $d_1 = \dfrac{\ln(S/K) + (r + \tfrac12\sigma^2)T}{\sigma\sqrt{T}}$, $d_2 = d_1 - \sigma\sqrt{T}$ |
| Parité call–put | $C - P = S - Ke^{-rT}$ |
| Prix risque-neutre | $V_t = e^{-r(T-t)}\,\mathbb{E}^{\mathbb{Q}}[\text{payoff} \mid \mathcal{F}_t]$ |
| Règle empirique ATM | $C \approx 0{,}4\,S\,\sigma\sqrt{T}$ |

## Erreurs fréquentes

::: pitfall Injecter le rendement espéré dans la formule
$\mu$ n'apparaît pas parce que la couverture l'élimine. « Risque-neutre » ne signifie pas que les investisseurs sont indifférents au risque ; cela signifie que la réplication rend les préférences pour le risque sans effet sur le prix.
:::

::: pitfall Confondre N(d1) et N(d2)
$N(d_2)$ est la probabilité risque-neutre d'exercice. $N(d_1)$ est le delta, *toujours plus grand* : c'est la probabilité d'exercice sous la mesure qui prend l'action comme numéraire. L'appeler « la probabilité de finir dans la monnaie » est une erreur classique.
:::

::: pitfall Mélanger les unités de temps
La formule ne voit jamais que $\sigma\sqrt{T}$ et $rT$, avec $\sigma$ annualisée et $T$ en années. Mélanger un $\sigma$ quotidien et une échéance en années est faux d'un facteur $\sqrt{252}$.
:::

::: pitfall Lire le smile comme une erreur de prix à arbitrer
Le smile n'est pas une erreur du marché ; il valorise des queues et des krachs que le modèle log-normal ne peut pas représenter. Vendre sur cette base des puts en dehors de la monnaie « chers », c'est le trade qui explose.
:::

## Révision en 30 secondes

La couverture en delta continue d'une action log-normale rend l'option sans risque, donc elle rapporte $r$ : $\partial_t V + \tfrac12\sigma^2 S^2 \partial_{SS}V + rS\,\partial_S V - rV = 0$ ; de façon équivalente, prix $=$ espérance actualisée sous $\mathbb{Q}$ avec dérive $r$. Pour un call, $C = S N(d_1) - K e^{-rT} N(d_2)$, $d_{1,2} = [\ln(S/K) + (r \pm \tfrac12\sigma^2)T]/(\sigma\sqrt{T})$ ; le put vient de la parité $C - P = S - K e^{-rT}$. $\mu$ n'apparaît jamais. La volatilité implicite inverse la formule ; le smile montre que le modèle est faux, mais il reste le langage de cotation.

## Formulation mathématique

**Hypothèses.** $dS_t = \mu S_t\,dt + \sigma S_t\,dW_t$, avec $\mu$, $\sigma$ et le taux $r$ à capitalisation continue constants ; pas de dividende (un taux $q$ est une extension facile) ; marchés sans friction ; absence d'arbitrage ; exercice européen.

::: formula EDP de Black–Scholes
$$
\partial_t V + \tfrac12 \sigma^2 S^2\,\partial_{SS} V + r S\,\partial_S V - r V = 0, \qquad V(T, S) = \text{payoff}(S).
$$
:::

::: formula Prix du call et du put
$$
\begin{aligned}
C &= S\,N(d_1) - K e^{-rT} N(d_2), \\
P &= K e^{-rT} N(-d_2) - S\,N(-d_1), \\
d_1 &= \frac{\ln(S/K) + (r + \tfrac12\sigma^2)T}{\sigma\sqrt{T}}, \qquad d_2 = d_1 - \sigma\sqrt{T},
\end{aligned}
$$
avec $N$ la fonction de répartition de la loi normale centrée réduite et $T$ le temps restant jusqu'à l'échéance.
:::

::: formula Parité call–put
$$
C - P = S - K e^{-rT}.
$$
:::

La parité ne dépend d'aucun modèle (un call long plus un put court est un forward), donc le put ne demande aucun nouveau calcul.

::: formula Valorisation risque-neutre
$$
V_t = e^{-r(T-t)}\,\mathbb{E}^{\mathbb{Q}}\big[\text{payoff}(S_T) \mid \mathcal{F}_t\big], \qquad dS_t = r S_t\,dt + \sigma S_t\,dW^{\mathbb{Q}}_t .
$$
:::

$N(d_2) = \mathbb{Q}(S_T > K)$ est la probabilité d'exercice, donc $K e^{-rT} N(d_2)$ est la valeur actuelle de ce que l'on paie ; $S\,N(d_1) = e^{-rT}\,\mathbb{E}^{\mathbb{Q}}[S_T \mathbf{1}_{S_T > K}]$ est ce que l'on reçoit, et $N(d_1)$ est le delta.

Avec un taux de dividende continu $q$, le call vaut $C = S e^{-qT} N(d_1) - K e^{-rT} N(d_2)$ avec $d_1 = \dfrac{\ln(S/K) + (r - q + \tfrac12\sigma^2)T}{\sigma\sqrt{T}}$. On actualise le spot par $e^{-qT}$ **ou** on le fait porter à $r - q$ dans $d_1$ : c'est la même recette écrite deux fois, donc appliquer les deux compte le dividende deux fois. La formule de Black pour les options sur futures est le cas $q = r$.

## Dérivation

**Couverture en delta (l'EDP).** Avec $\Pi = V - \Delta S$, le [[ito-lemma|lemme d'Itô]] donne

$$
dV = \Big(\partial_t V + \tfrac12\sigma^2 S^2\,\partial_{SS} V\Big)\,dt + \partial_S V\,dS_t ,
$$

donc $d\Pi = dV - \Delta\,dS_t$, et $\Delta = \partial_S V$ élimine tout terme en $dS_t$ :

$$
d\Pi = \Big(\partial_t V + \tfrac12\sigma^2 S^2\,\partial_{SS} V\Big)\,dt .
$$

Sans risque sur $dt$, il doit rapporter $r$ : $d\Pi = r\Pi\,dt = r\,(V - S\,\partial_S V)\,dt$. En égalant on obtient l'EDP. $\mu$ est parti avec les termes en $dS_t$ ; c'est tout l'intérêt. (En toute rigueur, on vérifie aussi que le portefeuille est autofinancé.)

**Argument risque-neutre.** Girsanov avec $\lambda = (\mu - r)/\sigma$ fait de $W^{\mathbb{Q}}_t = W_t + \lambda t$ un brownien et donne $dS_t = r S_t\,dt + \sigma S_t\,dW^{\mathbb{Q}}_t$. Alors $e^{-rt} S_t$ et la valeur actualisée de tout portefeuille autofinancé sont des $\mathbb{Q}$-martingales, donc $V_t = e^{-r(T-t)}\,\mathbb{E}^{\mathbb{Q}}[\text{payoff} \mid \mathcal{F}_t]$ ; Feynman–Kac dit que cela résout l'EDP.

**Forme fermée.** Sous $\mathbb{Q}$, $S_T = S\exp\big((r - \tfrac12\sigma^2)T + \sigma\sqrt{T}\,Z\big)$, $Z \sim \mathcal{N}(0, 1)$, et

$$
S_T > K \iff Z > \frac{\ln(K/S) - (r - \tfrac12\sigma^2)T}{\sigma\sqrt{T}} = -d_2 ,
$$

donc

$$
C = e^{-rT}\int_{-d_2}^{\infty} \Big(S e^{(r - \frac12\sigma^2)T + \sigma\sqrt{T} z} - K\Big)\varphi(z)\,dz .
$$

Le second terme vaut $K e^{-rT}\,\mathbb{Q}(Z > -d_2) = K e^{-rT} N(d_2)$. Pour le premier, on complète le carré : $e^{-\frac12\sigma^2 T + \sigma\sqrt{T}z}\,\varphi(z) = \varphi(z - \sigma\sqrt{T})$, ce qui donne $S\,N(d_2 + \sigma\sqrt{T}) = S\,N(d_1)$. Le put découle de la parité.

## Hypothèses et cas limites

- **Limites.** $T \to 0$ : $C \to (S - K)^+$. $\sigma \to 0$ : $C \to (S - K e^{-rT})^+$, un forward ou rien. $\sigma \to \infty$ : $C \to S$. Très dans la monnaie, $C \approx S - K e^{-rT}$ ; très en dehors, $C \to 0$ plus vite que toute puissance de $S$. À la monnaie forward, $C \approx 0{,}4\,S\,\sigma\sqrt{T}$.
- **Volatilité implicite.** $\partial C/\partial\sigma > 0$, donc $C_{BS}(\sigma)$ croît strictement de $(S - Ke^{-rT})^+$ à $S$ : tout prix dans cet intervalle a une unique $\sigma_{\text{impl}}$. Le modèle veut un seul nombre pour tous les $K$, $T$ ; le marché donne un **smile** (en change) ou un **skew** actions où les puts de strike bas sont chers.
- **Couverture discrète.** $N$ rééquilibrages laissent une erreur de moyenne nulle et de taille $\sqrt{\pi/4}\;\sigma\nu/\sqrt{N}$ (Derman–Kamal) : environ 10 % de la prime pour une couverture quotidienne d'une option à 3 mois ($N \approx 63$).
- **Sauts.** Non couvrables avec l'action seule : marché incomplet, prix non unique, puts en dehors de la monnaie sous-évalués — une lecture du skew.
- **Volatilité stochastique.** Un véga résiduel et un smile ; Heston ajoute un second brownien corrélé.
- **Coûts de transaction.** Leland remplace $\sigma^2$ par $\sigma^2\big(1 + \sqrt{2/\pi}\;k/(\sigma\sqrt{\delta t})\big)$ pour un coût proportionnel $k$ et un intervalle $\delta t$.
- **Taux, dividendes, exercice anticipé.** Les taux stochastiques comptent sur les longues échéances, les dividendes discrets demandent un spot ajusté. Un put américain sur une action sans dividende vaut strictement plus, un call américain la même chose : l'exercice anticipé n'est jamais optimal.

## Exemple détaillé

Call à un an, $S = 100$, $K = 105$, $r = 3\,\%$, $\sigma = 20\,\%$ :

$$
d_1 = \frac{\ln(100/105) + (0{,}03 + 0{,}02)\times 1}{0{,}20} = \frac{-0{,}04879 + 0{,}05}{0{,}20} = 0{,}0060, \qquad d_2 = 0{,}0060 - 0{,}20 = -0{,}1940 .
$$

$N(d_1) = 0{,}5024$, $N(d_2) = 0{,}4231$, $K e^{-rT} = 105 \times 0{,}97045 = 101{,}90$, donc

$$
C = 100 \times 0{,}5024 - 101{,}90 \times 0{,}4231 = 50{,}24 - 43{,}11 = 7{,}13, \qquad P = C - S + K e^{-rT} = 9{,}02 .
$$

Le call est en dehors de la monnaie, et pourtant $N(d_2) = 42\,\%$ des trajectoires risque-neutres finissent au-dessus de $105$. Le code le vérifie par Monte Carlo, puis inverse la formule sur une cotation de marché :

```python
import numpy as np
from scipy.stats import norm
from scipy.optimize import brentq

def bs_call(S, K, T, r, sigma):
    d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    return S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)

S0, K, T, r, sigma = 100.0, 105.0, 1.0, 0.03, 0.20
analytic = bs_call(S0, K, T, r, sigma)

# Monte Carlo under the risk-neutral GBM: S_T = S0 exp((r - sigma^2/2) T + sigma sqrt(T) Z)
rng = np.random.default_rng(2024)
n = 1_000_000
Z = rng.standard_normal(n)
ST = S0 * np.exp((r - 0.5 * sigma**2) * T + sigma * np.sqrt(T) * Z)
disc_payoff = np.exp(-r * T) * np.maximum(ST - K, 0.0)
mc, se = disc_payoff.mean(), disc_payoff.std(ddof=1) / np.sqrt(n)

print(f"Black-Scholes call : {analytic:.4f}")
print(f"Monte Carlo call   : {mc:.4f}  (std error {se:.4f})")

# Put from put-call parity, then implied vol backed out of a market quote
put = analytic - S0 + K * np.exp(-r * T)
print(f"Put via parity     : {put:.4f}")
market_price = 8.00
iv = brentq(lambda s: bs_call(S0, K, T, r, s) - market_price, 1e-6, 5.0)
print(f"Implied vol of a call quoted at {market_price:.2f} : {iv:.4%}")
print(f"Check: bs_call at implied vol = {bs_call(S0, K, T, r, iv):.4f}")
```

::: output
```
Black-Scholes call : 7.1281
Monte Carlo call   : 7.1427  (std error 0.0126)
Put via parity     : 9.0248
Implied vol of a call quoted at 8.00 : 22.1859%
Check: bs_call at implied vol = 8.0000
```
:::

Monte Carlo se situe à 1,2 erreur-type de la forme fermée. Une cotation de $8{,}00$ implique $22{,}2\,\%$, pas $20\,\%$ ; collecter ce nombre pour chaque strike et chaque échéance construit la surface de volatilité. `brentq` fonctionne parce que le prix est monotone en $\sigma$.

## Pourquoi c'est important en finance quantitative

- **La convention de cotation.** Les options se cotent en volatilité implicite ; tout modèle plus riche est calibré sur la surface $\sigma_{\text{impl}}(K, T)$.
- **La couverture.** $N(d_1)$ et les autres [[greeks|grecques]] sont ce qu'un desk trade ; une position couverte gagne $\tfrac12\Gamma S^2(\sigma^2_{\text{real}} - \sigma^2_{\text{impl}})\,dt$, un pari sur la variance réalisée contre l'implicite.
- **Le gabarit.** Black-76, Garman–Kohlhagen, le modèle de crédit de Merton, volatilité locale et stochastique, diffusions à sauts : chacun relâche une hypothèse.
- **Le pricing par martingale rendu concret.** Changement de mesure, prix actualisés [[martingales|martingales]] et Feynman–Kac, sur le [[brownian-motion|mouvement brownien]] et le [[ito-lemma|lemme d'Itô]].
- **Les systèmes de risque.** Les livres d'options sont réévalués avec la formule et ses grecques sous des milliers de scénarios pour la [[value-at-risk]].
- **La dérivation standard en entretien :** l'EDP à partir d'une couverture, la forme fermée, pourquoi le smile existe.

## Questions d'entretien

::: question Pourquoi le rendement espéré $\mu$ de l'action n'apparaît-il pas dans la formule de Black–Scholes ?
::: hint
Que deviennent les termes en $dS$ quand on détient $\partial_S V$ actions contre l'option ?
:::
::: answer
Le portefeuille détient $\Delta = \partial_S V$ actions et les termes en $dS$ — seul endroit où $\mu$ apparaît — s'annulent exactement. La position couverte est sans risque et doit rapporter $r$, donc le prix ne dépend que de $r$ et de $\sigma$ ; de façon équivalente, la dérive risque-neutre vaut $r$. Deux investisseurs en désaccord sur $\mu$ mais d'accord sur $\sigma$ s'accordent sur le prix.
:::
:::

::: question Donne une approximation rapide d'un call à la monnaie et démontre-la.
::: hint
Prends $K = S e^{rT}$ de sorte que $d_1 = -d_2 = \tfrac12\sigma\sqrt{T}$, et utilise $N(x) - N(-x) \approx 2x\,\varphi(0)$ pour $x$ petit.
:::
::: answer
Avec $K e^{-rT} = S$, $C = S\big[N(\tfrac12\sigma\sqrt{T}) - N(-\tfrac12\sigma\sqrt{T})\big] \approx S\,\sigma\sqrt{T}\,\varphi(0) = S\sigma\sqrt{T}/\sqrt{2\pi} \approx 0{,}4\,S\sigma\sqrt{T}$. Pour $S = 100$, $\sigma = 20\,\%$, $T = 0{,}25$ : $C \approx 4{,}0$ (exact $3{,}99$), à moins de 1 % tant que $\sigma\sqrt{T} \lesssim 0{,}5$.
:::
:::

::: question Interprète $N(d_1)$ et $N(d_2)$ de façon probabiliste et explique pourquoi $N(d_1) > N(d_2)$.
::: hint
Écris le call comme $e^{-rT}\,\mathbb{E}^{\mathbb{Q}}[S_T\mathbf{1}_{S_T>K}] - Ke^{-rT}\,\mathbb{Q}(S_T > K)$ et demande-toi quelles trajectoires pèsent le plus dans le premier terme.
:::
::: answer
$N(d_2) = \mathbb{Q}(S_T > K)$. Dans le premier terme, l'indicatrice est pondérée par $S_T$, la densité de $\mathbb{Q}^S$ telle que $d\mathbb{Q}^S/d\mathbb{Q} = S_T/(S e^{rT})$ (l'action comme numéraire) ; sous $\mathbb{Q}^S$ le log de l'action dérive à $r + \tfrac12\sigma^2$ et $\mathbb{Q}^S(S_T > K) = N(d_1)$. Les trajectoires à $S_T$ élevé pèsent davantage, donc $N(d_1) > N(d_2)$, les arguments différant de $\sigma\sqrt{T}$. $N(d_1)$ est aussi $\partial C/\partial S$.
:::
:::

::: question Suppose que la volatilité est stochastique mais indépendante du mouvement brownien qui pilote l'action. Montre que le prix de l'option est une moyenne de prix Black–Scholes et explique pourquoi cela crée un smile mais pas un skew.
::: hint
Conditionne par toute la trajectoire de volatilité. Quelle est la loi de $\ln S_T$ sachant $\bar\sigma^2 = \tfrac1T\int_0^T\sigma_t^2\,dt$ ?
:::
::: answer
Sachant la trajectoire, $\ln S_T$ est gaussien de variance $\bar\sigma^2 T$, donc le prix conditionnel est $C_{BS}(\bar\sigma)$ et par la propriété de tour $C = \mathbb{E}[C_{BS}(\bar\sigma)]$ (mélange de Hull–White). La convexité en $\sigma$ est le volga, $\nu\,d_1 d_2/\sigma$. Près de la monnaie $d_1 d_2 < 0$, $C_{BS}$ est concave, donc la vol implicite ATM est *en dessous* de $\sqrt{\mathbb{E}[\bar\sigma^2]}$ ; loin de la monnaie $d_1 d_2 > 0$ et la vol implicite est poussée *vers le haut* : un smile symétrique. Le mélange est symétrique en $\ln(K/S)$ autour du forward, donc pas de skew ; il faudrait une corrélation entre volatilité et rendements ($\rho < 0$ dans Heston) ou des sauts asymétriques.
:::
:::
