JBOY MOVIE STORE TZ — MOVIES + TRAILERS (CLOUDFLARE PAGES FUNCTIONS)

KILICHOONGEZWA
- Sehemu ya umma: TRAILER ZA MOVIE ZOTE. Trailer zinaonekana pale admin anapoweka trailer kwa movie.
- Admin anaweza kuweka trailer kama faili la video (hadi 90MB) au URL ya https.
- Movie, cover na trailer huhifadhiwa Cloudflare D1 + R2; si localStorage. Wateja wote wanaona vitu vilivyowekwa.
- Admin anaweza kufuta movie; kufuta huondoa taarifa D1 pamoja na cover/movie/trailer files R2.
- Majina ya movie yanaendelea kuonekana chini ya cover.

DEPLOY: Hii si ZIP ya static Direct Upload. Inahitaji Cloudflare Pages Functions, D1 na R2. Tumia Wrangler Deploy au Connect Git.
1. Tengeneza D1 database `jboy-movie-store` na utekeleze schema.sql. Kama database ya zamani tayari ina table ya movies, badala yake endesha MIGRATION-TRAILERS.sql mara moja ili kuongeza columns za trailer.
2. Tengeneza R2 bucket `jboy-movie-files`.
3. Weka bindings: DB (D1) na MOVIES_BUCKET (R2).
4. Weka Secrets: ADMIN_PASSWORD=tzjboy90 na SESSION_SECRET (string ya siri ya random yenye angalau herufi 32).
5. Weka D1 database ID sahihi kwenye wrangler.toml.
6. Deploy project yote pamoja na functions/. Usitumie Pages Direct Upload ya static assets; haitapeleka Functions.

LIMITS: Upload ya movie/trailer imewekewa kikomo cha 90MB kwa faili. Kwa faili kubwa, tumia Cloudflare Stream au multipart upload. Trailer URL inapaswa kuwa HTTPS na iwe direct video URL inayoweza kuchezwa kwenye HTML video player; YouTube watch page URL ya kawaida haiwezi kuchezwa moja kwa moja.

Firebase Web Config bado ni placeholder; login ya wateja kwa Firebase haitafanya kazi hadi uweke config yako.
