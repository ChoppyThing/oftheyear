interface ValidationEmailContent {
  greeting: string;
  title: string;
  description: string;
  buttonText: string;
  fallbackText: string;
}

export const validationEmailSubjects: Record<string, Record<string, string>> = {
  resetPassword: {
    fr: 'Réinitialisation de votre mot de passe',
    en: 'Reset your password',
    es: 'Restablece tu contraseña',
    zh: '重置您的密码',
  },
  validation: {
    fr: 'Validez votre compte Game of the year',
    en: 'Validate your Game of the year account',
    es: 'Valida tu cuenta de Game of the year',
    zh: '验证您的Game of the year帐户',
  },
};


const translations: Record<string, ValidationEmailContent> = {
  fr: {
    greeting: 'Bonjour',
    title: 'Nous vous remercions de vous être inscrits à Game of the year',
    description: 'Afin de valider votre compte, cliquez sur le bouton ci-dessous.',
    buttonText: 'Valider mon compte',
    fallbackText: 'Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur:',
  },
  en: {
    greeting: 'Hello',
    title: 'Thank you for signing up for Game of the year',
    description: 'To validate your account, click the button below.',
    buttonText: 'Validate my account',
    fallbackText: 'If the button doesn\'t work, copy and paste this link into your browser:',
  },
  es: {
    greeting: 'Hola',
    title: 'Gracias por registrarte en Game of the year',
    description: 'Para validar tu cuenta, haz clic en el botón de abajo.',
    buttonText: 'Validar mi cuenta',
    fallbackText: 'Si el botón no funciona, copia y pega este enlace en tu navegador:',
  },
  zh: {
    greeting: '你好',
    title: '感谢您注册Game of the year',
    description: '要验证您的帐户，请点击下面的按钮。',
    buttonText: '验证我的帐户',
    fallbackText: '如果按钮不起作用，请复制并粘贴此链接到您的浏览器：',
  },
};

export function validationEmail(firstName: string, verifyUrl: string, locale: string = 'en') {
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
          </td>
        </tr>

        <tr>
          <td style="padding:24px 32px; text-align:center;">
            <a href="${verifyUrl}" target="_blank"
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
            <span style="word-break:break-all; color:#555;">${verifyUrl}</span>
          </td>
        </tr>
      </table>
    </div>
  `;
}
