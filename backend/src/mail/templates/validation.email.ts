export function validationEmail(firstName: string, verifyUrl: string) {
return `
      <div style="font-family: Arial, sans-serif; background:#f6f6f6; padding:24px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:32px 32px 0 32px; text-align:center;">
              <!-- Logo centré -->
              <img src="https://www.gameofthyear.fr/images/logo.png" alt="Game of the year" width="240" style="display:block;margin:0 auto 16px auto;" />
            </td>
          </tr>

          <tr>
            <td style="padding:16px 32px 0 32px; text-align:center;">
              <h1 style="margin:0 0 8px 0; font-size:22px; color:#111;">Bonjour ${firstName}</h1>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 32px 0 32px; text-align:center;">
              <h2 style="margin:0 0 8px 0; font-size:16px; color:#111;">Nous vous remercions de vous être inscrits à Game of the year</h2>
              <p style="margin:0; font-size:14px; color:#444;">
                Afin de valider votre compte, cliquez sur le bouton ci-dessous.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px; text-align:center;">
              <!-- Bouton noir, texte blanc, arrondi -->
              <a href="${verifyUrl}" target="_blank"
                 style="display:inline-block; background:#000; color:#fff; text-decoration:none;
                        padding:12px 20px; border-radius:999px; font-weight:600;">
                Valider mon compte
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 32px 32px; text-align:center; color:#777; font-size:12px;">
              Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur:
              <br/>
              <span style="word-break:break-all; color:#555;">${verifyUrl}</span>
            </td>
          </tr>
        </table>
      </div>
    `;
}