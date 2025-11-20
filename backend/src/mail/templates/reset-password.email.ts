interface ResetPasswordEmailContent {
  greeting: string;
  title: string;
  description: string;
  expiryNotice: string;
  buttonText: string;
  fallbackText: string;
  ignoreText: string;
}

export const emailSubjects: Record<string, Record<string, string>> = {
  resetPassword: {
    fr: 'Réinitialisation de votre mot de passe',
    en: 'Reset your password',
    es: 'Restablece tu contraseña',
    zh: '重置您的密码',
  },
};

const translations: Record<string, ResetPasswordEmailContent> = {
  fr: {
    greeting: 'Bonjour',
    title: 'Réinitialisation de votre mot de passe',
    description:
      'Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour continuer.',
    expiryNotice: 'Ce lien expire dans 1 heure.',
    buttonText: 'Réinitialiser mon mot de passe',
    fallbackText:
      'Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur:',
    ignoreText:
      "Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.",
  },
  en: {
    greeting: 'Hello',
    title: 'Reset your password',
    description:
      'You requested to reset your password. Click the button below to continue.',
    expiryNotice: 'This link expires in 1 hour.',
    buttonText: 'Reset my password',
    fallbackText:
      "If the button doesn't work, copy and paste this link into your browser:",
    ignoreText: "If you didn't request this reset, please ignore this email.",
  },
  es: {
    greeting: 'Hola',
    title: 'Restablece tu contraseña',
    description:
      'Solicitaste restablecer tu contraseña. Haz clic en el botón de abajo para continuar.',
    expiryNotice: 'Este enlace expira en 1 hora.',
    buttonText: 'Restablecer mi contraseña',
    fallbackText:
      'Si el botón no funciona, copia y pega este enlace en tu navegador:',
    ignoreText: 'Si no solicitaste este restablecimiento, ignora este correo.',
  },
  zh: {
    greeting: '你好',
    title: '重置您的密码',
    description: '您请求重置密码。点击下面的按钮继续。',
    expiryNotice: '此链接将在1小时后过期。',
    buttonText: '重置我的密码',
    fallbackText: '如果按钮不起作用，请复制并粘贴此链接到您的浏览器：',
    ignoreText: '如果您没有请求此重置，请忽略此邮件。',
  },
};

export function resetPasswordEmail(
  firstName: string,
  resetUrl: string,
  locale: string = 'en',
) {
  const content = translations[locale] || translations['en'];

  return `
    <div style="font-family: Arial, sans-serif; background:#f6f6f6; padding:24px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
        <tr>
          <td style="padding:32px 32px 0 32px; text-align:center;">
            <img src="https://www.gameofthyear.fr/images/logo.png" alt="Game of the year" width="240" style="display:block;margin:0 auto 16px auto;" />
          </td>
        </tr>

        <tr>
          <td style="padding:16px 32px 0 32px; text-align:center;">
            <h1 style="margin:0 0 8px 0; font-size:22px; color:#111;">${content.greeting} ${firstName}</h1>
          </td>
        </tr>

        <tr>
          <td style="padding:16px 32px 0 32px; text-align:center;">
            <h2 style="margin:0 0 8px 0; font-size:16px; color:#111;">${content.title}</h2>
            <p style="margin:0; font-size:14px; color:#444;">
              ${content.description}
            </p>
            <p style="margin:12px 0 0 0; font-size:13px; color:#999;">
              ${content.expiryNotice}
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:24px 32px; text-align:center;">
            <a href="${resetUrl}" target="_blank"
               style="display:inline-block; background:#000; color:#fff; text-decoration:none;
                      padding:12px 20px; border-radius:999px; font-weight:600;">
              ${content.buttonText}
            </a>
          </td>
        </tr>

        <tr>
          <td style="padding:0 32px 32px 32px; text-align:center; color:#777; font-size:12px;">
            ${content.fallbackText}
            <br/>
            <span style="word-break:break-all; color:#555;">${resetUrl}</span>
            <br/><br/>
            ${content.ignoreText}
          </td>
        </tr>
      </table>
    </div>
  `;
}
