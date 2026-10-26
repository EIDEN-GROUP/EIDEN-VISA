export const html = `<nav class="sommaire" aria-label="Sommaire de la page">
        <h2>Sur cette page</h2>
        <ol>
          <li><a href="#s1">Le principe est simple</a></li>
          <li><a href="#s2">Stockage nécessaire</a></li>
          <li><a href="#s3">Catégories activables</a></li>
          <li><a href="#s4">Changer d'avis à tout moment</a></li>
          <li><a href="#s5">Contact</a></li>
        </ol>
      </nav>

      <section class="card alerte" id="s1">
        <h2><span class="num">1</span>Le principe est simple</h2>
        <p>
          Sans votre clic sur « Tout accepter »,
          <strong>aucun traceur tiers n'est chargé</strong>. « Tout refuser » laisse le site
          entièrement fonctionnel, sans mesure d'audience. Et « Personnaliser » vous laisse choisir
          catégorie par catégorie.
        </p>
      </section>

      <section class="card" id="s2">
        <h2>
          <span class="num">2</span>Stockage nécessaire (toujours actif, sur votre appareil
          uniquement)
        </h2>
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Nom</th>
                <th scope="col">Rôle</th>
                <th scope="col">Durée</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>eiden-langue</code></td>
                <td>Mémorise votre langue (français / arabe).</td>
                <td>12 mois</td>
              </tr>
              <tr>
                <td><code>eiden-demande-v1</code></td>
                <td>Brouillon de votre demande rapide, effacé à l'envoi.</td>
                <td>Jusqu'à l'envoi</td>
              </tr>
              <tr>
                <td><code>eiden-consentement-v1</code></td>
                <td>Mémorise vos choix cookies par catégorie.</td>
                <td>12 mois</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>Ces données ne quittent jamais votre appareil et ne sont transmises à personne.</p>
      </section>

      <section class="card" id="s3">
        <h2><span class="num">3</span>Catégories activables (avec votre accord uniquement)</h2>
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Catégorie</th>
                <th scope="col">Outils</th>
                <th scope="col">Rôle</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Mesure d'audience</strong></td>
                <td>Google Analytics 4 (via Tag Manager si configuré)</td>
                <td>Statistiques de visite : pages vues, clics, demandes envoyées.</td>
              </tr>
              <tr>
                <td><strong>Expérience</strong></td>
                <td>Microsoft Clarity</td>
                <td>Cartes de chaleur et replays de navigation anonymisés.</td>
              </tr>
              <tr>
                <td><strong>Marketing</strong></td>
                <td>Bing UET</td>
                <td>Mesure des visites issues du moteur Bing.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Leurs cookies propres (ex. <code>_ga</code>, <code>_clck</code>, <code>_uetvid</code>)
          suivent les durées définies par leurs éditeurs respectifs, de l'ordre de quelques mois à 2
          ans selon l'outil.
        </p>
      </section>

      <section class="card" id="s4">
        <h2><span class="num">4</span>Changer d'avis à tout moment</h2>
        <ul>
          <li>
            Cliquez sur <strong>« Gérer mes cookies »</strong> dans le pied de page du site pour
            rouvrir vos préférences catégorie par catégorie.
          </li>
          <li>
            Vous pouvez aussi effacer les données du site depuis les réglages de votre navigateur.
          </li>
        </ul>
      </section>

      <section class="card" id="s5">
        <h2><span class="num">5</span>Contact</h2>
        <p>
          Questions sur cette politique :
          <a href="mailto:visa@eiden-group.com">visa@eiden-group.com</a>. Voir aussi la
          <a href="/confidentialite">politique de confidentialité</a>.
        </p>
      </section>`;
