export const html = `<nav class="sommaire" aria-label="Sommaire de la page">
        <h2>Sur cette page</h2>
        <ol>
          <li><a href="#s1">Ce que nous mettons en place</a></li>
          <li><a href="#s2">Ce que le site ne vous demandera jamais</a></li>
          <li><a href="#s3">Méfiez-vous des imitations</a></li>
          <li><a href="#s4">Signaler une faille</a></li>
          <li><a href="#s5">Limites</a></li>
        </ol>
      </nav>

      <section class="card" id="s1">
        <h2><span class="num">1</span>Ce que nous mettons en place</h2>
        <ul>
          <li>
            <strong>Chiffrement :</strong> tout le site est servi en HTTPS, formulaires inclus.
          </li>
          <li>
            <strong>Base verrouillée :</strong> depuis le site, les demandes ne peuvent qu'être
            <em>écrites</em> aucune lecture publique des demandes n'est techniquement possible.
          </li>
          <li>
            <strong>Validation serveur :</strong> chaque envoi est contrôlé et plafonné côté serveur
            avant enregistrement (formats, tailles, fréquence).
          </li>
          <li>
            <strong>Secrets jamais exposés :</strong> les clés techniques restent côté serveur et ne
            transitent jamais dans le navigateur.
          </li>
          <li>
            <strong>Traceurs sous consentement :</strong> aucune balise tierce sans votre
            acceptation (voir <a href="/cookies">politique cookies</a>).
          </li>
        </ul>
      </section>

      <section class="card" id="s2">
        <h2><span class="num">2</span>Ce que le site ne vous demandera jamais en ligne</h2>
        <ul>
          <li>Aucun compte utilisateur, aucun mot de passe.</li>
          <li>Aucun paiement en ligne, aucune coordonnée bancaire.</li>
          <li>Aucune pièce d'identité via le formulaire (les documents se traitent au centre).</li>
        </ul>
      </section>

      <section class="card alerte" id="s3">
        <h2><span class="num">3</span>Méfiez-vous des imitations</h2>
        <p>
          Méfiez-vous de tout message ou site imitant EIDEN Visa et réclamant un paiement ou des
          documents : en cas de doute, appelez le centre au
          <a href="tel:+212777777428" dir="ltr">+212 777 777 428</a>.
        </p>
      </section>

      <section class="card" id="s4">
        <h2><span class="num">4</span>Signaler une faille</h2>
        <p>
          Vous avez repéré une vulnérabilité ? Écrivez à
          <a href="mailto:visa@eiden-group.com">visa@eiden-group.com</a> avec l'objet « [SÉCURITÉ] »
          et une description du problème. Nous nous engageons à accuser réception rapidement, à
          corriger dans les meilleurs délais et à ne pas engager de poursuites contre les
          signalements de bonne foi.
        </p>
      </section>

      <section class="card" id="s5">
        <h2><span class="num">5</span>Limites</h2>
        <p>
          Aucun système n'est inviolable : en cas d'incident avéré, nous informerons les personnes
          concernées et les autorités compétentes conformément à la loi 09-08.
        </p>
      </section>`;
