export default () => {
  const user = process.env.NODEMAIL_USER || process.env.SMTP_USER || '';
  const rawPass = process.env.NODEMAIL_PASS || process.env.SMTP_PASS || '';
  const pass = rawPass.replace(/\s+/g, '');
  const from = process.env.SMTP_FROM || (user ? `CityDeals <${user}>` : 'CityDeals <no-reply@citydeals.com>');

  return {
    mail: {
      host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      user,
      pass,
      from,
    },
  };
};
